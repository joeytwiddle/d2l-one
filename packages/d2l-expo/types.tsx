/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined;
  FavouriteRescuesTab: undefined;
  BookableRescueScreen: BookableRescueParamList;
  BookedRescueScreen: BookedRescueParamList;
  Modal: undefined;
  NotFound: undefined;
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

export type RootTabParamList = {
  Dashboard: undefined;
  Rescues: undefined;
};

export type RootTabScreenProps<Screen extends keyof RootTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

// Not working?
export type BookedRescueScreenProps = NativeStackScreenProps<RootStackParamList, 'BookedRescueScreen'>;

export type BookableRescueScreenProps = NativeStackScreenProps<RootStackParamList, 'BookableRescueScreen'>;
