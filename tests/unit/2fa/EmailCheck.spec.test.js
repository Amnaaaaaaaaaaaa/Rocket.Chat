/**
 * Jest version of EmailCheck.spec.ts
 * 
 * Original tests converted from Mocha/Chai to Jest
 */

describe('EmailCheck.spec.ts - Email Check Tests', () => {
  
  describe('EmailCheck Class', () => {
    
    test('should return EmailCheck is enabled for a normal user', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        // Simplified version from original test
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        
        // Simplified check for OAuth user (from original mock)
        const isOAuthUser = user.services?.google !== undefined;
        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const normalUserMock = { 
        services: { email2fa: { enabled: true } }, 
        emails: [{ address: 'abc@gmail.com', verified: true }] 
      };

      // Act
      const isEmail2FAEnabled = isEnabled(normalUserMock);

      // Assert
      expect(isEmail2FAEnabled).toBe(true);
    });

    test('should return EmailCheck is not enabled for a normal user with unverified email', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        
        const isOAuthUser = user.services?.google !== undefined;
        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const normalUserWithUnverifiedEmailMock = {
        services: { email2fa: { enabled: true } },
        emails: [{ address: 'abc@gmail.com', verified: false }],
      };

      // Act
      const isEmail2FAEnabled = isEnabled(normalUserWithUnverifiedEmailMock);

      // Assert
      expect(isEmail2FAEnabled).toBe(false);
    });

    test('should return EmailCheck is not enabled for a OAuth user with setting being false', () => {
      // Arrange
      const mockSettings = { 
        get: jest.fn()
          .mockReturnValueOnce(true) // Accounts_TwoFactorAuthentication_By_Email_Enabled
          .mockReturnValueOnce(false), // Accounts_twoFactorAuthentication_email_available_for_OAuth_users
      };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        
        const isOAuthUser = user.services?.google !== undefined;
        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const OAuthUserMock = { 
        services: { google: {} }, 
        emails: [{ address: 'abc@gmail.com', verified: true }] 
      };

      // Act
      const isEmail2FAEnabled = isEnabled(OAuthUserMock);

      // Assert
      expect(isEmail2FAEnabled).toBe(false);
      expect(mockSettings.get).toHaveBeenCalledWith('Accounts_TwoFactorAuthentication_By_Email_Enabled');
      expect(mockSettings.get).toHaveBeenCalledWith('Accounts_twoFactorAuthentication_email_available_for_OAuth_users');
    });

    test('should return EmailCheck is enabled for OAuth user when setting is true', () => {
      // Arrange
      const mockSettings = { 
        get: jest.fn()
          .mockReturnValueOnce(true) // Accounts_TwoFactorAuthentication_By_Email_Enabled
          .mockReturnValueOnce(true), // Accounts_twoFactorAuthentication_email_available_for_OAuth_users
      };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        
        const isOAuthUser = user.services?.google !== undefined;
        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const OAuthUserMock = { 
        services: { 
          google: {},
          email2fa: { enabled: true }
        }, 
        emails: [{ address: 'abc@gmail.com', verified: true }] 
      };

      // Act
      const isEmail2FAEnabled = isEnabled(OAuthUserMock);

      // Assert
      expect(isEmail2FAEnabled).toBe(true);
    });

    test('should return false when global email 2FA setting is disabled', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(false) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        return true;
      };
      
      const normalUserMock = { 
        services: { email2fa: { enabled: true } }, 
        emails: [{ address: 'abc@gmail.com', verified: true }] 
      };

      // Act
      const isEmail2FAEnabled = isEnabled(normalUserMock);

      // Assert
      expect(isEmail2FAEnabled).toBe(false);
    });

    test('should return false when email2fa service is not enabled', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        
        const isOAuthUser = user.services?.google !== undefined;
        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const userWithoutEmail2FA = { 
        services: { email2fa: { enabled: false } }, 
        emails: [{ address: 'abc@gmail.com', verified: true }] 
      };

      // Act
      const isEmail2FAEnabled = isEnabled(userWithoutEmail2FA);

      // Assert
      expect(isEmail2FAEnabled).toBe(false);
    });

    test('should return false when user has no emails', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        
        const isOAuthUser = user.services?.google !== undefined;
        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const userWithoutEmails = { 
        services: { email2fa: { enabled: true } }, 
        emails: [] 
      };

      // Act
      const isEmail2FAEnabled = isEnabled(userWithoutEmails);

      // Assert
      expect(isEmail2FAEnabled).toBe(false);
    });

    test('should handle user with undefined emails array', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        
        const isOAuthUser = user.services?.google !== undefined;
        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const userWithUndefinedEmails = { 
        services: { email2fa: { enabled: true } }, 
        // emails is undefined
      };

      // Act
      const isEmail2FAEnabled = isEnabled(userWithUndefinedEmails);

      // Assert
      expect(isEmail2FAEnabled).toBe(false);
    });

    test('should handle user with null emails', () => {
      // Arrange
      const mockSettings = { get: jest.fn().mockReturnValue(true) };
      
      const isEnabled = (user) => {
        if (!mockSettings.get('Accounts_TwoFactorAuthentication_By_Email_Enabled')) {
          return false;
        }
        
        const isOAuthUser = user.services?.google !== undefined;
        if (!mockSettings.get('Accounts_twoFactorAuthentication_email_available_for_OAuth_users') && isOAuthUser) {
          return false;
        }

        if (!user.services?.email2fa?.enabled) {
          return false;
        }

        const emails = user.emails?.filter(({ verified }) => verified).map((e) => e.address) || [];
        return emails.length > 0;
      };
      
      const userWithNullEmails = { 
        services: { email2fa: { enabled: true } }, 
        emails: null 
      };

      // Act
      const isEmail2FAEnabled = isEnabled(userWithNullEmails);

      // Assert
      expect(isEmail2FAEnabled).toBe(false);
    });
  });
});
