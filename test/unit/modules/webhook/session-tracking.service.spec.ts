import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { SessionTrackingService } from 'src/modules/webhooks/services/session-tracking.service';
import { UserSession } from 'src/modules/webhooks/entities/user-session.entity';

interface CreateSessionDto {
  clerkSessionId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  sessionMetadata?: Record<string, any>;
}

interface UpdateSessionDto {
  lastActivity?: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionMetadata?: Record<string, any>;
}

describe('SessionTrackingService', () => {
  let service: SessionTrackingService;
  let repository: jest.Mocked<Repository<UserSession>>;
  let logger: jest.Mocked<Logger>;

  const mockUserSession = {
    id: 'session-uuid',
    clerkSessionId: 'sess_test123',
    userId: 'user-uuid',
    createdAt: new Date('2025-07-06T10:00:00Z'),
    endedAt: null,
    lastActivity: new Date('2025-07-06T10:05:00Z'),
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    sessionMetadata: { device: 'desktop' },
    user: null,
    updatedAt: new Date('2025-07-06T10:05:00Z'),
    isActive: true,
    getDuration: jest.fn().mockReturnValue(300000),
    markAsEnded: jest.fn(),
    updateActivity: jest.fn(),
  } as any;

  const createSessionDto: CreateSessionDto = {
    clerkSessionId: 'sess_test123',
    userId: 'user-uuid',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    sessionMetadata: { device: 'desktop' },
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionTrackingService,
        {
          provide: getRepositoryToken(UserSession),
          useValue: mockRepository,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<SessionTrackingService>(SessionTrackingService);
    repository = module.get(getRepositoryToken(UserSession));
    logger = module.get(Logger);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a session successfully', async () => {
      repository.create.mockReturnValue(mockUserSession);
      repository.save.mockResolvedValue(mockUserSession);

      const result = await service.createSession(createSessionDto);

      expect(repository.create).toHaveBeenCalledWith({
        clerkSessionId: createSessionDto.clerkSessionId,
        userId: createSessionDto.userId,
        createdAt: expect.any(Date),
        lastActivity: expect.any(Date),
        ipAddress: createSessionDto.ipAddress,
        userAgent: createSessionDto.userAgent,
        sessionMetadata: createSessionDto.sessionMetadata,
      });
      expect(repository.save).toHaveBeenCalledWith(mockUserSession);
      expect(result).toEqual(mockUserSession);
    });

    it('should throw InternalServerErrorException when repository fails', async () => {
      repository.create.mockReturnValue(mockUserSession);
      repository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createSession(createSessionDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateSession', () => {
    const updateSessionDto: UpdateSessionDto = {
      lastActivity: new Date('2025-07-06T10:10:00Z'),
      ipAddress: '192.168.1.101',
    };

    it('should update a session successfully', async () => {
      repository.findOne.mockResolvedValue(mockUserSession);
      repository.save.mockResolvedValue({ ...mockUserSession, ...updateSessionDto });

      const result = await service.updateSession('sess_test123', updateSessionDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { clerkSessionId: 'sess_test123' }
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when session not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.updateSession('sess_nonexistent', updateSessionDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException when repository fails', async () => {
      repository.findOne.mockResolvedValue(mockUserSession);
      repository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.updateSession('sess_test123', updateSessionDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('endSession', () => {
    it('should end a session successfully', async () => {
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      await service.endSession('sess_test123');

      expect(repository.update).toHaveBeenCalledWith(
        { clerkSessionId: 'sess_test123' },
        { endedAt: expect.any(Date) }
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      repository.update.mockResolvedValue({ affected: 0, raw: {}, generatedMaps: [] });

      await expect(service.endSession('sess_nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException when repository fails', async () => {
      repository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.endSession('sess_test123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions for a user', async () => {
      const activeSessions = [mockUserSession];
      repository.find.mockResolvedValue(activeSessions);

      const result = await service.getActiveSessions('user-uuid');

      expect(repository.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid', endedAt: expect.anything() },
        order: { createdAt: 'DESC' }
      });
      expect(result).toEqual(activeSessions);
    });

    it('should throw InternalServerErrorException when repository fails', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));

      await expect(service.getActiveSessions('user-uuid')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getSessionByClerkId', () => {
    it('should return session by Clerk ID', async () => {
      repository.findOne.mockResolvedValue(mockUserSession);

      const result = await service.getSessionByClerkId('sess_test123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { clerkSessionId: 'sess_test123' },
        relations: ['user']
      });
      expect(result).toEqual(mockUserSession);
    });

    it('should return null when session not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.getSessionByClerkId('sess_nonexistent');

      expect(result).toBeNull();
    });

    it('should throw InternalServerErrorException when repository fails', async () => {
      repository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getSessionByClerkId('sess_test123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateLastActivity', () => {
    it('should update last activity successfully', async () => {
      repository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      await service.updateLastActivity('sess_test123');

      expect(repository.update).toHaveBeenCalledWith(
        { clerkSessionId: 'sess_test123' },
        { lastActivity: expect.any(Date) }
      );
    });

    it('should not throw error when session not found', async () => {
      repository.update.mockResolvedValue({ affected: 0, raw: {}, generatedMaps: [] });

      await expect(service.updateLastActivity('sess_nonexistent')).resolves.not.toThrow();
    });

    it('should not throw error when repository fails', async () => {
      repository.update.mockRejectedValue(new Error('Database error'));

      await expect(service.updateLastActivity('sess_test123')).resolves.not.toThrow();
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should cleanup expired sessions successfully', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 5 }),
      } as any;
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.cleanupExpiredSessions(30);

      expect(repository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('created_at < :cutoffDate', {
        cutoffDate: expect.any(Date)
      });
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should throw InternalServerErrorException when cleanup fails', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any;
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(service.cleanupExpiredSessions(30)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getSessionStats', () => {
    it('should return session statistics', async () => {
      repository.count
        .mockResolvedValueOnce(10) // totalSessions
        .mockResolvedValueOnce(3); // activeSessions
      
      repository.find.mockResolvedValue([
        { createdAt: new Date('2025-07-06T10:00:00Z'), endedAt: new Date('2025-07-06T10:30:00Z') } as any,
        { createdAt: new Date('2025-07-06T11:00:00Z'), endedAt: new Date('2025-07-06T11:15:00Z') } as any,
      ]);

      const result = await service.getSessionStats('user-uuid');

      expect(result).toEqual({
        totalSessions: 10,
        activeSessions: 3,
        averageSessionDuration: expect.any(Number),
      });
    });

    it('should throw InternalServerErrorException when stats calculation fails', async () => {
      repository.count.mockRejectedValue(new Error('Database error'));

      await expect(service.getSessionStats('user-uuid')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
