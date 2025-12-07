function parseDateParams(dateString) {
  if (typeof dateString !== 'string') return {};
  try {
    return JSON.parse(dateString);
  } catch {
    return {};
  }
}

function validateDateParams(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new Error('Start date and end date are required');
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date');
  }
  
  if (isNaN(end.getTime())) {
    throw new Error('Invalid end date');
  }
  
  return { start: startDate, end: endDate };
}

function parseAndValidate(fieldName, dateString) {
  const parsed = parseDateParams(dateString);
  return parsed;
}

function isRoomSearchProps(props) {
  return !!(props.rid && props.token);
}

function isRoomCreationProps(props) {
  return !!(props.agentId && props.direction);
}

module.exports = {
  parseDateParams,
  validateDateParams,
  parseAndValidate,
  isRoomSearchProps,
  isRoomCreationProps
};
