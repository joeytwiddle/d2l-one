const db = require('./db-gsheet/db.js');

// The root provides a resolver function for each API endpoint
const root = {
  async logIn(args, request) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return null;
  },

  async me(args, request) {
    console.log('request.session:', request.session);
    //console.log('arguments:', arguments);
    //await new Promise(resolve => setTimeout(resolve, 5000));
    return null;
    return { id: 'NONE', name: 'NO_USER' };
    return {
      id: 'User1',
      name: 'Your Name',
    };
  },

  async rescues() {
    return (await db.getAllRescues()).allRescues;
  },

  async allRescuesForMonth(args) {
    return (await db.getAllRescues(args.month)).allRescues;
  },
};

module.exports = root;
