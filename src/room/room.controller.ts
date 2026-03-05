import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { EditRoomDto } from './dto/edit-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';

@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createRoom(@Body() dto: CreateRoomDto, @Request() req) {
        return await this.roomService.createRoom(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(":id")
    async deleteRoom(@Param("id", ParseIntPipe) roomId: bigint, @Request() req) {
        return this.roomService.deleteRoom(roomId, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(":id")
    async editRoom(@Param("id", ParseIntPipe) roomId: bigint, @Body() dto: EditRoomDto, @Request() req) {
        return this.roomService.editRoom(roomId, dto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(":id/join")
    async joinRoom(@Param("id", ParseIntPipe) roomId: bigint, @Body() dto: JoinRoomDto, @Request() req) {
        return this.roomService.joinRoom(roomId, dto, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post(":id/leave")
    async leaveRoom(@Param("id", ParseIntPipe) roomId: bigint, @Body() dto: LeaveRoomDto, @Request() req) {
        return this.roomService.leaveRoom(roomId, dto, req.user.userId);
    }
}
