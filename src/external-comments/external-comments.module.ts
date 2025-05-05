import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExternalCommentsService } from './external-comments.service';
import { ExternalCommentsController } from './external-comments.controller';
import { ExternalComment } from '../entities/externalComment.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([ExternalComment]),
  ],
  providers: [ExternalCommentsService],
  controllers: [ExternalCommentsController],
  exports: [ExternalCommentsService],
})
export class ExternalCommentsModule {}
