import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
    async createMessage(roomId: bigint, userId: bigint, createMessageDto: CreateMessageDto) {
        //TODO: Add message to db
    }
}
