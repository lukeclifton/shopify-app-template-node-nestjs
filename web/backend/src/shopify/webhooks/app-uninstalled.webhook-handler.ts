import { ShopifyWebhookHandler, WebhookHandler } from '@nestjs-shopify/webhooks'
import { ShopifyWebhookTopic } from './enums'

@WebhookHandler(ShopifyWebhookTopic.AppUninstalled)
export class AppUninstalledWebhookHandler extends ShopifyWebhookHandler {
  async handle(shop: string, product: unknown): Promise<void> {
    console.log(shop, product)
  }
}
