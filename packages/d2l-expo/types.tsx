/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<MainStackParamList> | undefined;
};

export type BookableRescueParamList = {
  rescueId: string;
};

export type BookedRescueParamList = {
  rescueId: string;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type MainStackParamList = {
  Dashboard: undefined;
  Rescues: undefined;
  BookableRescueScreen: BookableRescueParamList;
  BookedRescueScreen: BookedRescueParamList;
  Modal: undefined;
  NotFound: undefined;
};

/*
export type MainStackScreenProps<Screen extends keyof MainStackParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainStackParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
*/

export type MainStackScreenProps<Screen extends keyof MainStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MainStackParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export type MainStackNavigationProp<Screen extends keyof MainStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackParamList, Screen>,
  NativeStackNavigationProp<RootStackParamList>
>;

/*
export type MainStackScreenProps<Screen extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  Screen
>;
*/

// Not working?
export type BookedRescueScreenProps = NativeStackScreenProps<MainStackParamList, 'BookedRescueScreen'>;

export type BookableRescueScreenProps = NativeStackScreenProps<MainStackParamList, 'BookableRescueScreen'>;
