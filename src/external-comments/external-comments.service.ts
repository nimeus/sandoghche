import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ExternalComment } from '../entities/externalComment.entity';

@Injectable()
export class ExternalCommentsService {
  private readonly logger = new Logger(ExternalCommentsService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(ExternalComment)
    private readonly commentRepository: Repository<ExternalComment>,
  ) {}
/**
   * Fetch comments from the external API and batch save new ones.
   * Iterates pages until fewer than 10 comments are returned.
   * Waits 5 seconds between each API call.
   *
   * @param vendorCode - the vendor code for the API request.
   * @param questionnaireId - the ID to associate with each comment.
   * @param externalServiceName - the external service name.
   * @param sortType - sort type for the API (default: 'score').
   */
async fetchAndSaveComments(
  vendorCode: string,
  questionnaireId: string,
  externalServiceName: string,
  sortType = 'score',
): Promise<void> {
  let page = 1;
  while (true) {
    const url = this.buildUrl(vendorCode, page, sortType);
    this.logger.log(`Fetching comments from: ${url}`);

    try {
      const response = await lastValueFrom(this.httpService.get(url));
      const data = response.data;
      const comments = data?.data?.comments || [];

      if (comments.length > 0) {
        // Get the IDs of comments returned in this batch
        const commentIds = comments.map(comment => comment.commentId);
        // Find existing comments in batch
        const existingComments = await this.commentRepository.find({
          where: { commentId: In(commentIds) },
        });
        const existingIds = new Set(existingComments.map(c => c.commentId));

        const newCommentEntities: ExternalComment[] = [];
        for (const commentData of comments) {
          if (!existingIds.has(commentData.commentId)) {
            const payload = {
              createdDate: commentData.createdDate,
              sender: commentData.sender,
              commentText: commentData.commentText,
              rating: parseInt((parseInt(commentData.rating) / 2).toString()),
              feeling: commentData.feeling,
              expeditionType: commentData.expeditionType,
              foods: commentData.foods,
            };

            newCommentEntities.push(
              this.commentRepository.create({
                commentId: commentData.commentId,
                questionnaireId,
                externalServiceName,
                commentPayload: payload,
              }),
            );
          } else {
            this.logger.log(`Comment with id: ${commentData.commentId} already exists. Skipping.`);
          }
        }

        if (newCommentEntities.length > 0) {
          await this.commentRepository.save(newCommentEntities);
          this.logger.log(`Batch saved ${newCommentEntities.length} new comment(s) on page ${page}.`);
        } else {
          this.logger.log(`No new comments to save on page ${page}.`);
        }
      }

      // If fewer than 10 comments, assume this is the last page.
      if (comments.length < 10) {
        this.logger.log('Reached last page of comments.');
        break;
      }
      page++;
      // Delay 5 seconds before the next API call.
      await this.delay(5000);
    } catch (error) {
      this.logger.error(`Error fetching page ${page}: ${error.message}`);
      break;
    }
  }
}

/**
 * Build the API URL with dynamic parameters.
 */
buildUrl(vendorCode: string, page: number, sortType: string): string {
  const baseUrl = 'https://snappfood.ir/mobile/v1/restaurant/vendor-comment';
  const params = new URLSearchParams({
    vendorCode,
    page: page.toString(),
    sortType,
  });
  return `${baseUrl}?${params.toString()}`;
}

/**
 * A helper delay function.
 */
private delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
}
