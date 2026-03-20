import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    name!: string;

    @IsOptional()
    @IsString()
    password!: string;
}