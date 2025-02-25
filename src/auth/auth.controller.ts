import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, HttpException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { SignupDto, LoginDto, TokenResponse } from '../dto/auth.dto';
import { User } from '../entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created',
    type: TokenResponse,
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  async signup(@Body() signupDto: SignupDto): Promise<TokenResponse> {
    try {
      return await this.authService.signup(signupDto.email, signupDto.password);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: TokenResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponse> {
    try {
      return await this.authService.login(loginDto.email, loginDto.password);
    } catch (error) {
      throw new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get('users')
  findAll(): Promise<User[]> {
    return this.authService.findAll();
  }

  @Post('loginFromExternal')
  async loginFromExternal(@Body() loginDto: LoginDto): Promise<User | null> {
    try {
      return this.authService.findUserByEmailAndPassword(loginDto.email, loginDto.password);
    } catch (error) {
      throw new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}