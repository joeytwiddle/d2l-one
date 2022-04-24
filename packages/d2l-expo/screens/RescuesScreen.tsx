//import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CentralizingContainer,
  FullWidth,
  FullWidthPageContainer,
  PaddedBlock,
  PageContainer,
  PullRightView,
} from '../components/Layout';
import RescueCard from '../components/RescueCard';
import { Button, LoadingSpinner, Text, View } from '../components/Themed';
import { getSite } from '../data/site-data';
import {
  GetAvailableRescuesForCurrentUserDocument,
  RescueLite,
  useAssignSelfToRescueMutation,
  useGetAvailableRescuesForCurrentUserQuery,
  useGetBookingLimitsForCurrentUserQuery,
  useGetMyRescuesQuery,
} from '../graphql';
import useUser from '../hooks/useUser';
import { handleGlobalError } from '../navigation/LoginScreen';
import { RootStackParamList } from '../types';

function callD2LAPI(hook: any, ...args: any[]) {
  const result = hook(...args);
  if (result.error) {
    console.error(`Error from server: ${String(result.error.message)}`);
    //toast.error(...);
  }
  return result;
}

const Tab = createMaterialTopTabNavigator();

function useAvailableRescuesData() {
  //const rescues = useGetAllRescuesQuery().data?.rescues;
  //const rescues = useGetAllRescuesForMonthQuery({ variables: { month: 'JAN 2021' } }).data?.allRescuesForMonth;
  //const rescues = callD2LAPI(useGetAllRescuesForMonthQuery, { variables: { month: 'DEC 2021' } }).data
  //  ?.allRescuesForMonth;

  const availableRescuesQuery = useGetAvailableRescuesForCurrentUserQuery();
  const availableRescues = availableRescuesQuery.data?.availableRescuesForCurrentUser;
  const myRescuesQuery = useGetMyRescuesQuery();
  const user = useUser();

  // TODO: Split rescues up into days, so we can rescues available day-by-day

  //const rescuesSorted = availableRescues?.slice(0);
  //rescuesSorted?.sort((ra, rb) => (ra > rb ? +1 : -1));
  // We can also use memoing on derived variables
  const rescuesSorted = React.useMemo(
    () => availableRescues?.slice(0).sort((ra, rb) => (ra > rb ? +1 : -1)),
    [availableRescues],
  );

  return {
    availableRescuesQuery,
    availableRescues: rescuesSorted,
  };
}

export default function RescuesScreen() {
  // I put the tab navigator after these hooks, because I didn't want to duplicate the hooks.
  // However that has resulted in performance issues, because we need to pass the props down, so we need inline components.
  // I have tried using pure compoenents to help with the performance issues.
  // TODO: But if they persist, we might want to extract the hooks setup into a function, and then use that inside the tab components.
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* We disable swiping so that we can scroll the table horizontally */}
      <Tab.Navigator screenOptions={{ swipeEnabled: false }}>
        <Tab.Screen name="Booking Limits" component={BookingLimits} />
        <Tab.Screen name="Favourites" component={FavouriteRescues} />
        <Tab.Screen name="Calendar" component={RescuesCalendar} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

function BookingLimits() {
  const bookingLimitsQuery = useGetBookingLimitsForCurrentUserQuery();
  const bookingLimits = bookingLimitsQuery.data?.bookingLimitsForCurrentUser;

  return <Text>{JSON.stringify(bookingLimits)}</Text>;
}

function RescuesLoadingSpinner() {
  return (
    <CentralizingContainer>
      <LoadingSpinner />
    </CentralizingContainer>
  );
}

const bgStyle = (colIndex: number, rowIndex: number) => {
  const shade = ((colIndex + 0) % 2) + ((rowIndex + 0) % 2);
  const brightness = 255 - shade * 8; // TODO: Should invert for theme
  const backgroundColor = `rgb(${brightness}, ${brightness}, ${brightness})`;
  return { backgroundColor };
};

function RescuesCalendar() {
  // Try to reduce sluggishness
  //const route = useRoute();
  //if (route.name !== 'Calendar') return null;

  const { availableRescuesQuery, availableRescues } = useAvailableRescuesData();

  const { allDates, rescuesBySiteThenDate, sitesToShow, datesToShow } = React.useMemo(() => {
    const allDates = new Set<string>();
    const rescuesBySiteThenDate = {} as Record<string, Record<string, RescueLite>>;
    if (availableRescues) {
      for (const rescue of availableRescues) {
        const { siteId } = rescue;
        const date = rescue.date;
        rescuesBySiteThenDate[siteId] = rescuesBySiteThenDate[siteId] || {};
        rescuesBySiteThenDate[siteId][date] = rescue;
        allDates.add(date);
      }
    }

    const sitesToShow = Object.keys(rescuesBySiteThenDate);

    // Until we have a fixed order, we shall order alphabetically (otherwise they tend to jump about when we make bookings!)
    sitesToShow.sort();

    const datesToShow = Array.from(allDates.values()).sort();

    return { allDates, rescuesBySiteThenDate, sitesToShow, datesToShow };
  }, [availableRescues]);

  if (availableRescuesQuery.loading) {
    return <RescuesLoadingSpinner />;
  }
  if (!availableRescues) return null;

  return (
    <RescuesCalendarViewPure
      availableRescues={availableRescues}
      sitesToShow={sitesToShow}
      datesToShow={datesToShow}
      rescuesBySiteThenDate={rescuesBySiteThenDate}
    />
  );
}

