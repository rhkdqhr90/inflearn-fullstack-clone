import {
  Body,
  Controller,
  Headers,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token-guard';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('verify')
  @UseGuards(AccessTokenGuard)
  async verifyPayment(
    @Body() veryfyPaymentDto: VerifyPaymentDto,
    @Req() req: Request,
  ) {
    return await this.paymentsService.verifyPayment(
      veryfyPaymentDto,
      req.user!.sub,
    );
  }

  @Post('webhook')
  async handlWebook(
    @Body() body: string,
    @Headers() heeaders: Record<string, string>,
  ) {
    this.logger.log('Payment webook 받음');
    return await this.paymentsService.handleWebhook(body, heeaders);
  }
}
