import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Patch, 
    Param, 
    Delete, 
    UseGuards,
    Request,
    Query,
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
  import { QuestionnaireService } from './questionnaire.service';
  import { CreateQuestionnaireDto } from '../dto/create-questionnaire.dto';
  import { UpdateQuestionnaireDto } from '../dto/update-questionnaire.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { Questionnaire } from '../entities/questionnaire.entity';
  
  @ApiTags('questionnaires')
  @Controller('questionnaires')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  export class QuestionnaireController {
    constructor(private readonly questionnaireService: QuestionnaireService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new questionnaire' })
    @ApiResponse({ status: 201, description: 'The questionnaire has been created successfully.' })
    create(
      @Body() createQuestionnaireDto: CreateQuestionnaireDto,
      @Request() req,
    ): Promise<Questionnaire> {
      console.log(req.user?.userId)
      return this.questionnaireService.create(createQuestionnaireDto, req.user?.userId);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all questionnaires' })
    @ApiResponse({ status: 200, description: 'Return all public questionnaires or user questionnaires if authenticated.' })
    findAll(@Request() req): Promise<Questionnaire[]> {
      console.log(req.user?.userId)

      const userId = req.user?.userId; // Optional chaining as user might not be authenticated
      return this.questionnaireService.findAll(userId);
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a questionnaire by id' })
    @ApiResponse({ status: 200, description: 'Return the questionnaire.' })
    @ApiResponse({ status: 404, description: 'Questionnaire not found.' })
    findOne(@Param('id') id: string, @Request() req): Promise<Questionnaire> {
      const userId = req.user?.id;
      return this.questionnaireService.findOne(id, userId);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a questionnaire' })
    @ApiResponse({ status: 200, description: 'The questionnaire has been updated successfully.' })
    @ApiResponse({ status: 404, description: 'Questionnaire not found.' })
    update(
      @Param('id') id: string,
      @Body() updateQuestionnaireDto: UpdateQuestionnaireDto,
      @Request() req,
    ): Promise<Questionnaire> {
      return this.questionnaireService.update(id, updateQuestionnaireDto, req.user.id);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a questionnaire' })
    @ApiResponse({ status: 200, description: 'The questionnaire has been deleted successfully.' })
    @ApiResponse({ status: 404, description: 'Questionnaire not found.' })
    remove(@Param('id') id: string, @Request() req): Promise<void> {
      return this.questionnaireService.remove(id, req.user.id);
    }
  }