import { HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export class UserAlreadyExistsException extends HttpException {
  constructor(errors: Prisma.UserWhereUniqueInput) {
    super(errors, HttpStatus.CONFLICT);
  }
}
