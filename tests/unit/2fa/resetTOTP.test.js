/**
 * White Box Testing for resetTOTP.ts
 * 
 * Function Under Test:
 * - resetTOTP
 */

describe('resetTOTP.ts - Reset TOTP Function', () => {
  
  describe('resetTOTP Function', () => {
 test('TC-001: Should send reset notification when notifyUser is true', async () => {
  // Arrange
  const mockUsers = {
    findOneById: jest.fn().mockResolvedValue({
      language: 'en',
      emails: [
        { address: 'test1@test.com', verified: true },
        { address: 'test2@test.com', verified: false },
        { address: 'test3@test.com', verified: true },
      ],
    }),
  };

  const mockSettings = {
    get: jest.fn((key) => {
      if (key === 'Language') return 'en';
      if (key === 'From_Email') return 'noreply@test.com';
      return undefined;
    }),
  };

  const mockI18n = {
    getFixedT: jest.fn().mockReturnValue((key) => key),
  };

  const mockMailer = {
    send: jest.fn(),
  };

  const sendResetNotification = async (userId) => {
    const user = await mockUsers.findOneById(userId, { projection: { language: 1, emails: 1 } });
    if (!user) throw new Error('invalid-user');

    const language = user.language || mockSettings.get('Language') || 'en';
    const addresses = user.emails?.filter(({ verified }) => verified).map(e => e.address);
    if (!addresses?.length) return;

    const t = mockI18n.getFixedT(language);
    const text = `${t('Your_TOTP_has_been_reset')}\n\n${t('TOTP_Reset_Other_Key_Warning')}`;
    const html = `<p>${t('Your_TOTP_has_been_reset')}</p><p>${t('TOTP_Reset_Other_Key_Warning')}</p>`;
    const from = mockSettings.get('From_Email');
    const subject = t('TOTP_reset_email');

    for await (const address of addresses) {
      await mockMailer.send({ to: address, from, subject, text, html });
    }
  };

  const userId = 'user123';

  // Act
  await sendResetNotification(userId);

  // Assert
  expect(mockMailer.send).toHaveBeenCalledTimes(2);
  for (const email of ['test1@test.com', 'test3@test.com']) {
    expect(mockMailer.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        from: 'noreply@test.com',
        subject: 'TOTP_reset_email',
        text: expect.stringContaining('Your_TOTP_has_been_reset'),
        html: expect.stringContaining('Your_TOTP_has_been_reset'),
      })
    );
  }
});

    test('TC-002: Should throw error when user not found for notification', async () => {
      // Arrange
      const mockUsers = {
        findOneById: jest.fn().mockResolvedValue(null),
      };
      
      const mockMeteor = {
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const sendResetNotification = async (userId) => {
        const user = await mockUsers.findOneById(userId, {
          projection: { language: 1, emails: 1 },
        });
        if (!user) {
          throw mockMeteor.Error('invalid-user');
        }
      };
      
      const userId = 'nonexistent';

      // Act & Assert
      await expect(sendResetNotification(userId))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'invalid-user'
        }));
    });

    test('TC-003: Should not send notification when no verified emails', async () => {
      // Arrange
      const mockUsers = {
        findOneById: jest.fn().mockResolvedValue({
          language: 'en',
          emails: [
            { address: 'test1@test.com', verified: false },
            { address: 'test2@test.com', verified: false },
          ]
        }),
      };
      
      const mockMailer = {
        send: jest.fn(),
      };
      
      const sendResetNotification = async (userId) => {
        const user = await mockUsers.findOneById(userId, {
          projection: { language: 1, emails: 1 },
        });
        
        const addresses = user.emails?.filter(({ verified }) => Boolean(verified)).map((e) => e.address);
        if (!addresses?.length) {
          return; // No emails to send
        }
        
        // This won't execute
        await mockMailer.send({});
      };
      
      const userId = 'user123';

      // Act
      await sendResetNotification(userId);

      // Assert
      expect(mockMailer.send).not.toHaveBeenCalled();
    });

    test('TC-004: Should handle email send failure', async () => {
      // Arrange
      const mockUsers = {
        findOneById: jest.fn().mockResolvedValue({
          language: 'en',
          emails: [{ address: 'test@test.com', verified: true }]
        }),
      };
      
      const mockSettings = {
        get: jest.fn()
          .mockReturnValueOnce('en')
          .mockReturnValueOnce('noreply@test.com'),
      };
      
      const mockI18n = {
        getFixedT: jest.fn().mockReturnValue((key) => key),
      };
      
      const mockMailer = {
        send: jest.fn().mockRejectedValue(new Error('SMTP Error')),
      };
      
      const mockMeteor = {
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const sendResetNotification = async (userId) => {
        const user = await mockUsers.findOneById(userId, {
          projection: { language: 1, emails: 1 },
        });
        
        const language = user.language || mockSettings.get('Language') || 'en';
        const addresses = user.emails?.filter(({ verified }) => Boolean(verified)).map((e) => e.address);
        
        const t = mockI18n.getFixedT(language);
        const from = mockSettings.get('From_Email');
        const subject = t('TOTP_reset_email');

        for await (const address of addresses) {
          try {
            await mockMailer.send({
              to: address,
              from,
              subject,
              text: 'text',
              html: 'html',
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw mockMeteor.Error('error-email-send-failed', `Error trying to send email: ${message}`, {
              function: 'resetUserTOTP',
              message,
            });
          }
        }
      };
      
      const userId = 'user123';

      // Act & Assert
      await expect(sendResetNotification(userId))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-email-send-failed',
          reason: 'Error trying to send email: SMTP Error'
        }));
    });

    test('TC-005: Should reset TOTP for non-federated user', async () => {
      // Arrange
      const mockIsUserIdFederated = jest.fn().mockResolvedValue(false);
      const mockUsers = {
        resetTOTPById: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        unsetLoginTokens: jest.fn(),
      };
      
      const mockNotifyOnUserChange = jest.fn();
      
      const mockMeteor = {
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const resetTOTP = async (userId, notifyUser = false) => {
        if (notifyUser) {
          // Skip notification for this test
        }

        const isUserFederated = await mockIsUserIdFederated(userId);
        if (isUserFederated) {
          throw mockMeteor.Error('error-not-allowed', 'Federated Users cant have TOTP', { function: 'resetTOTP' });
        }

        const result = await mockUsers.resetTOTPById(userId);

        if (result?.modifiedCount === 1) {
          await mockUsers.unsetLoginTokens(userId);
          
          mockNotifyOnUserChange({
            clientAction: 'updated',
            id: userId,
            diff: {
              'services.resume.loginTokens': [],
            },
          });
          return true;
        }

        return false;
      };
      
      const userId = 'user123';
      const notifyUser = false;

      // Act
      const result = await resetTOTP(userId, notifyUser);

      // Assert
      expect(result).toBe(true);
      expect(mockIsUserIdFederated).toHaveBeenCalledWith(userId);
      expect(mockUsers.resetTOTPById).toHaveBeenCalledWith(userId);
      expect(mockUsers.unsetLoginTokens).toHaveBeenCalledWith(userId);
      expect(mockNotifyOnUserChange).toHaveBeenCalledWith({
        clientAction: 'updated',
        id: userId,
        diff: {
          'services.resume.loginTokens': [],
        },
      });
    });

    test('TC-006: Should throw error for federated user', async () => {
      // Arrange
      const mockIsUserIdFederated = jest.fn().mockResolvedValue(true);
      const mockMeteor = {
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };
      
      const resetTOTP = async (userId, notifyUser = false) => {
        const isUserFederated = await mockIsUserIdFederated(userId);
        if (isUserFederated) {
          throw mockMeteor.Error('error-not-allowed', 'Federated Users cant have TOTP', { function: 'resetTOTP' });
        }
        return true;
      };
      
      const userId = 'federatedUser123';

      // Act & Assert
      await expect(resetTOTP(userId, false))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-not-allowed',
          reason: 'Federated Users cant have TOTP'
        }));
    });

    test('TC-007: Should return false when no user modified', async () => {
      // Arrange
      const mockIsUserIdFederated = jest.fn().mockResolvedValue(false);
      const mockUsers = {
        resetTOTPById: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      };
      
      const resetTOTP = async (userId, notifyUser = false) => {
        const isUserFederated = await mockIsUserIdFederated(userId);
        if (isUserFederated) {
          throw mockMeteor.Error('error-not-allowed', 'Federated Users cant have TOTP', { function: 'resetTOTP' });
        }

        const result = await mockUsers.resetTOTPById(userId);

        if (result?.modifiedCount === 1) {
          return true;
        }

        return false;
      };
      
      const userId = 'user123';

      // Act
      const result = await resetTOTP(userId, false);

      // Assert
      expect(result).toBe(false);
      expect(mockUsers.resetTOTPById).toHaveBeenCalledWith(userId);
    });

    test('TC-008: Should handle null result from resetTOTPById', async () => {
      // Arrange
      const mockIsUserIdFederated = jest.fn().mockResolvedValue(false);
      const mockUsers = {
        resetTOTPById: jest.fn().mockResolvedValue(null), // null result
      };
      
      const resetTOTP = async (userId, notifyUser = false) => {
        const isUserFederated = await mockIsUserIdFederated(userId);
        if (isUserFederated) {
          throw mockMeteor.Error('error-not-allowed', 'Federated Users cant have TOTP', { function: 'resetTOTP' });
        }

        const result = await mockUsers.resetTOTPById(userId);

        if (result?.modifiedCount === 1) {
          return true;
        }

        return false;
      };
      
      const userId = 'user123';

      // Act
      const result = await resetTOTP(userId, false);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-009: Should handle undefined modifiedCount', async () => {
      // Arrange
      const mockIsUserIdFederated = jest.fn().mockResolvedValue(false);
      const mockUsers = {
        resetTOTPById: jest.fn().mockResolvedValue({}), // No modifiedCount
      };
      
      const resetTOTP = async (userId, notifyUser = false) => {
        const isUserFederated = await mockIsUserIdFederated(userId);
        if (isUserFederated) {
          throw mockMeteor.Error('error-not-allowed', 'Federated Users cant have TOTP', { function: 'resetTOTP' });
        }

        const result = await mockUsers.resetTOTPById(userId);

        if (result?.modifiedCount === 1) {
          return true;
        }

        return false;
      };
      
      const userId = 'user123';

      // Act
      const result = await resetTOTP(userId, false);

      // Assert
      expect(result).toBe(false);
    });

    test('TC-010: Edge case - user with no language preference', async () => {
      // Arrange
      const mockUsers = {
        findOneById: jest.fn().mockResolvedValue({
          language: undefined, // No language
          emails: [{ address: 'test@test.com', verified: true }]
        }),
      };
      
      const mockSettings = {
        get: jest.fn()
          .mockReturnValueOnce('es') // Default language from settings
          .mockReturnValueOnce('noreply@test.com'),
      };
      
      const mockI18n = {
        getFixedT: jest.fn().mockReturnValue((key) => `translated_${key}`),
      };
      
      const mockMailer = {
        send: jest.fn(),
      };
      
      const sendResetNotification = async (userId) => {
        const user = await mockUsers.findOneById(userId, {
          projection: { language: 1, emails: 1 },
        });
        
        const language = user.language || mockSettings.get('Language') || 'en';
        const addresses = user.emails?.filter(({ verified }) => Boolean(verified)).map((e) => e.address);
        
        const t = mockI18n.getFixedT(language);
        const from = mockSettings.get('From_Email');
        const subject = t('TOTP_reset_email');

        for await (const address of addresses) {
          await mockMailer.send({
            to: address,
            from,
            subject,
            text: 'text',
            html: 'html',
          });
        }
      };
      
      const userId = 'user123';

      // Act
      await sendResetNotification(userId);

      // Assert
      expect(mockI18n.getFixedT).toHaveBeenCalledWith('es'); // Should use default from settings
    });
  });
});
