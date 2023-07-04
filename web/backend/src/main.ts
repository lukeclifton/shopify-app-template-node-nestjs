import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import '@shopify/shopify-api/adapters/node'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { AllExceptionFilter } from './common/filters/all-exception.filter'

async function bootstrap() {
  console.log('Bootstrapping app...')

  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  const httpAdapter = app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter))
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(process.env.PORT || 3000)
}

bootstrap()
