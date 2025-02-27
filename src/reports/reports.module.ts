import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../entities/answer.entity';
import { ReportsController } from './reports.controller';
import { ReportService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Answer])],
  controllers: [ReportsController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportsModule {}