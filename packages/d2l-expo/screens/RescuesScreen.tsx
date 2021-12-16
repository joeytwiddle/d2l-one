import * as React from 'react';
import { Button, ScrollView, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';
import { PartialRescue } from '../client-types';
import RescueCard from '../components/RescueCard';
import { Text, View } from '../components/Themed';
import { useGetAllRescuesForMonthQuery, useGetAvailableRescuesForCurrentUserQuery } from '../graphql';

function callD2LAPI(hook: any, ...args: any[]) {
  const result = hook(...args);
  if (result.error) {
    console.error(`Error from server: ${String(result.error.message)}`);
    //toast.error(...);
  }
  return result;
}

export default function RescuesScreen() {
  //const rescues = useGetAllRescuesQuery().data?.rescues;
  //const rescues = useGetAllRescuesForMonthQuery({ variables: { month: 'JAN 2021' } }).data?.allRescuesForMonth;
  //const rescues = callD2LAPI(useGetAllRescuesForMonthQuery, { variables: { month: 'DEC 2021' } }).data
  //  ?.allRescuesForMonth;

  const availableRescues = useGetAvailableRescuesForCurrentUserQuery().data?.availableRescuesForCurrentUser;

  if (!availableRescues) return null;

  // TODO: Split rescues up into days, so we can rescues available day-by-day

  const rescuesSorted = availableRescues.slice(0);
  rescuesSorted.sort((ra, rb) => (ra > rb ? +1 : -1));

  const bookRescue = (rescue: PartialRescue) => {
    alert('booking...');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      {/*<Text style={styles.title}>Rescues</Text>*/}
      <Text>{availableRescues.length} rescues</Text>
      {/*
      <Text style={styles.title}>Rescues</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      */}

      {availableRescues.map(rescue => (
        <RescueCard
          key={rescue.id}
          rescue={rescue}
          additional={() => <Button title="Book" onPress={() => bookRescue(rescue)} />}
        />
      ))}
      {/* <EditScreenInfo path="/screens/RescuesScreen.tsx" /> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    margin: 10,
  },
  scrollViewContent: {
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
  cell: {
    width: 80,
    padding: 6,
  },
  rowTitle: {
    width: 80,
    padding: 6,
  },
});
