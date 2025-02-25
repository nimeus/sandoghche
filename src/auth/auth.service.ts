import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
    });

    try {
      await this.usersRepository.save(user);
      return this.generateToken(user);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new UnauthorizedException('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    console.log(user,email,password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
console.log(1231232344)
    
console.log(this.generateToken(user))
    return this.generateToken(user);
  }

  private generateToken(user: User): { access_token: string } {
    console.log("user generzsdgzsd",user)
    
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      //exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days expiration
    };
    console.log("payload",payload)
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findUserByEmailAndPassword(email: string,password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}