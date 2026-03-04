import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from "bcrypt";
import { ForbiddenException, NotFoundException } from '@nestjs/common';

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
      const roomId = 1;
      const userId = 1;

      await expect(service.deleteRoom(roomId as unknown as bigint, userId as unknown as bigint)).resolves.not.toThrow();
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
      expect(prisma.deleteRoom).toHaveBeenCalledWith(roomId);
    });
    it("should throw NotFoundException", async () => {
      const roomId = 2; //Doesn't exist
      const userId = 1;

      (prisma.findRoomFromId as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteRoom(roomId as unknown as bigint, userId as unknown as bigint)).rejects.toThrow(NotFoundException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
    });
    it("should throw ForbiddenException because of user inexistence", async () => {
      const roomId = 1;
      const userId = 1;

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteRoom(roomId as unknown as bigint, userId as unknown as bigint)).rejects.toThrow(ForbiddenException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
    it("should throw ForbiddenException because of user role is not admin", async () => {
      const roomId = 1;
      const userId = 1;

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue({
        role: "member",
      });

      await expect(service.deleteRoom(roomId as unknown as bigint, userId as unknown as bigint)).rejects.toThrow(ForbiddenException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
  });
});
