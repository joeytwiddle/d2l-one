import Constants from 'expo-constants';

const nodeEnv = process.env.NODE_ENV || 'development';

const inProduction = nodeEnv === 'production';

//export const apiDomain = 'localhost';
//export const apiDomain = inProduction ? 'd2l.sg' : '192.168.0.195';
// In development mode, using Expo Go on mobile, we try to get the developer's LAN IP from the debugger
// If it's not there, then we assume we are on browser, and get the developer's IP from document.location
export const apiDomain = inProduction
  ? 'd2l.sg'
  : Constants.manifest && Constants.manifest.debuggerHost
  ? Constants.manifest.debuggerHost!.split(`:`).shift()
  : document?.location.hostname;
console.log('apiDomain:', apiDomain);

export const apiUrl = inProduction ? `//${apiDomain}/v1/graphql` : `http://${apiDomain}:4000/graphql`;
