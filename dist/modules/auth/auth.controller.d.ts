import { AuthService } from './auth.service';
import { UserRole } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    syncUser(req: any): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: UserRole;
        };
    }>;
    getProfile(req: any): Promise<{
        message: string;
        user: any;
        session: {
            id: any;
            status: any;
        };
    }>;
    adminOnly(req: any): Promise<{
        message: string;
        user: any;
    }>;
}
