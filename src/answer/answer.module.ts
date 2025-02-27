import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from '../entities/answer.entity';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';
import { OpenAIService } from 'src/openai/openai.service';
import { BullModule } from '@nestjs/bull';
import { AnswerProcessor } from 'src/processors/answer.processor';

@Module({
  controllers: [AnswerController],
  imports: [
    TypeOrmModule.forFeature([Answer]),
    BullModule.forRoot({
      redis: {
        host: 'redis://:yw53Pi1BBBWf548sqbiGSG79@ilhuilhuilhui:6379/0',        
      },
    }),
    BullModule.registerQueue({
      name: 'answer-processing',
    }),
  ],
  providers: [AnswerService, AnswerProcessor, OpenAIService],
})
export class AnswerModule {}