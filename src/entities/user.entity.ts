import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Questionnaire } from './questionnaire.entity';

@Entity('users')
export class User {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @Column()
  fullName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  @Column()
  phone: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'The role of the user',
    enum: ['user', 'admin'],
    default: 'user',
  })
  @Column({ default: 'user' })
  role: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if the user is verified',
    default: false,
  })
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user account is active',
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '{}',
    description: 'User verification settings stored as JSON',
  })
  @Column({ type: 'json', default: '{}' })
  verificationSetting: string;

  @ApiProperty({
    example: '2024-02-15T12:00:00Z',
    description: 'The date and time when the user was created',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2024-02-15T12:00:00Z',
    description: 'The date and time when the user was last updated',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Questionnaire, questionnaire => questionnaire.user)
  questionnaires: Questionnaire[];
}