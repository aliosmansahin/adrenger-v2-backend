import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class RefreshDto {
    @IsOptional()
    @Transform(({ value }) => {
        return ['on', 'true', true, '1', 1].includes(value);
    })
    @IsBoolean()
    rememberMe!: boolean;
}