import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import * as bcrypt from "bcrypt";
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("mock-jwt-token"),
          }
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
            createUser: jest.fn().mockResolvedValue({
              id: 1,
              email: 'test@mail.com',
              nickname: 'test',
            }),
            findUserFromEmail: jest.fn().mockResolvedValue({
              id: 1,
              email: 'test@mail.com',
              nickname: 'test',
              hash: "mock-hash",
            }),
          }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("should generate JWT on register", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("mock-hash");

    const user = {email: "test@email.com", password: "123", nickname: "test"};
    const result = await service.register(user as any);

    expect(result).toEqual({access_token: "mock-jwt-token"});
    expect(prisma.createUser).toHaveBeenCalledWith({
      email: "test@email.com",
      hash: "mock-hash",
      nickname: "test",
    });
    expect(jwtService.sign).toHaveBeenCalledWith({sub: "1", username: "test"});
  });

  describe("Login", () => {
    it("should generate JWT on login", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  
      const user = {email: "test@email.com", password: "123"};
  
      await expect(service.login(user)).resolves.toEqual({access_token: "mock-jwt-token"});
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(user.password, "mock-hash");
      expect(jwtService.sign).toHaveBeenCalledWith({sub: "1", username: "test"});
    });

    it("should throw NotFoundException", async () => {
      const user = {email: "throws@email.com", password: "123"};

      (prisma.findUserFromEmail as jest.Mock).mockResolvedValue(null);
  
      await expect(service.login(user)).rejects.toThrow(NotFoundException);
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);
    });

    it("should throw UnauthorizedException", async () => {
      const user = {email: "test@email.com", password: "123"};

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(user.password, "mock-hash");
    });
  });
});
