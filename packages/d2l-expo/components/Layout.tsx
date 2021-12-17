import * as React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../components/Themed';
import { View as UnstyledView } from 'react-native';

export function CentralizingContainer(props: any) {
  return <View style={styles.centralizingContainer} {...props} />;
}

export function PaddedBlock(props: any) {
  return <UnstyledView style={styles.paddedBlock} {...props} />;
}

const styles = StyleSheet.create({
  centralizingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paddedBlock: {
    padding: 10,
  },
});
