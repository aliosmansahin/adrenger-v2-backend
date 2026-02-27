import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService) {}

    login() {

    }
    register(dto: RegisterDto) {
        const payload = {sub: 1, username: "test"};
        const token = this.jwtService.sign(payload);
        return {
            access_token: token
        };
    }
}
