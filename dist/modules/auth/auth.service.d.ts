import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    constructor(usersService: UsersService);
    syncUserFromClerk(clerkUser: any): Promise<import("../users/entities/user.entity").User>;
    getUserProfile(userId: string): Promise<import("../users/entities/user.entity").User>;
}
