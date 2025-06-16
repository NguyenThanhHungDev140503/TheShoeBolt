import { ClerkSessionService } from './clerk.session.service';
export declare class ClerkController {
    private readonly clerkSessionService;
    constructor(clerkSessionService: ClerkSessionService);
    getUserSessions(req: any): Promise<{
        message: string;
        sessions: any;
    }>;
    revokeSession(sessionId: string): Promise<void>;
    revokeAllSessions(req: any): Promise<void>;
    getAnyUserSessions(userId: string): Promise<{
        message: string;
        userId: string;
        sessions: any;
    }>;
    revokeAllUserSessions(userId: string): Promise<void>;
}
