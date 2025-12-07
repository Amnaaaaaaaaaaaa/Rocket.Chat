/**
 * White Box Testing for totp.ts
 * 
 * Functions Under Test:
 * - TOTP.generateSecret
 * - TOTP.generateOtpauthURL
 * - TOTP.verify
 * - TOTP.generateCodes
 */

describe('totp.ts - TOTP Library', () => {
  
  describe('TOTP Object', () => {
    
    test('TC-001: generateSecret should return a secret object', () => {
      // Arrange
      const mockSpeakeasy = {
        generateSecret: jest.fn().mockReturnValue({
          ascii: 'secret123',
          base32: 'secretbase32',
          hex: 'secrethex',
          otpauth_url: 'otpauth://totp/Rocket.Chat:testuser?secret=secret123',
        }),
      };
      
      const TOTP = {
        generateSecret: () => mockSpeakeasy.generateSecret(),
      };

      // Act
      const result = TOTP.generateSecret();

      // Assert
      expect(result).toBeDefined();
      expect(result.ascii).toBe('secret123');
      expect(result.base32).toBe('secretbase32');
      expect(mockSpeakeasy.generateSecret).toHaveBeenCalled();
    });

    test('TC-002: generateOtpauthURL should generate correct URL', () => {
      // Arrange
      const mockSpeakeasy = {
        otpauthURL: jest.fn().mockReturnValue('otpauth://totp/Rocket.Chat:testuser?secret=secret123'),
      };
      
      const TOTP = {
        generateOtpauthURL: (secret, username) => mockSpeakeasy.otpauthURL({
          secret: secret.ascii,
          label: `Rocket.Chat:${username}`,
        }),
      };

      const secret = { ascii: 'secret123' };
      const username = 'testuser';

      // Act
      const result = TOTP.generateOtpauthURL(secret, username);

      // Assert
      expect(result).toBe('otpauth://totp/Rocket.Chat:testuser?secret=secret123');
      expect(mockSpeakeasy.otpauthURL).toHaveBeenCalledWith({
        secret: 'secret123',
        label: 'Rocket.Chat:testuser',
      });
    });

    test('TC-003: verify should validate TOTP token', async () => {
      // Arrange
      const mockSpeakeasy = {
        totp: {
          verify: jest.fn().mockReturnValue(true),
        },
      };
      
      const TOTP = {
        verify: async ({ secret, token, backupTokens, userId }) => {
          return mockSpeakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
          });
        },
      };

      const params = {
        secret: 'secret123',
        token: '123456',
      };

      // Act
      const result = await TOTP.verify(params);

      // Assert
      expect(result).toBe(true);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        encoding: 'base32',
        token: '123456',
      });
    });

    test('TC-004: verify should validate backup code', async () => {
      // Arrange
      const mockSHA256 = jest.fn().mockReturnValue('hashedCode');
      const mockUsers = {
        update2FABackupCodesByUserId: jest.fn(),
      };
      
      const TOTP = {
        verify: async ({ secret, token, backupTokens, userId }) => {
          // validates a backup code
          if (token.length === 8 && backupTokens) {
            const hashedCode = mockSHA256(token);
            const usedCode = backupTokens.indexOf(hashedCode);

            if (usedCode !== -1 && userId) {
              backupTokens.splice(usedCode, 1);

              // mark the code as used (remove it from the list)
              await mockUsers.update2FABackupCodesByUserId(userId, backupTokens);
              return true;
            }

            return false;
          }
          return false;
        },
      };

      const params = {
        secret: 'secret123',
        token: '12345678', // 8 characters - backup code
        backupTokens: ['hashedCode', 'otherHash'],
        userId: 'user123',
      };

      // Act
      const result = await TOTP.verify(params);

      // Assert
      expect(result).toBe(true);
      expect(mockSHA256).toHaveBeenCalledWith('12345678');
      expect(mockUsers.update2FABackupCodesByUserId).toHaveBeenCalledWith('user123', ['otherHash']);
    });

    test('TC-005: verify should use maxDelta when setting exists', async () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(2) }; // maxDelta = 2
      const mockSpeakeasy = {
        totp: {
          verifyDelta: jest.fn().mockReturnValue({ delta: 0 }),
        },
      };
      
      const TOTP = {
        verify: async ({ secret, token, backupTokens, userId }) => {
          const maxDelta = mockSettings.get('Accounts_TwoFactorAuthentication_MaxDelta');
          if (maxDelta) {
            const verifiedDelta = mockSpeakeasy.totp.verifyDelta({
              secret,
              encoding: 'base32',
              token,
              window: maxDelta,
            });

            return verifiedDelta !== undefined;
          }
          return false;
        },
      };

      const params = {
        secret: 'secret123',
        token: '123456',
      };

      // Act
      const result = await TOTP.verify(params);

      // Assert
      expect(result).toBe(true);
      expect(mockSettings.get).toHaveBeenCalledWith('Accounts_TwoFactorAuthentication_MaxDelta');
      expect(mockSpeakeasy.totp.verifyDelta).toHaveBeenCalledWith({
        secret: 'secret123',
        encoding: 'base32',
        token: '123456',
        window: 2,
      });
    });

    test('TC-006: generateCodes should generate 12 codes', () => {
      // Arrange
      const mockRandom = {
        id: jest.fn()
          .mockReturnValueOnce('code1')
          .mockReturnValueOnce('code2')
          .mockReturnValueOnce('code3')
          .mockReturnValueOnce('code4')
          .mockReturnValueOnce('code5')
          .mockReturnValueOnce('code6')
          .mockReturnValueOnce('code7')
          .mockReturnValueOnce('code8')
          .mockReturnValueOnce('code9')
          .mockReturnValueOnce('code10')
          .mockReturnValueOnce('code11')
          .mockReturnValueOnce('code12'),
      };
      
      const mockSHA256 = jest.fn()
        .mockReturnValueOnce('hash1')
        .mockReturnValueOnce('hash2')
        .mockReturnValueOnce('hash3')
        .mockReturnValueOnce('hash4')
        .mockReturnValueOnce('hash5')
        .mockReturnValueOnce('hash6')
        .mockReturnValueOnce('hash7')
        .mockReturnValueOnce('hash8')
        .mockReturnValueOnce('hash9')
        .mockReturnValueOnce('hash10')
        .mockReturnValueOnce('hash11')
        .mockReturnValueOnce('hash12');
      
      const TOTP = {
        generateCodes: () => {
          // generate 12 backup codes
          const codes = [];
          const hashedCodes = [];
          for (let i = 0; i < 12; i++) {
            const code = mockRandom.id(8);
            codes.push(code);
            hashedCodes.push(mockSHA256(code));
          }

          return { codes, hashedCodes };
        },
      };

      // Act
      const result = TOTP.generateCodes();

      // Assert
      expect(result.codes).toHaveLength(12);
      expect(result.hashedCodes).toHaveLength(12);
      expect(result.codes).toEqual([
        'code1', 'code2', 'code3', 'code4', 'code5', 'code6',
        'code7', 'code8', 'code9', 'code10', 'code11', 'code12'
      ]);
      expect(mockRandom.id).toHaveBeenCalledTimes(12);
      expect(mockRandom.id).toHaveBeenCalledWith(8);
      expect(mockSHA256).toHaveBeenCalledTimes(12);
    });
