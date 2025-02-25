import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Questionnaire } from '../../entities/questionnaire.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class QuestionnaireSeeder {
  constructor(
    @InjectRepository(Questionnaire)
    private questionnaireRepository: Repository<Questionnaire>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    // First, get the admin user
    const adminUser = await this.userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!adminUser) {
      console.log('Admin user not found. Please run the UserSeeder first.');
      return;
    }

    const questionnaires = [
      {
        name: 'Customer Satisfaction Survey',
        isPublic: true,
        logo: 'https://example.com/logos/satisfaction.png',
        setting: JSON.stringify({
          allowAnonymous: true,
          notifyOnSubmission: true,
          requireEmail: false,
        }),
      },
      {
        name: 'Employee Feedback Form',
        isPublic: false,
        logo: 'https://example.com/logos/feedback.png',
        setting: JSON.stringify({
          allowAnonymous: false,
          notifyOnSubmission: true,
          requireEmail: true,
        }),
      },
    ];

    for (const questionnaire of questionnaires) {
      const existingQuestionnaire = await this.questionnaireRepository.findOne({
        where: { name: questionnaire.name, userId: adminUser.id },
      });

      if (!existingQuestionnaire) {
        const savedQuestionnaire = await this.questionnaireRepository.save({
          ...questionnaire,
          userId: adminUser.id,
          user: adminUser,
        });
        console.log(`Questionnaire "${questionnaire.name}" created successfully with ID: ${savedQuestionnaire.id}`);
      } else {
        console.log(`Questionnaire "${questionnaire.name}" already exists`);
      }
    }
  }
}