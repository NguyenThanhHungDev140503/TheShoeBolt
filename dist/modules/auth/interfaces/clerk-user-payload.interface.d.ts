import { UserRole } from '../../users/entities/user.entity';
export interface ClerkUserPayload {
    sessionId?: string;
    userId?: string;
    orgId?: string;
    claims?: {
        public_metadata?: {
            role?: UserRole;
            roles?: UserRole[];
        };
        sub?: string;
        sid?: string;
        iat?: number;
        exp?: number;
        [key: string]: any;
    };
}
