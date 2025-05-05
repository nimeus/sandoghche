import { Test, TestingModule } from '@nestjs/testing';
import { ExternalCommentsService } from './external-comments.service';

describe('ExternalCommentsService', () => {
  let service: ExternalCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalCommentsService],
    }).compile();

    service = module.get<ExternalCommentsService>(ExternalCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
