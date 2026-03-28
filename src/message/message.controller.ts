import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('rooms/:roomId/messages')
export class MessageController {
    constructor(private messageService: MessageService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createMessage(@Param("roomId", ParseIntPipe) roomId: bigint, @Body() createMessageDto: CreateMessageDto,  @Request() req) {
        return this.messageService.createMessage(roomId, req.user.userId, createMessageDto);
    }
}
