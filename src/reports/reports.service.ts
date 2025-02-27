import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Answer } from '../entities/answer.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) {}

  async getAnswersByQuestionnaireId(
    questionnaireId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    comment?: string,
    minRating: number = 0,
    maxRating: number = 5,
    sortBy: 'createdAt' | 'updatedAt' | 'rating' = 'createdAt',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    hasAiReport?: boolean,
  ) {
    //console.log("questionnaireId",questionnaireId,page,limit,search,comment,minRating,maxRating,sortBy,sortOrder,hasAiReport)
    const skip = (page - 1) * limit;
    
    const queryBuilder = this.answersRepository.createQueryBuilder('answer')
      .where('answer.questionnaireId = :questionnaireId', { questionnaireId });
    
    // Apply general search filter if provided
    if (search) {
      queryBuilder.andWhere(`(
        answer.response::text ILIKE :search OR 
        answer.userInfo::text ILIKE :search
      )`, { search: `%${search}%` });
    }
    
    // Search specifically in the comment field
    if (comment) {
      queryBuilder.andWhere(`answer.response->>'comment' ILIKE :comment`, { 
        comment: `%${comment}%` 
      });
    }
    
    // Filter by rating range
    queryBuilder.andWhere(`(CAST(answer.response->>'rating' AS numeric) BETWEEN :minRating AND :maxRating)`, {
      minRating,
      maxRating
    });
    
    // Filter by presence of AI report if specified
    if (hasAiReport !== undefined) {
      if (hasAiReport) {
        queryBuilder.andWhere('answer.aiReport IS NOT NULL');
      } else {
        queryBuilder.andWhere('answer.aiReport IS NULL');
      }
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      queryBuilder.orderBy(`CAST(answer.response->>'rating' AS numeric)`, sortOrder);
    } else {
      queryBuilder.orderBy(`answer.${sortBy}`, sortOrder);
    }
    
    // Get total count for pagination
    const total = await queryBuilder.getCount();
    
    // Apply pagination
    const answers = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();
    
    const questionnaireSummary = await this.getAnswerSummaryByQuestionnaire(questionnaireId);
    return {
      data: answers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      questionnaireSummary
    };
  }

  async getAnswerById(answerId: string) {
    return this.answersRepository.findOne({ where: { id: answerId } });
  }

  // Add more report-specific methods as needed
  async getAnswerSummaryByQuestionnaire(questionnaireId: string) {
    // Get count of answers
    const totalAnswers = await this.answersRepository.count({
      where: { questionnaireId }
    });
    
    // Get count of answers with AI reports
    const answersWithAIReport = await this.answersRepository.count({
      where: { 
        questionnaireId,
        aiReport: Not(IsNull())
      }
    });
    
    // Get average rating (assuming response has a rating field)
    const avgRatingResult = await this.answersRepository
      .createQueryBuilder('answer')
      .select('AVG(CAST(answer.response->>\'rating\' AS numeric))', 'avgRating')
      .where('answer.questionnaireId = :questionnaireId', { questionnaireId })
      .getRawOne();
    
    // Get rating distribution
    const ratingDistribution = await this.answersRepository
      .createQueryBuilder('answer')
      .select('CAST(answer.response->>\'rating\' AS numeric)', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('answer.questionnaireId = :questionnaireId', { questionnaireId })
      .groupBy('rating')
      .orderBy('rating', 'ASC')
      .getRawMany();
    
    return {
      totalAnswers,
      answersWithAIReport,
      withoutAIReport: totalAnswers - answersWithAIReport,
      averageRating: avgRatingResult?.avgRating || 0,
      ratingDistribution,
    };
  }
}