import { useRoute } from '@react-navigation/core';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';
import { PartialRescue } from '../client-types';
import { CentralizingContainer, PaddedBlock, PullRightView } from '../components/Layout';
import RescueCard from '../components/RescueCard';
import { Button, LoadingSpinner, Text, View } from '../components/Themed';
import {
  GetAvailableRescuesForCurrentUserDocument,
  useAssignSelfToRescueMutation,
  useGetAvailableRescuesForCurrentUserQuery,
  useGetMyRescuesQuery,
} from '../graphql';
import { handleGlobalError } from '../navigation/LoginScreen';

function callD2LAPI(hook: any, ...args: any[]) {
  const result = hook(...args);
  if (result.error) {
    console.error(`Error from server: ${String(result.error.message)}`);
    //toast.error(...);
  }
  return result;
}

const Tab = createMaterialTopTabNavigator();

export default function RescuesScreen() {
  //const rescues = useGetAllRescuesQuery().data?.rescues;
  //const rescues = useGetAllRescuesForMonthQuery({ variables: { month: 'JAN 2021' } }).data?.allRescuesForMonth;
  //const rescues = callD2LAPI(useGetAllRescuesForMonthQuery, { variables: { month: 'DEC 2021' } }).data
  //  ?.allRescuesForMonth;

  const availableRescuesQuery = useGetAvailableRescuesForCurrentUserQuery();
  const availableRescues = availableRescuesQuery.data?.availableRescuesForCurrentUser;
  const myRescuesQuery = useGetMyRescuesQuery();

  const [assignSelfToRescue, assignSelfToRescueMutation] = useAssignSelfToRescueMutation({
    update(cache, data) {
      // Adapeted from: https://hasura.io/learn/graphql/typescript-react-apollo/optimistic-update-mutations/3.1-mutation-update-cache/
      // NOTE that this need optimisticResponse in the query, otherwise it won't update the UI until the mutation responds, which may be too slow.
      const rescueId = data.data?.assignSelfToRescue.id;
      const existingRescues = cache.readQuery({ query: GetAvailableRescuesForCurrentUserDocument }) as {
        availableRescuesForCurrentUser: PartialRescue[];
      };
      const availableRescuesUpdated = existingRescues!.availableRescuesForCurrentUser.filter(r => r.id !== rescueId);
      cache.writeQuery({
        query: GetAvailableRescuesForCurrentUserDocument,
        data: { availableRescuesForCurrentUser: availableRescuesUpdated },
      });
    },
  });

  const [rescueBeingBooked, setRescueBeingBooked] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const bookRescue = React.useCallback(
    (rescue: PartialRescue) => {
      console.log('Booking rescue:', rescue);
      setRescueBeingBooked(`${rescue.site.fullName} at ${rescue.date}`);
      assignSelfToRescue({
        variables: { rescueId: rescue.id },
        // Adapted from: https://www.apollographql.com/docs/react/performance/optimistic-ui/
        optimisticResponse: {
          assignSelfToRescue: {
            __typename: 'Rescue',
            id: rescue.id,
          },
        },
      })
        .then(() => {
          // TODO: Toast the successful booking
          //toast(`You have booked ${rescue.site.fullName} at ${rescue.date}`);
          setToastMessage(`You have booked ${rescue.site.fullName} at ${rescue.date}`);
          availableRescuesQuery.refetch();
          // I don't especially want to refresh this.  But I do want to invalidate it.
          myRescuesQuery.refetch();
          // Without the delay, the buttons appear enabled again, before we see the updated list
          setTimeout(() => setRescueBeingBooked(''), 1000);
        })
        .catch(error => {
          handleGlobalError(error);
          setToastMessage(String(error));
          setRescueBeingBooked('');
        });
    },
    [setRescueBeingBooked, setToastMessage, availableRescuesQuery, myRescuesQuery],
  );

  if (availableRescuesQuery.loading || rescueBeingBooked) {
    return (
      <CentralizingContainer>
        {rescueBeingBooked ? (
          <PaddedBlock>
            <Text>Booking {rescueBeingBooked}</Text>
          </PaddedBlock>
        ) : null}
        <LoadingSpinner />
      </CentralizingContainer>
    );
  }

  if (!availableRescues) return null;

  // TODO: Split rescues up into days, so we can rescues available day-by-day

  const rescuesSorted = availableRescues.slice(0);
  rescuesSorted.sort((ra, rb) => (ra > rb ? +1 : -1));

  const passProps = { toastMessage, availableRescues, makingBooking: !!rescueBeingBooked, bookRescue };

  // I put the tab navigator after these hooks, because I didn't want to duplicate the hooks.
  // However that has resulted in performance issues, because we need to pass the props down, so we need inline components.
  // I have tried using pure compoenents to help with the performance issues.
  // TODO: But if they persist, we might want to extract the hooks setup into a function, and then use that inside the tab components.
  return (
    // We disable swiping so that we can scroll the table horizontally
    <Tab.Navigator screenOptions={{ swipeEnabled: false }}>
      <Tab.Screen name="Calendar" component={() => <RescuesCalendarPure {...passProps} />} />
      <Tab.Screen name="Favourites" component={() => <RescuesListPure {...passProps} />} />
    </Tab.Navigator>
  );
}

