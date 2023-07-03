import { ShopifyWebhookHandler, WebhookHandler } from '@nestjs-shopify/webhooks'

@WebhookHandler(ShopifyWebhookTopic.AppUninstalled)
export class AppUninstalledWebhookHandler extends ShopifyWebhookHandler {
  async handle(shop: string, product: unknown): Promise<void> {
    console.log(shop, product)
  }
}
