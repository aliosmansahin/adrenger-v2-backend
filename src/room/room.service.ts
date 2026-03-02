import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import * as bcrypt from "bcrypt";

@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService) {}

    async createRoom(creatorUserid: bigint, createRoomDto: CreateRoomDto) {
        let hash: string | null = null;
        if(createRoomDto.password)
            hash = await bcrypt.hash(createRoomDto.password, 10);

        const response = await this.prisma.createRoom(creatorUserid, createRoomDto.name, hash);

        return JSON.stringify(response, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    }
}
