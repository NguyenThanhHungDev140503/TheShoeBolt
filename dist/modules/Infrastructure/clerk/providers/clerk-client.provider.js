"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkClientProvider = exports.CLERK_CLIENT = void 0;
const config_1 = require("@nestjs/config");
const backend_1 = require("@clerk/backend");
exports.CLERK_CLIENT = 'ClerkClient';
exports.ClerkClientProvider = {
    provide: exports.CLERK_CLIENT,
    useFactory: (configService) => {
        const secretKey = configService.get('CLERK_SECRET_KEY');
        const publishableKey = configService.get('CLERK_PUBLISHABLE_KEY');
        const jwtKey = configService.get('CLERK_JWT_KEY');
        if (!secretKey) {
            throw new Error('CLERK_SECRET_KEY is not set in environment variables.');
        }
        if (!publishableKey) {
            throw new Error('CLERK_PUBLISHABLE_KEY is not set in environment variables.');
        }
        if (!jwtKey) {
            throw new Error('CLERK_JWT_KEY is not set in environment variables.');
        }
        return (0, backend_1.createClerkClient)({
            secretKey,
            publishableKey,
            jwtKey
        });
    },
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=clerk-client.provider.js.map