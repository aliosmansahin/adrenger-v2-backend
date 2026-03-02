import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
    constructor(private prisma: PrismaService) {}

    async getRooms(userId: bigint) {
        return this.prisma.getRoomsOfUser(userId);
    }
}