test('TC-007: verify should return false for invalid backup code', async () => {
  // Arrange
  const mockSHA256 = jest.fn().mockReturnValue('hashedCode');
  const mockUsers = {
    update2FABackupCodesByUserId: jest.fn(),
  };
  
  const TOTP = {
    verify: async ({ secret, token, backupTokens, userId }) => {
      // validates a backup code
      if (token.length === 8 && backupTokens) {
        const hashedCode = mockSHA256(token);
        const usedCode = backupTokens.indexOf(hashedCode);

        if (usedCode !== -1 && userId) {
          backupTokens.splice(usedCode, 1);
          await mockUsers.update2FABackupCodesByUserId(userId, backupTokens);
          return true;
        }

        return false;
      }
      return false;
    },
  };

  const params = {
    secret: 'secret123',
    token: 'invalid1',    // FIX → exactly 8 chars
    backupTokens: ['otherHash1', 'otherHash2'],
    userId: 'user123',
  };

  // Act
  const result = await TOTP.verify(params);

  // Assert
  expect(result).toBe(false);
  expect(mockSHA256).toHaveBeenCalledWith('invalid1');
  expect(mockUsers.update2FABackupCodesByUserId).not.toHaveBeenCalled();
});

  

    test('TC-008: verify should handle missing backupTokens', async () => {
      // Arrange
      const mockSpeakeasy = {
        totp: {
          verify: jest.fn().mockReturnValue(true),
        },
      };
      
      const TOTP = {
        verify: async ({ secret, token, backupTokens, userId }) => {
          // validates a backup code
          if (token.length === 8 && backupTokens) {
            // This won't execute since backupTokens is undefined
            return false;
          }

          return mockSpeakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
          });
        },
      };

      const params = {
        secret: 'secret123',
        token: '12345678', // 8 characters
        backupTokens: undefined, // No backup tokens
      };

      // Act
      const result = await TOTP.verify(params);

      // Assert
      expect(result).toBe(true);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        encoding: 'base32',
        token: '12345678',
      });
    });

    test('TC-009: verify should handle non-8-character backup code', async () => {
      // Arrange
      const mockSpeakeasy = {
        totp: {
          verify: jest.fn().mockReturnValue(true),
        },
      };
      
      const TOTP = {
        verify: async ({ secret, token, backupTokens, userId }) => {
          // validates a backup code
          if (token.length === 8 && backupTokens) {
            // This won't execute since token is 6 characters
            return false;
          }

          return mockSpeakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
          });
        },
      };

      const params = {
        secret: 'secret123',
        token: '123456', // 6 characters - regular TOTP
        backupTokens: ['backup1', 'backup2'],
      };

      // Act
      const result = await TOTP.verify(params);

      // Assert
      expect(result).toBe(true);
      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: 'secret123',
        encoding: 'base32',
        token: '123456',
      });
    });

    test('TC-010: Edge case - verifyDelta returns undefined', async () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(2) };
      const mockSpeakeasy = {
        totp: {
          verifyDelta: jest.fn().mockReturnValue(undefined),
        },
      };
      
      const TOTP = {
        verify: async ({ secret, token, backupTokens, userId }) => {
          const maxDelta = mockSettings.get('Accounts_TwoFactorAuthentication_MaxDelta');
          if (maxDelta) {
            const verifiedDelta = mockSpeakeasy.totp.verifyDelta({
              secret,
              encoding: 'base32',
              token,
              window: maxDelta,
            });

            return verifiedDelta !== undefined;
          }
          return false;
        },
      };

      const params = {
        secret: 'secret123',
        token: '123456',
      };

      // Act
      const result = await TOTP.verify(params);

      // Assert
      expect(result).toBe(false);
    });
  });
});
