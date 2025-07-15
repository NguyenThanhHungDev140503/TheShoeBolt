export declare class CreateSessionDto {
    clerkSessionId: string;
    userId: string;
    createdAt?: Date;
    lastActivity?: Date;
    ipAddress?: string;
    userAgent?: string;
    sessionMetadata?: Record<string, any>;
}
