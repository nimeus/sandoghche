import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    const users = [
      {
        email: 'admin@example.com',
        password: 'admin123',
        fullName: 'Admin User',
        phone: '+1234567890',
        isVerified: true,
        isActive: true,
        verificationSetting: JSON.stringify({
          emailVerified: true,
          phoneVerified: true,
        }),
      },
      {
        email: 'user@example.com',
        password: 'user123',
        fullName: 'Regular User',
        phone: '+1987654321',
        isVerified: false,
        isActive: true,
        verificationSetting: JSON.stringify({
          emailVerified: false,
          phoneVerified: false,
        }),
      },
    ];

    for (const user of users) {
      const existingUser = await this.userRepository.findOne({
        where: { email: user.email },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const savedUser = await this.userRepository.save({
          ...user,
          password: hashedPassword,
        });
        console.log(`User ${user.email} created successfully with ID: ${savedUser.id}`);
      } else {
        console.log(`User ${user.email} already exists`);
      }
    }
  }
}
