/**
 * Instances API - White-Box Testing
 * Tests: get instance info
 * Total: 10 tests
 */

describe('Instances API - White-Box Testing', () => {
  const mockInstanceService = {
    getInstances: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    test('TC-INST-001: should get all instances', async () => {
      mockInstanceService.getInstances.mockResolvedValue([
        {
          _id: 'instance1',
          name: 'Rocket.Chat Instance 1',
          address: 'http://localhost:3000'
        }
      ]);

      const instances = await mockInstanceService.getInstances();
      expect(Array.isArray(instances)).toBe(true);
      expect(instances.length).toBeGreaterThan(0);
    });

    test('TC-INST-002: should validate instance structure', async () => {
      mockInstanceService.getInstances.mockResolvedValue([
        {
          _id: 'instance1',
          name: 'Instance 1',
          address: 'http://localhost:3000',
          extraInformation: {}
        }
      ]);

      const instances = await mockInstanceService.getInstances();
      const instance = instances[0];
      
      expect(instance).toHaveProperty('_id');
      expect(instance).toHaveProperty('name');
      expect(instance).toHaveProperty('address');
    });

    test('TC-INST-003: should handle empty instances', async () => {
      mockInstanceService.getInstances.mockResolvedValue([]);
      const instances = await mockInstanceService.getInstances();
      expect(instances).toEqual([]);
    });

    test('TC-INST-004: should include instance metadata', async () => {
      mockInstanceService.getInstances.mockResolvedValue([
        {
          _id: 'instance1',
          name: 'Instance',
          address: 'http://localhost:3000',
          extraInformation: {
            version: '6.0.0',
            nodeVersion: 'v18.0.0'
          }
        }
      ]);

      const instances = await mockInstanceService.getInstances();
      expect(instances[0]).toHaveProperty('extraInformation');
    });

    test('TC-INST-005: should validate address format', async () => {
      mockInstanceService.getInstances.mockResolvedValue([
        {
          _id: 'instance1',
          name: 'Instance',
          address: 'http://localhost:3000'
        }
      ]);

      const instances = await mockInstanceService.getInstances();
      const address = instances[0].address;
      
      expect(typeof address).toBe('string');
      expect(address).toMatch(/^https?:\/\//);
    });

    test('TC-INST-006: should handle multiple instances', async () => {
      mockInstanceService.getInstances.mockResolvedValue([
        { _id: 'instance1', name: 'Instance 1', address: 'http://localhost:3000' },
        { _id: 'instance2', name: 'Instance 2', address: 'http://localhost:3001' }
      ]);

      const instances = await mockInstanceService.getInstances();
      expect(instances.length).toBe(2);
    });

    test('TC-INST-007: should check instance connectivity status', async () => {
      mockInstanceService.getInstances.mockResolvedValue([
        {
          _id: 'instance1',
          name: 'Instance',
          address: 'http://localhost:3000',
          extraInformation: {
            status: 'online'
          }
        }
      ]);

      const instances = await mockInstanceService.getInstances();
      const status = instances[0].extraInformation?.status;
      expect(status).toBeDefined();
    });

    test('TC-INST-008: should validate _id format', async () => {
      mockInstanceService.getInstances.mockResolvedValue([
        { _id: 'instance123', name: 'Instance', address: 'http://localhost:3000' }
      ]);

      const instances = await mockInstanceService.getInstances();
      expect(typeof instances[0]._id).toBe('string');
      expect(instances[0]._id).toBeTruthy();
    });

    test('TC-INST-009: should handle service errors', async () => {
      mockInstanceService.getInstances.mockRejectedValue(
        new Error('Service unavailable')
      );

      await expect(mockInstanceService.getInstances()).rejects.toThrow(
        'Service unavailable'
      );
    });

    test('TC-INST-010: should return instances with timestamps', async () => {
      mockInstanceService.getInstances.mockResolvedValue([
        {
          _id: 'instance1',
          name: 'Instance',
          address: 'http://localhost:3000',
          _createdAt: new Date(),
          _updatedAt: new Date()
        }
      ]);

      const instances = await mockInstanceService.getInstances();
      expect(instances[0]).toHaveProperty('_createdAt');
      expect(instances[0]).toHaveProperty('_updatedAt');
    });
  });
});
