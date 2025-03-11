import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { Answer } from '../entities/answer.entity';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { OpenAIService } from 'src/openai/openai.service';
import { InjectQueue } from '@nestjs/bull';
import { AIGeneratedReport } from 'src/entities/aiGeneratedReport.entity';
import { AIReportDto } from 'src/dto/ai-report.dto';
//import { Queue } from 'bull';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    
    @InjectRepository(AIGeneratedReport)
    private aiGeneratedReportRepository: Repository<AIGeneratedReport>,
    
    private openAIService: OpenAIService,
    //@InjectQueue('answer-processing') private answerQueue: Queue,
  ) {}

  async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
    // Generate the AI report using the OpenAIService
    let aiReport = "";
    
    try {
      const uniqueData = await this.GetDetailsForQuestionnaireAnswers(createAnswerDto.questionnaireId);

      const report = await this.openAIService.chatGptRequestForAnalyzingAnswer(createAnswerDto.response.comment,uniqueData);
      aiReport = report;
    } catch (error) {
      console.log("Get AI report error : ",error)
      aiReport = "";
    }
  
    // Create the answer entity with the AI report
    const answer = this.answerRepository.create({
      ...createAnswerDto,
      aiReport: aiReport == "" ? null : JSON.parse(aiReport),
    });
  
    const savedAnswer = await this.answerRepository.save(answer);

    // Check and generate batch report if needed
    this.generateOrUpdateBatchReport(createAnswerDto.questionnaireId);

    return savedAnswer;
  }

  async createMultipleAnswers(jsonAnswers: string | CreateAnswerDto[]): Promise<{
    answers: Answer[],
    timings: { individual: number[], total: number }
  }> {
    // Parse the JSON string into an array of CreateAnswerDto objects
    let answersArray: CreateAnswerDto[];

  
    const savedAnswers: Answer[] = [];
    const individualTimings: number[] = [];
    const totalStartTime = Date.now();
  
    // Iterate sequentially through each answer DTO
    if (typeof jsonAnswers === 'string') {
      answersArray = JSON.parse(jsonAnswers);
    } else {
      answersArray = jsonAnswers;
    }

    for (const answerDto of answersArray) {
      const startTime = Date.now();
  
      // Generate the AI report using the OpenAIService for each answer
      let aiReport = "";
      try {
        const report = await this.openAIService.chatGptRequestForAnalyzingAnswer(
          answerDto.response.comment,
          await this.GetDetailsForQuestionnaireAnswers(answerDto.questionnaireId)
        );
        aiReport = report;
      } catch (error) {
        console.log("Get AI report error for answer:", error);
        aiReport = "";
      }
  
      // Create the answer entity with the AI report attached (parsed if available)
      const answerEntity = this.answerRepository.create({
        ...answerDto,
        //aiReport: aiReport === "" ? null : JSON.parse(aiReport),
        aiReport: aiReport === "" ? null : JSON.parse(aiReport),
      });
  
      // Save the answer entity to the database
      const savedAnswer = await this.answerRepository.save(answerEntity);
      savedAnswers.push(savedAnswer);
  
      const endTime = Date.now();
      individualTimings.push(endTime - startTime);
    }
  
    const totalEndTime = Date.now();
    const totalTiming = totalEndTime - totalStartTime;
  
    // Check and generate batch report if needed
    for(var i=1;i <= 5 ;i++){
      console.log('batch ' + i);
      await this.generateOrUpdateBatchReport(answersArray[0].questionnaireId);
    }

    return {
      answers: savedAnswers,
      timings: {
        individual: individualTimings,
        total: totalTiming,
      },
    };
  }
  

 //async create(createAnswerDto: CreateAnswerDto): Promise<Answer> {
 //  const answer = this.answerRepository.create(createAnswerDto);
 //  const savedAnswer = await this.answerRepository.save(answer);
 //
 //  // Add a job to the queue for AI report generation
 //  await this.answerQueue.add('generate-ai-report', {
 //    answerId: savedAnswer.id,
 //    comment: createAnswerDto.response.comment,
 //  });
 //
 //  return savedAnswer;
 //}

  async findByQuestionnaireId(questionnaireId: string): Promise<Answer[]> {
    return await this.answerRepository.find({ where: { questionnaireId } });
  }

  async findById(id: string): Promise<Answer | null> {
    return await this.answerRepository.findOne({ where: { id } });
  }

  private async generateOrUpdateBatchReport(questionnaireId: string): Promise<void> {

    console.log("start batch report");

    // Get last 10 answers with isAnalyzed = null
    const nullAnalyzedAnswers = await this.answerRepository.find({
        where: { isAnalyzed: IsNull(), questionnaireId },
        order: { createdAt: 'DESC' },
        take: 10
    });

    if (nullAnalyzedAnswers.length !== 10) {
        return; // Only process when we have exactly 10 new answers
    }

    // Get existing report or initialize a new one
    let existingReport = await this.aiGeneratedReportRepository.findOne({ where: { questionnaireId } });
    const existingData: BatchReportData = existingReport?.data || {
        questionnaireId,
        totalAnswers: 0,
        averageAIRating: 0,
        averageUserMood: 0,
        importanceDistribution: { '1-3': 0, '4-6': 0, '7-10': 0 },
        categories: {},
        tags: {},
        needsActionCount: 0,
        prosCount: 0,
        consCount: 0,
        summaryStats: { totalPros: 0, totalCons: 0, actionStepsRequired: 0 },
        lastUpdatedAnswers: []
    };

    // Prepare data for AI
    const batchData = nullAnalyzedAnswers.map(answer => ({
        response: answer.response.comment,
        aiReport: answer.aiReport
    }));

    try {
        const validBatchData = batchData.filter(answer => answer.aiReport !== undefined) as { response: string; aiReport: AIReportDto }[];
        const updatedReportJson = await this.openAIService.generateBatchReportFromAI(existingData, validBatchData);
        const updatedData: BatchReportData = JSON.parse(updatedReportJson);

        console.log("finished batch report:",updatedData);

        // Save or update the report
        if (existingReport) {
            existingReport.data = updatedData;
            existingReport.updatedAt = new Date();
            await this.aiGeneratedReportRepository.save(existingReport);
        } else {
            const newReport = this.aiGeneratedReportRepository.create({
                questionnaireId,
                data: updatedData,
            });
            await this.aiGeneratedReportRepository.save(newReport);
        }

        // Mark answers as analyzed
        await this.answerRepository.update(
            { id: In(nullAnalyzedAnswers.map(a => a.id)) },
            { isAnalyzed: true }
        );
    } catch (error) {
        console.error('Failed to generate/update batch report:', error);
        await this.answerRepository.update(
            { id: In(nullAnalyzedAnswers.map(a => a.id)) },
            { isAnalyzed: false }
        );
    }
}

  async GetDetailsForQuestionnaireAnswers(questionnaireId: string) {
    const categories = await this.answerRepository
      .createQueryBuilder('answer')
      .select('DISTINCT answer."aiReport"->>\'category\' as category')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport"->\'category\' IS NOT NULL')
      .getRawMany();
  
    const tags = await this.answerRepository
      .createQueryBuilder('answer')
      .select('DISTINCT jsonb_array_elements_text(answer."aiReport"->\'tags\') as tag')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport"->\'tags\' IS NOT NULL')
      .getRawMany();
  
    const pros = await this.answerRepository
      .createQueryBuilder('answer')
      .select('DISTINCT jsonb_array_elements_text(answer."aiReport"->\'pros\') as pro')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport"->\'pros\' IS NOT NULL')
      .getRawMany();
  
    const cons = await this.answerRepository
      .createQueryBuilder('answer')
      .select('DISTINCT jsonb_array_elements_text(answer."aiReport"->\'cons\') as con')
      .where('answer."questionnaireId" = :questionnaireId', { questionnaireId })
      .andWhere('answer."aiReport"->\'cons\' IS NOT NULL')
      .getRawMany();
  
    return {
      categories: categories.map((a) => a.category),
      tags: tags.map((a) => a.tag),
      pros: pros.map((a) => a.pro),
      cons: cons.map((a) => a.con),
    };
  }
  

}
