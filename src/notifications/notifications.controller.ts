import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';
import { UserJwt } from 'src/auth/strategies/jwt.strategy';
import { User as UserParam } from 'src/decorators/user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async getNotifications(@UserParam() user: UserJwt) {
  //   return this.notificationsService.getUserNotifications(user.id);
  // }
}
