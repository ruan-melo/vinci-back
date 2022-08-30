import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService, AccessResponse } from './auth.service';
import { Override, Public } from './guards';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  async login(@Request() req): Promise<AccessResponse> {
    const response = await this.authService.login(req.user);
    return response;
  }

  @Public()
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<AccessResponse> {
    const response = await this.authService.signUp(createUserDto);
    return response;
  }
}
