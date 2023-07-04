import { BadRequestException } from '@nestjs/common'
import { ErrorTypes } from 'src/common/enums'

export class NoActiveBillingSubscription extends BadRequestException {
  constructor() {
    super({
      errorType: ErrorTypes.NoActiveBillingSubscription,
      message: 'No active billing subscription',
    })
  }
}
