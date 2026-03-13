import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    @MaxLength(128)
    @IsNotEmpty()
    password!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(50)
    @IsNotEmpty()
    nickname!: string;

    @IsOptional()
    @Transform(({ value }) => {
        return ['on', 'true', true, '1', 1].includes(value);
    })
    @IsBoolean()
    rememberMe!: boolean;
}