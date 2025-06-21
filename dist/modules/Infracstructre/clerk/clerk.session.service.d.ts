import { ClerkModuleOptions } from './clerk.module';
export declare class ClerkSessionService {
    private options;
    private clerk;
    constructor(options: ClerkModuleOptions);
    getSessionList(userId: string): Promise<any>;
    revokeSession(sessionId: string): Promise<any>;
    verifySessionToken(token: string): Promise<any>;
    getSession(sessionId: string): Promise<any>;
    getUser(userId: string): Promise<any>;
    verifyTokenAndGetAuthData(token: string): Promise<{
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            publicMetadata: any;
        };
        session: any;
        sessionClaims: any;
    }>;
    revokeAllUserSessions(userId: string): Promise<any[]>;
}
