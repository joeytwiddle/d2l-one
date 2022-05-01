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
        // So this causes our app to appear at /app and everything else will come below that
        path: 'app',
        // This option means, if the user reloads the page on /app/rescues, they will see a back button leading to the Dashboard
        initialRouteName: 'Dashboard',
        screens: {
          Dashboard: {
            path: 'dashboard',
            screens: {
              DashboardScreen: 'home',
            },
          },
          Rescues: {
            path: 'rescues',
            screens: {
              /*
              BookingLimits: {
                path: 'limits',
              },
              List: {
                path: 'list',
              },
              Calendar: {
                path: 'calendar',
              },
              */
              // Left-hand-side matches the <Tabs.Screen> 'name' property
              // Right-hand-side is the path
              BookingLimits: 'limits',
              List: 'list',
              Calendar: 'calendar',
            },
          },
        },
      },
      Modal: 'modal',
      BookableRescueScreen: 'bookable-rescue',
      BookedRescueScreen: 'booked-rescue',
      NotFound: '*',
    },
  },
};

export default linking;
