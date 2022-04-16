import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EditScreenInfo from '../components/EditScreenInfo';
import { PaddedBlock } from '../components/Layout';
import Logo from '../components/Logo';
import RescueCard from '../components/RescueCard';
import { Button, LoadingSpinner, Text, View } from '../components/Themed';
import {
  useGetAllRescuesQuery,
  useGetAvailableRescuesForCurrentUserLazyQuery,
  useGetAvailableRescuesForCurrentUserQuery,
  useGetMyRescuesQuery,
} from '../graphql';
import useUser from '../hooks/useUser';
import { RootTabScreenProps } from '../types';

export default function DashboardScreen({ navigation }: RootTabScreenProps<'Dashboard'>) {
  //const user = useGetUserQuery().data?.me;
  const user = useUser();

  const myRescues = useGetMyRescuesQuery().data?.myRescues;

  console.log('[Dashboard] user:', user);
  console.log('[Dashboard] myRescues:', myRescues);

  const availableRescuesQuery = useGetAvailableRescuesForCurrentUserQuery();
  const availableRescues = availableRescuesQuery.data?.availableRescuesForCurrentUser;
  //
  // If we want to load the upcoming rescues first, before the larger list of availableRescues, we can use a lazy query
  // WARNING: Do not use this!  Fir some reason it triggers a refetch of myRescues every 2 seconds.
  /*
  const availableRescuesLazyQuery = useGetAvailableRescuesForCurrentUserLazyQuery();
  const availableRescues = availableRescuesLazyQuery[1].data?.availableRescuesForCurrentUser;
  React.useEffect(() => {
    setTimeout(() => {
      availableRescuesLazyQuery[0]();
    }, 2000);
  });
  */

  if (!user) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView></SafeAreaView>
      <Logo />
      <PaddedBlock>
        <Text>Welcome {user.name}</Text>
      </PaddedBlock>
      {/*<View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />*/}
      <ScrollView style={styles.upcomingRescuesScrollContainer} contentContainerStyle={styles.upcomingRescues}>
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
        {/*<View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />*/}
      </ScrollView>
      {availableRescues && availableRescues.length > 0 ? (
        <PaddedBlock>
          <Button
            title="Start Booking"
            onPress={() => {
              navigation.navigate('Rescues');
            }}
          ></Button>
        </PaddedBlock>
      ) : null}
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
  upcomingRescuesScrollContainer: {
    width: '100%',
  },
  upcomingRescues: {
    //width: '100%',
    //flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    //backgroundColor: '#f2f2f2',
  },
});
