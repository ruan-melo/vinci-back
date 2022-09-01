import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const OptionalQuery = createParamDecorator<string>(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest() as Request;

    const query = request.query[data];

    return query;
  },
);
