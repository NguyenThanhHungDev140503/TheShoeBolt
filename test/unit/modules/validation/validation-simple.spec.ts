import { validate } from 'class-validator';
import { SessionIdParamDto, UserIdParamDto } from 'src/modules/Infrastructure/clerk/dto/clerk-params.dto';

describe('Simple Validation Test', () => {
  describe('SessionIdParamDto Validation', () => {
    it('should pass validation for valid sessionId', async () => {
      // Arrange
      const dto = new SessionIdParamDto();
      dto.sessionId = 'sess_1234567890abcdef';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid sessionId format', async () => {
      // Arrange
      const dto = new SessionIdParamDto();
      dto.sessionId = 'invalid-session-id';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail validation for empty sessionId', async () => {
      // Arrange
      const dto = new SessionIdParamDto();
      dto.sessionId = '';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('UserIdParamDto Validation', () => {
    it('should pass validation for valid userId', async () => {
      // Arrange
      const dto = new UserIdParamDto();
      dto.userId = 'user_1234567890abcdef';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation for invalid userId format', async () => {
      // Arrange
      const dto = new UserIdParamDto();
      dto.userId = 'invalid-user-id';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });
  });
});
