const db = require('./db-gsheet/db.js');

// The root provides a resolver function for each API endpoint
const root = {
  async logIn(args, request) {
    //await new Promise(resolve => setTimeout(resolve, 1000));

    if (!args.username) {
      // Message does not get passed to caller, only status 500
      //throw new Error('Please provide a username');
      return {
        success: false,
        reason: 'Please provide a username',
      };
    }

    if (Math.random() < 0.2) {
      return {
        success: false,
        reason: 'Username or password not recognised. Please try again.',
      };
    }

    // TODO: We should check with gsheets, whether this user exists

    request.session.user = {
      id: args.username,
      name: args.username,
      // TODO: Should be more fields here really
    };

    return {
      success: true,
    };
  },

  async me(args, request) {
    //console.log('request.session:', request.session);
    //console.log('arguments:', arguments);
    //await new Promise(resolve => setTimeout(resolve, 5000));
    return request.session.user;
  },

  async rescues() {
    return (await db.getAllRescues()).allRescues;
  },

  async allRescuesForMonth(args) {
    return (await db.getAllRescues(args.month)).allRescues;
  },
};

module.exports = root;
