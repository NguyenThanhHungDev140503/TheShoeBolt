import { Payment } from '../../payments/entities/payment.entity';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user",
    SHIPPER = "shipper"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    clerkId: string;
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
