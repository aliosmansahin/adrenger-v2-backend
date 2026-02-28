import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

@Module({
  controllers: [HomeController],
  providers: [JwtStrategy]
})
export class HomeModule {}
