import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService) {
        const adapter = new PrismaPg({connectionString: config.get<string>("DATABASE_URL")})
        super({adapter});
    }

    async createUser(createUserDto: CreateUserDto) {
        const user = await this.user.create({
            data: {
                email: createUserDto.email,
                hash: createUserDto.hash,
                nickname: createUserDto.nickname,
            },
        });

        return user;
    }

    async findUserFromEmail(userEmail: string) {
        const user = await this.user.findUnique({
            where: {
                email: userEmail
            }
        });

        return user;
    }

    async updateRefreshTokenOfUser(id: bigint, refresh_token: string) {
        await this.user.update({
            data: {
                refreshToken: refresh_token
            },
            where: {
                id
            }
        });
    }
}
