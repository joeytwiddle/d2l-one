const db = require('./db-gsheet/db.js');

// The root provides a resolver function for each API endpoint
const root = {
  logIn: ifAny(async (args, request) => {
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
  }),

  me: ifAny(async (args, request) => {
    //await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('request.session.user:', request.session.user);
    return request.session.user;
  }),

  myRescues: ifUser(async (args, request) => {
    const userId = request.session.user.id;
    return await db.getAllRescuesForUser(userId);
  }),

  availableRescues: ifUser(async (args, request) => {
    const userId = request.session.user.id;
    return await db.getAvailableRescuesForUser(userId);
  }),

  rescues: ifUser(async () => {
    return await db.getAllRescues();
  }),

  allRescuesForMonth: ifUser(async args => {
    return await db.getAllRescues(args.month);
  }),

  allSites: ifUser(async args => {
    return Object.values(await db.getAllSiteData());
  }),

  siteGroupsForCurrentUser: ifUser(async (args, request) => {
    const userId = request.session.user.id;
    return Object.values(await db.getSiteGroupsForUser(userId));
  }),

  availableRescuesForCurrentUser: ifUser(async (args, request) => {
    return await db.getAvailableRescuesForUser(request.session.user.id);
  }),

  assignSelfToRescue: ifUser(async (args, request) => {
    return await db.assignUserToRescue(undefined, request.session.user.id, args.rescueId);
  }),

  unassignSelfFromRescue: ifUser(async (args, request) => {
    return await db.unassignUserFromRescue(undefined, request.session.user.id, args.rescueId);
  }),
};

module.exports = root;

// Our authorization approach is loosely based on authenticated() and validateRole() from https://the-guild.dev/blog/graphql-modules-auth

function ifAny(resolver) {
  return (args, request, context, info) => {
    return resolver(args, request, context, info);
  };
}

function ifUser(resolver) {
  return (args, request, context, info) => {
    if (!request.session.user) {
      throw new Error('Not logged in');
    }

    return resolver(args, request, context, info);
  };
}

function ifAdmin(resolver) {
  return (args, request, context, info) => {
    if (!request.session.user) {
      throw new Error('Not logged in');
    }

    if (request.session.user.role !== 'ADMIN') {
      throw new Error('Requires admin role');
    }

    return resolver(args, request, context, info);
  };
}
