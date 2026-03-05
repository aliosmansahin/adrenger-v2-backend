import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from "bcrypt";
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

describe('RoomService', () => {
  let service: RoomService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: PrismaService,
          useValue: {
            createRoom: jest.fn().mockResolvedValue({
              id: 1,
              name: "room 0",
              hash: "mock-hash"
            }),
            findRoomFromId: jest.fn().mockResolvedValue({
              id: 1,
              name: "room",
            }),
            findUserInRoom: jest.fn().mockResolvedValue({
              role: "admin",
            }),
            deleteRoom: jest.fn(),
            editRoom: jest.fn().mockResolvedValue({
              id: 1,
              name: "room edit",
              hash: "mock-hash"
            }),
            addUserToRoom: jest.fn().mockResolvedValue({
              id: 1,
              name: "room join",
            }),
            removeUserFromRoom: jest.fn(),
          },
        },
      ],
      
    }).compile();

    service = module.get<RoomService>(RoomService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("Create Room", () => {
    it("should return room data", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("mock-hash");

      const userId = 1;
      const roomData = {name: "room 0", password: "empty or not"};

      const result = await service.createRoom(userId as unknown as bigint, roomData);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({id: 1, name: roomData.name, hash: "mock-hash"}));
      expect(bcrypt.hash).toHaveBeenCalledWith(roomData.password, 10);
      expect(prisma.createRoom).toHaveBeenCalledWith(userId, roomData.name, "mock-hash");
    });
  });

  describe("Delete Room", () => {
    it("should delete room and return nothing", async () => {
      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);

      const roomId = 1n;
      const userId = 1n;

      await expect(service.deleteRoom(roomId, userId)).resolves.toBeUndefined();
      expect(spy).toHaveBeenCalledWith(roomId, userId);
      expect(prisma.deleteRoom).toHaveBeenCalledWith(roomId);
    });
  });

  describe("Edit Room", () => {
    it("should return edited room data", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("mock-hash");
      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);

      const roomId = 1n;
      const userId = 1n;
      const roomData = {name: "room edit", password: "empty or not edit"};

      const result = await service.editRoom(roomId, roomData, userId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({
        name: "room edit",
        id: 1
      }));
      expect(spy).toHaveBeenCalledWith(roomId, userId);
      expect(bcrypt.hash).toHaveBeenCalledWith(roomData.password, 10);
      expect(prisma.editRoom).toHaveBeenCalledWith(roomId, roomData.name, "mock-hash");
    });
  });

  describe("Check Room Process Availability", () => {
    it("should not throw", async () => {
      const roomId = 1n;
      const userId = 1n;

      await expect(service.checkProcessAvailability(roomId, userId)).resolves.toBeUndefined();
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
    it("should throw NotFoundException", async () => {
      const roomId = 2n; //Doesn't exist
      const userId = 1n;

      (prisma.findRoomFromId as jest.Mock).mockResolvedValue(null);

      await expect(service.checkProcessAvailability(roomId, userId)).rejects.toThrow(NotFoundException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
    });
    it("should throw ForbiddenException because of user inexistence", async () => {
      const roomId = 1n;
      const userId = 1n;

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);

      await expect(service.checkProcessAvailability(roomId, userId)).rejects.toThrow(ForbiddenException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
    it("should throw ForbiddenException because of user role is not admin", async () => {
      const roomId = 1n;
      const userId = 1n;

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue({
        role: "member",
      });

      await expect(service.checkProcessAvailability(roomId, userId)).rejects.toThrow(ForbiddenException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
  });

  describe("Join Room", () => {
    it("should return new room data", async () => {
      const roomId = 1n;
      const userId = 2n;

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);

      const result = await service.joinRoom(roomId, {}, userId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({
        name: "room join",
        id: 1
      }));
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
      expect(prisma.addUserToRoom).toHaveBeenCalledWith(roomId, userId);
    });
    it("should throw BadRequestException", async () => {
      const roomId = 1n;
      const userId = 1n;

      expect(service.joinRoom(roomId, {}, userId)).rejects.toThrow(BadRequestException);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
  });

  describe("Leave Room", () => {
    it("should return undefined", async () => {
      const roomId = 2n;
      const userId = 1n;

      await expect(service.leaveRoom(roomId, {}, userId)).resolves.toBeUndefined();
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
      expect(prisma.removeUserFromRoom).toHaveBeenCalledWith(roomId, userId);
    });
    it("should throw NotFoundException", async () => {
      const roomId = 1n;
      const userId = 2n;

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);

      await expect(service.leaveRoom(roomId, {}, userId)).rejects.toThrow(NotFoundException);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
  });
});