const RescuesCalendarPure = React.memo(RescuesCalendar);

function RescuesCalendar({ toastMessage, availableRescues, makingBooking, bookRescue }: any) {
  // Try to reduce sluggishness
  //const route = useRoute();
  //if (route.name !== 'Calendar') return null;

  const allDates = new Set<string>();
  const rescuesBySiteThenDate = {} as Record<string, Record<string, PartialRescue>>;
  for (const rescue of availableRescues) {
    const siteId = rescue.site.id;
    const date = rescue.date;
    rescuesBySiteThenDate[siteId] = rescuesBySiteThenDate[siteId] || {};
    rescuesBySiteThenDate[siteId][date] = rescue;
    allDates.add(date);
  }

  const sitesToShow = Object.keys(rescuesBySiteThenDate);

  const datesToShow = Array.from(allDates.values());

  return (
    <View style={styles.tableContainer}>
      <PaddedBlock>
        <Text>{toastMessage || `${availableRescues.length} rescues available`}</Text>
      </PaddedBlock>
      <ScrollView horizontal /* style={{ overflow: 'scroll' }} */>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={styles.dateCell}>Date</DataTable.Title>
              {sitesToShow.map(siteCode => (
                <DataTable.Title key={siteCode} style={styles.cell}>
                  {siteCode}
                </DataTable.Title>
              ))}
            </DataTable.Header>
            {datesToShow.map(date => (
              <DataTable.Row key={date}>
                <DataTable.Cell style={styles.dateCell}>{date}</DataTable.Cell>
                {sitesToShow.map(siteCode => {
                  const key = `${date}:${siteCode}`;
                  const rescue = rescuesBySiteThenDate[siteCode][date];

                  // TODO: To display rescuer names, we will need to poll the allRescues data

                  return (
                    <DataTable.Cell key={key} style={styles.cell}>
                      {rescue
                        ? rescue.rescuer || (
                            <Button
                              title="Book"
                              // This is only half working
                              disabled={makingBooking}
                              onPress={() => bookRescue(rescue)}
                            />
                          )
                        : '—'}
                    </DataTable.Cell>
                  );
                })}
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const RescuesListPure = React.memo(RescuesList);

function RescuesList({ toastMessage, availableRescues: allAvailableRescues, makingBooking, bookRescue }: any) {
  // Try to reduce sluggishness
  //const route = useRoute();
  //if (route.name !== 'Favourites') return null;

  // Also to reduce sliggishness
  // TODO: This can't stay!
  const availableRescues = allAvailableRescues.slice(0, 20);
  //const availableRescues = allAvailableRescues;

  return (
    <View style={styles.container}>
      <PaddedBlock>
        <Text>{toastMessage || `${availableRescues.length} rescues available`}</Text>
      </PaddedBlock>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {/*<Text style={styles.title}>Rescues</Text>*/}
        {/*
      <Text style={styles.title}>Rescues</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      */}

        {availableRescues.map((rescue: PartialRescue) => (
          <RescueCard
            key={rescue.id}
            rescue={rescue}
            additional={() => (
              <PullRightView>
                <Button
                  title="Book"
                  // This is only half working
                  disabled={makingBooking}
                  onPress={() => bookRescue(rescue)}
                />
              </PullRightView>
            )}
          />
        ))}
        {/* <EditScreenInfo path="/screens/RescuesScreen.tsx" /> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 10,
    backgroundColor: '#f2f2f2',
  },
  tableContainer: {
    width: '100%',
    height: '100%',
    // WARNING: Enabling alignItems will break scrolling of the calendar table on web
    //flex: 1,
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    // Undoes the margins on the first and last RescueCards
    marginVertical: -10,
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
  dateCell: {
    width: 110,
    padding: 6,
  },
  cell: {
    width: 80,
    padding: 6,
  },
  rowTitle: {
    width: 80,
    padding: 6,
  },
});
