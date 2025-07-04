import { ClerkSessionService } from './clerk.session.service';
export declare class ClerkController {
    private readonly clerkSessionService;
    constructor(clerkSessionService: ClerkSessionService);
    getUserSessions(req: any): Promise<{
        message: string;
        sessions: import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<import("@clerk/backend").Session[]>;
    }>;
    revokeSession(sessionId: string): Promise<void>;
    revokeAllSessions(req: any): Promise<void>;
    getAnyUserSessions(userId: string): Promise<{
        message: string;
        userId: string;
        sessions: import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<import("@clerk/backend").Session[]>;
    }>;
    revokeAllUserSessions(userId: string): Promise<void>;
}
