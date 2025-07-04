import { DynamicModule } from '@nestjs/common';
export interface ClerkModuleOptions {
    secretKey: string;
    publishableKey: string;
}
export declare class ClerkModule {
    static forRoot(options: ClerkModuleOptions): DynamicModule;
    static forRootAsync(): DynamicModule;
}
