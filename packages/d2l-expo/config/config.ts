import Constants from 'expo-constants';

const nodeEnv = process.env.NODE_ENV || 'development';

// https://stackoverflow.com/a/70323103/99777
const inProduction = nodeEnv === 'production';
const inExpo = Constants.manifest && Constants.manifest.debuggerHost;
const inBrowser = typeof document !== 'undefined';

// In development mode, using Expo Go on mobile, we try to get the developer's LAN IP from the debugger
// If it's not there, then we assume we are on browser, and get the developer's IP from document.location
// Source: https://stackoverflow.com/a/49198103/99777
//
//const inProduction = manifest.packagerOpts == null;
export const apiDomain = inProduction
  ? 'd2l.sg'
  : inExpo
  ? Constants.manifest!.debuggerHost!.split(`:`).shift()
  : inBrowser
  ? document.location.hostname
  : 'unknown';

console.log('apiDomain:', apiDomain);

export const apiUrl = inProduction ? `https://${apiDomain}/v1/graphql` : `http://${apiDomain}:4000/graphql`;
