const db = require('./db-gsheet/db.js');

// The root provides a resolver function for each API endpoint
var root = {
  async me() {
    //console.log('arguments:', arguments);
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {
      id: 'User1',
      name: 'Your Name',
    };
  },

  async rescues() {
    return await db.getAllRescues();
  },
};

module.exports = root;
