import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { Answer } from '../entities/answer.entity';

@ApiTags('Answers') // Group in Swagger UI
@Controller('answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new answer' })
  @ApiResponse({ status: 201, description: 'Answer successfully created', type: Answer })
  @ApiBody({ type: CreateAnswerDto })
  async create(@Body() createAnswerDto: CreateAnswerDto): Promise<Answer> {
    console.log(createAnswerDto);
    return this.answerService.create(createAnswerDto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Create multiple new answers' })
  @ApiResponse({ 
    status: 201, 
    description: 'Answers successfully created', 
    type: [Answer] 
  })
  @ApiBody({ 
    description: 'JSON string representing an array of CreateAnswerDto objects', 
    type: String 
  })
  async createMultiple(
    @Body() answersJson: string,
  ): Promise<{ 
    answers: Answer[], 
    timings: { individual: number[], total: number } 
  }> {
    console.log(answersJson);
    return this.answerService.createMultipleAnswers(answersJson);
  }

  //@Get('questionnaire/:questionnaireId')
  //@ApiOperation({ summary: 'Get all answers for a specific questionnaire' })
  //@ApiResponse({ status: 200, description: 'List of answers', type: [Answer] })
  //@ApiParam({ name: 'questionnaireId', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'The questionnaire ID' })
  //async findByQuestionnaireId(@Param('questionnaireId') questionnaireId: string): Promise<Answer[]> {
  //  return this.answerService.findByQuestionnaireId(questionnaireId);
  //}
  //
  //@Get(':id')
  //@ApiOperation({ summary: 'Get an answer by ID' })
  //@ApiResponse({ status: 200, description: 'The answer details', type: Answer })
  //@ApiResponse({ status: 404, description: 'Answer not found' })
  //@ApiParam({ name: 'id', example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'The answer ID' })
  //async findById(@Param('id') id: string): Promise<Answer | null> {
  //  return this.answerService.findById(id);
  //}

   /**
   * Endpoint to retrieve external comments (from ExternalComment table) with AI reports.
   * Query Parameter:
   *   - questionnaireId: The ID used to filter external comments.
   */
   @ApiOperation({ summary: 'Retrieve external comments with AI reports' })
   @ApiQuery({
     name: 'questionnaireId',
     description: 'The questionnaire ID used to filter external comments',
     required: true,
     type: String,
   })
   @ApiResponse({
     status: 200,
     description: 'External comments with AI reports successfully retrieved',
     schema: {
       example: {
         status: true,
         data: [
           {
             commentId: 12345,
             questionnaireId: 'abc123-uuid',
             externalServiceName: 'ExternalServiceX',
             isImported: false,
             createdAt: '2024-04-01T12:00:00.000Z',
             updatedAt: '2024-04-01T12:00:00.000Z',
             commentPayload: {
               createdDate: '2024-04-01',
               sender: 'John Doe',
               commentText: 'This is a comment.',
               rating: 5,
               feeling: 'happy',
               expeditionType: 'PICKUP',
               foods: []
             },
             aiReport: {
               summary: 'AI generated summary for the comment',
               sentiment: 'positive'
               // additional AI report fields...
             }
           }
         ]
       }
     }
   })
   @Get('external-comments')
   async importExternalCommentsAsAnswers(
     @Query('questionnaireId') questionnaireId: string,
   ) {
     const result = await this.answerService.importExternalCommentsAsAnswers(questionnaireId);
     return {
       status: true,
       data: result,
     };
   }
}
