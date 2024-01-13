import * as React from 'react';
import { ColorSchemeName, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import { apiUrl } from '../config/config';
import { useSiteDataQuery } from '../data/site-data';
import { useGetUserQuery, User } from '../graphql';
import useUser from '../hooks/useUser';
import Navigation from './Navigation';
import WelcomeAndLogin from './WelcomeAndLogin';

export default function AppRoot({ colorScheme }: { colorScheme: ColorSchemeName }) {
  // This is the function we usually use to get the user
  const user = useUser() as User | null;

  // But for the initial startup, it's helpful to know if there was an error
  const userQueryResult = useGetUserQuery();

  if (userQueryResult.loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (userQueryResult.error) {
    return (
      <View style={styles.container}>
        <Text>Initial startup failed:</Text>
        <Text>{userQueryResult.error.message}</Text>
        <Text>(apiUrl: {apiUrl})</Text>
      </View>
    );
  }

  console.log('[AppRoot] user:', user);

  return user ? <AppRootLoggedIn colorScheme={colorScheme} /> : <WelcomeAndLogin />;
}

function AppRootLoggedIn({ colorScheme }: { colorScheme: ColorSchemeName }) {
  // Load all the site data on startup
  // NOTE: This will show an error if it is called before the user has logged in
  const allSiteData = useSiteDataQuery();
  console.log('[AppRoot] allSiteData:', allSiteData);

  if (allSiteData.loading) {
    return null;
  }

  return <Navigation colorScheme={colorScheme} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
