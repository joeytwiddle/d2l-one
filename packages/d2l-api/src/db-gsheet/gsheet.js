const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

// This file was adapted from the Google Sheets Quickstart:
//
// https://developers.google.com/sheets/api/quickstart/nodejs

// Note: If you want to access a spreadsheet from a user who has not been
// authorized before, then you will need to add that user as a test user.
//
// Log in to Google as `d2l.sg.dev@gmail.com` then go to:
//
// - Google Cloud Console > APIs and Services > OAuth Consent Screen > Test Users
//
// https://console.cloud.google.com/apis/credentials/consent?project=d2l-one-334008

// This file stores the user's access and refresh tokens, and is created
// automatically when the authorization flow completes for the first time.
const TOKEN_PATH = 'google-api-token.json';

// If modifying these scopes, delete the token.json file.  It will be recreated
// the next time you start the API server (requires your interaction with the
// prompt!)
//const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorizeOAuth2(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {InstanceType<typeof google.auth.OAuth2>} oAuth2Client The OAuth2 client to get token for.
 * @param {function} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

// Our code

function authorizeServiceAccount(credentials, callback) {
  const { client_email, private_key } = credentials;

  // Helpful:
  // https://stackoverflow.com/questions/58565907/google-sheets-api-authorization-with-a-service-account
  // https://stackoverflow.com/questions/38949318/google-sheets-api-returns-the-caller-does-not-have-permission-when-using-serve

  // GoogleAuth and JWT both work

  const authClient = new GoogleAuth({
    //keyFile: 'service-account-credentials.json',
    credentials: {
      client_email,
      private_key,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  /*
  const authClient = new google.auth.JWT(client_email, null, private_key, [
    'https://www.googleapis.com/auth/spreadsheets',
  ]);
  */

  callback(authClient);
}

function initAuth(callback) {
  // Authorize a client with credentials, then call the Google Sheets API.

  /*
  fs.readFile('google-api-credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorizeOAuth2(JSON.parse(content.toString()), callback);
  });
  */

  fs.readFile('service-account-credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorizeServiceAccount(JSON.parse(content.toString()), callback);
  });
}

let auth;

initAuth(_auth => {
  auth = _auth;
});

function getSheets() {
  return google.sheets({ version: 'v4', auth });
}

module.exports = {
  spreadsheets: () => {
    return getSheets().spreadsheets;
  },
  sheets: () => {
    return getSheets().spreadsheets.sheets;
  },
  values: () => {
    return getSheets().spreadsheets.values;
  },
};
