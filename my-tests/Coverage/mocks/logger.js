class Logger {
  constructor(name) {
    this.name = name;
  }
  
  debug(message) {}
  info(message) {}
  warn(message) {}
  error(message) {}
}

module.exports = { Logger };
