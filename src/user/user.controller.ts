import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/role.guard';
import { Roles } from '../decorator/role.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('Protected Routes')
@ApiBearerAuth()
@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private userService: UserService) {}

  @Get('allUsers')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Admin only endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Successfully accessed admin route',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have admin role',
  })
  getAllUsers() {
    return this.userService.findAll();
  }
}