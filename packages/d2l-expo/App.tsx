import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { apiUrl } from './config/config';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import AppRoot from './navigation/AppRoot';

// Add console logging for Apollo requests and responses
// From: https://stackoverflow.com/questions/54273194/log-apollo-server-graphql-query-and-variables-per-request
// See also: https://github.com/apollographql/apollo-client/issues/4017
async function loggingFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const body = JSON.parse(String(init?.body) ?? '{}');

  const response = await fetch(input, init);

  return {
    ...response,

    async text() {
      const start = Date.now();
      const result = await response.text();
      const resultObj = JSON.parse(result);
      if (resultObj.errors) {
        console.error(`[apollo] %s -> %o`, body.operationName, resultObj.errors);
      } else {
        console.log(`[apollo] %s -> %o`, body.operationName, Object.values(resultObj.data)[0]);
      }
      return result;
    },
  };
}

const link = createHttpLink({
  fetch: loggingFetch,
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
