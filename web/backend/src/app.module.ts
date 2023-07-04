import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { ShopifyCoreModule, ShopifyCspMiddleware } from '@nestjs-shopify/core'
import { ApiVersion } from '@shopify/shopify-api'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ShopifyGraphqlProxyModule } from '@nestjs-shopify/graphql'
import { ShopifyAuthModule } from '@nestjs-shopify/auth'
import { ShopifyWebhooksModule } from '@nestjs-shopify/webhooks'
import { PostgreSQLSessionStorage } from '@shopify/shopify-app-session-storage-postgresql'
import { AppUninstalledWebhookHandler } from './shopify/webhooks/app-uninstalled.webhook-handler'
import { AuthHandlerModule } from './shopify/auth/auth-handlers/auth-handers.module'
import { AfterAuthHandler } from './shopify/auth/auth-handlers/after-auth.handler'
import { PRODUCTION } from './common/consts'
import { join } from 'path'

const STATIC_PATH =
  process.env.NODE_ENV === PRODUCTION
    ? '/app/frontend'
    : join(__dirname, '../../', 'frontend/dist')

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: STATIC_PATH,
      exclude: ['/api*'],
    }),
    ShopifyCoreModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.get('SHOPIFY_API_KEY'),
        apiSecretKey: configService.get('SHOPIFY_API_SECRET'),
        apiVersion: ApiVersion.Unstable,
        hostName: configService.get('HOST').replace(/https:\/\//, ''),
        isEmbeddedApp: true,
        scopes: configService.get('SHOPIFY_SCOPES').split(','),
        sessionStorage: new PostgreSQLSessionStorage(
          configService.get('DATABASE_URL'),
        ),
      }),
      inject: [ConfigService],
    }),
    ShopifyWebhooksModule.forRoot({
      path: '/api/shopify/webhooks',
    }),
    ShopifyAuthModule.forRootAsyncOnline({
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: AfterAuthHandler) => ({
        basePath: 'user',
        afterAuthHandler,
      }),
      inject: [AfterAuthHandler],
    }),
    ShopifyAuthModule.forRootAsyncOffline({
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: AfterAuthHandler) => ({
        basePath: 'shop',
        afterAuthHandler,
      }),
      inject: [AfterAuthHandler],
    }),
    ShopifyGraphqlProxyModule,
  ],
  providers: [AppUninstalledWebhookHandler],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ShopifyCspMiddleware).forRoutes('*')
  }
}
