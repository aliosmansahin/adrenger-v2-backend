import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
    constructor(private prisma: PrismaService) {}

    async getRooms(userId: bigint) {
        const response = await this.prisma.getRoomsOfUser(userId);

        return JSON.stringify(response, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    }
}
