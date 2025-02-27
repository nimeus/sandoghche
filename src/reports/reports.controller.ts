import { Controller, Get, Param, Query, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportService } from './reports.service';
import { Answer } from '../entities/answer.entity';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('reports')
@Controller('reports/answers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(
    private readonly ReportService: ReportService,
  ) {}

  @Get('questionnaire/:questionnaireId')
  @ApiOperation({ summary: 'Get all answers by questionnaire ID' })
  @ApiParam({ name: 'questionnaireId', description: 'Questionnaire UUID' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Items per page', required: false, type: Number })
  @ApiQuery({ name: 'search', description: 'General search term in user info or response', required: false })
  @ApiQuery({ name: 'comment', description: 'Search term in response comment field', required: false })
  @ApiQuery({ name: 'minRating', description: 'Minimum rating value', required: false, type: Number })
  @ApiQuery({ name: 'maxRating', description: 'Maximum rating value', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', description: 'Field to sort by', required: false, enum: ['createdAt', 'updatedAt', 'rating'] })
  @ApiQuery({ name: 'sortOrder', description: 'Sort order', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'hasAiReport', description: 'Filter by presence of AI report', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns paginated answers for the questionnaire', type: [Answer] })
  async getAnswersByQuestionnaireId(
    @Param('questionnaireId', ParseUUIDPipe) questionnaireId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('comment') comment?: string,
    @Query('minRating', new DefaultValuePipe(0), ParseIntPipe) minRating?: number,
    @Query('maxRating', new DefaultValuePipe(5), ParseIntPipe) maxRating?: number,
    @Query('sortBy') sortBy: 'createdAt' | 'updatedAt' | 'rating' = 'createdAt',
    @Query('sortOrder') sortOrder: 'ASC' | 'DESC' = 'DESC',
    @Query('hasAiReport') hasAiReport?: boolean,
  ) {
    return this.ReportService.getAnswersByQuestionnaireId(
      questionnaireId,
      page,
      limit,
      search,
      comment,
      minRating,
      maxRating,
      sortBy,
      sortOrder,
      hasAiReport,
    );
  }

  @Get(':answerId')
  @ApiOperation({ summary: 'Get answer by ID' })
  @ApiParam({ name: 'answerId', description: 'Answer UUID' })
  @ApiResponse({ status: 200, description: 'Returns the answer', type: Answer })
  @ApiResponse({ status: 404, description: 'Answer not found' })
  async getAnswerById(@Param('answerId', ParseUUIDPipe) answerId: string) {
    const answer = await this.ReportService.getAnswerById(answerId);
    
    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`);
    }
    
    return answer;
  }

  @Get('summary/:questionnaireId')
  @ApiOperation({ summary: 'Get summary statistics for answers by questionnaire ID' })
  @ApiParam({ name: 'questionnaireId', description: 'Questionnaire UUID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns summary statistics for the questionnaire answers',
    schema: {
      type: 'object',
      properties: {
        totalAnswers: { type: 'number', description: 'Total number of answers' },
        answersWithAIReport: { type: 'number', description: 'Number of answers with AI reports' },
        withoutAIReport: { type: 'number', description: 'Number of answers without AI reports' },
        averageRating: { type: 'number', description: 'Average rating across all answers' },
        ratingDistribution: { 
          type: 'array', 
          description: 'Distribution of ratings',
          items: {
            type: 'object',
            properties: {
              rating: { type: 'number', description: 'Rating value' },
              count: { type: 'number', description: 'Number of answers with this rating' }
            }
          }
        }
      }
    }
  })
  async getAnswerSummaryByQuestionnaire(@Param('questionnaireId', ParseUUIDPipe) questionnaireId: string) {
    return this.ReportService.getAnswerSummaryByQuestionnaire(questionnaireId);
  }
}