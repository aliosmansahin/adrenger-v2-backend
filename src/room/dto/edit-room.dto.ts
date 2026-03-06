import { IsNotEmpty, IsString, Length } from "class-validator";

export class EditRoomDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 30)
    name!: string;

    @IsString()
    password!: string;
}