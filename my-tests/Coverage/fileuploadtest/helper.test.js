const URL = require('url');

// Functions under test
function forceDownload(req) {
  const { query } = URL.parse(req.url || '', true);
  const forceDownload = typeof query.download !== 'undefined';
  if (forceDownload) {
    return true;
  }
  return query.contentDisposition === 'attachment';
}

function getContentDisposition(req) {
  const { query } = URL.parse(req.url || '', true);
  if (query.contentDisposition === 'inline') {
    return 'inline';
  }
  return 'attachment';
}

describe('Helper Functions - White-Box Testing', () => {
  
  // forceDownload tests
  test('TC-HELP-001: should return true if download query exists', () => {
    const req = { url: 'http://test.com?download' };
    expect(forceDownload(req)).toBe(true);
  });

  test('TC-HELP-002: should return true if contentDisposition=attachment', () => {
    const req = { url: 'http://test.com?contentDisposition=attachment' };
    expect(forceDownload(req)).toBe(true);
  });

  test('TC-HELP-003: should return false if no download query', () => {
    const req = { url: 'http://test.com' };
    expect(forceDownload(req)).toBe(false);
  });

  test('TC-HELP-004: should handle empty URL', () => {
    const req = { url: '' };
    expect(forceDownload(req)).toBe(false);
  });

  test('TC-HELP-005: should handle undefined URL', () => {
    const req = {};
    expect(forceDownload(req)).toBe(false);
  });

  // getContentDisposition tests
  test('TC-HELP-006: should return inline if contentDisposition=inline', () => {
    const req = { url: 'http://test.com?contentDisposition=inline' };
    expect(getContentDisposition(req)).toBe('inline');
  });

  test('TC-HELP-007: should return attachment by default', () => {
    const req = { url: 'http://test.com' };
    expect(getContentDisposition(req)).toBe('attachment');
  });

  test('TC-HELP-008: should return attachment for empty URL', () => {
    const req = { url: '' };
    expect(getContentDisposition(req)).toBe('attachment');
  });

  test('TC-HELP-009: should handle contentDisposition=attachment', () => {
    const req = { url: 'http://test.com?contentDisposition=attachment' };
    expect(getContentDisposition(req)).toBe('attachment');
  });

  test('TC-HELP-010: should handle multiple query parameters', () => {
    const req = { url: 'http://test.com?foo=bar&contentDisposition=inline' };
    expect(getContentDisposition(req)).toBe('inline');
  });
});
