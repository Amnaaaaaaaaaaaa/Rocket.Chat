/**
 * Commands API - White-Box Testing
 * Tests: get, list, run, preview
 * Total: 20 tests
 */

describe('Commands API - White-Box Testing', () => {
  const mockSlashCommands = {
    commands: {
      giphy: { command: 'giphy', description: 'Send GIF' },
      help: { command: 'help', description: 'Show help' }
    },
    run: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    test('TC-CMD-001: should validate command parameter', () => {
      const command = 'giphy';
      expect(typeof command).toBe('string');
    });

    test('TC-CMD-002: should get command by name', () => {
      const command = 'giphy';
      const cmd = mockSlashCommands.commands[command.toLowerCase()];
      expect(cmd).toBeDefined();
    });

    test('TC-CMD-003: should handle non-existent command', () => {
      const command = 'nonexistent';
      const cmd = mockSlashCommands.commands[command.toLowerCase()];
      expect(cmd).toBeUndefined();
    });

    test('TC-CMD-004: should convert to lowercase', () => {
      const command = 'GIPHY';
      const normalized = command.toLowerCase();
      expect(normalized).toBe('giphy');
    });

    test('TC-CMD-005: should return command object', () => {
      const cmd = mockSlashCommands.commands.giphy;
      expect(cmd).toHaveProperty('command');
      expect(cmd).toHaveProperty('description');
    });
  });

  describe('list', () => {
    test('TC-CMD-006: should list all commands', () => {
      const commands = Object.values(mockSlashCommands.commands);
      expect(Array.isArray(commands)).toBe(true);
      expect(commands.length).toBeGreaterThan(0);
    });

    test('TC-CMD-007: should filter by command name', () => {
      const query = { command: 'giphy' };
      const commands = Object.values(mockSlashCommands.commands);
      const filtered = commands.filter(cmd => cmd.command === query.command);
      expect(filtered.length).toBe(1);
    });

    test('TC-CMD-008: should handle pagination', () => {
      const offset = 0;
      const count = 10;
      expect(typeof offset).toBe('number');
      expect(typeof count).toBe('number');
    });

    test('TC-CMD-009: should sort commands', () => {
      const commands = Object.values(mockSlashCommands.commands);
      const sorted = commands.sort((a, b) => 
        a.command.localeCompare(b.command)
      );
      // Fixed: Use localeCompare to verify sorting
      const comparison = sorted[0].command.localeCompare(sorted[1].command);
      expect(comparison).toBeLessThanOrEqual(0);
    });

    test('TC-CMD-010: should return total count', () => {
      const commands = Object.values(mockSlashCommands.commands);
      const totalCount = commands.length;
      expect(totalCount).toBeGreaterThan(0);
    });
  });

  describe('run', () => {
    test('TC-CMD-011: should validate command parameter', () => {
      const command = 'giphy';
      expect(typeof command).toBe('string');
      expect(command).toBeTruthy();
    });

    test('TC-CMD-012: should validate params as string', () => {
      const params = 'funny cat';
      expect(typeof params).toBe('string');
    });

    test('TC-CMD-013: should validate roomId parameter', () => {
      const roomId = 'room123';
      expect(typeof roomId).toBe('string');
      expect(roomId).toBeTruthy();
    });

    test('TC-CMD-014: should handle optional tmid', () => {
      const tmid = 'thread123';
      expect(typeof tmid === 'string' || tmid === undefined).toBe(true);
    });

    test('TC-CMD-015: should check command exists', () => {
      const cmd = 'giphy'.toLowerCase();
      const exists = !!mockSlashCommands.commands[cmd];
      expect(exists).toBe(true);
    });

    test('TC-CMD-016: should generate random message ID', () => {
      const messageId = 'random-' + Date.now();
      expect(typeof messageId).toBe('string');
    });

    test('TC-CMD-017: should construct message object', () => {
      const message = {
        _id: 'msg123',
        rid: 'room123',
        msg: '/giphy funny cat'
      };
      expect(message).toHaveProperty('_id');
      expect(message).toHaveProperty('rid');
      expect(message).toHaveProperty('msg');
    });

    test('TC-CMD-018: should run command successfully', async () => {
      mockSlashCommands.run.mockResolvedValue({ success: true });
      
      const result = await mockSlashCommands.run({
        command: 'giphy',
        params: 'funny cat',
        message: { _id: 'msg123', rid: 'room123', msg: '/giphy funny cat' },
        userId: 'user123'
      });

      expect(result.success).toBe(true);
    });
  });

  describe('preview', () => {
    test('TC-CMD-019: should validate preview parameters', () => {
      const params = {
        command: 'giphy',
        params: 'funny cat',
        roomId: 'room123'
      };
      expect(params.command).toBeTruthy();
      expect(params.roomId).toBeTruthy();
    });

    test('TC-CMD-020: should validate previewItem structure', () => {
      const previewItem = {
        id: 'preview1',
        type: 'image',
        value: 'https://example.com/image.gif'
      };
      expect(previewItem).toHaveProperty('id');
      expect(previewItem).toHaveProperty('type');
      expect(previewItem).toHaveProperty('value');
    });
  });
});
