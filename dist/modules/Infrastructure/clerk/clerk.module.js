"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ClerkModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const clerk_session_service_1 = require("./clerk.session.service");
const clerk_controller_1 = require("./clerk.controller");
const clerk_auth_guard_1 = require("./guards/clerk-auth.guard");
const clerk_client_provider_1 = require("./providers/clerk-client.provider");
let ClerkModule = ClerkModule_1 = class ClerkModule {
    static forRoot(options) {
        return {
            module: ClerkModule_1,
            controllers: [clerk_controller_1.ClerkController],
            providers: [
                {
                    provide: "CLERK_OPTIONS",
                    useValue: options,
                },
                clerk_client_provider_1.ClerkClientProvider,
                clerk_session_service_1.ClerkSessionService,
                clerk_auth_guard_1.ClerkAuthGuard,
            ],
            exports: [
                clerk_session_service_1.ClerkSessionService,
                clerk_auth_guard_1.ClerkAuthGuard,
                "CLERK_OPTIONS",
                clerk_client_provider_1.CLERK_CLIENT,
            ],
            global: true,
        };
    }
    static forRootAsync(options) {
        return {
            module: ClerkModule_1,
            imports: [config_1.ConfigModule],
            controllers: [clerk_controller_1.ClerkController],
            providers: [
                {
                    provide: "CLERK_OPTIONS",
                    useFactory: (configService) => ({
                        secretKey: configService.get("CLERK_SECRET_KEY"),
                        publishableKey: configService.get("CLERK_PUBLISHABLE_KEY"),
                    }),
                    inject: [config_1.ConfigService],
                },
                clerk_client_provider_1.ClerkClientProvider,
                clerk_session_service_1.ClerkSessionService,
                clerk_auth_guard_1.ClerkAuthGuard,
            ],
            exports: [
                clerk_session_service_1.ClerkSessionService,
                clerk_auth_guard_1.ClerkAuthGuard,
                "CLERK_OPTIONS",
                clerk_client_provider_1.CLERK_CLIENT,
            ],
            global: true,
        };
    }
};
exports.ClerkModule = ClerkModule;
exports.ClerkModule = ClerkModule = ClerkModule_1 = __decorate([
    (0, common_1.Module)({})
], ClerkModule);
//# sourceMappingURL=clerk.module.js.map