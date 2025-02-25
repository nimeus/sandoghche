import { Controller, Post } from '@nestjs/common';
import { OpenAIService } from './openai.service';

@Controller('openai')
export class OpenaiController {
constructor(private readonly openaiService: OpenAIService) {}

  @Post('chatGptRequest')
    async chatGptRequest() {
      return this.openaiService.chatGptRequest('write a very long article about electric cars',[]);
  }
  
}
