import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private config: ConfigService, private prisma: PrismaService) {}

    async login(dto: LoginDto) {
        const user = await this.prisma.findUserFromEmail(dto.email);

        if(!user)
            throw new NotFoundException("user_not_found");

        const comp = await bcrypt.compare(dto.password, user.hash);

        if(!comp)
            throw new UnauthorizedException("invalid_credentials");

        const payload = {sub: user.id.toString(), username: user.nickname};
        const access_token = this.jwtService.sign(payload, { expiresIn: "5m", secret: this.config.get<string>("ACCESS_JWT_SECRET") });
        const refresh_token = this.jwtService.sign(payload, { expiresIn: "1d", secret: this.config.get<string>("REFRESH_JWT_SECRET") });

        //Save the refresh token to the db
        this.prisma.updateRefreshTokenOfUser(user.id, refresh_token);

        return {
            access_token,
            refresh_token
        };
    }
    async register(dto: RegisterDto) {
        const existUser = await this.prisma.findUserFromEmail(dto.email);
        if(existUser)
            throw new ConflictException("user_already_exists");

        const hash = await bcrypt.hash(dto.password, 10);

        const createdUser = await this.prisma.createUser({
            email: dto.email,
            hash,
            nickname: dto.nickname
        });

        const payload = {sub: createdUser.id.toString(), username: createdUser.nickname};
        const access_token = this.jwtService.sign(payload, { expiresIn: "5m", secret: this.config.get<string>("ACCESS_JWT_SECRET") });
        const refresh_token = this.jwtService.sign(payload, { expiresIn: "1d", secret: this.config.get<string>("REFRESH_JWT_SECRET") });
        
        //Save the refresh token to the db
        this.prisma.updateRefreshTokenOfUser(createdUser.id, refresh_token);

        return {
            access_token,
            refresh_token
        };
    }
}
