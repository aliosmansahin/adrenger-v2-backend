import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

describe('HomeController', () => {
  let controller: HomeController;
  let service: HomeService;

  const mockHomeService = {
    getRooms: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: mockHomeService,
        }
      ]
    }).compile();

    controller = module.get<HomeController>(HomeController);
    service = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("Get Rooms", () => {
    it("should return all rooms that belong to user", async () => {
      const mockRooms = [
        { roomId: "1", role: "admin", name: "room 0" },
        { roomId: "0", role: "member", name: "room 1" },
      ];
      (service.getRooms as jest.Mock).mockResolvedValue(mockRooms);

      const result = await controller.home(undefined, {user: {userId: 1}});

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(mockRooms.length);
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({roomId: "0"})
      ]));
      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({roomId: "1"})
      ]));
      
      expect(service.getRooms).toHaveBeenCalledWith(1, undefined);
    });
  })
});
