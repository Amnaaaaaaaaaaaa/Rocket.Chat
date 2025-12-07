const UserStatus = {
  OFFLINE: 0,
  ONLINE: 1,
  AWAY: 2,
  BUSY: 3,
  DISABLED: 4
};

const STATUS_MAP = [
  UserStatus.OFFLINE,
  UserStatus.ONLINE,
  UserStatus.AWAY,
  UserStatus.BUSY,
  UserStatus.DISABLED
];

function getStatusByIndex(index) {
  return STATUS_MAP[index];
}

function getStatusIndex(status) {
  return STATUS_MAP.indexOf(status);
}

function isValidStatus(status) {
  return STATUS_MAP.includes(status);
}

function getAllStatuses() {
  return [...STATUS_MAP];
}

module.exports = {
  UserStatus,
  STATUS_MAP,
  getStatusByIndex,
  getStatusIndex,
  isValidStatus,
  getAllStatuses
};
