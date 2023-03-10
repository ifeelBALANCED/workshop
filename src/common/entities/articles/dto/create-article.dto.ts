import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateArticleDto {
  @ApiProperty()
  @MinLength(5)
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @MaxLength(300)
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty()
  @IsString()
  body: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean = false;
}
