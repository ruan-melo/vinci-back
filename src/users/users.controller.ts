import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';

import { FileInterceptor } from '@nestjs/platform-express';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import {
  ParseAvatarFilePipe,
  uploadAvatarConfig,
} from 'src/storage/config/upload/avatar';
import { UserMap, userMapper } from './mappers/user.mapper';
import { JwtAuthGuard } from 'src/auth/guards';
import { User } from './models/user.model';
import { User as UserParam } from 'src/decorators/user.decorator';
import { RegisterTokenDto } from './dto/register-token-dto';
import { TokensService } from 'src/notifications/tokens.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { DeleteTokenDTO } from './dto/delete-token-dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/tokens')
  async registerToken(
    @Body() registerTokenDto: RegisterTokenDto,
    @UserParam() user: UserJwt,
  ) {
    await this.notificationsService.storeToken({
      token: registerTokenDto.token,
      userId: user.id,
    });
    return;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/tokens')
  async deleteToken(
    @Body() deleteTokenDto: DeleteTokenDTO,
    @UserParam() user: UserJwt,
  ) {
    await this.notificationsService.deleteToken({
      token: deleteTokenDto.token,
      userId: user.id,
    });
    return;
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('/notifications/:id')
  // async getNotification(@Param('id') id: string, @UserParam() user: UserJwt) {
  //   console.log('token', registerTokenDto.token);

  //   // await this.tokensService.storeToken(registerTokenDto.token, user.id);
  //   return;
  // }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/avatar')
  @UseInterceptors(FileInterceptor('file', uploadAvatarConfig))
  async updateAvatar(
    @Req() req: { user: UserJwt },
    @UploadedFile(ParseAvatarFilePipe)
    file: Express.Multer.File,
  ): Promise<User> {
    const user = await this.usersService.updateAvatar(req.user.id, file);

    return userMapper(user);
  }
}
