import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
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
    it.todo("should return jwt-token");
  });

  describe("Register", () => {
    it("should return access-token", () => {
      mockAuthService.register.mockReturnValue({
        access_token: "mock-jwt-token",
      })
      const mockDto = {
        email: "email",
        password: "password",
      }

      const result = controller.register(mockDto);
      expect(result).toEqual({
        access_token: "mock-jwt-token",
      });

      expect(authService.register).toHaveBeenCalledWith(mockDto);
    });
  })
});
