import { ClerkClient } from '@clerk/backend';
import { ClerkModuleOptions } from './clerk.module';
export declare class ClerkSessionService {
    private readonly clerkClient;
    private readonly options;
    constructor(clerkClient: ClerkClient, options: ClerkModuleOptions);
    getSessionList(userId: string): Promise<import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<import("@clerk/backend").Session[]>>;
    revokeSession(sessionId: string): Promise<import("@clerk/backend").Session>;
    verifySessionToken(token: string): Promise<import("@clerk/types").JwtPayload>;
    getSession(sessionId: string): Promise<import("@clerk/backend").Session>;
    getUser(userId: string): Promise<import("@clerk/backend").User>;
    verifyTokenAndGetAuthData(token: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            publicMetadata: UserPublicMetadata;
        };
        session: import("@clerk/backend").Session;
        sessionClaims: import("@clerk/types").JwtPayload;
    }>;
    revokeAllUserSessions(userId: string): Promise<import("@clerk/backend").Session[]>;
}
