//const util = require('util');
const gsheet = require('./gsheet.js');

const spreadsheetId = '1rIxLusw6S9E1nnGr4OuaziPmmXp2MYh2uetzZfVGoTo';

async function callAPI(obj, methodName, ...args) {
  // Explicit
  return new Promise((resolve, reject) => {
    obj[methodName](...args)
      .then(result => {
        resolve(result.data.values);
      })
      .catch(reject);
  });

  // Same thing, but using util.promisify
  /*
  // @ts-ignore
  const result = await util.promisify((...arguments) => obj[methodName](...arguments))(...args);
  return result.data.values;
	*/
}

module.exports = {
  async getAllRescues(month = 'DEC 2021') {
    const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: month });

    const siteRow = sheetData[0];
    //console.log('siteRow:', JSON.stringify(siteRow));
    const mapColumnToSite = {};
    const mapSiteToColumn = {};
    for (let colIndex = 2; colIndex < siteRow.length; colIndex++) {
      /** @type {string} */
      const cellData = siteRow[colIndex];
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

  async getUserByCredentials(username, password) {
    const sheetData = await callAPI(gsheet.values(), 'get', { spreadsheetId, range: 'NameRef' });

    for (let rowIndex = 2; rowIndex < sheetData.length; rowIndex++) {
      const row = sheetData[rowIndex];
      const [name, telegramName, telegramUsername, email, role, passwordSalt, passwordHash] = row;
      if (name === username) {
        // For now, if the password is empty/undefined, then we will just accept them for giving the correct username
        if (passwordHash === password || !passwordHash) {
          // User found

          // TODO: If the user provided a password, but no password is set, then we can set the one they provided!

          const id = name;

          const user = {
            id: id,
            name: name,
            telegramName: telegramName || 'unknown',
            telegramUsername: telegramUsername || '@unknown',
            email: email || 'unknown@unknown.com',
            role: role || 'USER',
          };

          return user;
        } else {
          //throw new Error('Incorrect password');
          console.warn(`Incorrect password for ${username}`);
          return null;
        }
      }
    }

    return null;
  },
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
