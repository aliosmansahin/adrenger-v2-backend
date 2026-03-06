import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  controllers: [RoomController],
  providers: [JwtStrategy, RoomService]
})
export class RoomModule {}
