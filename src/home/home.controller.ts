import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
    constructor(private homeService: HomeService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async home(@Request() req) {
        const userId = req.user.userId;
        return this.homeService.getRooms(userId);
    }
}
