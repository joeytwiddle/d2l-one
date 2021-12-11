/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '../types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        // Makes the entire app appear in a subfolder
        // This should match where you want the app to appear on the website
        // https://reactnavigation.org/docs/5.x/configuring-links/#matching-exact-paths
        path: 'app',
        screens: {
          Dashboard: {
            screens: {
              DashboardScreen: 'one',
            },
          },
          Rescues: {
            screens: {
              RescuesScreen: 'two',
            },
          },
        },
      },
      Modal: 'modal',
      NotFound: '*',
    },
  },
};

export default linking;
