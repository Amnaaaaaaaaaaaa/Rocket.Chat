/**
 * VoIP Queues - White-Box Testing
 * Tests: Queue management functions
 * Total: 12 tests
 */

const {
  getQueueSummary,
  getQueuedCallsForThisExtension,
  getQueueMembership
} = require('../src/api/voip-endpoints/queues');

describe('VoIP Queues - White-Box Testing', () => {
  test('TC-VOIP-QUE-001: should get queue summary', async () => {
    const result = await getQueueSummary();

    expect(result).toHaveProperty('result');
    expect(Array.isArray(result.result)).toBe(true);
  });

  test('TC-VOIP-QUE-002: should return queue with name and calls', async () => {
    const result = await getQueueSummary();

    expect(result.result[0]).toHaveProperty('name');
    expect(result.result[0]).toHaveProperty('calls');
  });

  test('TC-VOIP-QUE-003: should get queued calls with valid extension', async () => {
    const result = await getQueuedCallsForThisExtension({ extension: '1001' });

    expect(result.result).toHaveProperty('extension', '1001');
    expect(result.result).toHaveProperty('queuedCalls');
  });

  test('TC-VOIP-QUE-004: should throw error without extension parameter', async () => {
    await expect(
      getQueuedCallsForThisExtension({})
    ).rejects.toThrow('Extension required');
  });

  test('TC-VOIP-QUE-005: should get queue membership with valid extension', async () => {
    const result = await getQueueMembership({ extension: '1001' });

    expect(result.result).toHaveProperty('extension', '1001');
    expect(result.result).toHaveProperty('queues');
  });

  test('TC-VOIP-QUE-006: should throw error without extension in membership', async () => {
    await expect(
      getQueueMembership({})
    ).rejects.toThrow('Extension required');
  });

  test('TC-VOIP-QUE-007: should return queues as array', async () => {
    const result = await getQueueMembership({ extension: '1001' });

    expect(Array.isArray(result.result.queues)).toBe(true);
  });

  test('TC-VOIP-QUE-008: should handle different extension numbers', async () => {
    const extensions = ['1001', '1002', '1003'];

    for (const ext of extensions) {
      const result = await getQueuedCallsForThisExtension({ extension: ext });
      expect(result.result.extension).toBe(ext);
    }
  });

  test('TC-VOIP-QUE-009: should return numeric queued calls count', async () => {
    const result = await getQueuedCallsForThisExtension({ extension: '1001' });

    expect(typeof result.result.queuedCalls).toBe('number');
  });

  test('TC-VOIP-QUE-010: should handle null extension parameter', async () => {
    await expect(
      getQueuedCallsForThisExtension({ extension: null })
    ).rejects.toThrow();
  });

  test('TC-VOIP-QUE-011: should handle undefined extension parameter', async () => {
    await expect(
      getQueueMembership({ extension: undefined })
    ).rejects.toThrow();
  });

  test('TC-VOIP-QUE-012: should return consistent queue data structure', async () => {
    const summary = await getQueueSummary();
    const calls = await getQueuedCallsForThisExtension({ extension: '1001' });
    const membership = await getQueueMembership({ extension: '1001' });

    expect(summary).toHaveProperty('result');
    expect(calls).toHaveProperty('result');
    expect(membership).toHaveProperty('result');
  });
});
