import * as React from 'react';
import { StyleSheet } from 'react-native';
import EditScreenInfo from '../components/EditScreenInfo';
import RescueCard from '../components/RescueCard';
import { Text, View } from '../components/Themed';
import { useGetAllRescuesQuery, useGetMyRescuesQuery } from '../graphql';
import useUser from '../hooks/useUser';
import { RootTabScreenProps } from '../types';

export default function DashboardScreen({ navigation }: RootTabScreenProps<'Dashboard'>) {
  //const user = useGetUserQuery().data?.me;
  const user = useUser();

  const myRescues = useGetMyRescuesQuery().data?.myRescues;

  console.log('[Dashboard] user:', user);
  console.log('[Dashboard] myRescues:', myRescues);

  if (!user) return null;
  if (!myRescues) return null;

  return (
    <View style={styles.container}>
      <Text>Welcome {user.name}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.title}>Your upcoming rescues</Text>
      <View style={styles.upcomingRescue}>
        {myRescues.length === 0 && <Text>No rescues booked</Text>}
        {myRescues.map(rescue => (
          <RescueCard key={rescue.id} rescue={rescue} />
        ))}
      </View>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  upcomingRescue: {
    paddingVertical: 10,
  },
});
