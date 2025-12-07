function parseDateParams(dateString) {
  return {};
}

function validateDateParams(fieldName, dates) {
  return {};
}

function parseAndValidate(fieldName, dateString) {
  return {};
}

function isRoomSearchProps(props) {
  return {};
}

function isRoomCreationProps(props) {
  return {};
}

async function findVoipRoom(token, rid) {
  return { success: true };
}

async function closeVoipRoom(visitor, room, user, comment, data) {
  return { success: true };
}

module.exports = {
  parseDateParams,
  validateDateParams,
  parseAndValidate,
  isRoomSearchProps,
  isRoomCreationProps,
  findVoipRoom,
  closeVoipRoom
};
