import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class RpcExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Microservice exceptions are serialized as plain objects with statusCode
    const err = exception as Record<string, unknown>;
    const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = err?.message ?? 'Internal server error';

    response.status(statusCode).json({ statusCode, message });
  }
}
