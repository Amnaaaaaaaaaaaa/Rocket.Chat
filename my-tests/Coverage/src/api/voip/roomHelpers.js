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
  
  if (start > end) {
    throw new Error('Start date cannot be after end date');
  }
  
  return { start, end };
}

function isRoomSearchProps(params) {
  return params && (params.roomId || params.roomName);
}

function isRoomCreationProps(params) {
  return params && params.name && params.type;
}

module.exports = { validateDateParams, isRoomSearchProps, isRoomCreationProps };
