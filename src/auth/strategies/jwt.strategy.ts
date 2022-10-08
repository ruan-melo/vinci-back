import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export type JwtPayload = {
  sub: string;
  email: string;
};

export type UserJwt = {
  id: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  authenticate(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    options?: any,
  ): void {
    return super.authenticate(req, options);
  }

  validate(payload: JwtPayload): UserJwt {
    return { id: payload.sub, email: payload.email };
  }
}
