const Meteor = {
  Error: class extends Error {
    constructor(error, reason) {
      super(reason);
      this.error = error;
      this.reason = reason;
    }
  }
};

module.exports = { Meteor };
