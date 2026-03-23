import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class EditRoomDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    name!: string;

    @IsBoolean()
    changePassword!: boolean;

    @IsOptional()
    @IsString()
    currentPassword!: string;

    @IsOptional()
    @IsString()
    newPassword!: string;
}