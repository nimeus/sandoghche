import { IsUUID, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from './response.dto';
import { UserInfoDto } from './user-info.dto';
import { AIReportDto } from './ai-report.dto';

export class CreateAnswerDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'The questionnaire ID' })
  @IsUUID()
  questionnaireId: string;

  @ApiProperty({ type: ResponseDto, description: 'Response object containing rating and comment' })
  @ValidateNested()
  @Type(() => ResponseDto)
  response: ResponseDto;

  @ApiProperty({ type: UserInfoDto, description: 'User information', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserInfoDto)
  userInfo?: UserInfoDto;

  @ApiProperty({ type: AIReportDto, description: 'AI-generated report', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AIReportDto)
  aiReport?: AIReportDto;
}
