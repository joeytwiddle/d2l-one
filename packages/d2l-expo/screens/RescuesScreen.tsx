//import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
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
import RescueCard, { niceDate } from '../components/RescueCard';
import { Button, LoadingSpinner, Text, useThemeColor, View } from '../components/Themed';
import { getSite, useSiteDataCached } from '../data/site-data';
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

// We have different booking screens, but they use the same data, queries and mutations.
// So to avoid repetition, we gather that data in one place.
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
        <Tab.Screen name="List" component={RescuesList} />
        <Tab.Screen name="Calendar" component={RescuesCalendar} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

function BookingLimits() {
  const bookingLimitsQuery = useGetBookingLimitsForCurrentUserQuery();
  const bookingLimits = bookingLimitsQuery.data?.bookingLimitsForCurrentUser;
  //return <Text>{JSON.stringify(bookingLimits)}</Text>;

  if (!bookingLimits) return <LoadingSpinner />;

  return (
    <FullWidthPageContainer>
      <ScrollView>
        <PaddedBlock>
          {/* This used to centralise vertically, until I put it inside <FullWidthPageContainer> */}
          {/* Giving FullWidthPageContainer "height: 100%" did not help. */}
          {/* It doesn't really matter.  This doesn't need to centralise vertically. */}
          <CentralizingContainer>
            {bookingLimits.map(({ siteGroupName, limit, remaining, sites }) => (
              <PaddedBlock key={siteGroupName}>
                <Text>You may book {remaining} more rescues from the following sites:</Text>
                {sites.map(siteId => (
                  <Text key={siteId}> - {getSite(siteId).fullName}</Text>
                ))}
                <Text>
                  ({limit - remaining} already booked, maximum {limit})
                </Text>
              </PaddedBlock>
            ))}
            <PaddedBlock>
              <Text>There are other sites with unrestricted booking.</Text>
            </PaddedBlock>
          </CentralizingContainer>
        </PaddedBlock>
      </ScrollView>
    </FullWidthPageContainer>
  );
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

function RescuesList() {
  const navigation = useNavigation();

  const { allAreas } = useSiteDataCached();

  const [selectedArea, setSelectedArea] = useState('_ALL_');

  let { availableRescuesQuery, availableRescues: allAvailableRescues } = useAvailableRescuesData();
  if (availableRescuesQuery.loading) {
    return <RescuesLoadingSpinner />;
  }
  if (!allAvailableRescues) return null;

  if (selectedArea && selectedArea !== '_ALL_') {
    allAvailableRescues = allAvailableRescues.filter(rescue => {
      const site = getSite(rescue.siteId);
      return site.area === selectedArea;
    });
  }

  allAvailableRescues.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? +1 : a.siteId < b.siteId ? -1 : +1));

  // TODO: We are currently limiting the number of rescues displayed, because with 100 or more, it gets pretty sluggish.
  // TODO: We may need to use a smart list, that only renders the visible cards.
  // TODO: We could trim by date.  (E.g. only next 2 weeks, or next 4 weeks.)
  const availableRescues = allAvailableRescues.slice(0, 50);
  //const availableRescues = allAvailableRescues;

  return (
    <PageContainer>
      <View style={{ padding: 10, width: '100%' }}>
        {/*<Text>{selectedArea} of [{allAreas.join(', ')}]</Text>*/}
        <Picker
          prompt="Select area"
          selectedValue={selectedArea}
          onValueChange={(itemValue, itemIndex) => setSelectedArea(itemValue)}
          style={{
            width: '100%',
            borderWidth: 1,
            borderColor: '#bbbbbb',
            backgroundColor: useThemeColor({}, 'background'),
            fontSize: 18,
            padding: 5,
          }}
        >
          <Picker.Item label="All Areas" value="_ALL_" />
          {allAreas.map(area => (
            <Picker.Item key={area} label={area} value={area} />
          ))}
        </Picker>
      </View>
      {/*<PaddedBlock>
        <Text>{availableRescues.length} rescues available</Text>
      </PaddedBlock>*/}
      <PaddedBlock>
        <Text style={{ color: '#888f' }}>This page is under construction. It does not show all available rescues.</Text>
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
