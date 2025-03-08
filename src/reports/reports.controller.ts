import { Controller, Get, Param, Query, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe, NotFoundException, UseGuards, ParseFloatPipe, ParseBoolPipe, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportService } from './reports.service';
import { Answer } from '../entities/answer.entity';
import { AuthGuard } from '@nestjs/passport';
import { QuestionnaireAnswersQueryDto } from 'src/dto/questionnaire-answers-query.dto';

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
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved questionnaire answers' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input parameters' 
  })
  @UsePipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true, 
    forbidNonWhitelisted: true,
    validateCustomDecorators: true
  }))
  async getAnswersByQuestionnaireId(
    @Param('questionnaireId') questionnaireId: string,
    @Query() queryDto: QuestionnaireAnswersQueryDto
  ) {
    return this.ReportService.getAnswersByQuestionnaireId(
      questionnaireId,
      queryDto
    );
  }


  @Get('questionnaire/:questionnaireId/tags')
  @ApiOperation({ summary: 'Get distinct tags for a questionnaire' })
  @ApiParam({ name: 'questionnaireId', description: 'Questionnaire UUID' })
  @ApiResponse({ status: 200, description: 'Returns distinct tags', type: [String] })
  async getTagsByQuestionnaireId(@Param('questionnaireId', ParseUUIDPipe) questionnaireId: string) {
    return this.ReportService.getTagsByQuestionnaireId(questionnaireId);
  }

  @Get('questionnaire/:questionnaireId/categories')
  @ApiOperation({ summary: 'Get distinct categories for a questionnaire' })
  @ApiParam({ name: 'questionnaireId', description: 'Questionnaire UUID' })
  @ApiResponse({ status: 200, description: 'Returns distinct categories', type: [String] })
  async getCategoriesByQuestionnaireId(@Param('questionnaireId', ParseUUIDPipe) questionnaireId: string) {
    return this.ReportService.getCategoriesByQuestionnaireId(questionnaireId);
  }

  @Get('questionnaire/:questionnaireId/summary')
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