import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req?.cookies?.refresh_token,
            ]),
            secretOrKey: process.env.REFRESH_JWT_SECRET!,
            ignoreExpiration: false,
            passReqToCallback: false,
        })
    }

    async validate(payload: any) {
        return {userId: payload.sub, username: payload.nickname};
    }
}