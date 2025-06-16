import { ClerkModuleOptions } from './clerk.module';
export declare class ClerkSessionService {
    private options;
    private clerk;
    constructor(options: ClerkModuleOptions);
    getSessionList(userId: string): Promise<any>;
    revokeSession(sessionId: string): Promise<any>;
    verifySessionToken(token: string): Promise<any>;
    revokeAllUserSessions(userId: string): Promise<any[]>;
}
