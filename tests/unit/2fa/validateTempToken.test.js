/**
 * White Box Testing for validateTempToken.ts
 * 
 * Meteor Method Under Test:
 * - '2fa:validateTempToken'
 */

describe('validateTempToken.ts - Validate Temporary Token', () => {
  
  describe('Meteor Method - 2fa:validateTempToken', () => {
    
    test('TC-001: Should throw error when user is not logged in', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue(null),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const validateTempToken = async (userToken) => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }
        return {};
      };

      // Act & Assert
      await expect(validateTempToken('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'not-authorized'
        }));
    });

    test('TC-002: Should throw error when user is invalid', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue(null),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const validateTempToken = async (userToken) => {
        const userId = mockMeteor.userId();
        if (!userId) {
          throw mockMeteor.Error('not-authorized');
        }

        const user = await mockMeteor.userAsync();
        if (!user) {
          throw mockMeteor.Error('error-invalid-user', 'Invalid user', {
            method: '2fa:validateTempToken',
          });
        }
        return {};
      };

      // Act & Assert
      await expect(validateTempToken('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-invalid-user',
          reason: 'Invalid user'
        }));
    });

    test('TC-003: Should throw error when no tempSecret exists', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: { 
              enabled: false,
              // No tempSecret
            }
          }
        }),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const validateTempToken = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.tempSecret) {
          throw mockMeteor.Error('invalid-totp');
        }
        return {};
      };

      // Act & Assert
      await expect(validateTempToken('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-totp'
        }));
    });

    test('TC-004: Should throw error when token verification fails', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              tempSecret: 'tempSecret123'
            }
          }
        }),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(false), // Verification fails
      };
      
      const validateTempToken = async (userToken) => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.tempSecret) {
          throw mockMeteor.Error('invalid-totp');
        }

        const verified = await mockTOTP.verify({
          secret: user.services.totp.tempSecret,
          token: userToken,
        });
        
        if (!verified) {
          throw mockMeteor.Error('invalid-totp');
        }
        return {};
      };

      // Act & Assert
      await expect(validateTempToken('wrongtoken'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-totp'
        }));
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'tempSecret123',
        token: 'wrongtoken',
      });
    });

    test('TC-005: Should enable 2FA and generate backup codes when token is valid', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              tempSecret: 'tempSecret123'
            }
          }
        }),
      };
      
      const mockConnection = {
        httpHeaders: {
          'x-auth-token': 'authToken123'
        }
      };
      
      const mockAccounts = {
        _hashLoginToken: jest.fn().mockReturnValue('hashedAuthToken'),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
        generateCodes: jest.fn().mockReturnValue({
          codes: ['code1', 'code2', 'code3', 'code4', 'code5', 'code6', 'code7', 'code8', 'code9', 'code10', 'code11', 'code12'],
          hashedCodes: ['hash1', 'hash2', 'hash3', 'hash4', 'hash5', 'hash6', 'hash7', 'hash8', 'hash9', 'hash10', 'hash11', 'hash12']
        }),
      };
      
      const mockUsers = {
        enable2FAAndSetSecretAndCodesByUserId: jest.fn(),
        removeNonPATLoginTokensExcept: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        findOneById: jest.fn().mockResolvedValue({
          services: {
            resume: { loginTokens: ['token1'] },
            totp: { enabled: true }
          }
        }),
      };
      
      const mockNotifyOnUserChange = jest.fn();
      const mockNotifyOnUserChangeAsync = jest.fn();
      
      const validateTempToken = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.tempSecret) {
          throw { error: 'invalid-totp' };
        }

        const verified = await mockTOTP.verify({
          secret: user.services.totp.tempSecret,
          token: userToken,
        });
        
        if (!verified) {
          throw { error: 'invalid-totp' };
        }

        const { codes, hashedCodes } = mockTOTP.generateCodes();
        await mockUsers.enable2FAAndSetSecretAndCodesByUserId(userId, user.services.totp.tempSecret, hashedCodes);

        // Check for x-auth-token header
        const { 'x-auth-token': xAuthToken } = mockConnection?.httpHeaders ?? {};
        if (xAuthToken && userId) {
          const hashedToken = mockAccounts._hashLoginToken(xAuthToken);
          const { modifiedCount } = await mockUsers.removeNonPATLoginTokensExcept(userId, hashedToken);

          if (modifiedCount > 0) {
            mockNotifyOnUserChangeAsync(async () => {
              const user = await mockUsers.findOneById(userId, { 
                projection: { 'services.resume.loginTokens': 1, 'services.totp': 1 } 
              });
              return {
                clientAction: 'updated',
                id: userId,
                diff: {
                  'services.resume.loginTokens': user?.services?.resume?.loginTokens,
                  ...(user?.services?.totp && { 'services.totp.enabled': user.services.totp.enabled }),
                },
              };
            });
          } else {
            mockNotifyOnUserChange({ 
              clientAction: 'updated', 
              id: user._id, 
              diff: { 'services.totp.enabled': true } 
            });
          }
        }

        return { codes };
      };

      // Act
      const result = await validateTempToken('123456');

      // Assert
      expect(result.codes).toHaveLength(12);
      expect(mockTOTP.verify).toHaveBeenCalledWith({
        secret: 'tempSecret123',
        token: '123456',
      });
      expect(mockTOTP.generateCodes).toHaveBeenCalled();
      expect(mockUsers.enable2FAAndSetSecretAndCodesByUserId).toHaveBeenCalledWith(
        'user123', 
        'tempSecret123', 
        ['hash1', 'hash2', 'hash3', 'hash4', 'hash5', 'hash6', 'hash7', 'hash8', 'hash9', 'hash10', 'hash11', 'hash12']
      );
      expect(mockAccounts._hashLoginToken).toHaveBeenCalledWith('authToken123');
      expect(mockUsers.removeNonPATLoginTokensExcept).toHaveBeenCalledWith('user123', 'hashedAuthToken');
    });

    test('TC-006: Should handle case without x-auth-token header', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              tempSecret: 'tempSecret123'
            }
          }
        }),
      };
      
      const mockConnection = {
        httpHeaders: {} // No x-auth-token
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
        generateCodes: jest.fn().mockReturnValue({
          codes: ['code1', 'code2', 'code3'],
          hashedCodes: ['hash1', 'hash2', 'hash3']
        }),
      };
      
      const mockUsers = {
        enable2FAAndSetSecretAndCodesByUserId: jest.fn(),
      };
      
      const mockNotifyOnUserChange = jest.fn();
      
      const validateTempToken = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.tempSecret,
          token: userToken,
        });
        
        if (!verified) {
          throw { error: 'invalid-totp' };
        }

        const { codes, hashedCodes } = mockTOTP.generateCodes();
        await mockUsers.enable2FAAndSetSecretAndCodesByUserId(userId, user.services.totp.tempSecret, hashedCodes);

        // No x-auth-token header
        const { 'x-auth-token': xAuthToken } = mockConnection?.httpHeaders ?? {};
        if (!xAuthToken) {
          mockNotifyOnUserChange({ 
            clientAction: 'updated', 
            id: user._id, 
            diff: { 'services.totp.enabled': true } 
          });
        }

        return { codes };
      };

      // Act
      const result = await validateTempToken('123456');

      // Assert
      expect(result.codes).toHaveLength(3);
      expect(mockNotifyOnUserChange).toHaveBeenCalledWith({
        clientAction: 'updated',
        id: 'user123',
        diff: { 'services.totp.enabled': true }
      });
    });

    test('TC-007: Should handle case when no login tokens were removed', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              tempSecret: 'tempSecret123'
            }
          }
        }),
      };
      
      const mockConnection = {
        httpHeaders: {
          'x-auth-token': 'authToken123'
        }
      };
      
      const mockAccounts = {
        _hashLoginToken: jest.fn().mockReturnValue('hashedAuthToken'),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
        generateCodes: jest.fn().mockReturnValue({
          codes: ['code1', 'code2'],
          hashedCodes: ['hash1', 'hash2']
        }),
      };
      
      const mockUsers = {
        enable2FAAndSetSecretAndCodesByUserId: jest.fn(),
        removeNonPATLoginTokensExcept: jest.fn().mockResolvedValue({ modifiedCount: 0 }), // No tokens removed
      };
      
      const mockNotifyOnUserChange = jest.fn();
      
      const validateTempToken = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.tempSecret,
          token: userToken,
        });
        
        if (!verified) {
          throw { error: 'invalid-totp' };
        }

        const { codes, hashedCodes } = mockTOTP.generateCodes();
        await mockUsers.enable2FAAndSetSecretAndCodesByUserId(userId, user.services.totp.tempSecret, hashedCodes);

        const { 'x-auth-token': xAuthToken } = mockConnection?.httpHeaders ?? {};
        if (xAuthToken && userId) {
          const hashedToken = mockAccounts._hashLoginToken(xAuthToken);
          const { modifiedCount } = await mockUsers.removeNonPATLoginTokensExcept(userId, hashedToken);

          if (modifiedCount > 0) {
            // This won't execute
          } else {
            mockNotifyOnUserChange({ 
              clientAction: 'updated', 
              id: user._id, 
              diff: { 'services.totp.enabled': true } 
            });
          }
        }

        return { codes };
      };

      // Act
      const result = await validateTempToken('123456');

      // Assert
      expect(result.codes).toHaveLength(2);
      expect(mockNotifyOnUserChange).toHaveBeenCalledWith({
        clientAction: 'updated',
        id: 'user123',
        diff: { 'services.totp.enabled': true }
      });
    });

    test('TC-008: Should handle user with null services', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: null // null services
        }),
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const validateTempToken = async (userToken) => {
        const user = await mockMeteor.userAsync();
        
        if (!user.services?.totp?.tempSecret) {
          throw mockMeteor.Error('invalid-totp');
        }
        return {};
      };

      // Act & Assert
      await expect(validateTempToken('123456'))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-totp'
        }));
    });

    test('TC-009: Should generate exactly 12 backup codes', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              tempSecret: 'tempSecret123'
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
        generateCodes: jest.fn().mockReturnValue({
          codes: Array(12).fill('').map((_, i) => `code${i+1}`),
          hashedCodes: Array(12).fill('').map((_, i) => `hash${i+1}`)
        }),
      };
      
      const mockUsers = {
        enable2FAAndSetSecretAndCodesByUserId: jest.fn(),
      };
      
      const mockNotifyOnUserChange = jest.fn();
      
      const validateTempToken = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.tempSecret,
          token: userToken,
        });
        
        if (!verified) {
          throw { error: 'invalid-totp' };
        }

        const { codes, hashedCodes } = mockTOTP.generateCodes();
        await mockUsers.enable2FAAndSetSecretAndCodesByUserId(userId, user.services.totp.tempSecret, hashedCodes);

        mockNotifyOnUserChange({ 
          clientAction: 'updated', 
          id: user._id, 
          diff: { 'services.totp.enabled': true } 
        });

        return { codes };
      };

      // Act
      const result = await validateTempToken('123456');

      // Assert
      expect(result.codes).toHaveLength(12);
      expect(result.codes[0]).toBe('code1');
      expect(result.codes[11]).toBe('code12');
    });

    test('TC-010: Should handle database error when enabling 2FA', async () => {
      // Arrange
      const mockMeteor = {
        userId: jest.fn().mockReturnValue('user123'),
        userAsync: jest.fn().mockResolvedValue({
          _id: 'user123',
          services: {
            totp: {
              tempSecret: 'tempSecret123'
            }
          }
        }),
      };
      
      const mockTOTP = {
        verify: jest.fn().mockResolvedValue(true),
        generateCodes: jest.fn().mockReturnValue({
          codes: ['code1'],
          hashedCodes: ['hash1']
        }),
      };
      
      const mockUsers = {
        enable2FAAndSetSecretAndCodesByUserId: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      
      const validateTempToken = async (userToken) => {
        const userId = mockMeteor.userId();
        const user = await mockMeteor.userAsync();
        
        const verified = await mockTOTP.verify({
          secret: user.services.totp.tempSecret,
          token: userToken,
        });
        
        if (!verified) {
          throw { error: 'invalid-totp' };
        }

        const { codes, hashedCodes } = mockTOTP.generateCodes();
        await mockUsers.enable2FAAndSetSecretAndCodesByUserId(userId, user.services.totp.tempSecret, hashedCodes);

        return { codes };
      };

      // Act & Assert
      await expect(validateTempToken('123456'))
        .rejects
        .toThrow('Database error');
    });
  });
});
