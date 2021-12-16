//const util = require('util');
const gsheet = require('./gsheet.js');
// Docs: https://www.npmjs.com/package/memoizee
const memoize = require('memoizee');

const spreadsheetId = '1rIxLusw6S9E1nnGr4OuaziPmmXp2MYh2uetzZfVGoTo';

/**
@typedef {{
  id: string;
  date: string;
  rescuer: RescueUser;
  site: RescueSite;
}} Rescue

@typedef {{
  id: string;
  name: string;
}} RescueUser
*/

/** @typedef { import("../graphql-types").Site } RescueSite */

/**
 * @typedef {Object} SiteGroup
 * @property {string} groupName
 * @property {string} memberGroup
 * @property {number} bookLimit
 * @property {string[]} sites
 */

/**
 * @typedef {Object} MemberGroup
 * @property {string} name
 * @property {Record<string, 1>} members
 */

// If we call memoize() directly, typescript-jsdoc thinks that it returns {}.
// So we use this wrapper function, with enough JSDoc to help typescript see the right types.
//
// However, we have now switched to the memoizee package, which seems to return better types, so we might not need this function.
// Still it may have other uses (convenient passing of expireMs, central place for logging, ...) so let's keep using it.
/**
 * @template T
 * @template U
 * @param {(...fnArgs: T[]) => U} func The function to memoize
 * @param {number} [expireMs] Expiry time
 * @returns {(...fnArgs: T[]) => U} a memoized copy of the function
 */
function memoizeFunction(func, expireMs) {
  // @ts-ignore
  return memoize(func, { promise: true, maxAge: expireMs });
}

async function callAPI(obj, methodName, ...args) {
  // Explicit
  // I really wanted (string|undefined)[][], to force me to check a cell is defined before doing string operations on it
  // However JSDoc seems to ignore undefined and null.  false was the closest stand-in that achieves what I wanted (we can easily || it to solve concerns)
  /** @type {string[][] | false[][]} */
  const data = await new Promise((resolve, reject) => {
    console.log(`${isoDate()} (gsheet) >> Fetching ${obj.constructor.name}.${methodName}(${inspectOneLine(args)})`);
    obj[methodName](...args)
      .then(result => {
        console.log(`${isoDate()} (gsheet) << ${inspectOneLine(result.data).length}`);
        resolve(result.data.values);
      })
      .catch(error => {
        console.warn(
          `${isoDate()} (gsheet) !! Error while executing ${obj.constructor.name}.${methodName}(${inspectOneLine(
            args,
          )})`,
        );
        reject(error);
      });
  });
  return data;

  // Same thing, but using util.promisify
  /*
  // @ts-ignore
  const result = await util.promisify((...arguments) => obj[methodName](...arguments))(...args);
  return result.data.values;
	*/
}

function isoDate() {
  return new Date().toISOString();
}

function deepInspect(data) {
  return require('util').inspect(data, { showHidden: false, depth: null, colors: true });
}

function inspectOneLine(data) {
  return require('util').inspect(data, { showHidden: false, depth: 4, colors: true, breakLength: Infinity });
}

const standardCacheDuration = 15 * 1000;

const getAllSiteDataCached = memoizeFunction(getAllSiteDataUncached, standardCacheDuration);
const getGeneralDataCached = memoizeFunction(getGeneralDataUncached, standardCacheDuration);
const getAllUserDataCached = memoizeFunction(getAllUserDataUncached, standardCacheDuration);
const getAllRescueDataCached = memoizeFunction(getAllRescueDataUncached, standardCacheDuration);
const getSiteGroupsCached = memoizeFunction(getSiteGroupsUncached, standardCacheDuration);
const getMemberGroupsCached = memoizeFunction(getMemberGroupsUncached, standardCacheDuration);

