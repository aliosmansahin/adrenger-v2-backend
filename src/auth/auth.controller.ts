import { Body, Controller, HttpCode, HttpStatus, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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

    @UseGuards(JwtRefreshGuard)
    @Post("refresh")
    async refresh(@Request() req, @Res({passthrough: true}) res: Response) {
        const oldRefreshToken = req.cookies.refresh_token;

        const { access_token, refresh_token } = await this.authService.refreshTokens(req.user, oldRefreshToken);

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        return { access_token };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Post("logout")
    async logout(@Request() req, @Res({passthrough: true}) res: Response) {
        const user = req.user;

        await this.authService.logout(user);

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });
    }
}
