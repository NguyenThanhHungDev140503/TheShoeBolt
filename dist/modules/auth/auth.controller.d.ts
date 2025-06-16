import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        isActive: boolean;
        payments: import("../payments/entities/payment.entity").Payment[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
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
