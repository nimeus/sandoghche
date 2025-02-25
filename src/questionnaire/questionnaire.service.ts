import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '../entities/questionnaire.entity';
import { CreateQuestionnaireDto } from '../dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from '../dto/update-questionnaire.dto';

@Injectable()
export class QuestionnaireService {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnaireRepository: Repository<Questionnaire>,
  ) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto, userId: string): Promise<Questionnaire> {
    console.log(createQuestionnaireDto,userId)
    const questionnaire = this.questionnaireRepository.create({
      ...createQuestionnaireDto,
      userId,
      setting: JSON.stringify(createQuestionnaireDto.setting || {}),
    });

    return this.questionnaireRepository.save(questionnaire);
  }

  async findAll(userId?: string): Promise<Questionnaire[]> {
    const queryBuilder = this.questionnaireRepository.createQueryBuilder('questionnaire');

    if (userId) {
      queryBuilder.where('questionnaire.userId = :userId', { userId });
    } 
    //else {
      //queryBuilder.where('questionnaire.isPublic = :isPublic', { isPublic: true });
    //}

    return queryBuilder
      .orderBy('questionnaire.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, userId?: string): Promise<Questionnaire> {
    const queryBuilder = this.questionnaireRepository.createQueryBuilder('questionnaire');
    
    queryBuilder.where('questionnaire.id = :id', { id });

    if (userId) {
      queryBuilder.andWhere('(questionnaire.userId = :userId OR questionnaire.isPublic = :isPublic)', 
        { userId, isPublic: true });
    } else {
      queryBuilder.andWhere('questionnaire.isPublic = :isPublic', { isPublic: true });
    }

    const questionnaire = await queryBuilder.getOne();

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID "${id}" not found`);
    }

    return questionnaire;
  }

  async update(
    id: string, 
    updateQuestionnaireDto: UpdateQuestionnaireDto, 
    userId: string
  ): Promise<Questionnaire> {
    const questionnaire = await this.questionnaireRepository.findOne({
      where: { id, userId },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionnaire with ID "${id}" not found or unauthorized`);
    }

    // If setting is provided, stringify it
    if (updateQuestionnaireDto.setting) {
      updateQuestionnaireDto.setting = JSON.stringify(updateQuestionnaireDto.setting);
    }

    Object.assign(questionnaire, updateQuestionnaireDto);
    return this.questionnaireRepository.save(questionnaire);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.questionnaireRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(`Questionnaire with ID "${id}" not found or unauthorized`);
    }
  }
}