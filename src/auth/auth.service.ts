import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private prisma: PrismaService) {}

    login(dto: LoginDto) {

    }
    async register(dto: RegisterDto) {
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
