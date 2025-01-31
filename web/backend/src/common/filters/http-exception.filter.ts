import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common'
import { ErrorTypes } from 'src/common/enums'
import { Response } from 'express'
import { HTTP_ERROR_TYPES } from '../consts'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = +exception.getStatus()
    let errorType

    const exceptionResponse = exception.getResponse() as {
      errorType: ErrorTypes | string
      message: string | string[]
    }

    if (exceptionResponse.errorType) {
      errorType = exceptionResponse.errorType
    } else {
      errorType = HTTP_ERROR_TYPES[status]
    }

    this.logger.error(exception)

    return response.status(status).json({
      statusCode: status,
      errorType,
      message: exceptionResponse.message,
      timestamp: new Date().getTime(),
    })
  }
}
