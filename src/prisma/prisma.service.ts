import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { EditRoomDto } from '../room/dto/edit-room.dto';

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

    async deleteRefreshTokenOfUser(id: bigint) {
        await this.user.update({
            data: {
                refreshToken: null
            },
            where: {
                id
            }
        });
    }

    async findUserFromId(id: bigint) {
        return await this.user.findUnique({
            where: {
                id
            }
        });
    }

    async createRoom(creatorUserId: bigint, name: string, hash: string | null) {
        return await this.room.create({
            data: {
                name,
                hash,
                createdBy: {
                    connect: {
                        id: creatorUserId,
                    },
                },
                users: {
                    create: {
                        userId: creatorUserId,
                        role: "admin",
                    },
                }
            }
        });
    }

    async getRoom(roomId: bigint) {
        return await this.room.findUnique({
            where: {
                id: roomId,
            },
            include: {
                createdBy: {
                    select: {
                        nickname: true,
                    }
                }
            }
        });
    }
    
    async getRoomOnlyJoinData(roomId: bigint) {
        return await this.room.findUnique({
            where: {
                id: roomId,
            },
            select: {
                id: true,
                createdBy: {
                    select: {
                        nickname: true,
                    }
                },
                name: true,
                hash: true,
            }
        });
    }

    async getRoomsOfUser(userId: bigint, cursor: number | undefined) {
        return await this.userRoom.findMany({
            where: {
                userId,
            },
            ...(cursor && {
                cursor: {
                    userId_roomId: {
                        roomId: cursor,
                        userId,
                    },
                }
            }),
            take: 10, // 10 room limit
            skip: cursor ? 1 : 0, //Skip the cursor to prevent duplication
            orderBy: {
                joinedAt: 'desc',
            },
            include: {
                room: true,
            },
        });
    }

    async findUserInRoom(roomId: bigint, userId: bigint) {
        return await this.userRoom.findUnique({
            where: {
                userId_roomId: {
                    userId,
                    roomId,
                }
            },
        });
    }

    async deleteRoom(roomId: bigint) {
        return await this.room.delete({
            where: {
                id: roomId
            }
        });
    }

    async findRoomFromId(roomId: bigint) {
        return await this.room.findUnique({
            where: {
                id: roomId
            }
        })
    }

    async editRoom(roomId: bigint, name: string, changePassword: boolean, hash: string | null) {
        return await this.room.update({
            where: {
                id: roomId,
            },
            data: {
                name,
                ...(changePassword && {
                    hash
                })
            },
        })
    }

    async addUserToRoom(roomId: bigint, userId: bigint) {
        return await this.room.update({
            where: {
                id: roomId,
            },
            data: {
                users: {
                    create: {
                        role: "member",
                        user: {
                            connect: {
                                id: userId,
                            }
                        }
                    }
                }
            }
        })
    }

    async removeUserFromRoom(roomId: bigint, userId: bigint) {
        await this.room.update({
            where: {
                id: roomId,
            },
            data: {
                users: {
                    delete: {
                        userId_roomId: {
                            roomId,
                            userId,
                        }
                    }
                }
            }
        })
    }

    async getUsersOfRoom(roomId: bigint, cursor: number | undefined) {
        return await this.userRoom.findMany({
            where: {
                roomId,
            },
            ...(cursor && {
                cursor: {
                    userId_roomId: {
                        roomId,
                        userId: cursor,
                    }
                }
            }),
            include: {
                user: {
                    select: {
                        nickname: true,
                    }
                }
            }
        });
    }

    async promoteUserToAdminInRoom(roomId: bigint, userId: bigint) {
        return await this.userRoom.update({
            where: {
                userId_roomId: {
                    roomId,
                    userId,
                }
            },
            data: {
                role: "admin",
            }
        })
    }

    async depromoteUserToMemberInRoom(roomId: bigint, userId: bigint) {
        return await this.userRoom.update({
            where: {
                userId_roomId: {
                    roomId,
                    userId,
                }
            },
            data: {
                role: "member",
            }
        });
    }
}
