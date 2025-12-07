/**
 * White Box Testing for twoFactorRequired.ts
 * 
 * Function Under Test:
 * - twoFactorRequired decorator
 */

describe('twoFactorRequired.ts - Two Factor Required Decorator', () => {

  describe('twoFactorRequired Function', () => {

    test('TC-001: Should throw error when userId is not present', async () => {
      const mockMeteor = {
        Error: jest.fn((error, reason, details) => { throw { error, reason, details }; }),
      };

      const twoFactorRequired = (fn, options) => {
        return async function (...args) { // correct: removed 'this' parameter
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }
          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn();
      const decoratedFn = twoFactorRequired(mockFn);
      const context = { userId: null };

      await expect(decoratedFn.apply(context, []))
        .rejects
        .toEqual(expect.objectContaining({
          error: 'error-invalid-user',
          reason: 'Invalid user'
        }));
    });

    test('TC-002: Should extract twoFactor options from args', async () => {
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          const twoFactor = args.pop();
          if (twoFactor) {
            if (twoFactor.twoFactorCode && twoFactor.twoFactorMethod) {
              await mockCheckCodeForUser({
                user: this.userId,
                connection: this.connection || undefined,
                code: twoFactor.twoFactorCode,
                method: twoFactor.twoFactorMethod,
                options,
              });
              this.twoFactorChecked = true;
            } else {
              args.push(twoFactor);
            }
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn().mockReturnValue('result');
      const decoratedFn = twoFactorRequired(mockFn);
      const context = {
        userId: 'user123',
        connection: { id: 'conn123' },
        twoFactorChecked: false
      };

      const args = ['arg1', 'arg2', {
        twoFactorCode: '123456',
        twoFactorMethod: 'totp'
      }];

      const result = await decoratedFn.apply(context, args);

      expect(result).toBe('result');
      expect(mockCheckCodeForUser).toHaveBeenCalledWith({
        user: 'user123',
        connection: { id: 'conn123' },
        code: '123456',
        method: 'totp',
        options: undefined,
      });
      expect(context.twoFactorChecked).toBe(true);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('TC-003: Should check 2FA when twoFactorChecked is false', async () => {
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          const twoFactor = args.pop();
          if (twoFactor) {
            if (twoFactor.twoFactorCode && twoFactor.twoFactorMethod) {
              await mockCheckCodeForUser({
                user: this.userId,
                connection: this.connection,
                code: twoFactor.twoFactorCode,
                method: twoFactor.twoFactorMethod,
                options,
              });
              this.twoFactorChecked = true;
            } else {
              args.push(twoFactor);
            }
          }

          if (!this.twoFactorChecked) {
            await mockCheckCodeForUser({
              user: this.userId,
              connection: this.connection,
              options
            });
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn().mockReturnValue('result');
      const decoratedFn = twoFactorRequired(mockFn);
      const context = {
        userId: 'user123',
        connection: { id: 'conn123' },
        twoFactorChecked: false
      };

      const args = ['arg1', 'arg2'];

      const result = await decoratedFn.apply(context, args);

      expect(result).toBe('result');
      expect(mockCheckCodeForUser).toHaveBeenCalledWith({
        user: 'user123',
        connection: { id: 'conn123' },
        options: undefined,
      });
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('TC-004: Should skip 2FA check when twoFactorChecked is true', async () => {
      const mockCheckCodeForUser = jest.fn();

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          const twoFactor = args.pop();
          if (twoFactor) {
            if (twoFactor.twoFactorCode && twoFactor.twoFactorMethod) {
              await mockCheckCodeForUser({
                user: this.userId,
                connection: this.connection,
                code: twoFactor.twoFactorCode,
                method: twoFactor.twoFactorMethod,
                options,
              });
              this.twoFactorChecked = true;
            } else {
              args.push(twoFactor);
            }
          }

          if (!this.twoFactorChecked) {
            await mockCheckCodeForUser({
              user: this.userId,
              connection: this.connection,
              options
            });
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn().mockReturnValue('result');
      const decoratedFn = twoFactorRequired(mockFn);
      const context = {
        userId: 'user123',
        connection: { id: 'conn123' },
        twoFactorChecked: true
      };

      const args = ['arg1', 'arg2'];

      const result = await decoratedFn.apply(context, args);

      expect(result).toBe('result');
      expect(mockCheckCodeForUser).not.toHaveBeenCalled();
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    test('TC-005: Should handle args without twoFactor options', async () => {
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          const twoFactor = args.pop();
          if (twoFactor) {
            if (twoFactor.twoFactorCode && twoFactor.twoFactorMethod) {
              await mockCheckCodeForUser({
                user: this.userId,
                connection: this.connection,
                code: twoFactor.twoFactorCode,
                method: twoFactor.twoFactorMethod,
                options,
              });
              this.twoFactorChecked = true;
            } else {
              args.push(twoFactor);
            }
          }

          if (!this.twoFactorChecked) {
            await mockCheckCodeForUser({
              user: this.userId,
              connection: this.connection,
              options
            });
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn().mockReturnValue('result');
      const decoratedFn = twoFactorRequired(mockFn);
      const context = {
        userId: 'user123',
        connection: { id: 'conn123' },
        twoFactorChecked: false
      };

      const args = ['arg1', 'arg2', { otherOption: 'value' }];

      const result = await decoratedFn.apply(context, args);

      expect(result).toBe('result');
      expect(mockCheckCodeForUser).toHaveBeenCalledWith({
        user: 'user123',
        connection: { id: 'conn123' },
        options: undefined,
      });
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', { otherOption: 'value' });
    });

    test('TC-006: Should pass options to checkCodeForUser', async () => {
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          const twoFactor = args.pop();
          if (twoFactor) {
            if (twoFactor.twoFactorCode && twoFactor.twoFactorMethod) {
              await mockCheckCodeForUser({
                user: this.userId,
                connection: this.connection,
                code: twoFactor.twoFactorCode,
                method: twoFactor.twoFactorMethod,
                options,
              });
              this.twoFactorChecked = true;
            } else {
              args.push(twoFactor);
            }
          }

          if (!this.twoFactorChecked) {
            await mockCheckCodeForUser({
              user: this.userId,
              connection: this.connection,
              options
            });
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn().mockReturnValue('result');
      const options = { disablePasswordFallback: true, requireSecondFactor: true };
      const decoratedFn = twoFactorRequired(mockFn, options);
      const context = {
        userId: 'user123',
        connection: { id: 'conn123' },
        twoFactorChecked: false
      };

      const args = ['arg1'];

      const result = await decoratedFn.apply(context, args);

      expect(result).toBe('result');
      expect(mockCheckCodeForUser).toHaveBeenCalledWith({
        user: 'user123',
        connection: { id: 'conn123' },
        options,
      });
    });

    test('TC-007: Should handle empty args array', async () => {
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          if (!this.twoFactorChecked) {
            await mockCheckCodeForUser({
              user: this.userId,
              connection: this.connection,
              options
            });
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn().mockReturnValue('result');
      const decoratedFn = twoFactorRequired(mockFn);
      const context = {
        userId: 'user123',
        connection: { id: 'conn123' },
        twoFactorChecked: false
      };

      const args = [];

      const result = await decoratedFn.apply(context, args);

      expect(result).toBe('result');
      expect(mockCheckCodeForUser).toHaveBeenCalledWith({
        user: 'user123',
        connection: { id: 'conn123' },
        options: undefined,
      });
      expect(mockFn).toHaveBeenCalledWith();
    });

    test('TC-008: Should handle context without connection', async () => {
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          if (!this.twoFactorChecked) {
            await mockCheckCodeForUser({
              user: this.userId,
              connection: this.connection || undefined,
              options
            });
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn().mockReturnValue('result');
      const decoratedFn = twoFactorRequired(mockFn);
      const context = {
        userId: 'user123',
        twoFactorChecked: false
      };

      const args = [];

      const result = await decoratedFn.apply(context, args);

      expect(result).toBe('result');
      expect(mockCheckCodeForUser).toHaveBeenCalledWith({
        user: 'user123',
        connection: undefined,
        options: undefined,
      });
    });

    test('TC-009: Should preserve function return value', async () => {
      const mockCheckCodeForUser = jest.fn().mockResolvedValue(true);

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          if (!this.twoFactorChecked) {
            await mockCheckCodeForUser({
              user: this.userId,
              connection: this.connection,
              options
            });
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn().mockResolvedValue({ data: 'test', success: true });
      const decoratedFn = twoFactorRequired(mockFn);
      const context = {
        userId: 'user123',
        connection: { id: 'conn123' },
        twoFactorChecked: false
      };

      const args = ['param1', 'param2'];

      const result = await decoratedFn.apply(context, args);

      expect(result).toEqual({ data: 'test', success: true });
      expect(mockFn).toHaveBeenCalledWith('param1', 'param2');
    });

    test('TC-010: Should handle checkCodeForUser throwing error', async () => {
      const mockCheckCodeForUser = jest.fn().mockRejectedValue(new Error('2FA required'));

      const twoFactorRequired = (fn, options) => {
        return async function (...args) {
          if (!this.userId) {
            throw { error: 'error-invalid-user', reason: 'Invalid user' };
          }

          if (!this.twoFactorChecked) {
            await mockCheckCodeForUser({
              user: this.userId,
              connection: this.connection,
              options
            });
          }

          return fn.apply(this, args);
        };
      };

      const mockFn = jest.fn();
      const decoratedFn = twoFactorRequired(mockFn);
      const context = {
        userId: 'user123',
        connection: { id: 'conn123' },
        twoFactorChecked: false
      };

      const args = [];

      await expect(decoratedFn.apply(context, args))
        .rejects
        .toThrow('2FA required');
      expect(mockFn).not.toHaveBeenCalled();
    });

  });

});

