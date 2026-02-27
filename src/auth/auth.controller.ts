import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login")
    login() {
        return "Login route";
    }

    @Post("register")
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }
}
