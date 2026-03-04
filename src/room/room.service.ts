import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import * as bcrypt from "bcrypt";
import { EditRoomDto } from './dto/edit-room.dto';

@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService) {}

    async checkProcessAvailability(roomId: bigint, userId: bigint) {
        const room = await this.prisma.findRoomFromId(roomId);
        if(!room)
            throw new NotFoundException("room_not_found");

        //User and admin check
        const user = await this.prisma.findUserInRoom(roomId, userId);

        if(!user || user.role !== "admin")
            throw new ForbiddenException("access_denied");
    }

    async createRoom(creatorUserid: bigint, createRoomDto: CreateRoomDto) {
        let hash: string | null = null;
        if(createRoomDto.password)
            hash = await bcrypt.hash(createRoomDto.password, 10);

        const response = await this.prisma.createRoom(creatorUserid, createRoomDto.name, hash);

        return JSON.stringify(response, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    }

    async deleteRoom(roomId: bigint, userId: bigint) {
        await this.checkProcessAvailability(roomId, userId);

        //Delete room
        await this.prisma.deleteRoom(roomId);
    }

    async editRoom(roomId: bigint, editRoomDto: EditRoomDto, userId: bigint) {
        await this.checkProcessAvailability(roomId, userId);

        let hash: string | null = null;
        if(editRoomDto.password)
            hash = await bcrypt.hash(editRoomDto.password, 10);

        const response = await this.prisma.editRoom(roomId, editRoomDto.name, hash);

        return JSON.stringify(response, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    }
}
