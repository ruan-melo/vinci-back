import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { IS_AUTH_OPTIONAL_KEY, IS_PUBLIC_KEY, OVERRIDE_KEY } from '.';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);

    return ctx.getContext().req;
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

  handleRequest(err, user, info, context: ExecutionContext) {
    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(
      IS_AUTH_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isAuthOptional && !user) {
      return null;
    }

    if (err || !user) {
      throw err || new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    super.handleRequest;
    return user;
  }
}
