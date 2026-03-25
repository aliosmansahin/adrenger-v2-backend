import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { EditRoomDto } from './dto/edit-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { KickUserDto } from './dto/kick-user.dto';
import { PromoteUserDto } from './dto/promote-user.dto';
import { DepromoteMyselfDto } from './dto/depromote-myself.dto';

@Controller('rooms')
export class RoomController {
    constructor(private roomService: RoomService) {}
    
    @UseGuards(JwtAuthGuard)
    @Post()
    async createRoom(@Body() dto: CreateRoomDto, @Request() req) {
        return await this.roomService.createRoom(req.user.userId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get(":id")
    async getRoom(@Param("id", ParseIntPipe) roomId: bigint, @Request() req) {
        return this.roomService.getRoom(roomId, req.user.userId);
    }

    @Get(":id/only-join-data")
    async getRoomOnlyJoinData(@Param("id", ParseIntPipe) roomId: bigint) {
        return this.roomService.getRoomOnlyJoinData(roomId);
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
    @HttpCode(HttpStatus.OK)
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

    @UseGuards(JwtAuthGuard)
    @Get(":id/joined-users")
    async getJoinedUsers(@Param("id", ParseIntPipe) roomId: bigint, @Query("cursor") cursor: number | undefined, @Request() req) {
        return this.roomService.getJoinedUsers(roomId, cursor, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post(":id/kick/:userId")
    async kickUser(@Param("id", ParseIntPipe) roomId: bigint, @Param("userId", ParseIntPipe) kickUserId: bigint,  @Body() dto: KickUserDto, @Request() req) {
        return this.roomService.kickUser(roomId, dto, kickUserId, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Put(":id/promote/:userId")
    async promoteUser(@Param("id", ParseIntPipe) roomId: bigint, @Param("userId", ParseIntPipe) promoteUserId: bigint, @Body() dto: PromoteUserDto, @Request() req) {
        return this.roomService.promoteUser(roomId, dto, promoteUserId, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Put(":id/depromote-myself")
    async depromoteMyself(@Param("id", ParseIntPipe) roomId: bigint, @Body() dto: DepromoteMyselfDto, @Request() req) {
        return this.roomService.depromoteMyself(roomId, dto, req.user.userId);
    }
}