async function getUserByCredentials(username, password) {
  const { allUsers } = await getAllUserDataCached();

  const userData = allUsers.find(u => u.name.toLowerCase() === username.toLowerCase());

  if (!userData) {
    console.warn(`No user found with name: ${username}`);
    return null;
  }

  // For now, if the password is empty/undefined, then we will just accept them for giving the correct username
  if (userData.passwordHash === password || !userData.passwordHash) {
    // User found

    // TODO: If the user provided a password, but no password is set, then we can set the one they provided!

    // The object we return will contain most of the user fields, but not the sensitive password data
    const user = JSON.parse(JSON.stringify(userData));
    delete user.passwordSalt;
    delete user.passwordHash;
    return user;
  } else {
    //throw new Error('Incorrect password');
    console.warn(`Incorrect password for: ${username}`);
    return null;
  }
}

async function getAllUserDataUncached() {
  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: 'NameRef' });

  const allUsers = [];
  const usersById = {};
  for (let rowIndex = 2; rowIndex < sheetData.length; rowIndex++) {
    const row = sheetData[rowIndex];
    const [name, telegramName, telegramUsername, email, role, notes, passwordSalt, passwordHash] = row;

    const id = name;

    const user = {
      id: id || 'NO_ID',
      name: name || 'Name Unknown',
      telegramName: telegramName || 'unknown',
      telegramUsername: telegramUsername || '@unknown',
      email: email || 'unknown@unknown.com',
      role: role || 'USER',
      notes,
      passwordSalt,
      passwordHash,
    };

    allUsers.push(user);
    usersById[id] = user;
  }

  return {
    allUsers,
    usersById,
  };
}

const siteCodeRegexp = /^[A-Z0-9]*/;
const memberGroupRegexp = /^M[0-9A-Za-z]*/;

// @type {() => Promise<Record<string, RescueSite>>} */
async function getAllSiteDataUncached() {
  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: 'Site Data' });

  const keys = sheetData[1].map(cell => {
    if (!cell) return cell;
    return cell.charAt(0).toLowerCase() + cell.slice(1);
  });

  /** @type {Record<string, RescueSite>} */
  const siteData = {};
  for (let rowIndex = 2; rowIndex < sheetData.length; rowIndex++) {
    const row = sheetData[rowIndex];
    /** @type RescueSite */
    const site = {};
    for (let colIndex = 0; colIndex < keys.length; colIndex++) {
      const key = keys[colIndex];
      const value = row[colIndex] || '';
      site[key] = value;
    }
    // Sanitisation
    site.fullName = site.fullName || site.id;
    siteData[site.id] = site;
  }

  return siteData;
}

async function getAllRescueDataUncached(month) {
  month = month || (await getCurrentBookingMonth());

  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: month });

  const sitesById = await getAllSiteDataCached();

  const siteRow = sheetData[0];
  //console.log('siteRow:', JSON.stringify(siteRow));
  const mapColumnToSite = {};
  const mapSiteToColumn = {};
  for (let colIndex = 2; colIndex < siteRow.length; colIndex++) {
    /** @type {string} */
    const cellData = siteRow[colIndex] || '';
    const siteName = (cellData.match(siteCodeRegexp) || [])[0];
    //console.log('siteName:', siteName);
    if (siteName) {
      mapColumnToSite[colIndex] = siteName;
      mapSiteToColumn[siteName] = colIndex;
    }
  }
  //console.log('mapColumnToSite:', JSON.stringify(mapColumnToSite));
  //console.log('mapSiteToColumn:', JSON.stringify(mapSiteToColumn));

  /** @type {Rescue[]} */
  const allRescues = [];
  /** @type {Record<string, Rescue[]>} */
  const rescuesByDate = {};
  /** @type {Record<string, Rescue[]>} */
  const rescuesByRescuer = {};
  const mapDateToRow = {};
  for (let rowIndex = 2; rowIndex < sheetData.length; rowIndex++) {
    const row = sheetData[rowIndex];
    //console.log('row:', JSON.stringify(row));
    //const date = new Date(`${row[0]} UTC+08:00`);
    const date = new Date(`${row[0]}`);
    const isRealDate = date.getTime() >= 0;
    // Skip the row if it isn't a real day
    if (!isRealDate) continue;
    //console.log('row:', JSON.stringify(row));

    const shortDate = shortDateString(date);
    mapDateToRow[shortDate] = rowIndex;

    for (let colIndex = 2; colIndex < siteRow.length; colIndex++) {
      const siteId = mapColumnToSite[colIndex];
      if (siteId) {
        const rescuerName = row[colIndex];
        const rescuerId = rescuerName || 'NO_ID';
        /** @type {RescueUser} */
        const rescuer = rescuerName
          ? {
              id: rescuerId,
              name: rescuerName,
            }
          : null;
        const rescueId = `${siteId}@${shortDate}`;

        /** @type {RescueSite} */
        const site = sitesById[siteId] || {
          id: siteId,
          fullName: siteId,
          geoLocation: 'unknown',
        };
        if (!sitesById[siteId]) {
          console.warn(`No site found with id: ${siteId}`);
        }

        /** @type {Rescue} */
        const rescue = {
          id: rescueId,
          date: shortDate,
          site: site,
          rescuer: rescuer || null,
        };
        allRescues.push(rescue);
        rescuesByDate[shortDate] = rescuesByDate[shortDate] || [];
        rescuesByDate[shortDate].push(rescue);
        if (rescuerId) {
          rescuesByRescuer[rescuerId] = rescuesByRescuer[rescuerId] || [];
          rescuesByRescuer[rescuerId].push(rescue);
        }
      }
    }
  }

  return {
    allRescues,
    rescuesByDate,
    rescuesByRescuer,
    mapSiteToColumn,
    mapDateToRow,
  };
}

