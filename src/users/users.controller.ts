import {
  Controller,
  Patch,
  Req,
  UploadedFile,
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

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService, // private tokensService: TokensService, // private storageProvider: StorageProviderInterface,
  ) {}

  // @Post('/tokens')
  // async registerToken(
  //   @Body() registerTokenDto: RegisterTokenDto,
  //   @User() user: UserJwt,
  // ) {
  //   await this.tokensService.storeToken(registerTokenDto.token, user.id);
  //   return;
  // }

  @Patch('profile/avatar')
  @UseInterceptors(FileInterceptor('file', uploadAvatarConfig))
  async updateAvatar(
    @Req() req: { user: UserJwt },
    @UploadedFile(ParseAvatarFilePipe)
    file: Express.Multer.File,
  ): Promise<UserMap> {
    const user = await this.usersService.updateAvatar(req.user.id, file);

    return userMapper(user);
  }
}
