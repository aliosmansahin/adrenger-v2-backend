import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from "bcrypt";

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
              id: "1",
              name: "room 0",
              hash: "mock-hash"
            }),
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

      expect(parsed).toEqual(expect.objectContaining({id: "1", name: roomData.name, hash: "mock-hash"}));
      expect(bcrypt.hash).toHaveBeenCalledWith(roomData.password, 10);
      expect(prisma.createRoom).toHaveBeenCalledWith(userId, roomData.name, "mock-hash");
    });
  })
});
