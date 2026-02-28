import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("login")
    async login(@Body() dto: LoginDto, @Res({passthrough: true}) res: Response) {
        const { access_token, refresh_token } = await this.authService.login(dto);

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return { access_token };
    }

    @Post("register")
    async register(@Body() dto: RegisterDto, @Res({passthrough: true}) res: Response) {
        const { access_token, refresh_token } = await this.authService.register(dto);

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return { access_token };
    }
}
