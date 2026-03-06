import { Test, TestingModule } from '@nestjs/testing';
import { HomeService } from './home.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HomeService', () => {
  let service: HomeService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            getRoomsOfUser: jest.fn().mockResolvedValue([
              { id: 1, name: "room 0", userId: 1 },
              { id: 2, name: "room 1", userId: 1 }
            ]),
          },
        }
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("Get Rooms", () => {
    it("should return all rooms that belong to user", async () => {
      const result = await service.getRooms(1 as unknown as bigint);

      const parsed = JSON.parse(result);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
      expect(parsed).toEqual(expect.arrayContaining([
        expect.objectContaining({name: "room 0"})
      ]));
      expect(parsed).toEqual(expect.arrayContaining([
        expect.objectContaining({name: "room 1"})
      ]));

      expect(prisma.getRoomsOfUser).toHaveBeenCalledWith(1);
    })
  });
});
