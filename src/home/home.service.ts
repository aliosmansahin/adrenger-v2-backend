import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
    constructor(private prisma: PrismaService) {}

    async getRooms(userId: bigint) {
        const response = await this.prisma.getRoomsOfUser(userId);

        const mapped = response.map((item) => {
            return {
                roomId: item.roomId,
                role: item.role,
                name: item.room.name,
            }
        });

        return JSON.stringify(mapped, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    }
}
