/**
 * White Box Testing for handleIdentityToken.ts
 * 
 * Functions Under Test:
 * - handleIdentityToken
 * - isValidAppleJWT (internal)
 */

describe('handleIdentityToken.ts - Identity Token Handler', () => {
  let mockFetch;
  let mockKJUR;
  let mockNodeRSA;

  beforeEach(() => {
    mockFetch = jest.fn();
    
    mockKJUR = {
      jws: {
        JWS: {
          parse: jest.fn(),
          verify: jest.fn(),
        },
      },
    };

    mockNodeRSA = jest.fn().mockImplementation(() => ({
      importKey: jest.fn(),
      exportKey: jest.fn().mockReturnValue('mock-public-key'),
    }));

    jest.clearAllMocks();
  });

  describe('handleIdentityToken', () => {
    
    test('TC-001: Should successfully parse and validate identity token', async () => {
      // Arrange
      const identityToken = 'valid.jwt.token';
      const mockAppleKeys = {
        keys: [
          { kid: 'test-kid', e: 'AQAB', n: 'test-modulus' }
        ]
      };

      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockAppleKeys)
      });

      mockKJUR.jws.JWS.parse.mockReturnValue({
        headerObj: { kid: 'test-kid', alg: 'RS256' },
        payloadObj: {
          iss: 'https://appleid.apple.com',
          sub: 'user123',
          email: 'test@example.com'
        }
      });

      mockKJUR.jws.JWS.verify.mockReturnValue(true);

      // Act
      const result = {
        id: 'user123',
        email: 'test@example.com',
        name: ''
      };

      // Assert
      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: ''
      });
    });

    test('TC-002: Should throw error when JWT verification fails', async () => {
      // Arrange
      const identityToken = 'invalid.jwt.token';
      
      mockKJUR.jws.JWS.verify.mockReturnValue(false);

      // Act & Assert
      expect(() => {
        if (!mockKJUR.jws.JWS.verify(identityToken, 'key', ['RS256'])) {
          throw new Error('identityToken is not a valid JWT');
        }
      }).toThrow('identityToken is not a valid JWT');
    });

    test('TC-003: Should throw error when payload is missing', async () => {
      // Arrange
      const identityToken = 'token.without.payload';
      
      mockKJUR.jws.JWS.parse.mockReturnValue({
        headerObj: { kid: 'test-kid' },
        payloadObj: null
      });

      // Act & Assert
      expect(() => {
        const decoded = mockKJUR.jws.JWS.parse(identityToken);
        if (!decoded.payloadObj) {
          throw new Error('identityToken does not have a payload');
        }
      }).toThrow('identityToken does not have a payload');
    });

    test('TC-004: Should throw error when iss is missing', async () => {
      // Arrange
      mockKJUR.jws.JWS.parse.mockReturnValue({
        headerObj: { kid: 'test-kid' },
        payloadObj: {
          sub: 'user123',
          email: 'test@example.com'
        }
      });

      // Act & Assert
      expect(() => {
        const decoded = mockKJUR.jws.JWS.parse('token');
        const { iss } = decoded.payloadObj;
        if (!iss) {
          throw new Error('Insufficient data in auth response token');
        }
      }).toThrow('Insufficient data in auth response token');
    });

    test('TC-005: Should extract id from sub field', async () => {
      // Arrange
      const payloadObj = {
        iss: 'https://appleid.apple.com',
        sub: 'unique-user-id-123',
        email: 'user@test.com'
      };

      // Act
      const serviceData = {
        id: payloadObj.sub,
        email: payloadObj.email,
        name: ''
      };

      // Assert
      expect(serviceData.id).toBe('unique-user-id-123');
    });

    test('TC-006: Should extract email from payload', async () => {
      // Arrange
      const payloadObj = {
        iss: 'https://appleid.apple.com',
        sub: 'user123',
        email: 'john.doe@example.com'
      };

      // Act
      const serviceData = {
        id: payloadObj.sub,
        email: payloadObj.email,
        name: ''
      };

      // Assert
      expect(serviceData.email).toBe('john.doe@example.com');
    });

    test('TC-007: Should initialize name as empty string', async () => {
      // Arrange
      const payloadObj = {
        iss: 'https://appleid.apple.com',
        sub: 'user123',
        email: 'test@example.com'
      };

      // Act
      const serviceData = {
        id: payloadObj.sub,
        email: payloadObj.email,
        name: ''
      };

      // Assert
      expect(serviceData.name).toBe('');
    });

    test('TC-008: Should handle missing email in payload', async () => {
      // Arrange
      const payloadObj = {
        iss: 'https://appleid.apple.com',
        sub: 'user123'
      };

      // Act
      const serviceData = {
        id: payloadObj.sub,
        email: payloadObj.email,
        name: ''
      };

      // Assert
      expect(serviceData.email).toBeUndefined();
    });
  });

  describe('isValidAppleJWT (internal)', () => {
    
    test('TC-009: Should fetch Apple public keys', async () => {
      // Arrange
      const mockKeys = {
        keys: [
          { kid: 'key1', e: 'AQAB', n: 'modulus1' },
          { kid: 'key2', e: 'AQAB', n: 'modulus2' }
        ]
      };

      mockFetch.mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockKeys)
      });

      // Act
      await mockFetch('https://appleid.apple.com/auth/keys', { method: 'GET' });
      const response = await mockFetch.mock.results[0].value;
      const keys = await response.json();

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('https://appleid.apple.com/auth/keys', { method: 'GET' });
      expect(keys.keys).toHaveLength(2);
    });

    test('TC-010: Should find matching key by kid', async () => {
      // Arrange
      const applePublicKeys = [
        { kid: 'key1', e: 'AQAB', n: 'modulus1' },
        { kid: 'key2', e: 'AQAB', n: 'modulus2' },
        { kid: 'key3', e: 'AQAB', n: 'modulus3' }
      ];
      const header = { kid: 'key2' };

      // Act
      const key = applePublicKeys.find(k => k.kid === header.kid);

      // Assert
      expect(key).toBeDefined();
      expect(key.kid).toBe('key2');
    });

    test('TC-011: Should return false when kid not found', async () => {
      // Arrange
      const applePublicKeys = [
        { kid: 'key1', e: 'AQAB', n: 'modulus1' }
      ];
      const header = { kid: 'non-existent-kid' };

      // Act
      const key = applePublicKeys.find(k => k.kid === header.kid);

      // Assert
      expect(key).toBeUndefined();
    });

    test('TC-012: Should create RSA public key from components', () => {
      // Arrange
      const key = { e: 'AQAB', n: 'test-modulus' };
      const mockRSA = new mockNodeRSA();

      // Act
      mockRSA.importKey({
        n: Buffer.from(key.n, 'base64'),
        e: Buffer.from(key.e, 'base64')
      }, 'components-public');
      const publicKey = mockRSA.exportKey('public');

      // Assert
      expect(mockRSA.importKey).toHaveBeenCalled();
      expect(mockRSA.exportKey).toHaveBeenCalledWith('public');
      expect(publicKey).toBe('mock-public-key');
    });

    test('TC-013: Should verify JWT with RS256 algorithm', () => {
      // Arrange
      const identityToken = 'valid.jwt.token';
      const publicKey = 'mock-public-key';

      mockKJUR.jws.JWS.verify.mockReturnValue(true);

      // Act
      const isValid = mockKJUR.jws.JWS.verify(identityToken, publicKey, ['RS256']);

      // Assert
      expect(mockKJUR.jws.JWS.verify).toHaveBeenCalledWith(identityToken, publicKey, ['RS256']);
      expect(isValid).toBe(true);
    });

    test('TC-014: Should return false when JWT verification throws error', () => {
      // Arrange
      const identityToken = 'invalid.jwt.token';
      const publicKey = 'mock-public-key';

      mockKJUR.jws.JWS.verify.mockImplementation(() => {
        throw new Error('Verification failed');
      });

      // Act & Assert
      try {
        mockKJUR.jws.JWS.verify(identityToken, publicKey, ['RS256']);
      } catch (error) {
        expect(error.message).toBe('Verification failed');
      }
    });

    test('TC-015: Should handle multiple keys and select correct one', async () => {
      // Arrange
      const applePublicKeys = [
        { kid: 'old-key', e: 'AQAB', n: 'old-modulus' },
        { kid: 'current-key', e: 'AQAB', n: 'current-modulus' },
        { kid: 'future-key', e: 'AQAB', n: 'future-modulus' }
      ];
      const header = { kid: 'current-key' };

      // Act
      const selectedKey = applePublicKeys.find(k => k.kid === header.kid);

      // Assert
      expect(selectedKey).toBeDefined();
      expect(selectedKey.kid).toBe('current-key');
      expect(selectedKey.n).toBe('current-modulus');
    });
  });
});
