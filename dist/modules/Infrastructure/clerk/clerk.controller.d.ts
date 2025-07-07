import { ClerkSessionService } from './clerk.session.service';
import { SessionIdParamDto, UserIdParamDto } from './dto/clerk-params.dto';
export declare class ClerkController {
    private readonly clerkSessionService;
    constructor(clerkSessionService: ClerkSessionService);
    getUserSessions(req: any): Promise<{
        message: string;
        sessions: import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<import("@clerk/backend").Session[]>;
    }>;
    revokeSession(params: SessionIdParamDto): Promise<{
        message: string;
        session: import("@clerk/backend").Session;
    }>;
    revokeAllSessions(req: any): Promise<{
        message: string;
        details: import("@clerk/backend").Session[];
    }>;
    getAnyUserSessions(params: UserIdParamDto): Promise<{
        message: string;
        userId: string;
        sessions: import("@clerk/backend/dist/api/resources/Deserializer").PaginatedResourceResponse<import("@clerk/backend").Session[]>;
    }>;
    revokeAllUserSessions(params: UserIdParamDto): Promise<{
        message: string;
        details: import("@clerk/backend").Session[];
    }>;
}
