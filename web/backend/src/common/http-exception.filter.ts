import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { HttpErrorType } from 'src/common/http-error-type'
import { ErrorTypes } from 'src/common/enums'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = +exception.getStatus()

    // eslint-disable-next-line prefer-const
    let { errorType, message } = exception.getResponse() as {
      errorType: ErrorTypes | string
      message: string | string[]
    }

    if (!errorType) {
      errorType = HttpErrorType[status]
      errorType = errorType ? errorType : 'UNEXPECTED_ERROR'
    }

    return response.status(status).json({
      errorType,
      message,
      timestamp: new Date().getTime(),
    })
  }
}
