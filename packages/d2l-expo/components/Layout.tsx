import * as React from 'react';
import { StyleSheet } from 'react-native';
import { View } from '../components/Themed';

export function CentralizingContainer(props: any) {
  return <View style={styles.centralizingContainer} {...props} />;
}

const styles = StyleSheet.create({
  centralizingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
