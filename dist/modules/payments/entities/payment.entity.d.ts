import { User } from '../../users/entities/user.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class Payment {
    id: string;
    userId: string;
    user: User;
    stripePaymentIntentId: string;
    amount: number;
    currency: string;
    description: string;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
}
