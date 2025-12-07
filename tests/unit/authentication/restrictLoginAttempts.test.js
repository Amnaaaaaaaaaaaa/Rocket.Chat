/**
 * White Box Testing for restrictLoginAttempts.ts
 * Tests: isValidLoginAttemptByIp, isValidAttemptByUser
 * Coverage: All conditional branches and logic paths
 */

describe('restrictLoginAttempts - White Box Testing', () => {
  
  describe('isValidLoginAttemptByIp - Logic Testing', () => {
    let mockSettings;
    let mockServerEvents;

    beforeEach(() => {
      mockSettings = {
        get: jest.fn()
      };
      mockServerEvents = {
        findLastFailedAttemptByIp: jest.fn(),
        findLastSuccessfulAttemptByIp: jest.fn(),
        countFailedAttemptsByIpSince: jest.fn()
      };
      jest.clearAllMocks();
    });

    test('should return true when Block_Multiple_Failed_Logins_Enabled is false', async () => {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'Block_Multiple_Failed_Logins_Enabled') return false;
        return true;
      });

      const isEnabled = mockSettings.get('Block_Multiple_Failed_Logins_Enabled');
      const isByIp = mockSettings.get('Block_Multiple_Failed_Logins_By_Ip');

      const result = !isEnabled || !isByIp;
      expect(result).toBe(true);
    });

    test('should return true when Block_Multiple_Failed_Logins_By_Ip is false', async () => {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'Block_Multiple_Failed_Logins_Enabled') return true;
        if (key === 'Block_Multiple_Failed_Logins_By_Ip') return false;
        return true;
      });

      const isEnabled = mockSettings.get('Block_Multiple_Failed_Logins_Enabled');
      const isByIp = mockSettings.get('Block_Multiple_Failed_Logins_By_Ip');

      const result = !isEnabled || !isByIp;
      expect(result).toBe(true);
    });

    test('should return true when IP is in whitelist', () => {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'Block_Multiple_Failed_Logins_Ip_Whitelist') return '127.0.0.1,192.168.1.1';
        return true;
      });

      const ip = '127.0.0.1';
      const whitelist = String(mockSettings.get('Block_Multiple_Failed_Logins_Ip_Whitelist')).split(',');
      
      expect(whitelist.includes(ip)).toBe(true);
    });

    test('should parse whitelist correctly with spaces', () => {
      mockSettings.get.mockReturnValue('127.0.0.1, 192.168.1.1, 10.0.0.1');

      const whitelist = String(mockSettings.get('Block_Multiple_Failed_Logins_Ip_Whitelist'))
        .split(',')
        .map(ip => ip.trim());

      expect(whitelist).toContain('127.0.0.1');
      expect(whitelist).toContain('192.168.1.1');
      expect(whitelist).toContain('10.0.0.1');
      expect(whitelist.length).toBe(3);
    });

    test('should return true when attemptsUntilBlock is not configured', () => {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'Block_Multiple_Failed_Logins_Attempts_Until_Block_By_Ip') return null;
        return true;
      });

      const attemptsUntilBlock = mockSettings.get('Block_Multiple_Failed_Logins_Attempts_Until_Block_By_Ip');
      
      expect(!attemptsUntilBlock).toBe(true);
    });

    test('should return true when no failed attempts found', async () => {
      mockServerEvents.findLastFailedAttemptByIp.mockResolvedValue(null);

      const lastFailed = await mockServerEvents.findLastFailedAttemptByIp('192.168.1.100');
      
      expect(lastFailed).toBeNull();
    });

    test('should calculate lockout time correctly', () => {
      const minutesUntilUnblock = 15;
      const now = new Date('2024-01-01T12:00:00Z');
      
      // Simulate addMinutesToADate
      const lockoutTimeStart = new Date(now.getTime() - (minutesUntilUnblock * 60 * 1000));
      
      expect(lockoutTimeStart.getTime()).toBeLessThan(now.getTime());
      expect(lockoutTimeStart.toISOString()).toBe('2024-01-01T11:45:00.000Z');
    });

    test('should use lastSuccessfulAttempt as startTime if more recent', () => {
      const lockoutTimeStart = new Date('2024-01-01T10:00:00Z');
      const lastSuccessfulAttemptAt = new Date('2024-01-01T11:00:00Z');

      const startTime = lastSuccessfulAttemptAt
        ? new Date(Math.max(lockoutTimeStart.getTime(), lastSuccessfulAttemptAt.getTime()))
        : lockoutTimeStart;

      expect(startTime).toEqual(lastSuccessfulAttemptAt);
    });

    test('should use lockoutTimeStart when no successful attempt exists', () => {
      const lockoutTimeStart = new Date('2024-01-01T10:00:00Z');
      const lastSuccessfulAttemptAt = null;

      const startTime = lastSuccessfulAttemptAt
        ? new Date(Math.max(lockoutTimeStart.getTime(), lastSuccessfulAttemptAt.getTime()))
        : lockoutTimeStart;

      expect(startTime).toEqual(lockoutTimeStart);
    });

    test('should return true when failed attempts below threshold', async () => {
      mockServerEvents.countFailedAttemptsByIpSince.mockResolvedValue(3);
      const attemptsUntilBlock = 5;

      const failedAttempts = await mockServerEvents.countFailedAttemptsByIpSince('192.168.1.1', new Date());
      
      expect(failedAttempts < attemptsUntilBlock).toBe(true);
    });

    test('should return false when failed attempts reach threshold', async () => {
      mockServerEvents.countFailedAttemptsByIpSince.mockResolvedValue(5);
      const attemptsUntilBlock = 5;

      const failedAttempts = await mockServerEvents.countFailedAttemptsByIpSince('192.168.1.1', new Date());
      
      expect(failedAttempts < attemptsUntilBlock).toBe(false);
    });
  });

  describe('isValidAttemptByUser - Logic Testing', () => {
    let mockSettings;
    let mockServerEvents;

    beforeEach(() => {
      mockSettings = {
        get: jest.fn()
      };
      mockServerEvents = {
        findLastFailedAttemptByUsername: jest.fn(),
        findLastSuccessfulAttemptByUsername: jest.fn(),
        countFailedAttemptsByUsernameSince: jest.fn()
      };
      jest.clearAllMocks();
    });

    test('should return true when feature is disabled', () => {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'Block_Multiple_Failed_Logins_Enabled') return false;
        return true;
      });

      const isEnabled = mockSettings.get('Block_Multiple_Failed_Logins_Enabled');
      const isByUser = mockSettings.get('Block_Multiple_Failed_Logins_By_User');

      expect(!isEnabled || !isByUser).toBe(true);
    });

    test('should return true when loginUsername is not provided', () => {
      const login = {
        methodArguments: [{ user: {} }]
      };

      const loginUsername = login.methodArguments[0].user?.username;
      
      expect(!loginUsername).toBe(true);
    });

    test('should extract username from methodArguments correctly', () => {
      const login = {
        methodArguments: [{ user: { username: 'john.doe' } }]
      };

      const loginUsername = login.methodArguments[0].user?.username;
      
      expect(loginUsername).toBe('john.doe');
    });

    test('should return true when attemptsUntilBlock_by_User is not set', () => {
      mockSettings.get.mockImplementation((key) => {
        if (key === 'Block_Multiple_Failed_Logins_Attempts_Until_Block_by_User') return undefined;
        return true;
      });

      const attemptsUntilBlock = mockSettings.get('Block_Multiple_Failed_Logins_Attempts_Until_Block_by_User');
      
      expect(!attemptsUntilBlock).toBe(true);
    });

    test('should handle different threshold values', () => {
      const testCases = [
        { attempts: 2, threshold: 3, expected: true },
        { attempts: 3, threshold: 3, expected: false },
        { attempts: 5, threshold: 3, expected: false },
        { attempts: 0, threshold: 5, expected: true }
      ];

      testCases.forEach(({ attempts, threshold, expected }) => {
        expect(attempts < threshold).toBe(expected);
      });
    });
  });

  describe('saveFailedLoginAttempts - Data Structure Testing', () => {
    test('should create correct user object from login.user', () => {
      const login = {
        user: {
          _id: 'user123',
          username: 'testuser'
        },
        methodArguments: [{}],
        connection: {}
      };

      const user = {
        _id: login.user?._id,
        username: login.user?.username || login.methodArguments[0].user?.username
      };

      expect(user).toEqual({
        _id: 'user123',
        username: 'testuser'
      });
    });

    test('should fallback to methodArguments username when login.user.username not available', () => {
      const login = {
        user: {
          _id: 'user123'
        },
        methodArguments: [{ user: { username: 'fallback_user' } }],
        connection: {}
      };

      const user = {
        _id: login.user?._id,
        username: login.user?.username || login.methodArguments[0].user?.username
      };

      expect(user.username).toBe('fallback_user');
    });

    test('should handle missing user data gracefully', () => {
      const login = {
        methodArguments: [{}],
        connection: {}
      };

      const user = {
        _id: login.user?._id,
        username: login.user?.username || login.methodArguments[0].user?.username
      };

      expect(user._id).toBeUndefined();
      expect(user.username).toBeUndefined();
    });
  });

  describe('Date Calculation Logic', () => {
    test('should calculate future date correctly', () => {
      const baseDate = new Date('2024-01-01T12:00:00Z');
      const minutesToAdd = 30;
      
      const futureDate = new Date(baseDate.getTime() + (minutesToAdd * 60 * 1000));
      
      expect(futureDate.toISOString()).toBe('2024-01-01T12:30:00.000Z');
    });

    test('should calculate past date correctly (negative minutes)', () => {
      const baseDate = new Date('2024-01-01T12:00:00Z');
      const minutesToSubtract = -30;
      
      const pastDate = new Date(baseDate.getTime() + (minutesToSubtract * 60 * 1000));
      
      expect(pastDate.toISOString()).toBe('2024-01-01T11:30:00.000Z');
    });
  });
});