const RescuesCalendarViewPure = React.memo(RescuesCalendarView);

function RescuesCalendarView({
  availableRescues,
  sitesToShow,
  datesToShow,
  rescuesBySiteThenDate,
}: {
  availableRescues: RescueLite[];
  sitesToShow: string[];
  datesToShow: string[];
  rescuesBySiteThenDate: Record<string, Record<string, RescueLite>>;
}) {
  const navigation = useNavigation();

  return (
    <FullWidthPageContainer>
      <PaddedBlock>
        <FullWidth>
          <Text>{availableRescues.length} rescues available</Text>
        </FullWidth>
      </PaddedBlock>
      <ScrollView horizontal /* style={{ overflow: 'scroll' }} */>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={[styles.dateCell, bgStyle(1, 1)]}>Date</DataTable.Title>
              {sitesToShow.map((siteCode, colIndex) => (
                <DataTable.Title key={siteCode} style={[styles.cell, bgStyle(colIndex, 1)]}>
                  {siteCode}
                </DataTable.Title>
              ))}
            </DataTable.Header>
            {datesToShow.map((date, rowIndex) => (
              <DataTable.Row key={date}>
                <DataTable.Cell style={[styles.dateCell, bgStyle(1, rowIndex)]}>{niceDate(date)}</DataTable.Cell>
                {sitesToShow.map((siteCode, colIndex) => {
                  const key = `${date}:${siteCode}`;
                  const rescue = rescuesBySiteThenDate[siteCode][date];

                  // TODO: To display rescuer names, we will need to poll the allRescues data
                  // That will also allow us to show which rescues this user has booked

                  // '—'
                  return (
                    <DataTable.Cell key={key} style={[styles.cell, bgStyle(colIndex, rowIndex)]}>
                      {rescue
                        ? rescue.rescuer || (
                            <Button
                              title="View"
                              onPress={() => {
                                navigation.navigate('BookableRescueScreen', {
                                  rescueId: rescue.id,
                                });
                              }}
                            />
                          )
                        : '✔'}
                    </DataTable.Cell>
                  );
                })}
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      </ScrollView>
    </FullWidthPageContainer>
  );
}

// This worked
//type FavouriteRescuesTabNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FavouriteRescuesTab'>;
// But I think this is more correct
//type FavouriteRescuesTabNavigationProp = MaterialTopTabNavigationProp<RootStackParamList, 'FavouriteRescuesTab'>;

//function FavouriteRescues({ navigation }: { navigation: FavouriteRescuesTabNavigationProp }) {
//function FavouriteRescues() {
//  const navigation = useNavigation<FavouriteRescuesTabNavigationProp>();

function FavouriteRescues() {
  const navigation = useNavigation();

  // Try to reduce sluggishness
  //const route = useRoute();
  //if (route.name !== 'Favourites') return null;

  const { availableRescuesQuery, availableRescues: allAvailableRescues } = useAvailableRescuesData();
  if (availableRescuesQuery.loading) {
    return <RescuesLoadingSpinner />;
  }
  if (!allAvailableRescues) return null;

  allAvailableRescues.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? +1 : a.siteId < b.siteId ? -1 : +1));

  // Also to reduce sliggishness
  // TODO: This can't stay!
  const availableRescues = allAvailableRescues.slice(0, 20);
  //const availableRescues = allAvailableRescues;

  return (
    <PageContainer>
      {/*<PaddedBlock>
        <Text>{availableRescues.length} rescues available</Text>
      </PaddedBlock>*/}
      <PaddedBlock>
        <Text>This page is under construction. It does not show all available rescues.</Text>
      </PaddedBlock>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {availableRescues.map((rescue: RescueLite) => (
          <RescueCard
            key={rescue.id}
            rescue={rescue}
            additional={() => (
              <PullRightView>
                <Button
                  title="View"
                  onPress={() => {
                    navigation.navigate('BookableRescueScreen', {
                      rescueId: rescue.id,
                    });
                  }}
                />
              </PullRightView>
            )}
          />
        ))}
        {/* <EditScreenInfo path="/screens/RescuesScreen.tsx" /> */}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 10,
    //backgroundColor: '#f2f2f2',
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
    minWidth: 100,
    padding: 6,
    //border: '',
  },
  cell: {
    minWidth: 70,
    padding: 6,
    //border: '',
  },
});

export function niceDate(dateStr: string) {
  const date = new Date(dateStr);
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  const shortMonthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
    date.getMonth()
  ];
  return `${dayOfWeek}, ${shortMonthName} ${date.getDate()}`;
}
