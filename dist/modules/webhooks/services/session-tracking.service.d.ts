import { Repository } from 'typeorm';
import { UserSession } from '../entities/user-session.entity';
import { CreateSessionDto } from '../dto/create-session.dto';
import { UpdateSessionDto } from '../dto/update-session.dto';
export declare class SessionTrackingService {
    private readonly sessionRepository;
    private readonly logger;
    constructor(sessionRepository: Repository<UserSession>);
    createSession(sessionData: CreateSessionDto): Promise<UserSession>;
    updateSession(clerkSessionId: string, updateData: UpdateSessionDto): Promise<UserSession>;
    endSession(clerkSessionId: string): Promise<void>;
    getActiveSessions(userId: string): Promise<UserSession[]>;
    getSessionByClerkId(clerkSessionId: string): Promise<UserSession | null>;
    updateLastActivity(clerkSessionId: string): Promise<void>;
    cleanupExpiredSessions(daysOld?: number): Promise<number>;
    getSessionStats(userId: string): Promise<{
        totalSessions: number;
        activeSessions: number;
        averageSessionDuration: number;
    }>;
}
