//const util = require('util');
const gsheet = require('./gsheet.js');
// Docs: https://www.npmjs.com/package/memoizee
const memoize = require('memoizee');
const { isoDate, inspectOneLine, shortDateString, deepInspect } = require('../lib/util.js');

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
    const startTime = Date.now();
    obj[methodName](...args)
      .then(result => {
        const endTime = Date.now();
        const secondsTaken = (endTime - startTime) / 1000;
        const secondsString = secondsTaken.toLocaleString(undefined, { maximumFractionDigits: 1 });
        console.log(`${isoDate()} (gsheet) << ${inspectOneLine(result.data).length} bytes in ${secondsString} seconds`);
        resolve(result.data.values || result.data.sheets);
      })
      .catch(error => {
        console.warn(
          `${isoDate()} (gsheet) !! Error while executing ${obj.constructor.name}.${methodName}(${inspectOneLine(
            args,
          )})`,
        );
        const errorObject = (error.response.data || {}).error;
        console.error('error.response.data.error:', deepInspect(errorObject));
        // In the case of an invalid token, Axios produces a huge error with lots of details we don't need.
        // So if we detect that situation, we will produce a much smaller error, to focus on the developer's needs.
        if (String(error).match(/(invalid_grant|The request is missing a valid API key)/)) {
          reject(
            new Error(
              'Your Google API token has expired. Please delete google-api-token.json, restart the API server, open the link shown in the console, and finally paste the authorization code into this window.',
            ),
          );
        }
        if (String(error).match(/The caller does not have permission/)) {
          reject(
            new Error(
              'The caller does not have permission. Please ensure the spreadsheet has been shared with the client_email in service-provider-credentials.json',
            ),
          );
        }
        // If we reject(error) then it logs a huge response object.  We may be able to focus on something more important.
        if (errorObject && typeof errorObject.message === 'string') {
          reject(new Error(errorObject.message));
        }
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

const oneMinute = 60 * 1000;
const standardCacheDuration = 15 * 1000;
//const standardCacheDuration = 3 * 1000;

const getAllSiteDataCached = memoizeFunction(getAllSiteDataUncached, standardCacheDuration);
const getGeneralDataCached = memoizeFunction(getGeneralDataUncached, standardCacheDuration);
const getAllUserDataCached = memoizeFunction(getAllUserDataUncached, standardCacheDuration);
const getAllRescueDataCached = memoizeFunction(getAllRescueDataUncached, standardCacheDuration);
const getSiteGroupsCached = memoizeFunction(getSiteGroupsUncached, standardCacheDuration);
const getMemberGroupsCached = memoizeFunction(getMemberGroupsUncached, standardCacheDuration);
const getFormattedSpreadsheetCached = memoizeFunction(getFormattedSpreadsheetUncached, 30 * oneMinute);

// Because the formatting data is so slow to fetch, we will automatically refresh the cache when it expires
setTimeout(() => {
  const _ = getFormattedSpreadsheetCached();
}, 30.2 * oneMinute);

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

/**
 * @param {string} sheetName
 */
async function getFormattedSpreadsheetUncached(sheetName) {
  /** @type any */
  const formatData = await callAPI(gsheet.spreadsheets(), 'get', {
    spreadsheetId,
    includeGridData: true,
    ranges: sheetName,
  });
  //console.log('formatData:', formatData);
  const targetSheet = formatData.find(sheet => sheet.properties.title === sheetName);
  if (!targetSheet) {
    throw new Error(`Could not find targetSheet: ${sheetName}`);
  }
  //console.log('relevant.data[0].rowMetadata:', relevant.data[0].rowMetadata);
  //console.log('relevant.data[0].columnMetadata:', relevant.data[0].columnMetadata);
  //console.log('relevant.properties.gridData:', relevant.properties.gridData);
  //console.log('relevant.merges:', relevant.merges);
  //console.log('relevant.data[0].rowData[6].values[19]:', targetSheet.data[0].rowData[6].values[19]);
  /*
  relevant.data[0].rowData[6].values[12]: {
    userEnteredValue: { stringValue: 'Sandra Tan' },
    effectiveValue: { stringValue: 'Sandra Tan' },
    formattedValue: 'Sandra Tan',
    userEnteredFormat: {
      backgroundColor: { red: 1, green: 1, blue: 1 },
      horizontalAlignment: 'CENTER',
      verticalAlignment: 'BOTTOM',
      textFormat: { fontFamily: 'Arial' },
      backgroundColorStyle: { rgbColor: [Object] }
    },
    effectiveFormat: {
      backgroundColor: { red: 1, green: 1, blue: 1 },
      padding: { top: 2, right: 3, bottom: 2, left: 3 },
      horizontalAlignment: 'CENTER',
      verticalAlignment: 'BOTTOM',
      wrapStrategy: 'OVERFLOW_CELL',
      textFormat: {
        foregroundColor: {},
        fontFamily: 'Arial',
        fontSize: 10,
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        foregroundColorStyle: [Object]
      },
      hyperlinkDisplayType: 'PLAIN_TEXT',
      backgroundColorStyle: { rgbColor: [Object] }
    }
  }
  */
  return targetSheet;
}

async function getAllRescueDataUncached(month) {
  month = month || (await getCurrentBookingMonth());

  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: month });

  const formatData = await getFormattedSpreadsheetCached(month);

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
    const dateStr = String(row[0]);
    // dateStr appears to us as: "Thu 9 Dec"
    const looksLikeDate = dateStr.match(/^[A-Z][a-z][a-z] [0-9]+ [A-Z][a-z][a-z]$/);
    if (!looksLikeDate) continue;
    const date = getDateFromString(dateStr);
    const isRealDate = date.getTime() >= 0;
    // Skip the row if it didn't parse into a real date
    if (!isRealDate) continue;

    const shortDate = shortDateString(date);
    mapDateToRow[shortDate] = rowIndex;

    for (let colIndex = 2; colIndex < siteRow.length; colIndex++) {
      const siteId = mapColumnToSite[colIndex];
      if (siteId) {
        const rescueId = `${siteId}@${shortDate}`;
        const cellData = row[colIndex];

        // Skip cells which have been marked as unavailable, or greyed out
        if (cellData === 'XXX') {
          continue;
        }
        const cellBackgroundColor =
          formatData.data[0].rowData[rowIndex]?.values[colIndex]?.userEnteredFormat?.backgroundColor;
        if (cellBackgroundColor) {
          const { red, green, blue } = cellBackgroundColor;
          //if (siteId === 'KA' || siteId === 'PL') {
          //  console.log('cellBackgroundColor:', cellBackgroundColor);
          //}
          // Cells with a black background have no data: cellBackgroundColor = {}
          const cellIsGreyOrBlack =
            (green === red && blue === red && red < 1) ||
            (red === undefined && blue === undefined && green === undefined);
          if (cellIsGreyOrBlack) {
            //console.log(`Skipping ${rescueId} ${colIndex} x ${rowIndex}`);
            continue;
          }
        }

        const rescuerId = cellData;
        const rescuerName = rescuerId;
        /** @type {RescueUser} */
        const rescuer = rescuerName
          ? {
              id: rescuerId,
              name: rescuerName,
            }
          : null;

        if (!sitesById[siteId]) {
          //console.warn(`No site found with id: ${siteId}`);
        }
        /** @type {RescueSite} */
        const site = sitesById[siteId] || {
          id: siteId,
          fullName: siteId,
          geoLocation: 'unknown',
        };

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

function getDateFromString(dateStr) {
  // Takes a string of the form "Thu 9 Dec"
  // If we drop this straight into `new Date()` then it will get the wrong year: 2001
  // So we will first guess the appropriate year (based on today's date), and use that to create the final date object
  const weAreAtTheEndOfTheYear = new Date().getMonth() + 1 >= 9;
  const dateWithWrongYear = new Date(`${dateStr} 2000`);
  const thatDateIsAtTheStartOfTheYear = dateWithWrongYear.getMonth() + 1 <= 4;
  const thatDateIsProbablyNextYear = weAreAtTheEndOfTheYear && thatDateIsAtTheStartOfTheYear;
  const thisYear = new Date().getFullYear();
  const yearProbablyIntended = thatDateIsProbablyNextYear ? thisYear + 1 : thisYear;
  return new Date(`${dateStr} ${yearProbablyIntended}`);
}

async function getAllRescues(month) {
  const allRescueData = await getAllRescueDataCached(month);
  return allRescueData.allRescues;
}

async function getAllRescuesForUser(userId) {
  const allRescueData = await getAllRescueDataCached();
  return allRescueData.rescuesByRescuer[userId] || [];
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

/** @type {() => Promise<string>} */
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

async function getCurrentSiteGroupsSheet() {
  const generalData = await getGeneralDataCached();
  return generalData['Current Site Groups Sheet'];
}

async function getCurrentMemberGroupsSheet() {
  const generalData = await getGeneralDataCached();
  return generalData['Current Member Groups Sheet'];
}

async function getSiteGroupsUncached(month, siteGroupsSheet) {
  month = month || (await getCurrentBookingMonth());
  siteGroupsSheet = siteGroupsSheet || (await getCurrentSiteGroupsSheet());

  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: siteGroupsSheet });
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

/**
 * @type {(month: string, memberGroupSheet: string) => Promise<{
 *   memberGroups: Record<string, MemberGroup>;
 *   memberGroupsByUser: Record<string, string[]>;
 * }>}
 */
async function getMemberGroupsUncached(month, memberGroupsSheet) {
  month = month || (await getCurrentBookingMonth());
  memberGroupsSheet = memberGroupsSheet || (await getCurrentMemberGroupsSheet());

  const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: memberGroupsSheet });
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

async function getSiteGroupsForUser(userId) {
  const { siteGroups, siteGroupForSite } = await getSiteGroupsCached();
  const { memberGroups, memberGroupsByUser } = await getMemberGroupsCached();

  const availableSiteGroups = objectFromEntries(
    Object.entries(siteGroups).filter(([siteGroupName, siteGroupData]) => {
      const memberGroup = memberGroups[siteGroupData.memberGroup];
      const isMember = memberGroup && memberGroup.members[userId];
      return isMember;
    }),
  );

  // Since GraphQL can't pass dictionaries, you may need to do Object.values() on this
  return availableSiteGroups;
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

async function assignUserToRescue(month, userId, rescueId) {
  month = month || (await getCurrentBookingMonth());

  const rescueData = await getAllRescueDataUncached(month);

  const existingRescue = rescueData.allRescues.find(rescue => rescue.id === rescueId);
  if (!existingRescue) {
    throw new Error(`That rescue does not exist for month '${month}'`);
  }
  if (existingRescue.rescuer && existingRescue.rescuer.id !== userId) {
    throw new Error(`Rescue ${rescueId} is already booked by another user!`);
  }

  const rescuesAvailableToUser = await getAvailableRescuesForUser(userId);
  const rescueInAvailList = rescuesAvailableToUser.find(rescue => rescue.id === rescueId);
  if (!rescueInAvailList) {
    throw new Error(
      `Rescue ${rescueId} is not available to you (perhaps you reached your booking limit for this group?)`,
    );
  }

  const [siteId, date] = rescueId.split('@');
  console.log('siteId:', siteId);
  console.log('date:', date);
  const rowIndex = rescueData.mapDateToRow[date];
  const colIndex = rescueData.mapSiteToColumn[siteId];
  // TODO: Sanity check
  console.log('rowIndex:', rowIndex);
  console.log('colIndex:', colIndex);

  const response = await callAPI(gsheet.values(), 'update', {
    spreadsheetId,
    range: `${month}!R${rowIndex + 1}C${colIndex + 1}`,
    valueInputOption: 'RAW', // 'USER_ENTERED',
    resource: { values: [[userId]] },
  });

  // @ts-ignore We could fix this
  await getAllRescueDataCached.clear();
  // TODO: Any more to clear?  Make a convenience function.

  const newRescueData = await getAllRescueDataCached();
  const rescueNow = rescueData.allRescues.find(rescue => rescue.id === rescueId);
  console.log('rescueNow:', rescueNow);
  return rescueNow;
}

async function unassignUserFromRescue(month, userId, rescueId) {
  month = month || (await getCurrentBookingMonth());

  const rescueData = await getAllRescueDataUncached(month);

  const existingRescue = rescueData.allRescues.find(rescue => rescue.id === rescueId);
  if (!existingRescue) {
    throw new Error(`That rescue does not exist for month '${month}'`);
  }
  if (!existingRescue.rescuer) {
    throw new Error(`Rescue ${rescueId} is not booked!`);
  }
  if (existingRescue.rescuer && existingRescue.rescuer.id !== userId) {
    throw new Error(`Rescue ${rescueId} is already booked by another user!`);
  }

  const [siteId, date] = rescueId.split('@');
  console.log('siteId:', siteId);
  console.log('date:', date);
  const rowIndex = rescueData.mapDateToRow[date];
  const colIndex = rescueData.mapSiteToColumn[siteId];
  // TODO: Sanity check
  console.log('rowIndex:', rowIndex);
  console.log('colIndex:', colIndex);

  const response = await callAPI(gsheet.values(), 'update', {
    spreadsheetId,
    range: `${month}!R${rowIndex + 1}C${colIndex + 1}`,
    valueInputOption: 'RAW',
    resource: { values: [['']] },
  });

  // @ts-ignore We could fix this
  getAllRescueDataCached.clear();
  // TODO: Any more to clear?  Make a convenience function.

  const newRescueData = await getAllRescueDataCached();
  const rescueNow = rescueData.allRescues.find(rescue => rescue.id === rescueId);
  console.log('rescueNow:', rescueNow);
  return rescueNow;
}

/** @type {<X>(arr: [string, X][]) => Record<string, X>} */
function objectFromEntries(arr) {
  /** @type Record<string, any> */
  const obj = {};
  for (const [key, value] of arr) {
    obj[key] = value;
  }
  return obj;
}

const db = {
  //getGeneralDataCached,
  getUserByCredentials,
  //getAllUserDataCached,
  getAllRescues,
  getAllRescuesForUser,
  getCurrentBookingPhase,
  //getSiteGroups: getSiteGroupsCached,
  //getMemberGroups: getMemberGroupsCached,
  getSiteGroupsForUser,
  getAvailableRescuesForUser,
  assignUserToRescue,
  unassignUserFromRescue,
};

module.exports = db;
