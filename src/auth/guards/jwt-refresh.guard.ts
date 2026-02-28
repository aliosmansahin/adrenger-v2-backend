import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtRefreshGuard extends AuthGuard("jwt-refresh") {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }
    
    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
        if(err || !user) {
            throw err || new UnauthorizedException("unauthorized");
        }
        return user;
    }
}