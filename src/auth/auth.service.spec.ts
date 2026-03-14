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
            updateRefreshTokenOfUser: jest.fn(),
            findUserFromId: jest.fn().mockResolvedValue({
              id: 1,
              email: 'test@mail.com',
              nickname: 'test',
              hash: "mock-hash",
              refreshToken: "mock-hash"
            }),
            deleteRefreshTokenOfUser: jest.fn(),
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

      const user = {email: "test@email.com", password: "123", nickname: "test", rememberMe: true};

      await expect(service.register(user)).resolves.toEqual({access_token: "mock-jwt-token", refresh_token: "mock-jwt-token"});
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);

      expect(bcrypt.hash).toHaveBeenNthCalledWith(1, "123", 10);

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
        expect.objectContaining({})
      );

      expect(bcrypt.hash).toHaveBeenNthCalledWith(2, "mock-jwt-token", 10);

      expect(prisma.updateRefreshTokenOfUser).toHaveBeenCalledWith(1, "mock-hash");
    });

    it("should throw ConflictException", async () => {
      const user = {email: "test@email.com", password: "123", nickname: "test", rememberMe: true};

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
  
      const user = {email: "test@email.com", password: "123", rememberMe: true};
  
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
        expect.objectContaining({}),
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("mock-jwt-token", 10);

      expect(prisma.updateRefreshTokenOfUser).toHaveBeenCalledWith(1, "mock-hash");
    });

    it("should throw NotFoundException", async () => {
      const user = {email: "throws@email.com", password: "123", rememberMe: true};

      (prisma.findUserFromEmail as jest.Mock).mockResolvedValue(null);
  
      await expect(service.login(user)).rejects.toThrow(NotFoundException);
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);
    });

    it("should throw UnauthorizedException", async () => {
      const user = {email: "test@email.com", password: "123", rememberMe: true};

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
      expect(prisma.findUserFromEmail).toHaveBeenCalledWith(user.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(user.password, "mock-hash");
    });
  });

  describe("Refresh", () => {
    it("should generate JWT on refresh", async () => {
      const user = {userId: 1};
      const oldRefreshToken = "mock-jwt-token";

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue("mock-hash");

      const rememberMe = true;
      
      await expect(service.refreshTokens(rememberMe, user, oldRefreshToken)).resolves.toEqual({
        access_token: "mock-jwt-token",
        refresh_token: "mock-jwt-token",
      });
      expect(prisma.findUserFromId).toHaveBeenCalledWith(user.userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(oldRefreshToken, "mock-hash");

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
        expect.objectContaining({}),
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("mock-jwt-token", 10);

      expect(prisma.updateRefreshTokenOfUser).toHaveBeenCalledWith(1, "mock-hash");
    });
    it("should throw UnauthorizedException via user cannot found", async () => {
      const user = {userId: 1};
      const oldRefreshToken = "mock-jwt-token";

      (prisma.findUserFromId as jest.Mock).mockResolvedValue(null);

      const rememberMe = true;
      
      await expect(service.refreshTokens(rememberMe, user, oldRefreshToken)).rejects.toThrow(UnauthorizedException);
      expect(prisma.findUserFromId).toHaveBeenCalledWith(user.userId);
    });
    it("should throw UnauthorizedException via refreshToken cannot found", async () => {
      const user = {userId: 1};
      const oldRefreshToken = "mock-jwt-token";

      (prisma.findUserFromId as jest.Mock).mockResolvedValue({id: 1, nickname: "test"});

      const rememberMe = true;
      
      await expect(service.refreshTokens(rememberMe, user, oldRefreshToken)).rejects.toThrow(UnauthorizedException);
      expect(prisma.findUserFromId).toHaveBeenCalledWith(user.userId);      
    });
    it("should throw UnauthorizedException via refreshToken comparison failure", async () => {
      const user = {userId: 1};
      const oldRefreshToken = "mock-wrong-jwt-token";

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      (prisma.findUserFromId as jest.Mock).mockResolvedValue({id: 1, nickname: "test", refreshToken: "mock-hash"});

      const rememberMe = true;
      
      await expect(service.refreshTokens(rememberMe, user, oldRefreshToken)).rejects.toThrow(UnauthorizedException);
      expect(prisma.findUserFromId).toHaveBeenCalledWith(user.userId);      
      expect(bcrypt.compare).toHaveBeenCalledWith(oldRefreshToken, "mock-hash");
    });
  });

  describe("Logout", () => {
    it("should delete JWT refresh token on logout", async () => {
      const user = {userId: 1};

      await service.logout(user);
      expect(prisma.deleteRefreshTokenOfUser).toHaveBeenCalledWith(1);
    });
  });
});
