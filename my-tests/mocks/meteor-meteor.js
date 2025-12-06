class MeteorError extends Error {
  constructor(error, reason, details) {
    super(reason);
    this.error = error;
    this.reason = reason;
    this.details = details;
  }
}

module.exports = {
  Meteor: { Error: MeteorError }
};
