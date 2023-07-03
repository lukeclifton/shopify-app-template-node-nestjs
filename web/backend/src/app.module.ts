import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ShopifyCoreModule, ShopifyCspMiddleware } from '@nestjs-shopify/core'
import { ApiVersion } from '@shopify/shopify-api'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ShopifyGraphqlProxyModule } from '@nestjs-shopify/graphql'

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
      inject: [ConfigService],
    }),
    ShopifyGraphqlProxyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ShopifyCspMiddleware).forRoutes('*')
  }
}
