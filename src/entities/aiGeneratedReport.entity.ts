// ai-generated-report.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('aiGeneratedReport')
export class AIGeneratedReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    questionnaireId: string;

    @Column('jsonb')
    data: any; // You can define a more specific type based on your report structure

    @UpdateDateColumn()
    updatedAt: Date;
}