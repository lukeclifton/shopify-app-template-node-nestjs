import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { ErrorTypes } from 'src/common/enums'
import { InvalidShopError } from '@shopify/shopify-api'
import { HttpAdapterHost } from '@nestjs/core'

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal server error'
    let errorType: string | ErrorTypes = ErrorTypes.InternalServerError

    if (exception instanceof InvalidShopError) {
      httpStatus = HttpStatus.BAD_REQUEST
      errorType = ErrorTypes.InvalidShopArugment
      message = exception.message
    }

    this.logger.error(exception)

    const responseBody = {
      statusCode: httpStatus,
      message,
      errorType,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
