import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../../entities/user.entity';
import { UserSeeder } from './user.seeder';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { QuestionnaireSeeder } from './questionnaire.seeder';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      entities: [User,Questionnaire],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User,Questionnaire]),
  ],
  providers: [UserSeeder,QuestionnaireSeeder],
})
export class SeedModule {}