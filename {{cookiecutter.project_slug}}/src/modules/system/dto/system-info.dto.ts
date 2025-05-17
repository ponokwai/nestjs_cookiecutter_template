import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';

export class SystemInfoDto {
  @ApiProperty({
    description: 'Diagnostic checks to run',
    example: ['basic', 'database', 'network'],
    required: false,
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  checks?: string[];
}
