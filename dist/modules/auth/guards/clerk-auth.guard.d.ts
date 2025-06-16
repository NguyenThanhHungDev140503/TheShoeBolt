import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ClerkModuleOptions } from '../../clerk/clerk.module';
export declare class ClerkAuthGuard implements CanActivate {
    private options;
    constructor(options: ClerkModuleOptions);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
