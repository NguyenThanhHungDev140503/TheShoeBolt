"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailsService = class EmailsService {
    constructor(configService) {
        this.configService = configService;
        this.resend = new resend_1.Resend(this.configService.get('RESEND_API_KEY'));
    }
    async sendEmail(sendEmailDto) {
        try {
            const { data, error } = await this.resend.emails.send({
                from: sendEmailDto.from || this.configService.get('RESEND_FROM_EMAIL'),
                to: sendEmailDto.to,
                subject: sendEmailDto.subject,
                html: sendEmailDto.html,
                text: sendEmailDto.text,
            });
            if (error) {
                throw new common_1.BadRequestException(`Email sending failed: ${error.message}`);
            }
            return { success: true, messageId: data.id };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Email sending failed: ${error.message}`);
        }
    }
    async sendWelcomeEmail(email, firstName) {
        const html = `
      <h1>Welcome to Our Platform, ${firstName}!</h1>
      <p>Thank you for joining us. We're excited to have you on board.</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br>The Team</p>
    `;
        return this.sendEmail({
            to: [email],
            subject: 'Welcome to Our Platform!',
            html,
            text: `Welcome to Our Platform, ${firstName}! Thank you for joining us.`,
        });
    }
    async sendPasswordResetEmail(email, resetToken) {
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
        const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;
        return this.sendEmail({
            to: [email],
            subject: 'Password Reset Request',
            html,
            text: `Password reset requested. Visit: ${resetUrl}`,
        });
    }
    async sendPaymentConfirmationEmail(email, amount, currency) {
        const html = `
      <h1>Payment Confirmation</h1>
      <p>Your payment has been successfully processed.</p>
      <p><strong>Amount:</strong> ${amount} ${currency.toUpperCase()}</p>
      <p>Thank you for your payment!</p>
    `;
        return this.sendEmail({
            to: [email],
            subject: 'Payment Confirmation',
            html,
            text: `Payment confirmed: ${amount} ${currency.toUpperCase()}`,
        });
    }
};
exports.EmailsService = EmailsService;
exports.EmailsService = EmailsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailsService);
//# sourceMappingURL=emails.service.js.map