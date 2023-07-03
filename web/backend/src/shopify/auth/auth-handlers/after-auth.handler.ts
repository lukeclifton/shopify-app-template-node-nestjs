import { Request, Response } from 'express'
import { ShopifyAuthAfterHandler } from '@nestjs-shopify/auth'
import { ShopifyWebhooksService } from '@nestjs-shopify/webhooks'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Session } from '@shopify/shopify-api'
import { InjectShopify } from '@nestjs-shopify/core'
import { Shopify } from '@shopify/shopify-api'

@Injectable()
export class AfterAuthHandler implements ShopifyAuthAfterHandler {
  constructor(
    private readonly webhooksService: ShopifyWebhooksService,
    @InjectShopify()
    private readonly shopifyApi: Shopify,
  ) {}

  private readonly logger = new Logger(AfterAuthHandler.name)

  async afterAuth(req: Request, res: Response, session: Session) {
    if (!session.isOnline) {
      await this.webhooksService.registerWebhooks(session)
    }

    if (res.headersSent) {
      this.logger.log(
        'Response headers have already been sent, skipping redirection to host',
        { shop: session.shop },
      )

      return
    }

    const redirectUrl = await this.getRedirectUrl(req, res, session)

    this.logger.debug(`Redirecting to host at ${redirectUrl}`, {
      shop: session.shop,
    })

    res.redirect(redirectUrl)
  }

  private async getRedirectUrl(req: Request, res: Response, session: Session) {
    const host = this.shopifyApi.utils.sanitizeHost(req.query.host as string)!

    return this.shopifyApi.config.isEmbeddedApp
      ? await this.shopifyApi.auth.getEmbeddedAppUrl({
          rawRequest: req,
          rawResponse: res,
        })
      : `/?shop=${session.shop}&host=${encodeURIComponent(host)}`
  }
}
