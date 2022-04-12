import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CentralizingContainer, PaddedBlock } from '../components/Layout';

import { Button, LoadingSpinner, SecondaryButton, Text, View } from '../components/Themed';
import {
  Rescue,
  useGetAvailableRescuesForCurrentUserQuery,
  useGetMyRescuesQuery,
  useUnassignSelfFromRescueMutation,
} from '../graphql';
import { handleGlobalError } from '../navigation/LoginScreen';
import { niceDate } from './RescuesScreen';

//export default function BookedRescueScreen({ navigation, route: { rescueId } }: BookedRescueScreenProps) {
export default function BookedRescueScreen({ navigation, route }: any) {
  const { rescueId } = route.params;

  const myRescues = useGetMyRescuesQuery().data?.myRescues;

  // For clearing the cache
  const availableRescuesQuery = useGetAvailableRescuesForCurrentUserQuery();
  const myRescuesQuery = useGetMyRescuesQuery();

  const rescue = myRescues && (myRescues.find((rescue: any) => rescue.id === rescueId) as Rescue);

  const [isUnbooking, setIsUnbooking] = useState(false);

  const [unassignSelfFromRescue, unassignSelfFromRescueMutation] = useUnassignSelfFromRescueMutation({
    /*
    update(cache, data) {
      // Adapted from: https://hasura.io/learn/graphql/typescript-react-apollo/optimistic-update-mutations/3.1-mutation-update-cache/
      // NOTE that this need optimisticResponse in the query, otherwise it won't update the UI until the mutation responds, which may be too slow.
      const rescueId = data.data?.assignSelfToRescue.id;
      const existingRescues = cache.readQuery({ query: GetAvailableRescuesForCurrentUserDocument }) as {
        availableRescuesForCurrentUser: PartialRescue[];
      };
      const availableRescuesUpdated = existingRescues!.availableRescuesForCurrentUser.filter(r => r.id !== rescueId);
      cache.writeQuery({
        query: GetAvailableRescuesForCurrentUserDocument,
        variables: { rescueId: rescueId },
        data: { availableRescuesForCurrentUser: availableRescuesUpdated },
      });
    },
    */
  });

  const cancelBooking = React.useCallback(
    (rescue: Rescue) => {
      console.log('Unbooking rescue:', rescue);
      setIsUnbooking(true);
      unassignSelfFromRescue({
        variables: { rescueId: rescue.id },
      })
        .then(() => {
          setIsUnbooking(false);
          // TODO: Global Toast
          //setToastMessage(`You have booked ${rescue.site.fullName} at ${rescue.date}`);
          navigation.goBack();
          availableRescuesQuery.refetch();
          myRescuesQuery.refetch();
          // Without the delay, the buttons appear enabled again, before we see the updated list
          //setTimeout(() => setRescueBeingBooked(''), 1000);
        })
        .catch(error => {
          handleGlobalError(error);
          //setToastMessage(String(error));
          setIsUnbooking(false);
        });
    },
    [unassignSelfFromRescue],
  );

  if (!myRescues || !rescue || isUnbooking) {
    return (
      <CentralizingContainer>
        <LoadingSpinner />
      </CentralizingContainer>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/*
      <PaddedBlock>
        <Text style={styles.title}>Rescue</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      </PaddedBlock>
      */}

      <View style={styles.container}>
        <PaddedBlock>
          <Text>{niceDate(rescue.date)}</Text>
        </PaddedBlock>
        <PaddedBlock>
          <Text>{rescue.site.fullName}</Text>
        </PaddedBlock>
        <PaddedBlock>
          <Text>{rescue.site.collectionTime}</Text>
        </PaddedBlock>
        <PaddedBlock>
          <Text>{rescue.site.directions}</Text>
        </PaddedBlock>
        <PaddedBlock>
          <Text>{rescue.site.rules}</Text>
        </PaddedBlock>
      </View>

      <View>
        <PaddedBlock>
          <Button title="Upload Photo" onPress={() => {}} />
        </PaddedBlock>
      </View>
      <View>
        <PaddedBlock>
          <SecondaryButton title="Cancel Booking" onPress={() => cancelBooking(rescue)} />
        </PaddedBlock>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
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
});
