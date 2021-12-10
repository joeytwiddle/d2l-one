import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { apiUrl } from './config/config';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import AppRoot from './navigation/AppRoot';

const link = createHttpLink({
  uri: apiUrl,
  credentials: 'include',
});

// TODO: Change url depending on deployment
const client = new ApolloClient({
  //uri: apiUrl,
  link,
  cache: new InMemoryCache(),
  //credentials: 'include',
});

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <ApolloProvider client={client}>
        <SafeAreaProvider>
          <AppRoot colorScheme={colorScheme} />
          <StatusBar />
        </SafeAreaProvider>
      </ApolloProvider>
    );
  }
}
