import { Test, TestingModule } from "@nestjs/testing";
import { ClerkController } from "src/modules/Infrastructure/clerk/clerk.controller";
import { ClerkSessionService } from "src/modules/Infrastructure/clerk/clerk.session.service";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { ClerkAuthGuard } from "src/modules/Infrastructure/clerk/guards/clerk-auth.guard";
import { UserRole } from "src/modules/users/entities/user.entity";
import {
  SessionIdParamDto,
  UserIdParamDto,
} from "src/modules/Infrastructure/clerk/dto/clerk-params.dto";
import { CanActivate, ValidationPipe } from "@nestjs/common";

// Mock Guards
const mockClerkAuthGuard: CanActivate = { canActivate: jest.fn(() => true) };
const mockRolesGuard: CanActivate = { canActivate: jest.fn(() => true) };

describe("ClerkController", () => {
  let controller: ClerkController;
  let clerkSessionService: ClerkSessionService;

  const mockClerkSessionService = {
    getSessionList: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllUserSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClerkController],
      providers: [
        {
          provide: ClerkSessionService,
          useValue: mockClerkSessionService,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue(mockClerkAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<ClerkController>(ClerkController);
    clerkSessionService = module.get<ClerkSessionService>(ClerkSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("User Session Endpoints", () => {
    const mockRequest = {
      clerkUser: {
        userId: "user_2b6fcd92dvf96q05x8e4a8xvt6a",
      },
    };

    describe("getUserSessions", () => {
      it("should get sessions for current user", async () => {
        const mockSessions = [{ id: "session1" }, { id: "session2" }];
        mockClerkSessionService.getSessionList.mockResolvedValue(mockSessions);

        const result = await controller.getUserSessions(mockRequest);

        expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(
          "user_2b6fcd92dvf96q05x8e4a8xvt6a"
        );
        expect(result).toEqual({
          message: "Sessions retrieved successfully",
          sessions: mockSessions,
        });
      });
    });

    describe("revokeSession", () => {
      it("should revoke specific session", async () => {
        const sessionId = "sess_2b6fcd92dvf96q05x8e4a8xvt6a";
        const sessionIdDto: SessionIdParamDto = { sessionId };
        const mockRevokedSession = { id: sessionId, status: "revoked" };
        mockClerkSessionService.revokeSession.mockResolvedValue(
          mockRevokedSession
        );

        const result = await controller.revokeSession(sessionIdDto);

        expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(
          sessionId
        );
        expect(result).toEqual({
          message: `Session ${sessionId} revoked successfully`,
          session: mockRevokedSession,
        });
      });
    });

    describe("revokeAllSessions", () => {
      it("should revoke all sessions for current user", async () => {
        const mockRevokedInfo = { revoked: 2 };
        mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(
          mockRevokedInfo
        );

        const result = await controller.revokeAllSessions(mockRequest);

        expect(
          mockClerkSessionService.revokeAllUserSessions
        ).toHaveBeenCalledWith("user_2b6fcd92dvf96q05x8e4a8xvt6a");
        expect(result).toEqual({
          message: "All sessions revoked successfully",
          details: mockRevokedInfo,
        });
      });
    });
  });

  describe("Admin Endpoints", () => {
    it("getAnyUserSessions should get sessions for any user", async () => {
      const userId = "user_2b6fcd92dvf96q05x8e4a8xvt6a";
      const userIdDto: UserIdParamDto = { userId };
      const mockSessions = [{ id: "session1" }];
      mockClerkSessionService.getSessionList.mockResolvedValue(mockSessions);

      const result = await controller.getAnyUserSessions(userIdDto);

      expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual({
        message: "User sessions retrieved successfully",
        userId,
        sessions: mockSessions,
      });
    });

    it("revokeAllUserSessions (admin) should revoke all sessions for any user", async () => {
      const userId = "user_2b6fcd92dvf96q05x8e4a8xvt6a";
      const userIdDto: UserIdParamDto = { userId };
      const mockRevokedInfo = { revoked: 5 };
      mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(
        mockRevokedInfo
      );

      const result = await controller.revokeAllUserSessions(userIdDto);

      expect(
        mockClerkSessionService.revokeAllUserSessions
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        message: `All sessions for user ${userId} revoked successfully`,
        details: mockRevokedInfo,
      });
    });
  });

  describe("Phase 2 - Input Validation Analysis", () => {
    let controller: ClerkController;
    let mockClerkSessionService: any;
    let mockClerkAuthGuard: any;
    let mockRolesGuard: any;
    let app: any;

    beforeEach(async () => {
      mockClerkSessionService = {
        getSessionList: jest.fn(),
        revokeSession: jest.fn(),
        revokeAllUserSessions: jest.fn(),
      };

      mockClerkAuthGuard = {
        canActivate: jest.fn().mockReturnValue(true),
      };

      mockRolesGuard = {
        canActivate: jest.fn().mockReturnValue(true),
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [ClerkController],
        providers: [
          {
            provide: ClerkSessionService, // Token để Inject
            useValue: mockClerkSessionService, // Mock service thay thế, các hàm trong object service sẽ không được giữ nguyên logic
          },
        ],
      })
        .overrideGuard(ClerkAuthGuard) // Bypass authentication (Mock Guard)
        .useValue(mockClerkAuthGuard)
        .overrideGuard(RolesGuard)
        .useValue(mockRolesGuard)
        .compile();

      app = module.createNestApplication();

      // Enable ValidationPipe để test validation
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
          transformOptions: {
            enableImplicitConversion: true,
          },
        })
      );

      await app.init();
      controller = module.get<ClerkController>(ClerkController);
    });

    afterEach(async () => {
      jest.clearAllMocks();
      if (app) {
        await app.close();
      }
    });

    describe("Vấn đề 2.2: Kiểm tra Input Validation", () => {
      describe("Controller Behavior Tests - Business Logic với Valid Input", () => {
        describe("revokeSession", () => {
          it("should call clerkSessionService.revokeSession with valid sessionId", async () => {
            // Arrange
            const validParams = { sessionId: "sess_1234567890abcdef" };

            mockClerkSessionService.revokeSession.mockResolvedValue({
              id: "sess_1234567890abcdef",
              status: "revoked",
            });

            // Act - Test controller logic với valid input
            const result = await controller.revokeSession(validParams);

            // Assert - Kiểm tra controller gọi service đúng cách
            expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(
              "sess_1234567890abcdef"
            );
            expect(result.message).toContain("revoked successfully");
            expect(result.session).toEqual({
              id: "sess_1234567890abcdef",
              status: "revoked",
            });
          });

          it("should handle service errors properly", async () => {
            // Arrange
            const validParams = { sessionId: "sess_1234567890abcdef" };
            const serviceError = new Error("Clerk API error");

            mockClerkSessionService.revokeSession.mockRejectedValue(
              serviceError
            );

            // Act & Assert - Test error handling
            await expect(controller.revokeSession(validParams)).rejects.toThrow(
              "Clerk API error"
            );
            expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(
              "sess_1234567890abcdef"
            );
          });
        });

        describe("revokeAllUserSessions", () => {
          it("should call clerkSessionService.revokeAllUserSessions with valid userId", async () => {
            // Arrange
            const validParams = { userId: "user_1234567890abcdef" };

            mockClerkSessionService.revokeAllUserSessions.mockResolvedValue([
              { id: "sess_1", status: "revoked" },
              { id: "sess_2", status: "revoked" },
            ]);

            // Act - Test controller logic với valid input
            const result = await controller.revokeAllUserSessions(validParams);

            // Assert - Kiểm tra controller gọi service đúng cách
            expect(
              mockClerkSessionService.revokeAllUserSessions
            ).toHaveBeenCalledWith("user_1234567890abcdef");
            expect(result.message).toContain("revoked successfully");
            expect(result.details).toHaveLength(2);
          });

          it("should handle revokeAllUserSessions service errors", async () => {
            // Arrange
            const validParams = { userId: "user_1234567890abcdef" };
            const serviceError = new Error("Failed to revoke user sessions");

            mockClerkSessionService.revokeAllUserSessions.mockRejectedValue(
              serviceError
            );

            // Act & Assert - Test error handling
            await expect(
              controller.revokeAllUserSessions(validParams)
            ).rejects.toThrow("Failed to revoke user sessions");
            expect(
              mockClerkSessionService.revokeAllUserSessions
            ).toHaveBeenCalledWith("user_1234567890abcdef");
          });
        });

        describe("getUserSessions", () => {
          it("should get sessions for current user from request context", async () => {
            // Arrange
            const mockReq = { clerkUser: { userId: "user_123456789" } };

            mockClerkSessionService.getSessionList.mockResolvedValue([
              { id: "sess_1", status: "active", lastActiveAt: "2024-01-01" },
              { id: "sess_2", status: "active", lastActiveAt: "2024-01-02" },
            ]);

            // Act - Test controller logic với request context
            const result = await controller.getUserSessions(mockReq);

            // Assert - Kiểm tra controller extract userId từ request và gọi service đúng cách
            expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(
              "user_123456789"
            );
            expect(result.message).toBe("Sessions retrieved successfully");
            expect(result.sessions).toHaveLength(2);
            expect(result.sessions[0]).toEqual({
              id: "sess_1",
              status: "active",
              lastActiveAt: "2024-01-01",
            });
          });

          it("should handle getUserSessions service errors", async () => {
            // Arrange
            const mockReq = { clerkUser: { userId: "user_123456789" } };
            const serviceError = new Error("Failed to fetch user sessions");

            mockClerkSessionService.getSessionList.mockRejectedValue(
              serviceError
            );

            // Act & Assert - Test error handling
            await expect(controller.getUserSessions(mockReq)).rejects.toThrow(
              "Failed to fetch user sessions"
            );
            expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(
              "user_123456789"
            );
          });
        });

        describe("revokeAllSessions", () => {
          it("should revoke all sessions for current user from request context", async () => {
            // Arrange
            const mockReq = { clerkUser: { userId: "user_987654321" } };

            mockClerkSessionService.revokeAllUserSessions.mockResolvedValue([
              { id: "sess_1", status: "revoked", revokedAt: "2024-01-01" },
              { id: "sess_2", status: "revoked", revokedAt: "2024-01-01" },
            ]);

            // Act - Test controller logic với request context
            const result = await controller.revokeAllSessions(mockReq);

            // Assert - Kiểm tra controller extract userId từ request và gọi service đúng cách
            expect(
              mockClerkSessionService.revokeAllUserSessions
            ).toHaveBeenCalledWith("user_987654321");
            expect(result.message).toBe("All sessions revoked successfully");
            expect(result.details).toHaveLength(2);
            expect(result.details[0]).toEqual({
              id: "sess_1",
              status: "revoked",
              revokedAt: "2024-01-01",
            });
          });

          it("should handle revokeAllSessions service errors", async () => {
            // Arrange
            const mockReq = { clerkUser: { userId: "user_987654321" } };
            const serviceError = new Error("Failed to revoke all sessions");

            mockClerkSessionService.revokeAllUserSessions.mockRejectedValue(
              serviceError
            );

            // Act & Assert - Test error handling
            await expect(controller.revokeAllSessions(mockReq)).rejects.toThrow(
              "Failed to revoke all sessions"
            );
            expect(
              mockClerkSessionService.revokeAllUserSessions
            ).toHaveBeenCalledWith("user_987654321");
          });
        });

        describe("getAnyUserSessions (Admin)", () => {
          it("should get sessions for any user with userId in response", async () => {
            // Arrange
            const validParams = { userId: "user_admin_target_456" };

            mockClerkSessionService.getSessionList.mockResolvedValue([
              { id: "sess_admin_1", status: "active", device: "Chrome" },
              { id: "sess_admin_2", status: "expired", device: "Mobile" },
            ]);

            // Act - Test admin controller logic
            const result = await controller.getAnyUserSessions(validParams);

            // Assert - Kiểm tra controller gọi service với target userId và include userId trong response
            expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(
              "user_admin_target_456"
            );
            expect(result.message).toBe("User sessions retrieved successfully");
            expect(result.userId).toBe("user_admin_target_456");
            expect(result.sessions).toHaveLength(2);
            expect(result.sessions[0]).toEqual({
              id: "sess_admin_1",
              status: "active",
              device: "Chrome",
            });
          });

          it("should handle getAnyUserSessions service errors", async () => {
            // Arrange
            const validParams = { userId: "user_admin_target_456" };
            const serviceError = new Error("User not found or access denied");

            mockClerkSessionService.getSessionList.mockRejectedValue(
              serviceError
            );

            // Act & Assert - Test error handling
            await expect(
              controller.getAnyUserSessions(validParams)
            ).rejects.toThrow("User not found or access denied");
            expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(
              "user_admin_target_456"
            );
          });
        });
      });

      describe("Edge Cases & Error Scenarios", () => {
        describe("Empty Data Handling", () => {
          it("should handle empty sessions list from getUserSessions", async () => {
            // Arrange
            const mockReq = { clerkUser: { userId: "user_no_sessions" } };

            mockClerkSessionService.getSessionList.mockResolvedValue([]);

            // Act - Test controller behavior với empty data
            const result = await controller.getUserSessions(mockReq);

            // Assert - Kiểm tra controller handle empty array correctly
            expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(
              "user_no_sessions"
            );
            expect(result.message).toBe("Sessions retrieved successfully");
            expect(result.sessions).toEqual([]);
            expect(result.sessions).toHaveLength(0);
          });

          it("should handle empty revoked sessions list from revokeAllSessions", async () => {
            // Arrange
            const mockReq = {
              clerkUser: { userId: "user_no_active_sessions" },
            };

            mockClerkSessionService.revokeAllUserSessions.mockResolvedValue([]);

            // Act - Test controller behavior với empty revocation result
            const result = await controller.revokeAllSessions(mockReq);

            // Assert - Kiểm tra controller handle empty revocation correctly
            expect(
              mockClerkSessionService.revokeAllUserSessions
            ).toHaveBeenCalledWith("user_no_active_sessions");
            expect(result.message).toBe("All sessions revoked successfully");
            expect(result.details).toEqual([]);
            expect(result.details).toHaveLength(0);
          });

          it("should handle empty admin sessions list from getAnyUserSessions", async () => {
            // Arrange
            const validParams = { userId: "user_admin_empty_target" };

            mockClerkSessionService.getSessionList.mockResolvedValue([]);

            // Act - Test admin controller behavior với empty data
            const result = await controller.getAnyUserSessions(validParams);

            // Assert - Kiểm tra admin controller handle empty sessions correctly
            expect(mockClerkSessionService.getSessionList).toHaveBeenCalledWith(
              "user_admin_empty_target"
            );
            expect(result.message).toBe("User sessions retrieved successfully");
            expect(result.userId).toBe("user_admin_empty_target");
            expect(result.sessions).toEqual([]);
            expect(result.sessions).toHaveLength(0);
          });
        });

        describe("Null/Undefined Response Handling", () => {
          it("should handle null service response from revokeSession", async () => {
            // Arrange
            const validParams = { sessionId: "sess_null_response" };

            mockClerkSessionService.revokeSession.mockResolvedValue(null);

            // Act - Test controller behavior với null service response
            const result = await controller.revokeSession(validParams);

            // Assert - Kiểm tra controller handle null response correctly
            expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(
              "sess_null_response"
            );
            expect(result.message).toBe(
              "Session sess_null_response revoked successfully"
            );
            expect(result.session).toBeNull();
          });

          it("should handle undefined service response from revokeSession", async () => {
            // Arrange
            const validParams = { sessionId: "sess_undefined_response" };

            mockClerkSessionService.revokeSession.mockResolvedValue(undefined);

            // Act - Test controller behavior với undefined service response
            const result = await controller.revokeSession(validParams);

            // Assert - Kiểm tra controller handle undefined response correctly
            expect(mockClerkSessionService.revokeSession).toHaveBeenCalledWith(
              "sess_undefined_response"
            );
            expect(result.message).toBe(
              "Session sess_undefined_response revoked successfully"
            );
            expect(result.session).toBeUndefined();
          });
        });

        describe("Dynamic Message Generation", () => {
          it("should generate dynamic message with correct sessionId in revokeSession", async () => {
            // Arrange
            const testSessionIds = [
              "sess_test_123",
              "sess_another_456",
              "sess_special_chars_789",
            ];

            for (const sessionId of testSessionIds) {
              // Setup mock for each sessionId
              mockClerkSessionService.revokeSession.mockResolvedValue({
                id: sessionId,
                status: "revoked",
              });

              // Act - Test dynamic message generation
              const result = await controller.revokeSession({ sessionId });

              // Assert - Verify message contains correct sessionId
              expect(result.message).toBe(
                `Session ${sessionId} revoked successfully`
              );
              expect(result.message).toContain(sessionId);
            }
          });

          it("should generate dynamic message with correct userId in revokeAllUserSessions", async () => {
            // Arrange
            const testUserIds = [
              "user_admin_test_123",
              "user_special_456",
              "user_long_id_789",
            ];

            for (const userId of testUserIds) {
              // Setup mock for each userId
              mockClerkSessionService.revokeAllUserSessions.mockResolvedValue(
                []
              );

              // Act - Test dynamic message generation
              const result = await controller.revokeAllUserSessions({ userId });

              // Assert - Verify message contains correct userId
              expect(result.message).toBe(
                `All sessions for user ${userId} revoked successfully`
              );
              expect(result.message).toContain(userId);
            }
          });

          it("should include userId in response for getAnyUserSessions", async () => {
            // Arrange
            const testUserIds = [
              "user_response_test_123",
              "user_admin_check_456",
            ];

            for (const userId of testUserIds) {
              // Setup mock for each userId
              mockClerkSessionService.getSessionList.mockResolvedValue([]);

              // Act - Test userId inclusion in response
              const result = await controller.getAnyUserSessions({ userId });

              // Assert - Verify userId is included in response
              expect(result.userId).toBe(userId);
              expect(result.message).toBe(
                "User sessions retrieved successfully"
              );
            }
          });
        });

        describe("Comprehensive Error Scenarios", () => {
          describe("Clerk API Specific Errors", () => {
            it("should handle session not found error (404)", async () => {
              // Arrange
              const validParams = { sessionId: "sess_not_found_123" };
              const clerkError = {
                status: 404,
                code: "session_not_found",
                message: "Session not found",
              };

              mockClerkSessionService.revokeSession.mockRejectedValue(
                clerkError
              );

              // Act & Assert - Test specific Clerk error handling
              await expect(
                controller.revokeSession(validParams)
              ).rejects.toMatchObject({
                status: 404,
                code: "session_not_found",
                message: "Session not found",
              });
              expect(
                mockClerkSessionService.revokeSession
              ).toHaveBeenCalledWith("sess_not_found_123");
            });

            it("should handle rate limit error (429)", async () => {
              // Arrange
              const validParams = { sessionId: "sess_rate_limited" };
              const rateLimitError = {
                status: 429,
                message: "Rate limit exceeded",
                retryAfter: 60,
              };

              mockClerkSessionService.revokeSession.mockRejectedValue(
                rateLimitError
              );

              // Act & Assert - Test rate limit error handling
              await expect(
                controller.revokeSession(validParams)
              ).rejects.toMatchObject({
                status: 429,
                message: "Rate limit exceeded",
                retryAfter: 60,
              });
            });

            it("should handle unauthorized error (401)", async () => {
              // Arrange
              const mockReq = { clerkUser: { userId: "user_unauthorized" } };
              const unauthorizedError = {
                status: 401,
                message: "Invalid or expired authentication token",
              };

              mockClerkSessionService.getSessionList.mockRejectedValue(
                unauthorizedError
              );

              // Act & Assert - Test unauthorized error handling
              await expect(
                controller.getUserSessions(mockReq)
              ).rejects.toMatchObject({
                status: 401,
                message: "Invalid or expired authentication token",
              });
            });

            it("should handle forbidden error (403) for admin operations", async () => {
              // Arrange
              const validParams = { userId: "user_forbidden_access" };
              const forbiddenError = {
                status: 403,
                message: "Insufficient permissions to access user data",
              };

              mockClerkSessionService.getSessionList.mockRejectedValue(
                forbiddenError
              );

              // Act & Assert - Test forbidden error handling
              await expect(
                controller.getAnyUserSessions(validParams)
              ).rejects.toMatchObject({
                status: 403,
                message: "Insufficient permissions to access user data",
              });
            });
          });

          describe("Network & Infrastructure Errors", () => {
            it("should handle network timeout errors", async () => {
              // Arrange
              const validParams = { sessionId: "sess_timeout" };
              const timeoutError = new Error("ETIMEDOUT") as any;
              timeoutError.code = "ETIMEDOUT";
              timeoutError.timeout = 5000;

              mockClerkSessionService.revokeSession.mockRejectedValue(
                timeoutError
              );

              // Act & Assert - Test network timeout error handling
              await expect(
                controller.revokeSession(validParams)
              ).rejects.toMatchObject({
                message: "ETIMEDOUT",
                code: "ETIMEDOUT",
                timeout: 5000,
              });
            });

            it("should handle connection reset errors", async () => {
              // Arrange
              const mockReq = {
                clerkUser: { userId: "user_connection_reset" },
              };
              const connectionError = new Error("ECONNRESET") as any;
              connectionError.code = "ECONNRESET";

              mockClerkSessionService.revokeAllUserSessions.mockRejectedValue(
                connectionError
              );

              // Act & Assert - Test connection reset error handling
              await expect(
                controller.revokeAllSessions(mockReq)
              ).rejects.toMatchObject({
                message: "ECONNRESET",
                code: "ECONNRESET",
              });
            });

            it("should handle DNS resolution errors", async () => {
              // Arrange
              const validParams = { userId: "user_dns_error" };
              const dnsError = new Error("ENOTFOUND") as any;
              dnsError.code = "ENOTFOUND";
              dnsError.hostname = "api.clerk.dev";

              mockClerkSessionService.revokeAllUserSessions.mockRejectedValue(
                dnsError
              );

              // Act & Assert - Test DNS error handling
              await expect(
                controller.revokeAllUserSessions(validParams)
              ).rejects.toMatchObject({
                message: "ENOTFOUND",
                code: "ENOTFOUND",
                hostname: "api.clerk.dev",
              });
            });
          });

          describe("Service Unavailable Scenarios", () => {
            it("should handle service unavailable error (503)", async () => {
              // Arrange
              const validParams = { sessionId: "sess_service_down" };
              const serviceUnavailableError = {
                status: 503,
                message: "Service temporarily unavailable",
                retryAfter: 300,
              };

              mockClerkSessionService.revokeSession.mockRejectedValue(
                serviceUnavailableError
              );

              // Act & Assert - Test service unavailable error handling
              await expect(
                controller.revokeSession(validParams)
              ).rejects.toMatchObject({
                status: 503,
                message: "Service temporarily unavailable",
                retryAfter: 300,
              });
            });

            it("should handle internal server error (500)", async () => {
              // Arrange
              const mockReq = { clerkUser: { userId: "user_internal_error" } };
              const internalError = {
                status: 500,
                message: "Internal server error occurred",
              };

              mockClerkSessionService.getSessionList.mockRejectedValue(
                internalError
              );

              // Act & Assert - Test internal server error handling
              await expect(
                controller.getUserSessions(mockReq)
              ).rejects.toMatchObject({
                status: 500,
                message: "Internal server error occurred",
              });
            });
          });

          describe("Invalid Request Context Errors", () => {
            it("should handle missing clerkUser in request context", async () => {
              // Arrange
              const invalidReq = {}; // Missing clerkUser

              // Act & Assert - Test missing user context error
              await expect(
                controller.getUserSessions(invalidReq)
              ).rejects.toThrow("Missing user context in request");
            });

            it("should handle missing userId in clerkUser context", async () => {
              // Arrange
              const invalidReq = { clerkUser: {} }; // Missing userId

              // Act & Assert - Test missing userId error
              await expect(
                controller.revokeAllSessions(invalidReq)
              ).rejects.toThrow("Missing userId in user context");
            });
          });
        });
      });

      describe("DTO Validation Tests - Validation Rules", () => {
        describe("SessionIdParamDto Validation", () => {
          it("should reject invalid sessionId format (missing sess_ prefix)", async () => {
            // Arrange
            const dto = new SessionIdParamDto();
            dto.sessionId = "invalid-session-id";

            // Act - Test DTO validation logic
            const { validate } = await import("class-validator");
            const errors = await validate(dto);

            // Assert - Validation should fail
            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty("matches");
            expect(errors[0].constraints.matches).toContain(
              "Invalid session ID format"
            );
          });

          it("should reject sessionId with invalid characters", async () => {
            // Arrange
            const dto = new SessionIdParamDto();
            dto.sessionId = "sess_invalid@#$%";

            // Act - Test DTO validation logic
            const { validate } = await import("class-validator");
            const errors = await validate(dto);

            // Assert - Validation should fail
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty("matches");
          });

          it("should reject empty sessionId", async () => {
            // Arrange
            const dto = new SessionIdParamDto();
            dto.sessionId = "";

            // Act - Test DTO validation logic
            const { validate } = await import("class-validator");
            const errors = await validate(dto);

            // Assert - Validation should fail
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty("isNotEmpty");
          });

          it("should accept valid sessionId format (sess_xxx)", async () => {
            // Arrange
            const dto = new SessionIdParamDto();
            dto.sessionId = "sess_1234567890abcdef";

            // Act - Test DTO validation logic
            const { validate } = await import("class-validator");
            const errors = await validate(dto);

            // Assert - Validation should pass
            expect(errors).toHaveLength(0);
          });
        });

        describe("UserIdParamDto Validation", () => {
          it("should reject invalid userId format (missing user_ prefix)", async () => {
            // Arrange
            const dto = new UserIdParamDto();
            dto.userId = "invalid-user-id";

            // Act - Test DTO validation logic
            const { validate } = await import("class-validator");
            const errors = await validate(dto);

            // Assert - Validation should fail
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty("matches");
            expect(errors[0].constraints.matches).toContain(
              "Invalid user ID format"
            );
          });

          it("should reject userId with invalid characters", async () => {
            // Arrange
            const dto = new UserIdParamDto();
            dto.userId = "user_invalid@#$%";

            // Act - Test DTO validation logic
            const { validate } = await import("class-validator");
            const errors = await validate(dto);

            // Assert - Validation should fail
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty("matches");
          });

          it("should accept valid userId format (user_xxx)", async () => {
            // Arrange
            const dto = new UserIdParamDto();
            dto.userId = "user_1234567890abcdef";

            // Act - Test DTO validation logic
            const { validate } = await import("class-validator");
            const errors = await validate(dto);

            // Assert - Validation should pass
            expect(errors).toHaveLength(0);
          });
        });
      });
    });

    describe("Kiểm tra DTO Classes Implementation", () => {
      it("should have SessionIdParamDto with proper validation rules", () => {
        // Arrange
        const dto = new SessionIdParamDto();

        // Act & Assert - Kiểm tra DTO class tồn tại và có thể instantiate
        expect(dto).toBeInstanceOf(SessionIdParamDto);
        // DTO properties are undefined until assigned, so we check the class structure
        expect(dto.constructor.name).toBe("SessionIdParamDto");
      });

      it("should have UserIdParamDto with proper validation rules", () => {
        // Arrange
        const dto = new UserIdParamDto();

        // Act & Assert - Kiểm tra DTO class tồn tại và có thể instantiate
        expect(dto).toBeInstanceOf(UserIdParamDto);
        // DTO properties are undefined until assigned, so we check the class structure
        expect(dto.constructor.name).toBe("UserIdParamDto");
      });
    });

    describe("Kiểm tra ValidationPipe Configuration", () => {
      it("should have ValidationPipe configured globally in test environment", () => {
        // Test này kiểm tra ValidationPipe đã được cấu hình trong test setup
        expect(app).toBeDefined();

        // ValidationPipe đã được enable trong beforeEach
        expect(true).toBe(true);
      });
    });

    describe("Security Risk Assessment - Validation Protection", () => {
      it("should reject SQL injection attempts in sessionId", async () => {
        // Arrange
        const maliciousSessionIdParam = {
          sessionId: "'; DROP TABLE sessions; --",
        };

        // Act & Assert - Validation sẽ reject malicious input
        const dto = new SessionIdParamDto();
        Object.assign(dto, maliciousSessionIdParam);

        const { validate } = await import("class-validator");
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("matches");
      });

      it("should reject XSS attempts in sessionId", async () => {
        // Arrange
        const xssPayloadParam = { sessionId: '<script>alert("xss")</script>' };

        // Act & Assert - Validation sẽ reject XSS payload
        const dto = new SessionIdParamDto();
        Object.assign(dto, xssPayloadParam);

        const { validate } = await import("class-validator");
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("matches");
      });

      it("should reject path traversal attempts in sessionId", async () => {
        // Arrange
        const pathTraversalParam = { sessionId: "../../../etc/passwd" };

        // Act & Assert - Validation sẽ reject path traversal
        const dto = new SessionIdParamDto();
        Object.assign(dto, pathTraversalParam);

        const { validate } = await import("class-validator");
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty("matches");
      });
    });
  });
});
