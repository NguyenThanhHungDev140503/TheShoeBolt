import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, DataSource, EntityManager } from 'typeorm';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(createPaymentDto: CreatePaymentDto, userId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(createPaymentDto.amount * 100), // Convert to cents
        currency: createPaymentDto.currency || 'usd',
        metadata: {
          userId,
          description: createPaymentDto.description || '',
        },
      });

      const payment = this.paymentsRepository.create({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'usd',
        description: createPaymentDto.description,
        status: PaymentStatus.PENDING,
      });

      await this.paymentsRepository.save(payment);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      };
    } catch (error) {
      throw new BadRequestException(`Payment creation failed: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      const payment = await this.paymentsRepository.findOne({
        where: { stripePaymentIntentId: paymentIntentId },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      payment.status = paymentIntent.status === 'succeeded' 
        ? PaymentStatus.COMPLETED 
        : PaymentStatus.FAILED;

      await this.paymentsRepository.save(payment);

      return payment;
    } catch (error) {
      throw new BadRequestException(`Payment confirmation failed: ${error.message}`);
    }
  }

  async findUserPayments(userId: string) {
    return this.paymentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async handleWebhook(signature: string, body: Buffer) {
    const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    try {
      const event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.confirmPayment(event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          await this.handleFailedPayment(event.data.object.id);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }
  }

  private async handleFailedPayment(paymentIntentId: string) {
    const payment = await this.paymentsRepository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (payment) {
      payment.status = PaymentStatus.FAILED;
      await this.paymentsRepository.save(payment);
    }
  }

  // ===== PAYMENT REFUND METHODS (Refactored from sp_process_refund) =====

  /**
   * Process payment refund with business validation
   * Business logic moved from sp_process_refund stored procedure
   * This implements the complete refund workflow
   */
  async processRefund(
    paymentId: string,
    refundAmount: number,
    reason?: string
  ): Promise<void> {
    this.logger.log(`Processing refund for payment ${paymentId}, amount: ${refundAmount}`);

    return await this.dataSource.transaction(async (manager) => {
      try {
        // 1. Get payment details
        const payment = await this.findPaymentById(paymentId, manager);
        if (!payment) {
          throw new NotFoundException(`Không tìm thấy thanh toán với ID: ${paymentId}`);
        }

        // 2. Business validation
        this.validateRefundRequest(payment, refundAmount);

        // 3. Process refund with external provider (Stripe)
        await this.processExternalRefund(payment, refundAmount);

        // 4. Update payment record
        await this.updateRefundStatus(paymentId, refundAmount, reason, manager);

        this.logger.log(`Successfully processed refund for payment ${paymentId}`);
      } catch (error) {
        this.logger.error(`Failed to process refund: ${error.message}`, error.stack);
        throw error;
      }
    });
  }

  /**
   * Validate refund request business rules
   * Business logic that was previously in database layer
   */
  private validateRefundRequest(payment: Payment, refundAmount: number): void {
    // Check payment status
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Chỉ có thể refund payment có trạng thái completed');
    }

    // Check refund amount
    if (refundAmount > payment.amount) {
      throw new BadRequestException('Số tiền refund không thể lớn hơn số tiền thanh toán');
    }

    // Note: Since we don't have REFUNDED status, we'll need to track refunds differently
    // TODO: Add refund tracking mechanism or add REFUNDED status to PaymentStatus enum

    this.logger.debug(`Refund validation passed for payment ${payment.id}`);
  }

  /**
   * Find payment by ID with transaction support
   */
  private async findPaymentById(
    paymentId: string,
    manager?: EntityManager
  ): Promise<Payment | null> {
    const repository = manager ? manager.getRepository(Payment) : this.paymentsRepository;
    return await repository.findOne({ where: { id: paymentId } });
  }

  /**
   * Process refund with external payment provider
   */
  private async processExternalRefund(payment: Payment, refundAmount: number): Promise<void> {
    try {
      if (payment.stripePaymentIntentId) {
        // Process Stripe refund
        await this.stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          amount: Math.round(refundAmount * 100), // Convert to cents
        });

        this.logger.debug(`Processed Stripe refund for payment ${payment.id}`);
      } else {
        // Handle other payment providers
        this.logger.warn(`No external payment provider found for payment ${payment.id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process external refund: ${error.message}`);
      throw new BadRequestException(`Không thể xử lý refund với payment provider: ${error.message}`);
    }
  }

  /**
   * Update payment record with refund status
   * Uses simplified stored procedure (sp_update_refund_status)
   */
  private async updateRefundStatus(
    paymentId: string,
    refundAmount: number,
    reason: string | undefined,
    manager: EntityManager
  ): Promise<void> {
    try {
      // Use simplified stored procedure for status update
      await manager.query(
        'CALL sp_update_refund_status($1, $2, $3)',
        [paymentId, refundAmount, reason]
      );

      this.logger.debug(`Updated refund status for payment ${paymentId}`);
    } catch (error) {
      this.logger.error(`Error updating refund status: ${error.message}`);

      // Handle specific database errors
      if (error.message.includes('Không tìm thấy payment')) {
        throw new NotFoundException(`Không tìm thấy payment với ID: ${paymentId}`);
      }

      throw error;
    }
  }

  /**
   * Simple refund status update using simplified stored procedure
   * Direct call to sp_update_refund_status
   */
  async updateRefundStatusSimple(
    paymentId: string,
    refundAmount: number,
    reason?: string
  ): Promise<void> {
    this.logger.log(`Updating refund status for payment ${paymentId}`);

    try {
      // Use simplified stored procedure directly
      await this.dataSource.query(
        'CALL sp_update_refund_status($1, $2, $3)',
        [paymentId, refundAmount, reason]
      );

      this.logger.log(`Successfully updated refund status for payment ${paymentId}`);
    } catch (error) {
      this.logger.error(`Error updating refund status: ${error.message}`);

      // Handle specific database errors
      if (error.message.includes('Không tìm thấy payment')) {
        throw new NotFoundException(`Không tìm thấy payment với ID: ${paymentId}`);
      }

      throw error;
    }
  }
}