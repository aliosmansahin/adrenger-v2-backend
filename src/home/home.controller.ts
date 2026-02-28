import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('home')
export class HomeController {
    @UseGuards(JwtAuthGuard)
    @Get()
    home(@Request() req) {
        return req.user;
    }
}
