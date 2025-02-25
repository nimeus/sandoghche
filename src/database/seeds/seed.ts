import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { UserSeeder } from './user.seeder';
import { QuestionnaireSeeder } from './questionnaire.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  try {
    const seeder = app.get(UserSeeder);
    await seeder.seed();
    console.log('Seeding user completed successfully');

    // Then run Questionnaire seeder
    const questionnaireSeeder = app.get(QuestionnaireSeeder);
    await questionnaireSeeder.seed();
    console.log('Seeding questionnaire completed successfully');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();