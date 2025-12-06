/**
 * VoIP Extensions - White-Box Testing
 * Tests: Extension management functions
 * Total: 15 tests
 */

const {
  getConnectorVersion,
  getExtensionList,
  getExtensionDetails,
  getRegistrationInfo
} = require('../src/api/voip-endpoints/extensions');

describe('VoIP Extensions - White-Box Testing', () => {
  test('TC-VOIP-EXT-001: should get connector version', async () => {
    const result = await getConnectorVersion();

    expect(result).toHaveProperty('version');
    expect(result).toHaveProperty('type');
  });

  test('TC-VOIP-EXT-002: should return asterisk type', async () => {
    const result = await getConnectorVersion();

    expect(result.type).toBe('asterisk');
  });

  test('TC-VOIP-EXT-003: should get extension list', async () => {
    const result = await getExtensionList();

    expect(result).toHaveProperty('result');
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('TC-VOIP-EXT-004: should return extensions with properties', async () => {
    const result = await getExtensionList();

    expect(result.result[0]).toHaveProperty('extension');
    expect(result.result[0]).toHaveProperty('name');
  });

  test('TC-VOIP-EXT-005: should get extension details with valid extension', async () => {
    const result = await getExtensionDetails({ extension: '1001' });

    expect(result.result).toHaveProperty('extension', '1001');
    expect(result.result).toHaveProperty('status');
  });

  test('TC-VOIP-EXT-006: should throw error without extension parameter', async () => {
    await expect(getExtensionDetails({})).rejects.toThrow('Extension required');
  });

  test('TC-VOIP-EXT-007: should get registration info with valid extension', async () => {
    const result = await getRegistrationInfo({ extension: '1001' });

    expect(result.result).toHaveProperty('extension', '1001');
    expect(result.result).toHaveProperty('username');
    expect(result.result).toHaveProperty('password');
  });

  test('TC-VOIP-EXT-008: should throw error without extension in registration', async () => {
    await expect(getRegistrationInfo({})).rejects.toThrow('Extension required');
  });

  test('TC-VOIP-EXT-009: should handle different extension numbers', async () => {
    const extensions = ['1001', '1002', '1003'];

    for (const ext of extensions) {
      const result = await getExtensionDetails({ extension: ext });
      expect(result.result.extension).toBe(ext);
    }
  });

  test('TC-VOIP-EXT-010: should return active status for extensions', async () => {
    const result = await getExtensionDetails({ extension: '1001' });

    expect(result.result.status).toBe('active');
  });

  test('TC-VOIP-EXT-011: should include username in registration info', async () => {
    const result = await getRegistrationInfo({ extension: '1001' });

    expect(result.result.username).toBeDefined();
    expect(typeof result.result.username).toBe('string');
  });

  test('TC-VOIP-EXT-012: should include password in registration info', async () => {
    const result = await getRegistrationInfo({ extension: '1001' });

    expect(result.result.password).toBeDefined();
    expect(typeof result.result.password).toBe('string');
  });

  test('TC-VOIP-EXT-013: should handle null extension parameter', async () => {
    await expect(getExtensionDetails({ extension: null })).rejects.toThrow();
  });

  test('TC-VOIP-EXT-014: should handle undefined extension parameter', async () => {
    await expect(getExtensionDetails({ extension: undefined })).rejects.toThrow();
  });

  test('TC-VOIP-EXT-015: should return consistent version format', async () => {
    const result = await getConnectorVersion();

    expect(result.version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
