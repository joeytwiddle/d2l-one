//const util = require('util');
const gsheet = require('./gsheet.js');
// Docs: https://www.npmjs.com/package/memoizee
const memoize = require('memoizee');

const spreadsheetId = '1rIxLusw6S9E1nnGr4OuaziPmmXp2MYh2uetzZfVGoTo';

const oneMinute = 60 * 1000;

// If we call memoize() directly, typescript-jsdoc thinks that it returns {}
// So we use this wrapper function, so that typescript sees the right types
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
    obj[methodName](...args)
      .then(result => {
        resolve(result.data.values);
      })
      .catch(reject);
  });
  return data;

  // Same thing, but using util.promisify
  /*
  // @ts-ignore
  const result = await util.promisify((...arguments) => obj[methodName](...arguments))(...args);
  return result.data.values;
	*/
}

const getGeneralData = memoizeFunction(getGeneralDataUncached, oneMinute);

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
  const generalData = await getGeneralDataUncached();
  console.log('generalData:', generalData);
  return generalData['Current Booking Month'];
}

async function getCurrentBookingPhase() {
  const generalData = await getGeneralData();
  return generalData['Current Booking Phase'];
}

async function getSiteGroups(month, phase) {
  month = month || (await getCurrentBookingMonth());
  phase = phase || (await getCurrentBookingPhase());
}

const db = {
  async getUserByCredentials(username, password) {
    const { allUsers } = await db.getAllUserData();

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
  },

  async getAllUserData() {
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
  },

  async getAllRescues(month) {
    const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: month });

    month = month || (await getCurrentBookingMonth());

    const siteRow = sheetData[0];
    //console.log('siteRow:', JSON.stringify(siteRow));
    const mapColumnToSite = {};
    const mapSiteToColumn = {};
    for (let colIndex = 2; colIndex < siteRow.length; colIndex++) {
      /** @type {string} */
      const cellData = siteRow[colIndex] || '';
      const siteName = (cellData.match(/^[A-Z0-9]*/) || [])[0];
      //console.log('siteName:', siteName);
      if (siteName) {
        mapColumnToSite[colIndex] = siteName;
        mapSiteToColumn[siteName] = colIndex;
      }
    }
    console.log('mapColumnToSite:', JSON.stringify(mapColumnToSite));
    console.log('mapSiteToColumn:', JSON.stringify(mapSiteToColumn));

    const allRescues = [];
    const rescuesByDate = {};
    const rescuesByRescuer = {};
    for (let rowIndex = 2; rowIndex < sheetData.length; rowIndex++) {
      const row = sheetData[rowIndex];
      //console.log('row:', JSON.stringify(row));
      //const date = new Date(`${row[0]} UTC+08:00`);
      const date = new Date(`${row[0]}`);
      const isRealDate = date.getTime() >= 0;
      // Skip the row if it isn't a real day
      if (!isRealDate) continue;
      //console.log('row:', JSON.stringify(row));

      for (let colIndex = 2; colIndex < siteRow.length; colIndex++) {
        const siteName = mapColumnToSite[colIndex];
        if (siteName) {
          const rescuerName = row[colIndex];
          const rescuerId = rescuerName;
          const rescuer = rescuerName
            ? {
                id: rescuerId,
                name: rescuerName,
              }
            : null;
          const rescueId = `${siteName}@${shortDateString(date)}`;
          const shortDate = shortDateString(date);
          const rescue = {
            id: rescueId,
            date: shortDate,
            site: {
              id: siteName,
              name: siteName,
            },
            rescuers: rescuer ? [rescuer] : [],
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
    };
  },
};

db.getAllUserData = memoizeFunction(db.getAllUserData, oneMinute);
db.getAllRescues = memoizeFunction(db.getAllRescues, oneMinute);

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
