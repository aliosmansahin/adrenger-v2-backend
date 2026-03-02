import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createRoom(@Body() dto: CreateRoomDto, @Request() req) {
        return await this.roomService.createRoom(req.user.userId, dto);
    }
}
