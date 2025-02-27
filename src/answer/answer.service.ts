import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../entities/answer.entity';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { OpenAIService } from 'src/openai/openai.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    private openAIService: OpenAIService,
    @InjectQueue('answer-processing') private answerQueue: Queue,
  ) {}

  //async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
  //  // Generate the AI report using the OpenAIService
  //  let aiReport = "";
  //  
  //  try {
  //    const report = await this.openAIService.chatGptRequestForAnalyzingAnswer(createAnswerDto.response.comment);
  //    aiReport = report;
  //  } catch (error) {
  //    console.log("Get AI report error : ",error)
  //    aiReport = "";
  //  }
//
  //  // Create the answer entity with the AI report
  //  const answer = this.answerRepository.create({
  //    ...createAnswerDto,
  //    aiReport: aiReport == "" ? null : JSON.parse(aiReport),
  //  });
//
  //  // Save the answer entity to the database
  //  return await this.answerRepository.save(answer);
  //}

 async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
   const answer = this.answerRepository.create(createAnswerDto);
   const savedAnswer = await this.answerRepository.save(answer);
 
   // Add a job to the queue for AI report generation
   await this.answerQueue.add('generate-ai-report', {
     answerId: savedAnswer.id,
     comment: createAnswerDto.response.comment,
   });
 
   return savedAnswer;
 }

  async findByQuestionnaireId(questionnaireId: string): Promise<Answer[]> {
    return await this.answerRepository.find({ where: { questionnaireId } });
  }

  async findById(id: string): Promise<Answer | null> {
    return await this.answerRepository.findOne({ where: { id } });
  }
}
