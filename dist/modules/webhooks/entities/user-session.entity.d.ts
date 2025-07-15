import { User } from '../../users/entities/user.entity';
export declare class UserSession {
    id: string;
    clerkSessionId: string;
    userId: string;
    user: User;
    createdAt: Date;
    endedAt: Date | null;
    lastActivity: Date | null;
    ipAddress: string | null;
    userAgent: string | null;
    sessionMetadata: Record<string, any> | null;
    updatedAt: Date;
    isActive(): boolean;
    getDuration(): number | null;
    updateLastActivity(): void;
    endSession(): void;
}
