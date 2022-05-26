import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { CentralizingContainer, PaddedBlock, PageContainer, PullRightView } from '../components/Layout';

import { Button, LoadingSpinner, SecondaryButton, Text, View } from '../components/Themed';
import { getSite } from '../data/site-data';
import {
  RescueLite,
  useAssignSelfToRescueMutation,
  useGetAvailableRescuesForCurrentUserQuery,
  useGetBookingLimitsForCurrentUserQuery,
  useGetMyRescuesQuery,
} from '../graphql';
import useUser from '../hooks/useUser';
import { handleGlobalError } from '../navigation/LoginScreen';
import { BookableRescueScreenProps, MainStackParamList, RootStackParamList } from '../types';
import { niceDate, niceTime } from '../components/RescueCard';

type BookableRescueScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'BookableRescueScreen'>;

export default function BookableRescueScreen({ route }: any) {
  const navigation = useNavigation<BookableRescueScreenNavigationProp>();

  const { rescueId } = route.params;

  const user = useUser();

  //const myRescues = useGetMyRescuesQuery().data?.myRescues;

  // For clearing the cache
  const availableRescuesQuery = useGetAvailableRescuesForCurrentUserQuery();
  const myRescuesQuery = useGetMyRescuesQuery();
  const bookingLimitsQuery = useGetBookingLimitsForCurrentUserQuery();

  const availableRescues = availableRescuesQuery.data?.availableRescuesForCurrentUser;

  const rescue = availableRescues
    ? (availableRescues.find((rescue: any) => rescue.id === rescueId) as RescueLite)
    : undefined;

  const [isBooking, setIsBooking] = useState(false);

  const [assignSelfToRescue, assignSelfToRescueMutation] = useAssignSelfToRescueMutation({
    /*
    update(cache, data) {
      // Adapted from: https://hasura.io/learn/graphql/typescript-react-apollo/optimistic-update-mutations/3.1-mutation-update-cache/
      // NOTE that this need optimisticResponse in the query, otherwise it won't update the UI until the mutation responds, which may be too slow.
      const rescueId = data.data?.assignSelfToRescue.id;
      const existingRescues = cache.readQuery({ query: GetAvailableRescuesForCurrentUserDocument }) as {
        availableRescuesForCurrentUser: RescueLite[];
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

  const bookRescue = React.useCallback(() => {
    if (!rescue) {
      throw new Error('No rescue to book');
    }
    const site = getSite(rescue.siteId);
    console.log('Booking rescue:', rescue);
    setIsBooking(true);
    assignSelfToRescue({
      variables: { rescueId: rescue.id },
      // Adapted from: https://www.apollographql.com/docs/react/performance/optimistic-ui/
      optimisticResponse: {
        assignSelfToRescue: {
          __typename: 'Rescue',
          id: rescue.id,
          rescuer: {
            id: user.id,
          },
        },
      },
    })
      .then(() => {
        // TODO: Toast the successful booking
        //toast(`You have booked ${rescue.site.fullName} at ${rescue.date}`);
        availableRescuesQuery.refetch();
        myRescuesQuery.refetch();
        bookingLimitsQuery.refetch();
        setTimeout(() => {
          setIsBooking(false);
          navigation.goBack();
        }, 2000);
      })
      .catch(error => {
        setIsBooking(false);
        handleGlobalError(error);
      });
  }, [setIsBooking, assignSelfToRescue, availableRescuesQuery, myRescuesQuery]);

  if (!availableRescues || !rescue || isBooking) {
    return (
      <CentralizingContainer>
        <LoadingSpinner />
      </CentralizingContainer>
    );
  }

  const site = getSite(rescue.siteId);

  return (
    <PageContainer>
      {/*
      <PaddedBlock>
        <Text style={styles.title}>Rescue</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      </PaddedBlock>
      */}

      <View style={styles.container}>
        <PaddedBlock>
          <Text style={styles.siteName}>{site.fullName}</Text>
        </PaddedBlock>
        <PaddedBlock>
          <Text>
            {niceDate(rescue.date)}, {niceTime(site.collectionTime)}
          </Text>
        </PaddedBlock>
        <PaddedBlock>
          <Text>{site.directions}</Text>
        </PaddedBlock>
        <PaddedBlock>
          <Text>{site.rules}</Text>
        </PaddedBlock>
      </View>

      {/*
      <View>
        <PaddedBlock>
          <Button title="Upload Photo" onPress={() => {}} />
        </PaddedBlock>
      </View>
      */}

      <PullRightView>
        <PaddedBlock>
          <Button title="Book" onPress={bookRescue} />
        </PaddedBlock>
      </PullRightView>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  siteName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
