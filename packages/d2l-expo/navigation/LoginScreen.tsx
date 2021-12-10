import React, { useState } from 'react';
import { Button, StyleSheet, TextInput } from 'react-native';
import { apiDomain } from '../App';
import { Text, View } from '../components/Themed';
import { useGetUserQuery, useLogInMutation } from '../graphql';

export const handleGlobalError = console.error;

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [logIn, logInMutation] = useLogInMutation();

  // We don't really need this data here.  But we use it to fire a refetch() of the query, to trigger a rerender of AppRoot.
  const userQuery = useGetUserQuery();

  //console.log('logInMutation:', logInMutation);
  //console.log('userQuery:', userQuery);

  const submit = () => {
    logIn({ variables: { username, password } })
      .then(() => userQuery.refetch())
      .catch(handleGlobalError);
    // When it completes, logInMutation changes from undefined to { logIn: null }
    // At that point, perhaps we could request a refetch of the user query, so the page will change?
    // Oh, it also returns a promise!  We should probably catch that.
  };

  const loginProcessFailureMessage =
    logInMutation.data?.logIn.success && userQuery.data && userQuery.data.me == null
      ? `Login succeeded but user not fetched. Possibly a same-domain cookie issue. (Make sure your webpage is on the same domain as the API: ${apiDomain})`
      : '';

  const errorMessage = loginProcessFailureMessage || logInMutation.data?.logIn?.reason || logInMutation.error?.message;

  if (errorMessage) {
    console.warn(errorMessage);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.container}>
        <View style={styles.container}>
          <TextInput style={styles.larger} placeholder="Name" value={username} onChangeText={setUsername} />
        </View>
        {/*
        <View style={styles.container}>
          <TextInput style={styles.larger} secureTextEntry={true} placeholder="Password" value={password} onChangeText={setPassword} />
        </View>
         */}
        <View style={styles.container}>
          <Button title="Log in" onPress={submit} disabled={!username || logInMutation.loading || userQuery.loading} />
        </View>
        <View style={styles.smallContainer}>
          <Text>{errorMessage}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  smallContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  larger: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
