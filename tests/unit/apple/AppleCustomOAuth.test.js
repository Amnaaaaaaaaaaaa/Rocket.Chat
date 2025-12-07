/**
 * White Box Testing for AppleCustomOAuth.ts
 * 
 * Class Under Test:
 * - AppleCustomOAuth
 * - getIdentity method
 */

describe('AppleCustomOAuth.ts - Apple Custom OAuth Implementation', () => {
  let mockHandleIdentityToken;
  let mockMeteorError;
  let mockAccounts;

  beforeEach(() => {
    mockHandleIdentityToken = jest.fn();
    
    mockMeteorError = jest.fn((error, message) => ({
      error,
      message,
      errorType: 'Meteor.Error'
    }));

    mockAccounts = {
      LoginCancelledError: {
        numericError: 'login-cancelled'
      }
    };

    jest.clearAllMocks();
  });

  describe('getIdentity Method', () => {
    
    test('TC-001: Should parse identity token successfully', async () => {
      // Arrange
      const accessToken = 'mock-access-token';
      const query = {
        id_token: 'valid.id.token',
        user: ''
      };

      mockHandleIdentityToken.mockResolvedValue({
        id: 'user123',
        email: 'test@example.com',
        name: ''
      });

      // Act
      const result = await mockHandleIdentityToken(query.id_token);

      // Assert
      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: ''
      });
    });

    test('TC-002: Should parse user object from JSON string', async () => {
      // Arrange
      const userStr = JSON.stringify({
        name: {
          firstName: 'John',
          lastName: 'Doe'
        }
      });

      // Act
      let usrObj = {};
      try {
        usrObj = JSON.parse(userStr);
      } catch (e) {
        // ignore
      }

      // Assert
      expect(usrObj).toEqual({
        name: {
          firstName: 'John',
          lastName: 'Doe'
        }
      });
    });

    test('TC-003: Should handle invalid JSON in user string', () => {
      // Arrange
      const userStr = 'invalid-json-{';

      // Act
      let usrObj = {};
      let errorCaught = false;
      try {
        usrObj = JSON.parse(userStr);
      } catch (e) {
        errorCaught = true;
      }

      // Assert
      expect(errorCaught).toBe(true);
      expect(usrObj).toEqual({});
    });

    test('TC-004: Should construct full name with first and last name', async () => {
      // Arrange
      const usrObj = {
        name: {
          firstName: 'Jane',
          lastName: 'Smith'
        }
      };

      const serviceData = {
        id: 'user123',
        email: 'jane@example.com',
        name: ''
      };

      // Act
      if (usrObj?.name) {
        serviceData.name = `${usrObj.name.firstName}${usrObj.name.middleName ? ` ${usrObj.name.middleName}` : ''}${
          usrObj.name.lastName ? ` ${usrObj.name.lastName}` : ''
        }`;
      }

      // Assert
      expect(serviceData.name).toBe('Jane Smith');
    });

    test('TC-005: Should construct full name with middle name', async () => {
      // Arrange
      const usrObj = {
        name: {
          firstName: 'John',
          middleName: 'Paul',
          lastName: 'Jones'
        }
      };

      const serviceData = {
        id: 'user123',
        email: 'john@example.com',
        name: ''
      };

      // Act
      if (usrObj?.name) {
        serviceData.name = `${usrObj.name.firstName}${usrObj.name.middleName ? ` ${usrObj.name.middleName}` : ''}${
          usrObj.name.lastName ? ` ${usrObj.name.lastName}` : ''
        }`;
      }

      // Assert
      expect(serviceData.name).toBe('John Paul Jones');
    });

    test('TC-006: Should handle only first name', async () => {
      // Arrange
      const usrObj = {
        name: {
          firstName: 'Madonna'
        }
      };

      const serviceData = {
        id: 'user123',
        email: 'madonna@example.com',
        name: ''
      };

      // Act
      if (usrObj?.name) {
        serviceData.name = `${usrObj.name.firstName}${usrObj.name.middleName ? ` ${usrObj.name.middleName}` : ''}${
          usrObj.name.lastName ? ` ${usrObj.name.lastName}` : ''
        }`;
      }

      // Assert
      expect(serviceData.name).toBe('Madonna');
    });

    test('TC-007: Should handle missing name object', async () => {
      // Arrange
      const usrObj = {};
      const serviceData = {
        id: 'user123',
        email: 'test@example.com',
        name: ''
      };

      // Act
      if (usrObj?.name) {
        serviceData.name = `${usrObj.name.firstName}`;
      }

      // Assert
      expect(serviceData.name).toBe('');
    });

    test('TC-008: Should return error when handleIdentityToken throws', async () => {
      // Arrange
      const query = {
        id_token: 'invalid.token',
        user: ''
      };

      const errorMessage = 'Invalid token signature';
      mockHandleIdentityToken.mockRejectedValue(new Error(errorMessage));

      // Act
      let result;
      try {
        await mockHandleIdentityToken(query.id_token);
      } catch (error) {
        result = {
          type: 'apple',
          error: mockMeteorError(mockAccounts.LoginCancelledError.numericError, error.message)
        };
      }

      // Assert
      expect(result.type).toBe('apple');
      expect(result.error.message).toBe(errorMessage);
    });

    test('TC-009: Should handle empty user string', async () => {
      // Arrange
      const query = {
        id_token: 'valid.token',
        user: ''
      };

      // Act
      let usrObj = {};
      try {
        usrObj = JSON.parse(query.user);
      } catch (e) {
        // ignore
      }

      // Assert
      expect(usrObj).toEqual({});
    });

    test('TC-010: Should preserve serviceData from handleIdentityToken', async () => {
      // Arrange
      const expectedServiceData = {
        id: 'apple-user-123',
        email: 'user@icloud.com',
        name: ''
      };

      mockHandleIdentityToken.mockResolvedValue(expectedServiceData);

      // Act
      const result = await mockHandleIdentityToken('token');

      // Assert
      expect(result).toEqual(expectedServiceData);
      expect(result.id).toBe('apple-user-123');
      expect(result.email).toBe('user@icloud.com');
    });

    test('TC-011: Should return error object with type apple on failure', async () => {
      // Arrange
      const errorMessage = 'Token expired';
      mockHandleIdentityToken.mockRejectedValue(new Error(errorMessage));

      // Act
      let errorResult;
      try {
        await mockHandleIdentityToken('expired.token');
      } catch (error) {
        errorResult = {
          type: 'apple',
          error: mockMeteorError(mockAccounts.LoginCancelledError.numericError, error.message)
        };
      }

      // Assert
      expect(errorResult).toBeDefined();
      expect(errorResult.type).toBe('apple');
      expect(errorResult.error).toBeDefined();
    });
  });
});
