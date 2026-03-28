import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  providers: [JwtStrategy, MessageService],
  controllers: [MessageController]
})
export class MessageModule {}
