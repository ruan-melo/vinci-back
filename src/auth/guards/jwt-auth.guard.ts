import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, OVERRIDE_KEY } from '.';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isOverride = this.reflector.getAllAndOverride<boolean>(OVERRIDE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isOverride) {
      return true;
    }

    return super.canActivate(context);
  }
}
