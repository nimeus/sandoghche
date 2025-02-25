import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../entities/answer.entity';
import { CreateAnswerDto } from '../dto/create-answer.dto';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
  ) {}

  async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
    const answer = this.answerRepository.create(createAnswerDto);
    return await this.answerRepository.save(answer);
  }

  async findByQuestionnaireId(questionnaireId: string): Promise<Answer[]> {
    return await this.answerRepository.find({ where: { questionnaireId } });
  }

  async findById(id: string): Promise<Answer | null> {
    return await this.answerRepository.findOne({ where: { id } });
  }
}
