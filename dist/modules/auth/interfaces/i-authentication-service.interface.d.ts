import { JwtPayload } from '@clerk/types';
export interface IAuthenticationService {
    verifyTokenAndGetAuthData(token: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            publicMetadata: any;
        };
        session: any;
        sessionClaims: JwtPayload;
    }>;
    getSession(sessionId: string): Promise<any>;
    getSessionList(userId: string): Promise<any>;
    revokeSession(sessionId: string): Promise<any>;
    revokeAllUserSessions(userId: string): Promise<any>;
    verifySessionToken(token: string): Promise<JwtPayload>;
    getUser(userId: string): Promise<any>;
}
