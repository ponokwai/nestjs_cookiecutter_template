import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDTO {
  @ApiProperty({
    description: 'The id of the book',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  readonly id: number;

  @ApiProperty({
    description: 'The title of the book',
    required: true,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({
    description: 'The description of the book',
    required: true,
    type: String,
  })
  @IsString()
  readonly description: string;

  @ApiProperty({
    description: 'The author of the book',
    required: true,
    type: String,
  })
  @IsString()
  readonly author: string;
}
