import { Controller, Get, Query } from '@nestjs/common';
import { ExternalCommentsService } from './external-comments.service';

@Controller('comments')
export class ExternalCommentsController {
  constructor(private readonly commentsService: ExternalCommentsService) {}

  
  /**
   * Endpoint to fetch and save external comments.
   * Query parameters:
   * - vendorCode: The vendor code for the API call.
   * - questionnaireId: The ID to associate with the comments.
   * - externalServiceName: The external service name.
   * - sortType: (optional) Sort type for the API, defaults to 'score'.
   */
  @Get('fetch')
  async fetchAndSaveComments(
    @Query('vendorCode') vendorCode: string,
    @Query('questionnaireId') questionnaireId: string,
    @Query('externalServiceName') externalServiceName: "snappfood",
    @Query('sortType') sortType = 'score',
  ) {
    await this.commentsService.fetchAndSaveComments(
      vendorCode,
      questionnaireId,
      externalServiceName,
      sortType,
    );
    return {
      status: true,
      message: 'Comments fetched and saved successfully.',
    };
  }
}
