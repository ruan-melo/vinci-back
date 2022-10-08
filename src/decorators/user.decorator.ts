import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export enum ContextType {
  HTTP = 'http',
  GRAPHQL = 'graphql',
}

export const User = createParamDecorator<ContextType>(
  (data = ContextType.HTTP, ctx: ExecutionContext) => {
    if (data === ContextType.HTTP) {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    }

    const gqlCtx = GqlExecutionContext.create(ctx);

    return gqlCtx.getContext().req.user;
  },
);