async function getAllRescues(month) {
  const allRescueData = await getAllRescueDataCached(month);
  return allRescueData.allRescues;
}

async function getAllRescuesForUser(userId) {
  const allRescueData = await getAllRescueDataCached();
  return allRescueData.rescuesByRescuer[userId];
}

async function getGeneralDataUncached() {
  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: 'General' });

  const map = {};
  for (const row of sheetData) {
    const key = row[0];
    const value = row[1];
    if (!key) continue;
    map[key] = value;
  }

  console.log('map:', map);
  return map;
}

async function getCurrentBookingMonth() {
  const generalData = await getGeneralDataCached();
  console.log('generalData:', generalData);
  return generalData['Current Booking Month'];
}

/* This is what we show to users */
async function getCurrentBookingPhase() {
  const generalData = await getGeneralDataCached();
  return generalData['Current Booking Phase'];
}

/* This is what we use to look up the "Site Groups" and "Member Groups" sheets */
async function getCurrentBookingPhaseCode() {
  const generalData = await getGeneralDataCached();
  return generalData['Current Booking Phase Code'];
}

async function getSiteGroupsUncached(month, phaseCode) {
  month = month || (await getCurrentBookingMonth());
  phaseCode = phaseCode || (await getCurrentBookingPhaseCode());

  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: `Site Groups ${phaseCode}` });
  //console.log('sheetData:', sheetData);

  /** @type {Record<string, SiteGroup>} */
  const siteGroups = {};
  /** @type {Record<string, SiteGroup>} */
  const siteGroupForSite = {};
  const cols = sheetData[2].length;
  for (let colIndex = 1; colIndex < cols; colIndex++) {
    const groupName = sheetData[2][colIndex] || '';
    const memberGroup = sheetData[3][colIndex] || '';

    if (!groupName.match(/^G[0-9]+$/) /*|| !memberGroup.match(/^M[0-9]+$/)*/) {
      continue;
    }

    const bookLimit = Number(sheetData[4][colIndex] || 'NaN');

    const sites = sheetData
      .slice(5)
      .map(row => row[colIndex])
      .filter(cell => !!cell);

    /** @type SiteGroup */
    const siteGroup = {
      groupName,
      memberGroup,
      bookLimit,
      sites,
    };

    siteGroups[groupName] = siteGroup;

    for (const site of sites) {
      //siteGroupForSite[site] = groupName;
      siteGroupForSite[site] = siteGroup;
    }
  }

  return {
    siteGroups,
    siteGroupForSite,
  };
}

