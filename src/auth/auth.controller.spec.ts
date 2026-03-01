import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  describe("Login", () => {
    it("should return access-token", async () => {
      mockAuthService.login.mockResolvedValue({
        access_token: "mock-jwt-token",
        refresh_token: "mock-jwt-token",
      });

      const mockDto = {
        email: "email@email.com",
        password: "123",
      };

      const mockResponse = {
        cookie: jest.fn(),
      };

      await expect(controller.login(mockDto, mockResponse as any)).resolves.toEqual({
        access_token: "mock-jwt-token",
      });
      expect(authService.login).toHaveBeenCalledWith(mockDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith("refresh_token", expect.any(String), expect.objectContaining({httpOnly: true}));
    });
  });

  describe("Register", () => {
    it("should return access-token", async () => {
      mockAuthService.register.mockResolvedValue({
        access_token: "mock-jwt-token",
        refresh_token: "mock-jwt-token",
      })
      const mockDto = {
        email: "email",
        password: "password",
        nickname: "ali",
      }
      
      const mockResponse = {
        cookie: jest.fn(),
      };

      await expect(controller.register(mockDto, mockResponse as any)).resolves.toEqual({
        access_token: "mock-jwt-token",
      });

      expect(authService.register).toHaveBeenCalledWith(mockDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith("refresh_token", expect.any(String), expect.objectContaining({httpOnly: true}));
    });
  });

  describe("Refresh", () => {
    it("should return access-token", async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        access_token: "mock-jwt-token",
        refresh_token: "mock-jwt-token",
      })

      const mockResponse = {
        cookie: jest.fn(),
      }

      await expect(controller.refresh({cookies: {refresh_token: "mock-jwt-token"}}, mockResponse as any)).resolves.toEqual({access_token: "mock-jwt-token"});
      expect(mockResponse.cookie).toHaveBeenCalledWith("refresh_token", expect.any(String), expect.objectContaining({httpOnly: true}));
    });
  });
});
