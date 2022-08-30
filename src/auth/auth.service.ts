import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { JwtPayload } from './strategies/jwt.strategy';
import { UserMap, userMapper } from 'src/users/mappers/user.mapper';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export interface AccessResponse {
  access_token: string;
  user: UserMap;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordMatching = await compare(pass, user.password);

    if (isPasswordMatching) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: User): Promise<AccessResponse> {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: userMapper(user),
    };
  }

  async signUp(createUserDto: CreateUserDto): Promise<AccessResponse> {
    const user = await this.usersService.create(createUserDto);

    const payload: JwtPayload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: userMapper(user),
    };
  }
}
