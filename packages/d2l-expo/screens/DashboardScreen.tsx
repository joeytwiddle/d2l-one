import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import EditScreenInfo from '../components/EditScreenInfo';
import { PaddedBlock } from '../components/Layout';
import Logo from '../components/Logo';
import RescueCard from '../components/RescueCard';
import { LoadingSpinner, Text, View } from '../components/Themed';
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

  return (
    <ScrollView>
      <View style={styles.container}>
        <Logo />
        <PaddedBlock>
          <Text>Welcome {user.name}</Text>
        </PaddedBlock>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <View style={styles.upcomingRescues}>
          <Text style={styles.title}>Your upcoming rescues</Text>
          {!myRescues && <LoadingSpinner />}
          {myRescues && myRescues.length === 0 && (
            <PaddedBlock>
              <Text>No rescues booked</Text>
            </PaddedBlock>
          )}
          {myRescues &&
            myRescues.map(rescue => (
              <RescueCard
                key={rescue.id}
                rescue={rescue}
                onPress={() =>
                  navigation.navigate('BookedRescueScreen', {
                    rescueId: rescue.id,
                  })
                }
              />
            ))}
        </View>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      </View>
    </ScrollView>
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
  upcomingRescues: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#f2f2f2',
  },
});
