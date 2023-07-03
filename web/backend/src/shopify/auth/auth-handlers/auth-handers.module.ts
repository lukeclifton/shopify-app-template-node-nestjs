import { Module } from '@nestjs/common';
import { AfterAuthHandler } from './after-auth.handler';

@Module({
  providers: [AfterAuthHandler],
  exports: [AfterAuthHandler],
})
export class AuthHandlerModule {}