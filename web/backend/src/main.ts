import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import '@shopify/shopify-api/adapters/node'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/http-exception.filter'

async function bootstrap() {
  console.log('Bootstrapping app...')

  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.enableCors()
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(process.env.PORT || 3000)
}

bootstrap()