async function getMemberGroupsUncached(month, phaseCode) {
  month = month || (await getCurrentBookingMonth());
  phaseCode = phaseCode || (await getCurrentBookingPhaseCode());

  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: `Member Groups ${phaseCode}` });
  //console.log('sheetData:', sheetData);

  /** @type {Record<string, MemberGroup>} */
  const memberGroups = {};

  /** @type {Record<string, string[]>} */
  const memberGroupsByUser = {};

  const cols = sheetData[1].length;
  for (let colIndex = 1; colIndex < cols; colIndex++) {
    const memberGroupName = sheetData[1][colIndex] || '';
    if (memberGroupName.match(memberGroupRegexp)) {
      /** @type {Record<string, 1>} */
      const members = {};
      for (let rowIndex = 2; rowIndex < sheetData.length; rowIndex++) {
        const cell = sheetData[rowIndex][colIndex];
        if (cell && !cell.match(/^[*]/)) {
          const userId = cell;
          members[userId] = 1;
          //
          memberGroupsByUser[userId] = memberGroupsByUser[userId] || [];
          memberGroupsByUser[userId].push(memberGroupName);
        }
      }

      const memberGroup = {
        name: memberGroupName,
        members: members,
      };
      memberGroups[memberGroupName] = memberGroup;
    }
  }

  return {
    memberGroups,
    memberGroupsByUser,
  };
}

async function getAvailableRescuesForUser(userId) {
  const { siteGroups, siteGroupForSite } = await getSiteGroupsCached();
  const { memberGroups, memberGroupsByUser } = await getMemberGroupsCached();

  // NOTE: Errors like this get shown when jsconfig.json is configured, but without it they just appear as little dotted lines (hardly noticeable)
  //const siteGroup = siteGroups.siteGroupsForSite.siteGroupForSite['foo'];
  //const sg = siteGroupForSite.fluff.foo.siteGroupForSite['foo'];

  const rescuesForUser = await getAllRescuesForUser(userId);

  const rescuesBySiteGroup = {};
  for (const rescue of rescuesForUser) {
    const siteId = rescue.site.id;
    const siteGroup = siteGroupForSite[siteId];
    const siteGroupName = (siteGroup && siteGroup.groupName) || 'UNRESTRICTED';
    rescuesBySiteGroup[siteGroupName] = rescuesBySiteGroup[siteGroupName] || [];
    rescuesBySiteGroup[siteGroupName].push(rescue);
  }

  // Gather all available rescues, and categorise them by siteGroup
  const allRescues = await getAllRescues();
  const allUnbookedRescues = allRescues.filter(rescue => !rescue.rescuer);

  // For each unbooked rescue, get its siteGroup
  // 1. Check if the user is allowed to book that site
  // 2. Calculate how many remaining bookings the user is allowed for that siteGroup
  // 3. If > 0, or unrestriced, then return that as an available rescue

  const rescuesAvailableToUser = allUnbookedRescues.filter(rescue => {
    const siteCode = rescue.site.id;

    // Is this user even a member of that site?
    const siteGroup = siteGroupForSite[siteCode];
    if (!siteGroup) {
      // UNRESTRICTED site
      return true;
    }
    const memberGroup = memberGroups[siteGroup.memberGroup];
    //console.log('memberGroup:', memberGroup);
    const isMember = memberGroup && memberGroup.members[userId];
    //console.log('isMember:', isMember);
    if (!isMember) {
      return false;
    }

    const usersExistingBookingsForThisGroup = rescuesBySiteGroup[siteGroup.groupName];
    const countExisting = usersExistingBookingsForThisGroup ? usersExistingBookingsForThisGroup.length : 0;
    const remaining = siteGroup.bookLimit - countExisting;
    return remaining > 0;
  });

  return rescuesAvailableToUser;
}

const db = {
  //getGeneralDataCached,
  getUserByCredentials,
  //getAllUserDataCached,
  getAllRescues,
  getAllRescuesForUser,
  getCurrentBookingPhase,
  //getSiteGroups: getSiteGroupsCached,
  //getSiteMembers: getSiteMembersCached,
  getAvailableRescuesForUser,
};

function shortDateString(date) {
  date = date || new Date();
  return date.getFullYear() + '/' + padLeft(date.getMonth() + 1, 2, '0') + '/' + padLeft(date.getDate(), 2, '0');
}

function padLeft(str, len, padChar) {
  padChar = padChar || ' ';
  str = '' + str;
  while (str.length < len) {
    str = padChar + str;
  }
  return str;
}

module.exports = db;
