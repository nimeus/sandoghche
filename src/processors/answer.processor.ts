import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../entities/answer.entity';
import { OpenAIService } from '../openai/openai.service';

@Processor('answer-processing')
export class AnswerProcessor {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    private openAIService: OpenAIService,
  ) {}

  @Process('generate-ai-report')
  async handleGenerateAiReport(job: Job<{ answerId: string; comment: string }>) {
    console.log('Generating AI report for answer:', job.data);
    const { answerId, comment } = job.data;
    const aiReport = await this.openAIService.chatGptRequestForAnalyzingAnswer(comment);

    await this.answerRepository.update(answerId, {
      aiReport: JSON.parse(aiReport),
    });
  }
}
