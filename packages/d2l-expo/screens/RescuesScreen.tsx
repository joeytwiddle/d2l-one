import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';
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

  // TODO: This scrolls on Android but not on web.  We may fix this by using multipe pages.  (But can multiple pages have different headers?)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rescues</Text>
      <Text>{availableRescues.length} rescues</Text>
      {/*
      <Text style={styles.title}>Rescues</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      */}
      <ScrollView horizontal /* style={{ overflow: 'scroll' }} */>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title style={styles.cell}>Date</DataTable.Title>
            <DataTable.Title style={styles.cell}>TM</DataTable.Title>
            <DataTable.Title style={styles.cell}>PS</DataTable.Title>
            <DataTable.Title style={styles.cell}>TM</DataTable.Title>
            <DataTable.Title style={styles.cell}>PS</DataTable.Title>
            <DataTable.Title style={styles.cell}>TM</DataTable.Title>
            <DataTable.Title style={styles.cell}>PS</DataTable.Title>
            <DataTable.Title style={styles.cell}>TM</DataTable.Title>
            <DataTable.Title style={styles.cell}>PS</DataTable.Title>
            <DataTable.Title style={styles.cell}>TM</DataTable.Title>
            <DataTable.Title style={styles.cell}>PS</DataTable.Title>
            <DataTable.Title style={styles.cell}>TM</DataTable.Title>
            <DataTable.Title style={styles.cell}>PS</DataTable.Title>
          </DataTable.Header>
          <DataTable.Row>
            <DataTable.Cell style={styles.cell}>Mon 1 Dec</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell style={styles.cell}>Tue 2 Dec</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <DataTable.Cell style={styles.cell}>Wed 3 Dec</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Jennifer</DataTable.Cell>
            <DataTable.Cell style={styles.cell}>Max</DataTable.Cell>
          </DataTable.Row>
        </DataTable>
        {/*
        <ScrollView horizontal>
          <View>
            <Text style={styles.rowTitle}>Date</Text>
            <Text style={styles.cell}>Mon 1 Dec</Text>
            <Text style={styles.cell}>Tue 2 Dec</Text>
            <Text style={styles.cell}>Wed 3 Dec</Text>
            <Text style={styles.cell}>Mon 1 Dec</Text>
            <Text style={styles.cell}>Tue 2 Dec</Text>
            <Text style={styles.cell}>Wed 3 Dec</Text>
            <Text style={styles.cell}>Mon 1 Dec</Text>
            <Text style={styles.cell}>Tue 2 Dec</Text>
            <Text style={styles.cell}>Wed 3 Dec</Text>
          </View>
          <View>
            <Text style={styles.rowTitle}>TM</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
          </View>
          <View>
            <Text style={styles.rowTitle}>PS</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
          </View>
          <View>
            <Text style={styles.rowTitle}>TM</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
          </View>
          <View>
            <Text style={styles.rowTitle}>PS</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
          </View>
          <View>
            <Text style={styles.rowTitle}>TM</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
          </View>
          <View>
            <Text style={styles.rowTitle}>PS</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
            <Text style={styles.cell}>Jennifer</Text>
            <Text style={styles.cell}>Steve</Text>
            <Text style={styles.cell}>Max</Text>
          </View>
        </ScrollView>
        */}
      </ScrollView>
      {/* <EditScreenInfo path="/screens/RescuesScreen.tsx" /> */}
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
  cell: {
    width: 80,
    padding: 6,
  },
  rowTitle: {
    width: 80,
    padding: 6,
  },
});
