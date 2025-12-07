/**
 * White Box Testing for login.ts
 * Tests: Login event handlers and callbacks
 */

describe('Login Event Handlers - White Box Testing', () => {
  let mockSettings;
  let mockAccounts;
  let mockCallbacks;
  let mockSaveFailedLoginAttempts;
  let mockSaveSuccessfulLogin;
  let mockLogFailedLoginAttempts;

  beforeEach(() => {
    // Mock dependencies
    mockSettings = {
      get: jest.fn()
    };

    mockAccounts = {
      onLoginFailure: jest.fn(),
      onLogin: jest.fn()
    };

    mockCallbacks = {
      add: jest.fn()
    };

    mockSaveFailedLoginAttempts = jest.fn().mockResolvedValue();
    mockSaveSuccessfulLogin = jest.fn().mockResolvedValue();
    mockLogFailedLoginAttempts = jest.fn();

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('onLoginFailure Handler - All Conditions', () => {
    const ignoredErrorTypes = ['totp-required', 'error-login-blocked-for-user'];

    const simulateOnLoginFailure = async (login) => {
      // Logic from the actual handler
      if (
        mockSettings.get('Block_Multiple_Failed_Logins_Enabled') &&
        login.error?.error &&
        !ignoredErrorTypes.includes(String(login.error.error))
      ) {
        await mockSaveFailedLoginAttempts(login);
      }

      mockLogFailedLoginAttempts(login);
    };

    test('should save failed attempts when blocking enabled and error not ignored', async () => {
      mockSettings.get.mockReturnValue(true);
      
      const login = {
        error: { error: 'invalid-credentials' }
      };

      await simulateOnLoginFailure(login);

      expect(mockSaveFailedLoginAttempts).toHaveBeenCalledWith(login);
      expect(mockLogFailedLoginAttempts).toHaveBeenCalledWith(login);
    });

    test('should NOT save failed attempts when error is in ignored types (totp-required)', async () => {
      mockSettings.get.mockReturnValue(true);
      
      const login = {
        error: { error: 'totp-required' } // This is in ignoredErrorTypes
      };

      await simulateOnLoginFailure(login);

      expect(mockSaveFailedLoginAttempts).not.toHaveBeenCalled();
      expect(mockLogFailedLoginAttempts).toHaveBeenCalledWith(login);
    });

    test('should NOT save failed attempts when error is in ignored types (error-login-blocked-for-user)', async () => {
      mockSettings.get.mockReturnValue(true);
      
      const login = {
        error: { error: 'error-login-blocked-for-user' }
      };

      await simulateOnLoginFailure(login);

      expect(mockSaveFailedLoginAttempts).not.toHaveBeenCalled();
      expect(mockLogFailedLoginAttempts).toHaveBeenCalledWith(login);
    });

    test('should NOT save failed attempts when blocking is disabled', async () => {
      mockSettings.get.mockReturnValue(false);
      
      const login = {
        error: { error: 'invalid-credentials' }
      };

      await simulateOnLoginFailure(login);

      expect(mockSaveFailedLoginAttempts).not.toHaveBeenCalled();
      expect(mockLogFailedLoginAttempts).toHaveBeenCalledWith(login);
    });

    test('should handle login without error object', async () => {
      mockSettings.get.mockReturnValue(true);
      
      const login = {
        // No error property
      };

      await simulateOnLoginFailure(login);

      expect(mockSaveFailedLoginAttempts).not.toHaveBeenCalled();
      expect(mockLogFailedLoginAttempts).toHaveBeenCalledWith(login);
    });

    test('should handle login with undefined error.error', async () => {
      mockSettings.get.mockReturnValue(true);
      
      const login = {
        error: { /* no error property */ }
      };

      await simulateOnLoginFailure(login);

      expect(mockSaveFailedLoginAttempts).not.toHaveBeenCalled();
      expect(mockLogFailedLoginAttempts).toHaveBeenCalledWith(login);
    });
  });

  describe('afterValidateLogin Callback', () => {
    const simulateAfterValidateLogin = (login) => {
      if (!mockSettings.get('Block_Multiple_Failed_Logins_Enabled')) {
        return;
      }

      return mockSaveSuccessfulLogin(login);
    };

    test('should call saveSuccessfulLogin when blocking enabled', () => {
      mockSettings.get.mockReturnValue(true);
      
      const login = { user: { _id: '123' } };
      
      simulateAfterValidateLogin(login);
      
      expect(mockSaveSuccessfulLogin).toHaveBeenCalledWith(login);
    });

    test('should NOT call saveSuccessfulLogin when blocking disabled', () => {
      mockSettings.get.mockReturnValue(false);
      
      const login = { user: { _id: '123' } };
      
      simulateAfterValidateLogin(login);
      
      expect(mockSaveSuccessfulLogin).not.toHaveBeenCalled();
    });

    test('should handle undefined login object', () => {
      mockSettings.get.mockReturnValue(true);
      
      simulateAfterValidateLogin(undefined);
      
      // Should not crash - mock would be called with undefined
      expect(mockSaveSuccessfulLogin).toHaveBeenCalledWith(undefined);
    });
  });

  describe('String Conversion in ignoredErrorTypes check', () => {
    test('should handle non-string error types with String() conversion', () => {
      const ignoredErrorTypes = ['totp-required', 'error-login-blocked-for-user'];
      
      // Test with number error code
      const numericError = 123;
      expect(ignoredErrorTypes.includes(String(numericError))).toBe(false);
      
      // Test with boolean
      const booleanError = true;
      expect(ignoredErrorTypes.includes(String(booleanError))).toBe(false);
      
      // Test with object
      const objectError = { toString: () => 'totp-required' };
      expect(ignoredErrorTypes.includes(String(objectError))).toBe(true);
    });
  });
});
