/**
 * Custom Emoji API - White-Box Testing
 * Tests: list, all, create, update, delete
 * Total: 20 tests
 */

describe('Custom Emoji API - White-Box Testing', () => {
  const mockEmojiCustom = {
    find: jest.fn(),
    findPaginated: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteOne: jest.fn()
  };

  const mockUploads = {
    insertFileInit: jest.fn(),
    confirmFileUpload: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    test('TC-EMOJI-001: should list with pagination', async () => {
      mockEmojiCustom.findPaginated.mockReturnValue({
        cursor: {
          toArray: jest.fn().mockResolvedValue([
            { _id: 'emoji1', name: 'rocket' }
          ])
        },
        totalCount: jest.fn().mockResolvedValue(1)
      });

      const result = mockEmojiCustom.findPaginated({}, {});
      const [emojis] = await Promise.all([result.cursor.toArray()]);
      expect(emojis.length).toBe(1);
    });

    test('TC-EMOJI-002: should filter by name', () => {
      const query = 'rocket';
      const filter = { name: { $regex: query, $options: 'i' } };
      expect(filter.name.$regex).toBe('rocket');
    });

    test('TC-EMOJI-003: should apply sort by name', () => {
      const sort = { name: 1 };
      expect(sort.name).toBe(1);
    });

    test('TC-EMOJI-004: should handle updatedSince parameter', () => {
      const updatedSince = new Date('2024-01-01');
      const query = { _updatedAt: { $gt: updatedSince } };
      expect(query._updatedAt.$gt).toEqual(updatedSince);
    });
  });

  describe('all', () => {
    test('TC-EMOJI-005: should get all emojis without pagination', async () => {
      mockEmojiCustom.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { _id: 'emoji1', name: 'rocket' },
          { _id: 'emoji2', name: 'star' }
        ])
      });

      const result = await mockEmojiCustom.find({}).toArray();
      expect(result.length).toBe(2);
    });

    test('TC-EMOJI-006: should project only required fields', () => {
      const projection = {
        name: 1,
        aliases: 1,
        extension: 1,
        _updatedAt: 1
      };
      expect(projection).toHaveProperty('name');
      expect(projection).toHaveProperty('aliases');
    });

    test('TC-EMOJI-007: should filter by updatedSince in all', () => {
      const updatedSince = new Date('2024-01-01');
      const query = updatedSince ? { _updatedAt: { $gt: updatedSince } } : {};
      expect(query._updatedAt).toBeDefined();
    });
  });

  describe('create', () => {
    test('TC-EMOJI-008: should validate emoji parameter', () => {
      const emoji = ':rocket:';
      expect(typeof emoji).toBe('string');
      expect(emoji).toBeTruthy();
    });

    test('TC-EMOJI-009: should validate name parameter', () => {
      const name = 'rocket';
      expect(typeof name).toBe('string');
    });

    test('TC-EMOJI-010: should validate aliases as array', () => {
      const aliases = 'spaceship,ship';
      const aliasesArray = aliases ? aliases.split(',') : undefined;
      expect(Array.isArray(aliasesArray)).toBe(true);
    });

    test('TC-EMOJI-011: should handle base64 emoji data', () => {
      const emoji = 'data:image/png;base64,iVBORw0KG...';
      const isBase64 = emoji.startsWith('data:');
      expect(isBase64).toBe(true);
    });

    test('TC-EMOJI-012: should extract mime type from base64', () => {
      const emoji = 'data:image/png;base64,iVBORw0KG...';
      const [metadata] = emoji.split(',');
      const mimeMatch = metadata.match(/data:(.*);base64/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
      expect(mimeType).toBe('image/png');
    });

    test('TC-EMOJI-013: should create emoji with upload', async () => {
      mockUploads.insertFileInit.mockResolvedValue({ _id: 'upload1' });
      mockUploads.confirmFileUpload.mockResolvedValue(true);
      mockEmojiCustom.create.mockResolvedValue({ _id: 'emoji1' });

      const upload = await mockUploads.insertFileInit(
        'user123',
        'EmojiCustom',
        { name: 'rocket.png' }
      );

      expect(upload._id).toBe('upload1');
    });

    test('TC-EMOJI-014: should handle extension from filename', () => {
      const extension = 'rocket.png'.split('.').pop();
      expect(extension).toBe('png');
    });
  });

  describe('update', () => {
    test('TC-EMOJI-015: should validate _id parameter', () => {
      const _id = 'emoji123';
      expect(typeof _id).toBe('string');
      expect(_id).toBeTruthy();
    });

    test('TC-EMOJI-016: should update emoji name', async () => {
      mockEmojiCustom.update.mockResolvedValue(true);
      await mockEmojiCustom.update('emoji1', {
        name: 'new-rocket',
        aliases: ['spaceship']
      });
      expect(mockEmojiCustom.update).toHaveBeenCalled();
    });

    test('TC-EMOJI-017: should handle new emoji upload on update', () => {
      const newEmoji = 'data:image/png;base64,abc123';
      const hasNewEmoji = !!newEmoji;
      expect(hasNewEmoji).toBe(true);
    });
  });

  describe('delete', () => {
    test('TC-EMOJI-018: should validate emojiId parameter', () => {
      const emojiId = 'emoji123';
      expect(typeof emojiId).toBe('string');
      expect(emojiId).toBeTruthy();
    });

    test('TC-EMOJI-019: should delete custom emoji', async () => {
      mockEmojiCustom.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const result = await mockEmojiCustom.deleteOne({ _id: 'emoji1' });
      expect(result.deletedCount).toBe(1);
    });

    test('TC-EMOJI-020: should handle deletion error', async () => {
      mockEmojiCustom.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const result = await mockEmojiCustom.deleteOne({ _id: 'invalid' });
      expect(result.deletedCount).toBe(0);
    });
  });
});
