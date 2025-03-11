import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';
import { UserInfoDto } from '../dto/user-info.dto';
import { AIReportDto } from '../dto/ai-report.dto';
import { IsBoolean, IsOptional } from 'class-validator';

@Entity('answers')
export class Answer {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'The unique identifier of the answer' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'The ID of the related questionnaire' })
  @Column('uuid')
  questionnaireId: string;

  @ApiProperty({ type: ResponseDto, description: 'Response containing rating and comment' })
  @Column('jsonb')
  response: ResponseDto;

  @ApiProperty({ type: UserInfoDto, description: 'User information', nullable: true })
  @Column('jsonb', { nullable: true })
  userInfo?: UserInfoDto;

  @ApiProperty({ type: AIReportDto, description: 'AI-generated report', nullable: true })
  @Column('jsonb', { nullable: true })
  aiReport?: AIReportDto;

  @ApiProperty({ example: '2024-02-15T12:00:00Z', description: 'The date and time when the answer was created' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-02-15T12:00:00Z', description: 'The date and time when the answer was last updated' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ example: false, description: 'Indicates if the answer has been analyzed' })
  @IsBoolean()
  @IsOptional()
  @Column({ default: null })
  isAnalyzed?: boolean; // Changed to camelCase
  //@ManyToOne(() => Questionnaire, questionnaire => questionnaire.answers, { onDelete: 'CASCADE' })
  //questionnaire: Questionnaire;
}
