import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from "bcrypt";
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

describe('RoomService', () => {
  let service: RoomService;
  let prisma: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
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
            getRoom: jest.fn().mockResolvedValue({
              id: 1,
              name: "room 0",
              hash: "mock-hash"
            }),
            getRoomOnlyJoinData: jest.fn().mockResolvedValue({
              id: 1,
              name: "room",
            }),
            findRoomFromId: jest.fn().mockResolvedValue({
              id: 1,
              name: "room",
              hash: "mock-hash",
            }),
            findUserInRoom: jest.fn().mockResolvedValue(
              {joinedAt: null, role: "admin", roomId: "1", userId: "1", user: {nickname: "mock-nickname"}}
            ),
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
            promoteUserToAdminInRoom: jest.fn().mockResolvedValue({
              role: "admin",
            }),
            depromoteUserToMemberInRoom: jest.fn().mockResolvedValue({
              role: "member",
            }),
            getUsersOfRoom: jest.fn().mockResolvedValue([
              {roomId: 1n, userId: 1n, joinedAt: null, role: "admin", user: {nickname: "mock-nickname"}},
            ]),
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

      expect(parsed).toEqual(expect.objectContaining({id: 1, name: roomData.name}));
      expect(bcrypt.hash).toHaveBeenCalledWith(roomData.password, 10);
      expect(prisma.createRoom).toHaveBeenCalledWith(userId, roomData.name, "mock-hash");
    });
  });

  describe("Get Room", () => {
    it("should return room data without hash", async () => {
      const userId = 1n;
      const roomId = 1n;

      const result = await service.getRoom(roomId, userId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({roomId: "1", name: "room 0"}));
      expect(parsed).toEqual(expect.not.objectContaining({hash: "mock-hash"}));
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
      expect(prisma.getRoom).toHaveBeenCalledWith(roomId);
    });
    it("should throw NotFoundException", async () => {
      const userId = 1n;
      const roomId = 2n; //Not exists

      (prisma.findRoomFromId as jest.Mock).mockResolvedValue(null);

      await expect(service.getRoom(roomId, userId)).rejects.toThrow(NotFoundException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
    });
    it("should throw ForbiddenException", async () => {
      const userId = 2n; //Not exists in room
      const roomId = 1n;

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);

      await expect(service.getRoom(roomId, userId)).rejects.toThrow(ForbiddenException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
  });

  describe("Get Room Only Join Data", () => {
    it("should return only join room data", async () => {
      const roomId = 1n;

      const result = await service.getRoomOnlyJoinData(roomId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({
        id: 1,
        name: "room"
      }));
      expect(prisma.getRoomOnlyJoinData).toHaveBeenCalledWith(roomId);
    });
    it("should throw NotFoundException", async () => {
      const roomId = 2n; //Not exists

      (prisma.getRoomOnlyJoinData as jest.Mock).mockResolvedValue(null);

      await expect(service.getRoomOnlyJoinData(roomId)).rejects.toThrow(NotFoundException);
      expect(prisma.getRoomOnlyJoinData).toHaveBeenCalledWith(roomId);
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
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const roomId = 1n;
      const userId = 1n;
      const roomData = {name: "room edit", changePassword: true, currentPassword: "", newPassword: "empty or not edit"};

      const result = await service.editRoom(roomId, roomData, userId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({
        name: "room edit",
        id: 1
      }));
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(roomData.currentPassword, "mock-hash");
      expect(bcrypt.hash).toHaveBeenCalledWith(roomData.newPassword, 10);
      expect(prisma.editRoom).toHaveBeenCalledWith(roomId, roomData.name, roomData.changePassword, "mock-hash");
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
    it("should return new room data with password", async () => {
      const roomId = 1n;
      const userId = 2n;

      const dto = {
        password: "mock-password",
      };

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.joinRoom(roomId, dto, userId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({
        name: "room join",
        id: 1
      }));
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, "mock-hash");
      expect(prisma.addUserToRoom).toHaveBeenCalledWith(roomId, userId);
    });
    it("should return new room data withOUT password", async () => {
      const roomId = 1n;
      const userId = 2n;

      const dto = {
        password: "",
      };

      (prisma.findRoomFromId as jest.Mock).mockResolvedValue({
        id: 1n,
        name: "room",
        hash: null,
      });
      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);

      const result = await service.joinRoom(roomId, dto, userId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({
        name: "room join",
        id: 1
      }));
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(prisma.addUserToRoom).toHaveBeenCalledWith(roomId, userId);
    });
    it("should throw NotFoundException", async () => {
      const roomId = 1n;
      const userId = 1n;
      
      const dto = {
        password: "mock-password",
      };

      (prisma.findRoomFromId as jest.Mock).mockResolvedValue(null);

      await expect(service.joinRoom(roomId, dto, userId)).rejects.toThrow(NotFoundException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
    });
    it("should throw BadRequestException", async () => {
      const roomId = 1n;
      const userId = 1n;
      
      const dto = {
        password: "mock-password",
      };

      await expect(service.joinRoom(roomId, dto, userId)).rejects.toThrow(BadRequestException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
    it("should throw ForbiddenException due to invalid password", async () => {
      const roomId = 1n;
      const userId = 1n;
      
      const dto = {
        password: "mock-invalid-password",
      };

      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.joinRoom(roomId, dto, userId)).rejects.toThrow(ForbiddenException);
      expect(prisma.findRoomFromId).toHaveBeenCalledWith(roomId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, "mock-hash");
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

  describe("Get Joined Users", () => {
    it("should return mapped joined users of room", async () => {
      const roomId = 1n;
      const userId = 1n;

      const cursor = undefined;

      const result = await service.getJoinedUsers(roomId, cursor, userId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.arrayContaining([expect.objectContaining({roomId: "1", joinedAt: null, role: "admin", user: {nickname: "mock-nickname", userId: "1"}})]));
      expect(prisma.getUsersOfRoom).toHaveBeenCalledWith(roomId, cursor);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, userId);
    });
  });

  describe("Kick User", () => {
    it("should not throw exception", async () => {
      const roomId = 1n;
      const meUserId = 1n;
      const kickUserId = 2n;

      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);
      (prisma.findUserInRoom as jest.Mock).mockResolvedValue({
        role: "member",
      });

      await expect(service.kickUser(roomId, {}, kickUserId, meUserId)).resolves.toBeUndefined();
      expect(spy).toHaveBeenCalledWith(roomId, meUserId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, kickUserId);
      expect(prisma.removeUserFromRoom).toHaveBeenCalledWith(roomId, kickUserId);
    });
    it("should throw BadRequestException", async () => {
      const roomId = 1n;
      const meUserId = 1n;
      const kickUserId = 1n;

      await expect(service.kickUser(roomId, {}, kickUserId, meUserId)).rejects.toThrow(BadRequestException);
    });
    it("should throw NotFoundException", async () => {
      const roomId = 1n;
      const meUserId = 1n;
      const kickUserId = 2n;

      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);
      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);

      await expect(service.kickUser(roomId, {}, kickUserId, meUserId)).rejects.toThrow(NotFoundException);
      expect(spy).toHaveBeenCalledWith(roomId, meUserId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, kickUserId);
    });
    it("should throw ForbiddenException", async () => {
      const roomId = 1n;
      const meUserId = 1n;
      const kickUserId = 2n;

      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);
      (prisma.findUserInRoom as jest.Mock).mockResolvedValue({
        role: "admin",
      });

      await expect(service.kickUser(roomId, {}, kickUserId, meUserId)).rejects.toThrow(ForbiddenException);
      expect(spy).toHaveBeenCalledWith(roomId, meUserId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, kickUserId);
    });
  });

  describe("Promote User", () => {
    it("should return promoted userroom object", async () => {
      const roomId = 1n;
      const meUserId = 1n;
      const promoteUserId = 2n;

      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);
      (prisma.findUserInRoom as jest.Mock).mockResolvedValue({
        role: "member",
      });

      const result = await service.promoteUser(roomId, {}, promoteUserId, meUserId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({
        role: "admin",
      }));
      expect(spy).toHaveBeenCalledWith(roomId, meUserId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, promoteUserId);
      expect(prisma.promoteUserToAdminInRoom).toHaveBeenCalledWith(roomId, promoteUserId);
    });
    it("should throw ForbiddenException", async () => {
      const roomId = 1n;
      const meUserId = 1n;
      const promoteUserId = 1n;
      
      await expect(service.promoteUser(roomId, {}, promoteUserId, meUserId)).rejects.toThrow(ForbiddenException);
    });
    it("should throw NotFoundException", async () => {
      const roomId = 1n;
      const meUserId = 1n;
      const promoteUserId = 3n; //Not exists

      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);
      (prisma.findUserInRoom as jest.Mock).mockResolvedValue(null);

      await expect(service.promoteUser(roomId, {}, promoteUserId, meUserId)).rejects.toThrow(NotFoundException);
      expect(spy).toHaveBeenCalledWith(roomId, meUserId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, promoteUserId);
    });
    it("should throw BadRequestException", async () => {
      const roomId = 1n;
      const meUserId = 1n;
      const promoteUserId = 2n;

      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);
      (prisma.findUserInRoom as jest.Mock).mockResolvedValue({
        role: "admin" // The user will be promoted is already an admin
      });

      await expect(service.promoteUser(roomId, {}, promoteUserId, meUserId)).rejects.toThrow(BadRequestException);
      expect(spy).toHaveBeenCalledWith(roomId, meUserId);
      expect(prisma.findUserInRoom).toHaveBeenCalledWith(roomId, promoteUserId);
    });
  });

  describe("Depromote Myself", () => {
    it("should return depromoted userroom object", async () => {
      const roomId = 1n;
      const userId = 1n;

      const spy = jest.spyOn(service, "checkProcessAvailability").mockResolvedValue(undefined);

      const result = await service.depromoteMyself(roomId, {}, userId);

      const parsed = JSON.parse(result);

      expect(parsed).toEqual(expect.objectContaining({
        role: "member",
      }));
      expect(spy).toHaveBeenCalledWith(roomId, userId);
      expect(prisma.depromoteUserToMemberInRoom).toHaveBeenCalledWith(roomId, userId);
    });
  });
});
