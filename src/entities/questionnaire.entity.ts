import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('questionnaires')
export class Questionnaire {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'The unique identifier of the questionnaire',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Customer Satisfaction Survey',
    description: 'The name of the questionnaire',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the questionnaire is public',
    default: false,
  })
  @Column({ default: false })
  isPublic: boolean;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    description: 'The URL of the questionnaire logo',
  })
  @Column()
  logo: string;

  @ApiProperty({
    example: '{}',
    description: 'Questionnaire settings stored as JSON',
  })
  @Column({ type: 'json', default: '{}' })
  setting: string;

  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'The ID of the user who created this questionnaire',
  })
  @Column()
  userId: string;

  @ApiProperty({
    example: '2024-02-15T12:00:00Z',
    description: 'The date and time when the questionnaire was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-02-15T12:00:00Z',
    description: 'The date and time when the questionnaire was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.questionnaires)
  user: User;
}