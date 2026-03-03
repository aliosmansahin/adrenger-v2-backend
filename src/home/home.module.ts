import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { HomeService } from './home.service';

@Module({
  controllers: [HomeController],
  providers: [JwtStrategy, HomeService]
})
export class HomeModule {}
