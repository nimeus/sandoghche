import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../entities/answer.entity';
import { ReportsController } from './reports.controller';
import { ReportService } from './reports.service';
import { AIGeneratedReport } from 'src/entities/aiGeneratedReport.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Answer,AIGeneratedReport])],
  controllers: [ReportsController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportsModule {}