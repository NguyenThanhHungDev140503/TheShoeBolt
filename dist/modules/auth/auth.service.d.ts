import { UsersService } from '../users/users.service';
import { IAuthenticationService } from './interfaces/i-authentication-service.interface';
export declare class AuthService {
    private readonly usersService;
    private readonly authService?;
    constructor(usersService: UsersService, authService?: IAuthenticationService);
    syncUserFromClerk(clerkUser: any): Promise<import("../users/entities/user.entity").User>;
    getUserProfile(userId: string): Promise<import("../users/entities/user.entity").User>;
    validateUserSession(token: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            publicMetadata: any;
        };
        session: any;
        sessionClaims: import("@clerk/types").JwtPayload;
    }>;
}
