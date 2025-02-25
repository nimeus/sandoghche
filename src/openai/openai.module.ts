import { Global, Module } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';
import { OpenaiController } from './openai.controller';

@Global()
@Module({
  providers: [OpenAIService],
  exports: [OpenAIService],
  controllers: [OpenaiController]
})
export class OpenAIModule {}