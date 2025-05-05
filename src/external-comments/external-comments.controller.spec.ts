import { Test, TestingModule } from '@nestjs/testing';
import { ExternalCommentsController } from './external-comments.controller';

describe('ExternalCommentsController', () => {
  let controller: ExternalCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalCommentsController],
    }).compile();

    controller = module.get<ExternalCommentsController>(ExternalCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
