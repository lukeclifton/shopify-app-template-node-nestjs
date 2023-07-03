import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ShopifyCoreModule, ShopifyCspMiddleware } from '@nestjs-shopify/core'
import { ApiVersion } from '@shopify/shopify-api'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ShopifyGraphqlProxyModule } from '@nestjs-shopify/graphql'
import { ShopifyAuthModule } from '@nestjs-shopify/auth'
import { AfterAuthHandler } from './shopify/auth/auth-handlers/after-auth.handler'
import { ShopifyWebhooksModule } from '@nestjs-shopify/webhooks'
import { AppUninstalledWebhookHandler } from './shopify/webhooks/app-uninstalled.webhook-handler'
import { PostgreSQLSessionStorage } from '@shopify/shopify-app-session-storage-postgresql'

@Module({
  imports: [
    ConfigModule.forRoot(),
    ShopifyCoreModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('SHOPIFY_API_KEY'),
          apiSecretKey: configService.get('SHOPIFY_API_SECRET'),
          apiVersion: ApiVersion.Unstable,
          hostName: configService.get('HOST').replace(/https:\/\//, ''),
          isEmbeddedApp: true,
          scopes: configService.get('SHOPIFY_SCOPES').split(','),
        }
      },
      inject: [ConfigService, PostgreSQLSessionStorage],
    }),
    ShopifyWebhooksModule.forRoot({
      path: '/shopify/webhooks',
    }),
    ShopifyAuthModule.forRootAsyncOnline({
      useFactory: (afterAuthHandler: AfterAuthHandler) => ({
        basePath: 'user',
        afterAuthHandler,
      }),
      inject: [AfterAuthHandler],
    }),
    ShopifyAuthModule.forRootAsyncOffline({
      useFactory: (afterAuthHandler: AfterAuthHandler) => ({
        basePath: 'shop',
        afterAuthHandler,
      }),
      inject: [AfterAuthHandler],
    }),
    ShopifyGraphqlProxyModule,
  ],
  providers: [AfterAuthHandler, AppUninstalledWebhookHandler],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ShopifyCspMiddleware).forRoutes('*')
  }
}
