import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, Brackets } from 'typeorm';
import { Answer } from '../entities/answer.entity';
import { QuestionnaireAnswersQueryDto } from 'src/dto/questionnaire-answers-query.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) {}

  async getAnswersByQuestionnaireId(
    questionnaireId: string,
    queryDto: QuestionnaireAnswersQueryDto
  ) {
    try {
      // Validate the DTO (this will be done by ValidationPipe in the controller)
      const sanitizedDto = queryDto.sanitizeInput();
  
      // Calculate pagination
      const page = sanitizedDto.page;
      const limit = sanitizedDto.limit;
      const skip = (page - 1) * limit;
  
      // Sanitize questionnaireId
      const sanitizedQuestionnaireId = this.sanitizeInput(questionnaireId);
  
      const queryBuilder = this.answersRepository
        .createQueryBuilder('answer')
        .where('answer."questionnaireId" = :questionnaireId', { 
          questionnaireId: sanitizedQuestionnaireId 
        });
  
      // Apply general search filter if provided
      if (sanitizedDto.search) {
        queryBuilder.andWhere(
          `(
            answer.response::text ILIKE :search
          )`,
          { search: `%${sanitizedDto.search}%` },
        );
      }
  
      // Search specifically in the comment field
      if (sanitizedDto.comment) {
        queryBuilder.andWhere(`answer.response->>'comment' ILIKE :comment`, {
          comment: `%${sanitizedDto.comment}%`,
        });
      }
  
      // Filter by rating range
      queryBuilder.andWhere(
        `(CAST(answer.response->>'rating' AS numeric) BETWEEN :minRating AND :maxRating)`,
        { 
          minRating: sanitizedDto.minRating, 
          maxRating: sanitizedDto.maxRating 
        },
      );
  
      // Handle hasAiReport and aiReport-related filters
      if (sanitizedDto.hasAiReport === true) {
        queryBuilder.andWhere('answer."aiReport" IS NOT NULL');
        
        // Apply AI report filters
        if (sanitizedDto.tags) {
          const selectedTags = sanitizedDto.tags.split(',');
          if (selectedTags.length > 0) {
            queryBuilder.andWhere('answer."aiReport"->\'tags\' ?| :selectedTags', { selectedTags });
          }
        }
  
        if (sanitizedDto.categories) {
          const selectedCategories = sanitizedDto.categories.split(',');
          if (selectedCategories.length > 0) {
            queryBuilder.andWhere('answer."aiReport"->>\'category\' IN (:...selectedCategories)', {
              selectedCategories,
            });
          }
        }
  
        // Additional numeric filters
        if (sanitizedDto.minMood !== undefined && sanitizedDto.maxMood !== undefined) {
          queryBuilder.andWhere(
            '(answer."aiReport"->>\'user_mood\')::numeric BETWEEN :minMood AND :maxMood',
            { 
              minMood: sanitizedDto.minMood, 
              maxMood: sanitizedDto.maxMood 
            },
          );
        }
  
        if (sanitizedDto.minImportance !== undefined && sanitizedDto.maxImportance !== undefined) {
          queryBuilder.andWhere(
            '(answer."aiReport"->>\'importance_index\')::numeric BETWEEN :minImportance AND :maxImportance',
            { 
              minImportance: sanitizedDto.minImportance, 
              maxImportance: sanitizedDto.maxImportance 
            },
          );
        }
  
        if (sanitizedDto.minAnalyzedRating !== undefined && sanitizedDto.maxAnalyzedRating !== undefined) {
          queryBuilder.andWhere(
            '(answer."aiReport"->>\'analyzed_ai_rating\')::numeric BETWEEN :minAnalyzedRating AND :maxAnalyzedRating',
            { 
              minAnalyzedRating: sanitizedDto.minAnalyzedRating, 
              maxAnalyzedRating: sanitizedDto.maxAnalyzedRating 
            },
          );
        }
  
        if (sanitizedDto.actionRequired !== undefined) {
          queryBuilder.andWhere('answer."aiReport"->>\'needs_action\' = :actionRequired::text', {
            actionRequired: sanitizedDto.actionRequired.toString(),
          });
        }
      } else if (sanitizedDto.hasAiReport === false) {
        queryBuilder.andWhere('answer."aiReport" IS NULL');
      } else {
        // hasAiReport is undefined (i.e., 'all'), include answers with and without aiReport
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('answer."aiReport" IS NULL').orWhere(
              new Brackets((qb2) => {
                qb2.where('answer."aiReport" IS NOT NULL');
                
                // Reuse existing AI report filter logic
                if (sanitizedDto.tags) {
                  const selectedTags = sanitizedDto.tags.split(',');
                  if (selectedTags.length > 0) {
                    qb2.andWhere('answer."aiReport"->\'tags\' ?| :selectedTags', { selectedTags });
                  }
                }
  
                if (sanitizedDto.categories) {
                  const selectedCategories = sanitizedDto.categories.split(',');
                  if (selectedCategories.length > 0) {
                    qb2.andWhere('answer."aiReport"->>\'category\' IN (:...selectedCategories)', {
                      selectedCategories,
                    });
                  }
                }
  
                // Numeric filters
                if (sanitizedDto.minMood !== undefined && sanitizedDto.maxMood !== undefined) {
                  qb2.andWhere(
                    '(answer."aiReport"->>\'user_mood\')::numeric BETWEEN :minMood AND :maxMood',
                    { 
                      minMood: sanitizedDto.minMood, 
                      maxMood: sanitizedDto.maxMood 
                    },
                  );
                }
  
                if (sanitizedDto.minImportance !== undefined && sanitizedDto.maxImportance !== undefined) {
                  qb2.andWhere(
                    '(answer."aiReport"->>\'importance_index\')::numeric BETWEEN :minImportance AND :maxImportance',
                    { 
                      minImportance: sanitizedDto.minImportance, 
                      maxImportance: sanitizedDto.maxImportance 
                    },
                  );
                }
  
                if (sanitizedDto.minAnalyzedRating !== undefined && sanitizedDto.maxAnalyzedRating !== undefined) {
                  qb2.andWhere(
                    '(answer."aiReport"->>\'analyzed_ai_rating\')::numeric BETWEEN :minAnalyzedRating AND :maxAnalyzedRating',
                    { 
                      minAnalyzedRating: sanitizedDto.minAnalyzedRating, 
                      maxAnalyzedRating: sanitizedDto.maxAnalyzedRating 
                    },
                  );
                }
  
                if (sanitizedDto.actionRequired !== undefined) {
                  qb2.andWhere('answer."aiReport"->>\'needs_action\' = :actionRequired::text', {
                    actionRequired: sanitizedDto.actionRequired.toString(),
                  });
                }
              }),
            );
          }),
        );
      }
  
      // Apply sorting
      if (sanitizedDto.sortBy === 'rating') {
        queryBuilder.orderBy(`CAST(answer.response->>'rating' AS numeric)`, sanitizedDto.sortOrder);
      } else {
        queryBuilder.orderBy(`answer.${sanitizedDto.sortBy}`, sanitizedDto.sortOrder);
      }
  
      // Get total count for pagination
      const total = await queryBuilder.getCount();
  
      // Apply pagination
      const answers = await queryBuilder.skip(skip).take(limit).getMany();
  
      return {
        data: answers,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },       
      };
    } catch (error) { 
      console.log(error)
      // Throw a generic error to prevent information leakage
      throw new InternalServerErrorException('Unable to retrieve answers');
    }    
  }

  private sanitizeInput(input: string): string {
    return input
      .replace(/['";`\\]/g, '') // Remove quotes and potential SQL injection chars
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim()
      .substring(0, 255);
  }


  async getTagsByQuestionnaireId(questionnaireId: string): Promise<string[]> {
    const answers = await this.answersRepository
      .createQueryBuilder('answer')
      .select('DISTINCT jsonb_array_elements_text(answer."aiReport"->\'tags\') as tag')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport"->\'tags\' IS NOT NULL')
      .getRawMany();
    return answers.map((a) => a.tag);
}

async getCategoriesByQuestionnaireId(questionnaireId: string): Promise<string[]> {
  const answers = await this.answersRepository
    .createQueryBuilder('answer')
    .select('DISTINCT answer."aiReport"->>\'category\' as category')
    .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
    .andWhere('answer."aiReport"->\'category\' IS NOT NULL')
    .getRawMany();
  return answers.map((a) => a.category);
}

  async getAnswerById(answerId: string) {
    return this.answersRepository.findOne({ where: { id: answerId } });
  }

  // Add more report-specific methods as needed
  async getAnswerSummaryByQuestionnaire(questionnaireId: string) {
    // Get total count of answers
    const totalAnswers = await this.answersRepository.count({
      where: { questionnaireId },
    });
  
    // Get count of answers with AI reports
    const answersWithAIReport = await this.answersRepository.count({
      where: {
        questionnaireId,
        aiReport: Not(IsNull()),
      },
    });
  
    // Get average rating from user responses
    const avgRatingResult = await this.answersRepository
      .createQueryBuilder('answer')
      .select('AVG(CAST(answer.response->>\'rating\' AS numeric))', 'avgRating')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .getRawOne();
  
    // Get rating distribution
    const ratingDistribution = await this.answersRepository
      .createQueryBuilder('answer')
      .select('CAST(answer.response->>\'rating\' AS numeric)', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .groupBy('rating')
      .orderBy('rating', 'ASC')
      .getRawMany();
  
    // Get average user mood from AI reports
    const avgMoodResult = await this.answersRepository
      .createQueryBuilder('answer')
      .select('AVG(CAST(answer."aiReport"->>\'user_mood\' AS numeric))', 'avgMood')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport" IS NOT NULL')
      .getRawOne();
  
    // Get average importance index from AI reports
    const avgImportanceResult = await this.answersRepository
      .createQueryBuilder('answer')
      .select('AVG(CAST(answer."aiReport"->>\'importance_index\' AS numeric))', 'avgImportance')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport" IS NOT NULL')
      .getRawOne();
  
    // Get average analyzed AI rating from AI reports
    const avgAnalyzedRatingResult = await this.answersRepository
      .createQueryBuilder('answer')
      .select('AVG(CAST(answer."aiReport"->>\'analyzed_ai_rating\' AS numeric))', 'avgAnalyzedRating')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport" IS NOT NULL')
      .getRawOne();
  
    // Get count of answers that require action
    const actionRequiredCount = await this.answersRepository
      .createQueryBuilder('answer')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport" IS NOT NULL')
      .andWhere('answer."aiReport"->>\'needs_action\' = \'true\'')
      .getCount();
  
    // Get category distribution
    const categoryDistribution = await this.answersRepository
      .createQueryBuilder('answer')
      .select('answer."aiReport"->>\'category\'', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport" IS NOT NULL')
      .groupBy('answer."aiReport"->>\'category\'')
      .orderBy('count', 'DESC')
      .getRawMany();
  
    // Return the enhanced summary
    return {
      totalAnswers,
      answersWithAIReport,
      withoutAIReport: totalAnswers - answersWithAIReport,
      averageRating: avgRatingResult?.avgRating || 0,
      ratingDistribution,
      averageMood: avgMoodResult?.avgMood || 0,
      averageImportance: avgImportanceResult?.avgImportance || 0,
      averageAnalyzedRating: avgAnalyzedRatingResult?.avgAnalyzedRating || 0,
      actionRequiredCount,
      categoryDistribution,
    };
  }
}