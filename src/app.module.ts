import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HomeModule } from './home/home.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}), AuthModule, PrismaModule, HomeModule, RoomModule],
})
export class AppModule {}
