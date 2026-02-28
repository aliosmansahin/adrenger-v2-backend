import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import * as bcrypt from "bcrypt";

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
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
            },
            createUser: jest.fn().mockResolvedValue({
              id: 1,
              email: 'test@mail.com',
              nickname: 'test',
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

  it.todo("should generate JWT on login");
});
