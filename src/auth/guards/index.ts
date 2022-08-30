import { SetMetadata } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const OVERRIDE_KEY = 'wasReplaced';
export const Override = () => SetMetadata(OVERRIDE_KEY, true);

export { JwtAuthGuard };
