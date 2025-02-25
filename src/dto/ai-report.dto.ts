import { IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AIReportDto {
  @ApiProperty({ example: { summary: 'AI-generated insights' }, description: 'AI-generated report data', required: false })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
