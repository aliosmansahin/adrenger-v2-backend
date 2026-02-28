import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
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
    it("should return access-token", () => {
      mockAuthService.login.mockReturnValue({
        access_token: "mock-jwt-token",
      });

      const mockDto = {
        email: "email@email.com",
        password: "123",
      };

      const result = controller.login(mockDto);
      expect(result).toEqual({
        access_token: "mock-jwt-token",
      });
      expect(authService.login).toHaveBeenCalledWith(mockDto);
    });
  });

  describe("Register", () => {
    it("should return access-token", () => {
      mockAuthService.register.mockReturnValue({
        access_token: "mock-jwt-token",
      })
      const mockDto = {
        email: "email",
        password: "password",
        nickname: "ali",
      }

      const result = controller.register(mockDto);
      expect(result).toEqual({
        access_token: "mock-jwt-token",
      });

      expect(authService.register).toHaveBeenCalledWith(mockDto);
    });
  })
});
