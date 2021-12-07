import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { DataTable } from 'react-native-paper';
import { View } from '../components/Themed';

export default function RescuesScreen() {
  return (
    <View style={styles.container}>
      {/*
      <Text style={styles.title}>Rescues</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      */}
      <ScrollView horizontal>
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
});
