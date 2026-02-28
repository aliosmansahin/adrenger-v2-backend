import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import * as bcrypt from "bcrypt";
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';

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
            updateRefreshTokenOfUser: jest.fn()
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

  describe("Register", () => {
    it("should generate JWT on register", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("mock-hash");

      (prisma.findUserFromEmail as jest.Mock).mockResolvedValue(null);

      const user = {email: "test@email.com", password: "123", nickname: "test"};

      await expect(service.register(user)).resolves.toEqual({access_token: "mock-jwt-token", refresh_token: "mock-jwt-token"});
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);
      expect(prisma.createUser).toHaveBeenCalledWith({
        email: "test@email.com",
        hash: "mock-hash",
        nickname: "test",
      });
      
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({sub: "1", username: "test"}),
        expect.objectContaining({
          expiresIn: "5m"
        }
      ));
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({sub: "1", username: "test"}),
        expect.objectContaining({
          expiresIn: "1d"
        }
      ));

      expect(prisma.updateRefreshTokenOfUser).toHaveBeenCalledWith(1, "mock-jwt-token");
    });

    it("should throw ConflictException", async () => {
      const user = {email: "test@email.com", password: "123", nickname: "test"};

      (prisma.findUserFromEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@email.com",
      });
      
      await expect(service.register(user)).rejects.toThrow(ConflictException);
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);
    });
  });

  describe("Login", () => {
    it("should generate JWT on login", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  
      const user = {email: "test@email.com", password: "123"};
  
      await expect(service.login(user)).resolves.toEqual({access_token: "mock-jwt-token", refresh_token: "mock-jwt-token"});
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(user.password, "mock-hash");

      expect(jwtService.sign).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({sub: "1", username: "test"}),
        expect.objectContaining({
          expiresIn: "5m"
        }
      ));
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({sub: "1", username: "test"}),
        expect.objectContaining({
          expiresIn: "1d"
        }
      ));

      expect(prisma.updateRefreshTokenOfUser).toHaveBeenCalledWith(1, "mock-jwt-token");
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
