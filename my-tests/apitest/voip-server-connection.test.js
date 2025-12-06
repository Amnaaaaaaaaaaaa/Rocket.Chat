/**
 * VoIP Server Connection - White-Box Testing
 * Tests: Server connection validation functions
 * Total: 10 tests
 */

const {
  checkManagementConnection,
  checkCallserverConnection
} = require('../src/api/voip-endpoints/server-connection');

describe('VoIP Server Connection - White-Box Testing', () => {
  describe('checkManagementConnection', () => {
    test('TC-VOIP-CONN-001: should check connection with valid parameters', async () => {
      const result = await checkManagementConnection(
        'localhost',
        '5038',
        'admin',
        'password'
      );

      expect(result).toHaveProperty('connected', true);
      expect(result).toHaveProperty('host', 'localhost');
      expect(result).toHaveProperty('port', '5038');
    });

    test('TC-VOIP-CONN-002: should throw error without host', async () => {
      await expect(
        checkManagementConnection(null, '5038', 'admin', 'password')
      ).rejects.toThrow('All parameters required');
    });

    test('TC-VOIP-CONN-003: should throw error without port', async () => {
      await expect(
        checkManagementConnection('localhost', null, 'admin', 'password')
      ).rejects.toThrow('All parameters required');
    });

    test('TC-VOIP-CONN-004: should throw error without username', async () => {
      await expect(
        checkManagementConnection('localhost', '5038', null, 'password')
      ).rejects.toThrow('All parameters required');
    });

    test('TC-VOIP-CONN-005: should throw error without password', async () => {
      await expect(
        checkManagementConnection('localhost', '5038', 'admin', null)
      ).rejects.toThrow('All parameters required');
    });

    test('TC-VOIP-CONN-006: should handle different host addresses', async () => {
      const hosts = ['localhost', '192.168.1.1', 'voip.example.com'];

      for (const host of hosts) {
        const result = await checkManagementConnection(
          host,
          '5038',
          'admin',
          'password'
        );
        expect(result.host).toBe(host);
      }
    });

    test('TC-VOIP-CONN-007: should handle different ports', async () => {
      const ports = ['5038', '8088', '443'];

      for (const port of ports) {
        const result = await checkManagementConnection(
          'localhost',
          port,
          'admin',
          'password'
        );
        expect(result.port).toBe(port);
      }
    });
  });

  describe('checkCallserverConnection', () => {
    test('TC-VOIP-CONN-008: should check connection with valid socket URL', async () => {
      const result = await checkCallserverConnection('wss://localhost:8089/ws');

      expect(result).toHaveProperty('connected', true);
      expect(result).toHaveProperty('url', 'wss://localhost:8089/ws');
    });

    test('TC-VOIP-CONN-009: should throw error without socket URL', async () => {
      await expect(
        checkCallserverConnection(null)
      ).rejects.toThrow('Socket URL required');
    });

    test('TC-VOIP-CONN-010: should handle different WebSocket URLs', async () => {
      const urls = [
        'wss://localhost:8089/ws',
        'wss://voip.example.com/asterisk',
        'wss://192.168.1.1:443/ws'
      ];

      for (const url of urls) {
        const result = await checkCallserverConnection(url);
        expect(result.url).toBe(url);
      }
    });
  });
});
