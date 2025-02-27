import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserModule } from './user/user.module';
import { OpenAIModule } from './openai/openai.module';
import { Questionnaire } from './entities/questionnaire.entity';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { AnswerModule } from './answer/answer.module';
import { Answer } from './entities/answer.entity';
import { ReportsModule } from './reports/reports.module';
import { BullModule } from '@nestjs/bull';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'), // Neon connection string
        ssl: {
          rejectUnauthorized: false // Required for Neon
        },
        autoLoadEntities: true,
        synchronize: true, // Set to false in production
        entities: [User,Questionnaire,Answer],
        uuidExtension: 'uuid-ossp',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    OpenAIModule,
    QuestionnaireModule,
    AnswerModule,
    ReportsModule,
    BullModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
