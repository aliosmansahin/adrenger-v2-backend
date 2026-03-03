import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

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
}