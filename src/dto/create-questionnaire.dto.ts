import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionnaireDto {
  @ApiProperty({
    example: 'Customer Satisfaction Survey',
    description: 'The name of the questionnaire',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: false,
    description: 'Whether the questionnaire is public',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'URL of the questionnaire logo',
  })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({
    example: { allowAnonymous: true, notifyOnSubmission: true },
    description: 'Questionnaire settings',
  })
  @IsOptional()
  setting?: string | Record<string, any>;;
}