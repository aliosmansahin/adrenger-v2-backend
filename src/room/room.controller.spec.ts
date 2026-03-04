import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RoomController', () => {
  let controller: RoomController;
  let service: RoomService;

  const mockRoomService = {
    createRoom: jest.fn().mockResolvedValue({
      id: "1",
      name: "room 0"
    }),
    deleteRoom: jest.fn()
  };

  const mockPrismaService = {

  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        }
      ]
    }).compile();

    controller = module.get<RoomController>(RoomController);
    service = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("Create Room", () => {
    it("should return room data", async () => {
      const user = {userId: 1};
      const roomData = {name: "room 0", password: "empty or not"};
      await expect(controller.createRoom(roomData, {user})).resolves.toEqual(expect.objectContaining({id: "1", name: "room 0"}));
      expect(service.createRoom).toHaveBeenCalledWith(user.userId, roomData);
    });
  });

  describe("Delete Room", () => {
    it("should delete room and return nothing", async () => {
      const user = {userId: 1};
      const roomId = 1;
      await controller.deleteRoom(roomId as unknown as bigint, {user});
      expect(service.deleteRoom).toHaveBeenCalledWith(roomId, user.userId);
    });
  })
});
