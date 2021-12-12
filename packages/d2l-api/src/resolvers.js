const db = require('./db-gsheet/db.js');

// To add authorization, e.g. some routes only for ADMINs, consider using an ifAdmin() wrapper
// Example using authenticated() and validateRole(): https://the-guild.dev/blog/graphql-modules-auth

// The root provides a resolver function for each API endpoint
const root = {
  async logIn(args, request) {
    //await new Promise(resolve => setTimeout(resolve, 1000));

    if (!args.username) {
      // Message does not get passed to caller, only status 500
      //throw new Error('Please provide a username');
      return { success: false, reason: 'Please provide a username' };
    }

    const user = await db.getUserByCredentials(args.username, args.password);
    console.log('user:', user);

    if (!user) {
      return { success: false, reason: 'No user found with that username and password' };
    }

    request.session.user = user;

    return { success: true };
  },

  async me(args, request) {
    //await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('request.session.user:', request.session.user);
    return request.session.user;
  },

  async rescues() {
    return (await db.getAllRescues()).allRescues;
  },

  async allRescuesForMonth(args) {
    return (await db.getAllRescues(args.month)).allRescues;
  },

  async myRescues(args, request) {
    const rescuerId = request.session.user.id;
    return (await db.getAllRescues()).rescuesByRescuer[rescuerId];
  },
};

module.exports = root;
