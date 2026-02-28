import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private prisma: PrismaService) {}

    async login(dto: LoginDto) {
        const user = await this.prisma.findUserFromEmail(dto.email);

        if(!user)
            throw new NotFoundException("user_not_found");

        const comp = await bcrypt.compare(dto.password, user.hash);

        if(!comp)
            throw new UnauthorizedException("invalid_credentials");

        const payload = {sub: user.id.toString(), username: user.nickname};
        const token = this.jwtService.sign(payload);

        return {
            access_token: token
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
        const token = this.jwtService.sign(payload);
        return {
            access_token: token
        };
    }
}
