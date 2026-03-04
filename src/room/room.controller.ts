import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { EditRoomDto } from './dto/edit-room.dto';

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
}
