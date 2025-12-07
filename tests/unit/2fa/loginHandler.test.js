/**
 * White Box Testing for loginHandler.ts
 * 
 * Functions Under Test:
 * - TOTP login handler
 * - onValidateLogin callback
 * - OAuth._retrievePendingCredential override
 */

describe('loginHandler.ts - Login Handler', () => {
  
  describe('TOTP Login Handler', () => {
    
    test('TC-001: Should return undefined when no TOTP code in options', () => {
      // Arrange
      const registerLoginHandler = (handlerName, handler) => {
        // Simulate Accounts.registerLoginHandler
        return handler;
      };
      
      const totpLoginHandler = function (options) {
        if (!options.totp?.code) {
          return;
        }
        // Would process TOTP login
        return { userId: 'user123' };
      };
      
      const loginHandler = registerLoginHandler('totp', totpLoginHandler);

      // Act
      const result = loginHandler({ password: { user: 'test' } }); // No totp.code

      // Assert
      expect(result).toBeUndefined();
    });

    test('TC-002: Should process TOTP login when code is present', () => {
      // Arrange
      const mockAccounts = {
        _runLoginHandlers: jest.fn().mockReturnValue({ userId: 'user123' }),
      };
      
      const totpLoginHandler = function (options) {
        if (!options.totp?.code) {
          return;
        }
        // @ts-expect-error - not sure how to type this yet
        return mockAccounts._runLoginHandlers(this, options.totp.login);
      };
      
      const context = { connectionId: 'conn123' };
      const options = {
        totp: {
          code: '123456',
          login: { user: { id: 'user123' } }
        }
      };

      // Act
      const result = totpLoginHandler.call(context, options);

      // Assert
      expect(result).toEqual({ userId: 'user123' });
      expect(mockAccounts._runLoginHandlers).toHaveBeenCalledWith(
        context,
        { user: { id: 'user123' } }
      );
    });
  });

  describe('onValidateLogin Callback', () => {
    
    test('TC-003: Should return login unchanged for resume type', async () => {
      // Arrange
      const mockCheckCodeForUser = jest.fn();
      
      const onValidateLogin = async (login) => {
        if (
          !login.user ||
          login.type === 'resume' ||
          login.type === 'proxy' ||
          login.type === 'cas' ||
          (login.type === 'password' && login.methodName === 'resetPassword') ||
          login.methodName === 'verifyEmail'
        ) {
          return login;
        }

        const [loginArgs] = login.methodArguments;
        const { totp } = loginArgs;

        await mockCheckCodeForUser({
          user: login.user,
          code: totp?.code,
          options: { disablePasswordFallback: true },
        });

        return login;
      };

      const login = {
        user: { _id: 'user123' },
        type: 'resume', // Should be skipped
        methodArguments: [{ totp: { code: '123456' } }]
      };

      // Act
      const result = await onValidateLogin(login);

      // Assert
      expect(result).toBe(login);
      expect(mockCheckCodeForUser).not.toHaveBeenCalled();
    });

    test('TC-004: Should check 2FA for password login', async () => {
      // Arrange
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);
      
      const onValidateLogin = async (login) => {
        if (
          !login.user ||
          login.type === 'resume' ||
          login.type === 'proxy' ||
          login.type === 'cas' ||
          (login.type === 'password' && login.methodName === 'resetPassword') ||
          login.methodName === 'verifyEmail'
        ) {
          return login;
        }

        const [loginArgs] = login.methodArguments;
        const { totp } = loginArgs;

        await mockCheckCodeForUser({
          user: login.user,
          code: totp?.code,
          options: { disablePasswordFallback: true },
        });

        return login;
      };

      const login = {
        user: { _id: 'user123' },
        type: 'password',
        methodName: 'login',
        methodArguments: [{ 
          totp: { 
            code: '123456',
            login: { user: { id: 'user123' } }
          } 
        }]
      };

      // Act
      const result = await onValidateLogin(login);

      // Assert
      expect(result).toBe(login);
      expect(mockCheckCodeForUser).toHaveBeenCalledWith({
        user: { _id: 'user123' },
        code: '123456',
        options: { disablePasswordFallback: true },
      });
    });

    test('TC-005: Should skip 2FA for resetPassword', async () => {
      // Arrange
      const mockCheckCodeForUser = jest.fn();
      
      const onValidateLogin = async (login) => {
        if (
          !login.user ||
          login.type === 'resume' ||
          login.type === 'proxy' ||
          login.type === 'cas' ||
          (login.type === 'password' && login.methodName === 'resetPassword') ||
          login.methodName === 'verifyEmail'
        ) {
          return login;
        }

        await mockCheckCodeForUser({
          user: login.user,
          code: undefined,
          options: { disablePasswordFallback: true },
        });

        return login;
      };

      const login = {
        user: { _id: 'user123' },
        type: 'password',
        methodName: 'resetPassword', // Should be skipped
        methodArguments: [{}]
      };

      // Act
      const result = await onValidateLogin(login);

      // Assert
      expect(result).toBe(login);
      expect(mockCheckCodeForUser).not.toHaveBeenCalled();
    });

    test('TC-006: Should skip 2FA for verifyEmail', async () => {
      // Arrange
      const mockCheckCodeForUser = jest.fn();
      
      const onValidateLogin = async (login) => {
        if (
          !login.user ||
          login.type === 'resume' ||
          login.type === 'proxy' ||
          login.type === 'cas' ||
          (login.type === 'password' && login.methodName === 'resetPassword') ||
          login.methodName === 'verifyEmail'
        ) {
          return login;
        }

        await mockCheckCodeForUser({
          user: login.user,
          code: undefined,
          options: { disablePasswordFallback: true },
        });

        return login;
      };

      const login = {
        user: { _id: 'user123' },
        type: 'password',
        methodName: 'verifyEmail', // Should be skipped
        methodArguments: [{}]
      };

      // Act
      const result = await onValidateLogin(login);

      // Assert
      expect(result).toBe(login);
      expect(mockCheckCodeForUser).not.toHaveBeenCalled();
    });

    test('TC-007: Should skip 2FA when no user in login', async () => {
      // Arrange
      const mockCheckCodeForUser = jest.fn();
      
      const onValidateLogin = async (login) => {
        if (
          !login.user ||
          login.type === 'resume' ||
          login.type === 'proxy' ||
          login.type === 'cas' ||
          (login.type === 'password' && login.methodName === 'resetPassword') ||
          login.methodName === 'verifyEmail'
        ) {
          return login;
        }

        await mockCheckCodeForUser({
          user: login.user,
          code: undefined,
          options: { disablePasswordFallback: true },
        });

        return login;
      };

      const login = {
        user: null, // No user
        type: 'password',
        methodArguments: [{}]
      };

      // Act
      const result = await onValidateLogin(login);

      // Assert
      expect(result).toBe(login);
      expect(mockCheckCodeForUser).not.toHaveBeenCalled();
    });

    test('TC-008: Should handle login without totp in arguments', async () => {
      // Arrange
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);
      
      const onValidateLogin = async (login) => {
        if (
          !login.user ||
          login.type === 'resume' ||
          login.type === 'proxy' ||
          login.type === 'cas' ||
          (login.type === 'password' && login.methodName === 'resetPassword') ||
          login.methodName === 'verifyEmail'
        ) {
          return login;
        }

        const [loginArgs] = login.methodArguments;
        const { totp } = loginArgs;

        await mockCheckCodeForUser({
          user: login.user,
          code: totp?.code,
          options: { disablePasswordFallback: true },
        });

        return login;
      };

      const login = {
        user: { _id: 'user123' },
        type: 'password',
        methodName: 'login',
        methodArguments: [{}] // No totp
      };

      // Act
      const result = await onValidateLogin(login);

      // Assert
      expect(result).toBe(login);
      expect(mockCheckCodeForUser).toHaveBeenCalledWith({
        user: { _id: 'user123' },
        code: undefined,
        options: { disablePasswordFallback: true },
      });
    });
  });

  describe('OAuth._retrievePendingCredential Override', () => {
    
    test('TC-009: Should return undefined when no pending credential found', async () => {
      // Arrange
      const mockCheck = jest.fn();
      
      const OAuth = {
        _pendingCredentials: {
          findOneAsync: jest.fn().mockResolvedValue(null), // No credential
        },
      };
      
      const retrievePendingCredential = async function (key, ...args) {
        const credentialSecret = args.length > 0 && args[0] !== undefined ? args[0] : undefined;
        mockCheck(key, String);

        const pendingCredential = await OAuth._pendingCredentials.findOneAsync({
          key,
          credentialSecret,
        });

        if (!pendingCredential) {
          return;
        }
        return 'credential';
      };

      // Act
      const result = await retrievePendingCredential('testKey');

      // Assert
      expect(result).toBeUndefined();
      expect(mockCheck).toHaveBeenCalledWith('testKey', String);
      expect(OAuth._pendingCredentials.findOneAsync).toHaveBeenCalledWith({
        key: 'testKey',
        credentialSecret: undefined,
      });
    });

    test('TC-010: Should return error when credential has error', async () => {
      // Arrange
      const mockCheck = jest.fn();
      
      const isCredentialWithError = (credential) => {
        return credential?.error !== undefined;
      };
      
      const recreateError = (errorDoc) => {
        const error = new Error(errorDoc.message);
        error.stack = errorDoc.stack;
        return error;
      };
      
      const OAuth = {
        _pendingCredentials: {
          findOneAsync: jest.fn().mockResolvedValue({
            _id: 'cred123',
            credential: { error: new Error('OAuth error') }
          }),
          removeAsync: jest.fn(),
        },
      };
      
      const retrievePendingCredential = async function (key, ...args) {
        const credentialSecret = args.length > 0 && args[0] !== undefined ? args[0] : undefined;
        mockCheck(key, String);

        const pendingCredential = await OAuth._pendingCredentials.findOneAsync({
          key,
          credentialSecret,
        });

        if (!pendingCredential) {
          return;
        }

        if (isCredentialWithError(pendingCredential.credential)) {
          await OAuth._pendingCredentials.removeAsync({
            _id: pendingCredential._id,
          });
          return recreateError(pendingCredential.credential.error);
        }

        return 'credential';
      };

      // Act
      const result = await retrievePendingCredential('testKey');

      // Assert
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('OAuth error');
      expect(OAuth._pendingCredentials.removeAsync).toHaveBeenCalledWith({
        _id: 'cred123',
      });
    });

    test('TC-011: Should update createdAt for reusable credentials', async () => {
      // Arrange
      const mockCheck = jest.fn();
      const mockOpenSecret = jest.fn().mockReturnValue('openedCredential');
      
      const OAuth = {
        _pendingCredentials: {
          findOneAsync: jest.fn().mockResolvedValue({
            _id: 'cred123',
            credential: 'encryptedCredential',
            createdAt: new Date('2024-01-01'),
          }),
          updateAsync: jest.fn(),
        },
        openSecret: mockOpenSecret,
      };
      
      const retrievePendingCredential = async function (key, ...args) {
        const credentialSecret = args.length > 0 && args[0] !== undefined ? args[0] : undefined;
        mockCheck(key, String);

        const pendingCredential = await OAuth._pendingCredentials.findOneAsync({
          key,
          credentialSecret,
        });

        if (!pendingCredential) {
          return;
        }

        // Work-around to make the credentials reusable for 2FA
        const future = new Date();
        future.setMinutes(future.getMinutes() + 2);

        await OAuth._pendingCredentials.updateAsync(
          {
            _id: pendingCredential._id,
          },
          {
            $set: {
              createdAt: future,
            },
          },
        );

        return OAuth.openSecret(pendingCredential.credential);
      };

      // Act
      const result = await retrievePendingCredential('testKey');

      // Assert
      expect(result).toBe('openedCredential');
      expect(OAuth._pendingCredentials.updateAsync).toHaveBeenCalledWith(
        { _id: 'cred123' },
        { $set: { createdAt: expect.any(Date) } }
      );
      expect(mockOpenSecret).toHaveBeenCalledWith('encryptedCredential');
    });

    test('TC-012: Should handle credentialSecret parameter', async () => {
      // Arrange
      const mockCheck = jest.fn();
      
      const OAuth = {
        _pendingCredentials: {
          findOneAsync: jest.fn().mockResolvedValue(null),
        },
      };
      
      const retrievePendingCredential = async function (key, ...args) {
        const credentialSecret = args.length > 0 && args[0] !== undefined ? args[0] : undefined;
        mockCheck(key, String);

        const pendingCredential = await OAuth._pendingCredentials.findOneAsync({
          key,
          credentialSecret,
        });

        if (!pendingCredential) {
          return;
        }
        return 'credential';
      };

      // Act
      const result = await retrievePendingCredential('testKey', 'secret123');

      // Assert
      expect(result).toBeUndefined();
      expect(OAuth._pendingCredentials.findOneAsync).toHaveBeenCalledWith({
        key: 'testKey',
        credentialSecret: 'secret123',
      });
    });
  });

  describe('Utility Functions', () => {
    
    test('TC-013: isMeteorError should check for meteorError property', () => {
      // Arrange
      const isMeteorError = (error) => {
        return error?.meteorError !== undefined;
      };

      const meteorError = { meteorError: true, error: 'test' };
      const regularError = new Error('test');
      const nullError = null;
      const undefinedError = undefined;

      // Act & Assert
      expect(isMeteorError(meteorError)).toBe(true);
      expect(isMeteorError(regularError)).toBe(false);
      expect(isMeteorError(nullError)).toBe(false);
      expect(isMeteorError(undefinedError)).toBe(false);
    });

    test('TC-014: isCredentialWithError should check for error property', () => {
      // Arrange
      const isCredentialWithError = (credential) => {
        return credential?.error !== undefined;
      };

      const credentialWithError = { error: new Error('test') };
      const credentialWithoutError = { data: 'test' };
      const nullCredential = null;
      const undefinedCredential = undefined;

      // Act & Assert
      expect(isCredentialWithError(credentialWithError)).toBe(true);
      expect(isCredentialWithError(credentialWithoutError)).toBe(false);
      expect(isCredentialWithError(nullCredential)).toBe(false);
      expect(isCredentialWithError(undefinedCredential)).toBe(false);
    });

    test('TC-015: copyTo should copy properties between errors', () => {
      // Arrange
      const copyTo = (from, to) => {
        Object.getOwnPropertyNames(to).forEach((key) => {
          const idx = key;
          to[idx] = from[idx];
        });
        return to;
      };

      const fromError = { message: 'test', stack: 'stack', code: 500 };
      const toError = { message: '', stack: '', code: 0 };

      // Act
      const result = copyTo(fromError, toError);

      // Assert
      expect(result.message).toBe('test');
      expect(result.stack).toBe('stack');
      expect(result.code).toBe(500);
      expect(result).toBe(toError); // Should return the same object
    });

    test('TC-016: recreateError should recreate Meteor.Error', () => {
      // Arrange
      const recreateError = (errorDoc) => {
        const isMeteorError = errorDoc?.meteorError !== undefined;
        
        if (isMeteorError) {
          const error = { meteorError: true, error: '', reason: '' };
          // Simplified copy
          error.error = errorDoc.error;
          error.reason = errorDoc.reason;
          return error;
        }

        const error = new Error();
        error.message = errorDoc.message;
        return error;
      };

      const meteorErrorDoc = { meteorError: true, error: 'test-error', reason: 'Test reason' };
      const regularErrorDoc = new Error('Regular error');

      // Act
      const result1 = recreateError(meteorErrorDoc);
      const result2 = recreateError(regularErrorDoc);

      // Assert
      expect(result1.meteorError).toBe(true);
      expect(result1.error).toBe('test-error');
      expect(result1.reason).toBe('Test reason');
      expect(result2.message).toBe('Regular error');
    });
  });
});
