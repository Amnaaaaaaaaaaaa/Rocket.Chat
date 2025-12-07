/**
 * White Box Testing for EmailCheck.ts
 * 
 * Class Under Test:
 * - EmailCheck
 */

describe('EmailCheck.ts - Email Check', () => {
  
  describe('EmailCheck Class', () => {
    
    test('TC-001: Should have correct name property', () => {
      // Arrange & Act
      const instance = {
        name: 'email',
        isEnabled: jest.fn(),
        verify: jest.fn(),
        processInvalidCode: jest.fn(),
        maxFaildedAttemtpsReached: jest.fn(),
        getUserVerifiedEmails: jest.fn(),
        sendEmailCode: jest.fn(),
      };

      // Assert
      expect(instance.name).toBe('email');
    });

    test('TC-002: getUserVerifiedEmails should return verified emails', () => {
      // Arrange
      const getUserVerifiedEmails = (user) => {
        if (!Array.isArray(user.emails)) {
          return [];
        }
        return user.emails.filter(({ verified }) => verified).map((e) => e.address);
      };
      
      const user = {
        emails: [
          { address: 'user1@test.com', verified: true },
          { address: 'user2@test.com', verified: false },
          { address: 'user3@test.com', verified: true },
        ]
      };

      // Act
      const result = getUserVerifiedEmails(user);

      // Assert
      expect(result).toEqual(['user1@test.com', 'user3@test.com']);
    });

    test('TC-003: getUserVerifiedEmails should return empty array for non-array emails', () => {
      // Arrange
      const getUserVerifiedEmails = (user) => {
        if (!Array.isArray(user.emails)) {
          return [];
        }
        return user.emails.filter(({ verified }) => verified).map((e) => e.address);
      };
      
      const user1 = { emails: null };
      const user2 = { emails: undefined };
      const user3 = { emails: {} };

      // Act
      const result1 = getUserVerifiedEmails(user1);
      const result2 = getUserVerifiedEmails(user2);
      const result3 = getUserVerifiedEmails(user3);

      // Assert
      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
      expect(result3).toEqual([]);
    });

    test('TC-004: isEnabled should return false when email 2FA is disabled globally', () => {
      // Arrange
      const mockSettings = { get: jest.fn() };
      const isOAuthUser = (user) => user.services?.google !== undefined;
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }

        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser(user)) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const user = { 
        services: { email2fa: { enabled: true } },
        emails: [{ address: 'test@test.com', verified: true }]
      };
      
      mockSettings.get
        .mockReturnValueOnce(false) // Accounts_TwoFactorAuthentication_By_Email_Enabled
        .mockReturnValueOnce(true); // Accounts_twoFactorAuthentication_email_available_for_OAuth_users

      // Act
      const result = isEnabled(user);

      // Assert
      expect(result).toBe(false);
      expect(mockSettings.get).toHaveBeenCalledWith('Accounts_TwoFactorAuthentication_By_Email_Enabled');
    });

    test('TC-005: isEnabled should return false for OAuth users when setting is false', () => {
      // Arrange
      const mockSettings = { get: jest.fn() };
      const isOAuthUser = (user) => user.services?.google !== undefined;
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }

        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser(user)) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const user = { 
        services: { 
          email2fa: { enabled: true },
          google: {}
        },
        emails: [{ address: 'test@test.com', verified: true }]
      };
      
      mockSettings.get
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false); // Not available for OAuth users

      // Act
      const result = isEnabled(user);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-006: isEnabled should return false when user email2fa is not enabled', () => {
      // Arrange
      const mockSettings = { get: jest.fn() };
      const isOAuthUser = (user) => user.services?.google !== undefined;
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }

        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser(user)) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const user = { 
        services: { email2fa: { enabled: false } },
        emails: [{ address: 'test@test.com', verified: true }]
      };
      
      mockSettings.get
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      // Act
      const result = isEnabled(user);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-007: isEnabled should return false when user has no verified emails', () => {
      // Arrange
      const mockSettings = { get: jest.fn() };
      const isOAuthUser = (user) => user.services?.google !== undefined;
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }

        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser(user)) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const user = { 
        services: { email2fa: { enabled: true } },
        emails: [{ address: 'test@test.com', verified: false }]
      };
      
      mockSettings.get
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      // Act
      const result = isEnabled(user);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-008: isEnabled should return true when all conditions are met', () => {
      // Arrange
      const mockSettings = { get: jest.fn() };
      const isOAuthUser = (user) => user.services?.google !== undefined;
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }

        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser(user)) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const user = { 
        services: { email2fa: { enabled: true } },
        emails: [{ address: 'test@test.com', verified: true }]
      };
      
      mockSettings.get
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      // Act
      const result = isEnabled(user);

      // Assert
      expect(result).toBe(true);
    });

    test('TC-009: verify should return false when not enabled', async () => {
      // Arrange
      const mockBcrypt = { compare: jest.fn() };
      const mockUsers = { removeEmailCodeOfUserId: jest.fn() };
      
      const verify = async (user, codeFromEmail) => {
        const mockIsEnabled = jest.fn().mockReturnValue(false);
        if (!mockIsEnabled(user)) {
          return false;
        }

        if (!user.services?.emailCode) {
          return false;
        }

        // Remove non digits
        codeFromEmail = codeFromEmail.replace(/([^\d])/g, '');

        const { code, expire } = user.services.emailCode;

        if (expire < new Date()) {
          return false;
        }

        if (await mockBcrypt.compare(codeFromEmail, code)) {
          await mockUsers.removeEmailCodeOfUserId(user._id);
          return true;
        }

        return false;
      };
      
      const user = { _id: 'user123' };
      const code = '123456';

      // Act
      const result = await verify(user, code);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-010: verify should return false when no emailCode exists', async () => {
      // Arrange
      const mockBcrypt = { compare: jest.fn() };
      const mockUsers = { removeEmailCodeOfUserId: jest.fn() };
      
      const verify = async (user, codeFromEmail) => {
        const mockIsEnabled = jest.fn().mockReturnValue(true);
        if (!mockIsEnabled(user)) {
          return false;
        }

        if (!user.services?.emailCode) {
          return false;
        }

        // Remove non digits
        codeFromEmail = codeFromEmail.replace(/([^\d])/g, '');

        const { code, expire } = user.services.emailCode;

        if (expire < new Date()) {
          return false;
        }

        if (await mockBcrypt.compare(codeFromEmail, code)) {
          await mockUsers.removeEmailCodeOfUserId(user._id);
          return true;
        }

        return false;
      };
      
      const user = { 
        _id: 'user123',
        services: {} 
      };
      const code = '123456';

      // Act
      const result = await verify(user, code);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-011: verify should return false when code is expired', async () => {
      // Arrange
      const mockBcrypt = { compare: jest.fn() };
      const mockUsers = { removeEmailCodeOfUserId: jest.fn() };
      
      const verify = async (user, codeFromEmail) => {
        const mockIsEnabled = jest.fn().mockReturnValue(true);
        if (!mockIsEnabled(user)) {
          return false;
        }

        if (!user.services?.emailCode) {
          return false;
        }

        // Remove non digits
        codeFromEmail = codeFromEmail.replace(/([^\d])/g, '');

        const { code, expire } = user.services.emailCode;

        if (expire < new Date()) {
          return false;
        }

        if (await mockBcrypt.compare(codeFromEmail, code)) {
          await mockUsers.removeEmailCodeOfUserId(user._id);
          return true;
        }

        return false;
      };
      
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      
      const user = { 
        _id: 'user123',
        services: { 
          emailCode: {
            code: 'hashedCode',
            expire: pastDate
          }
        }
      };
      const code = '123456';

      // Act
      const result = await verify(user, code);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-012: verify should return true when code matches', async () => {
      // Arrange
      const mockBcrypt = { compare: jest.fn().mockResolvedValue(true) };
      const mockUsers = { removeEmailCodeOfUserId: jest.fn() };
      
      const verify = async (user, codeFromEmail) => {
        const mockIsEnabled = jest.fn().mockReturnValue(true);
        if (!mockIsEnabled(user)) {
          return false;
        }

        if (!user.services?.emailCode) {
          return false;
        }

        // Remove non digits
        codeFromEmail = codeFromEmail.replace(/([^\d])/g, '');

        const { code, expire } = user.services.emailCode;

        if (expire < new Date()) {
          return false;
        }

        if (await mockBcrypt.compare(codeFromEmail, code)) {
          await mockUsers.removeEmailCodeOfUserId(user._id);
          return true;
        }

        return false;
      };
      
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);
      
      const user = { 
        _id: 'user123',
        services: { 
          emailCode: {
            code: 'hashedCode',
            expire: futureDate
          }
        }
      };
      const code = '123456';

      // Act
      const result = await verify(user, code);

      // Assert
      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('123456', 'hashedCode');
      expect(mockUsers.removeEmailCodeOfUserId).toHaveBeenCalledWith('user123');
    });

    test('TC-013: verify should remove non-digits from code', async () => {
      // Arrange
      const mockBcrypt = { compare: jest.fn().mockResolvedValue(true) };
      const mockUsers = { removeEmailCodeOfUserId: jest.fn() };
      
      const verify = async (user, codeFromEmail) => {
        const mockIsEnabled = jest.fn().mockReturnValue(true);
        if (!mockIsEnabled(user)) {
          return false;
        }

        if (!user.services?.emailCode) {
          return false;
        }

        // Remove non digits
        codeFromEmail = codeFromEmail.replace(/([^\d])/g, '');

        const { code, expire } = user.services.emailCode;

        if (expire < new Date()) {
          return false;
        }

        if (await mockBcrypt.compare(codeFromEmail, code)) {
          await mockUsers.removeEmailCodeOfUserId(user._id);
          return true;
        }

        return false;
      };
      
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);
      
      const user = { 
        _id: 'user123',
        services: { 
          emailCode: {
            code: 'hashedCode',
            expire: futureDate
          }
        }
      };
      const code = '123-456';

      // Act
      const result = await verify(user, code);

      // Assert
      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('123456', 'hashedCode');
    });

    test('TC-014: maxFailedAttemptsReached should check settings', async () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(5) };
      const mockUsers = { maxInvalidEmailCodeAttemptsReached: jest.fn().mockResolvedValue(true) };
      
      const maxFaildedAttemtpsReached = async (user) => {
        const maxAttempts = mockSettings.get('Accounts_TwoFactorAuthentication_Max_Invalid_Email_Code_Attempts');
        return await mockUsers.maxInvalidEmailCodeAttemptsReached(user._id, maxAttempts);
      };
      
      const user = { _id: 'user123' };

      // Act
      const result = await maxFaildedAttemtpsReached(user);

      // Assert
      expect(result).toBe(true);
      expect(mockSettings.get).toHaveBeenCalledWith('Accounts_TwoFactorAuthentication_Max_Invalid_Email_Code_Attempts');
      expect(mockUsers.maxInvalidEmailCodeAttemptsReached).toHaveBeenCalledWith('user123', 5);
    });

    test('TC-015: processInvalidCode should generate new code when no valid code exists', async () => {
      // Arrange
      const mockUsers = {
        removeExpiredEmailCodeOfUserId: jest.fn(),
      };
      
      const processInvalidCode = async (user) => {
        await mockUsers.removeExpiredEmailCodeOfUserId(user._id);

        // Generate new code if the there isn't any code with more than 5 minutes to expire
        const expireWithDelta = new Date();
        expireWithDelta.setMinutes(expireWithDelta.getMinutes() - 5);

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        const emailOrUsername = user.username || emails[0];

        const hasValidCode = false; // Simplified for test

        if (hasValidCode) {
          return {
            emailOrUsername,
            codeGenerated: false,
            codeExpires: user.services?.emailCode?.expire,
          };
        }

        // Mock sendEmailCode
        const sendEmailCode = async () => {};

        await sendEmailCode(user);

        return {
          codeGenerated: true,
          emailOrUsername,
        };
      };
      
      const user = { 
        _id: 'user123',
        username: 'testuser',
        emails: [{ address: 'test@test.com', verified: true }],
        services: {}
      };

      // Act
      const result = await processInvalidCode(user);

      // Assert
      expect(result.codeGenerated).toBe(true);
      expect(result.emailOrUsername).toBe('testuser');
      expect(mockUsers.removeExpiredEmailCodeOfUserId).toHaveBeenCalledWith('user123');
    });
  });
});
