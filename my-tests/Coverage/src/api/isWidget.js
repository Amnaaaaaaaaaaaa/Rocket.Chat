function isWidget(headers) {
  const cookie = headers.get ? headers.get('cookie') : headers.cookie;
  if (!cookie) return false;
  
  const cookies = cookie.split(';').reduce((acc, c) => {
    const [key, value] = c.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return cookies.rc_room_type === 'l' && cookies.rc_is_widget === 't';
}

module.exports = { isWidget };
