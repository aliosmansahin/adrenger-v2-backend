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
    deleteRoom: jest.fn(),
    editRoom: jest.fn().mockResolvedValue({
      id: "1",
      name: "room edit",
    }),
    joinRoom: jest.fn().mockResolvedValue({
      id: "1",
      name: "room 0"
    }),
    leaveRoom: jest.fn(),
    kickUser: jest.fn(),
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
  });

  describe("Edit Room", () => {
    it("should return edited room data", async () => {
      const user = {userId: 1};
      const roomId = 1;
      const roomData = {name: "room edit", password: "empty or not edit"};

      await expect(controller.editRoom(roomId as unknown as bigint, roomData, {user})).resolves.toEqual(expect.objectContaining({id: "1", name: "room edit"}));
      expect(service.editRoom).toHaveBeenCalledWith(roomId, roomData, user.userId);
    });
  });

  describe("Join Room", () => {
    it("should return new room data", async () => {
      const user = {userId: 2};
      const roomId = 1n;

      const dto = {
        password: "",
      }

      await expect(controller.joinRoom(roomId, dto, {user})).resolves.toEqual(expect.objectContaining({id: "1", name: "room 0"}));
      expect(service.joinRoom).toHaveBeenCalledWith(roomId, dto, user.userId);
    })
  });

  describe("Leave Room", () => {
    it("should return undefined", async () => {
      const user = {userId: 2};
      const roomId = 2n;

      await expect(controller.leaveRoom(roomId, {}, {user})).resolves.toBeUndefined();
      expect(service.leaveRoom).toHaveBeenCalledWith(roomId, {}, user.userId);
    });
  });

  describe("Kick User", () => {
    it("should not throw exception", async () => {
      const user = {userId: 1};
      const roomId = 1n;
      const kickUserId = 2n;

      await expect(controller.kickUser(roomId, kickUserId, {}, {user})).resolves.toBeUndefined();
      expect(service.kickUser).toHaveBeenCalledWith(roomId, {}, kickUserId, user.userId);
    });
  });
});
