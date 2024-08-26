// index.js
import '@cypress/code-coverage/support';
const customCommands = require('./commands.js');

module.exports = {
  commands: customCommands,
};
