/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import { CombinedDarkTheme, CombinedDefaultTheme } from '../constants/Themes';
import useColorScheme from '../hooks/useColorScheme';
import BookableRescueScreen from '../screens/BookableRescueScreen';
import BookedRescueScreen from '../screens/BookedRescueScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import RescuesScreen from '../screens/RescuesScreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const theme = colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer linking={LinkingConfiguration} theme={theme}>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      {/* Note: If a page is using headerShown: false, then it must use SafeAreaView to avoid overlapping the statusbar */}
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Modal" component={ModalScreen} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="BookableRescueScreen"
          component={BookableRescueScreen}
          options={{ headerShown: true, headerTitle: 'Rescue' }}
        />
        <Stack.Screen
          name="BookedRescueScreen"
          component={BookedRescueScreen}
          options={{ headerShown: true, headerTitle: 'Rescue' }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
//const BottomTab = createBottomTabNavigator<RootTabParamList>();
const BottomTab = createNativeStackNavigator<RootTabParamList>();

function BottomTabNavigator(props: any) {
  const colorScheme = useColorScheme();

  //const showTabBar = false;

  return (
    <BottomTab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        // This is achieved through the NavigationContainer's theme
        //tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
      // This hides the tab bar (which is not ideal, because on iOS, we will need some way to get back to the dashboard)
      //tabBar={showTabBar ? undefined : () => null}
      // We could make `headerShown: true` but that doesn't help because Rescues is parallel to Dashboard.  We want it to be a child below it (or above it on the stack).
    >
      <BottomTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }: RootTabScreenProps<'Dashboard'>) => ({
          title: 'Dashboard',
          headerShown: false,
          //tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('Modal')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <FontAwesome name="info-circle" size={25} color={Colors[colorScheme].text} style={{ marginRight: 15 }} />
            </Pressable>
          ),
        })}
      />
      <BottomTab.Screen
        name="Rescues"
        component={RescuesScreen}
        options={{
          title: 'Rescues',
          headerShown: true,
          //tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}
