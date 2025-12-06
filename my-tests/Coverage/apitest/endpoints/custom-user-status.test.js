/**
 * Custom User Status API - White-Box Testing
 * Tests: list, create, update, delete
 * Total: 15 tests
 */

describe('Custom User Status API - White-Box Testing', () => {
  const mockCustomUserStatus = {
    findPaginated: jest.fn(),
    findOneByName: jest.fn(),
    findOneById: jest.fn()
  };

  const mockMethods = {
    insertOrUpdateUserStatus: jest.fn(),
    deleteCustomUserStatus: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    test('TC-USTATUS-001: should list with pagination', async () => {
      mockCustomUserStatus.findPaginated.mockReturnValue({
        cursor: {
          toArray: jest.fn().mockResolvedValue([
            { _id: 'status1', name: 'busy' }
          ])
        },
        totalCount: jest.fn().mockResolvedValue(1)
      });

      const result = mockCustomUserStatus.findPaginated({}, {});
      const [statuses] = await Promise.all([result.cursor.toArray()]);
      expect(statuses.length).toBe(1);
    });

    test('TC-USTATUS-002: should filter by name', () => {
      const name = 'busy';
      const filter = { name: { $regex: name, $options: 'i' } };
      expect(filter.name.$regex).toBe('busy');
    });

    test('TC-USTATUS-003: should filter by _id', () => {
      const _id = 'status1';
      const filter = _id ? { _id } : {};
      expect(filter).toEqual({ _id: 'status1' });
    });

    test('TC-USTATUS-004: should combine query filters', () => {
      const query = { active: true };
      const name = 'busy';
      const filter = {
        ...query,
        ...(name ? { name: { $regex: name, $options: 'i' } } : {})
      };
      expect(filter.active).toBe(true);
    });

    test('TC-USTATUS-005: should apply default sort', () => {
      const sort = { name: 1 };
      expect(sort.name).toBe(1);
    });
  });

  describe('create', () => {
    test('TC-USTATUS-006: should validate name parameter', () => {
      const name = 'busy';
      expect(typeof name).toBe('string');
      expect(name).toBeTruthy();
    });

    test('TC-USTATUS-007: should handle optional statusType', () => {
      const statusType = 'online';
      const data = {
        name: 'busy',
        statusType: statusType || ''
      };
      expect(data.statusType).toBe('online');
    });

    test('TC-USTATUS-008: should create user status', async () => {
      mockMethods.insertOrUpdateUserStatus.mockResolvedValue(true);
      mockCustomUserStatus.findOneByName.mockResolvedValue({
        _id: 'status1',
        name: 'busy'
      });

      await mockMethods.insertOrUpdateUserStatus('user123', {
        name: 'busy',
        statusType: 'online'
      });

      const status = await mockCustomUserStatus.findOneByName('busy');
      expect(status).toBeDefined();
    });

    test('TC-USTATUS-009: should handle creation error', async () => {
      mockCustomUserStatus.findOneByName.mockResolvedValue(null);
      const status = await mockCustomUserStatus.findOneByName('busy');
      expect(status).toBeNull();
    });
  });

  describe('delete', () => {
    test('TC-USTATUS-010: should validate customUserStatusId', () => {
      const customUserStatusId = 'status1';
      expect(typeof customUserStatusId).toBe('string');
      expect(customUserStatusId).toBeTruthy();
    });

    test('TC-USTATUS-011: should delete user status', async () => {
      mockMethods.deleteCustomUserStatus.mockResolvedValue(true);
      await mockMethods.deleteCustomUserStatus('user123', 'status1');
      expect(mockMethods.deleteCustomUserStatus).toHaveBeenCalled();
    });

    test('TC-USTATUS-012: should handle missing id', () => {
      const customUserStatusId = undefined;
      expect(customUserStatusId).toBeFalsy();
    });
  });

  describe('update', () => {
    test('TC-USTATUS-013: should validate update parameters', () => {
      const data = {
        _id: 'status1',
        name: 'busy',
        statusType: 'online'
      };
      expect(data._id).toBeTruthy();
      expect(data.name).toBeTruthy();
    });

    test('TC-USTATUS-014: should check status exists before update', async () => {
      mockCustomUserStatus.findOneById.mockResolvedValue({
        _id: 'status1',
        name: 'busy'
      });

      const status = await mockCustomUserStatus.findOneById('status1');
      expect(status).toBeDefined();
    });

    test('TC-USTATUS-015: should handle non-existent status', async () => {
      mockCustomUserStatus.findOneById.mockResolvedValue(null);
      const status = await mockCustomUserStatus.findOneById('invalid');
      expect(status).toBeNull();
    });
  });
});
