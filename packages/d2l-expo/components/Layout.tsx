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

export function FullWidth(props: any) {
  return <View style={styles.fullWidth} {...props} />;
}

export function PullRightView(props: any) {
  return <View style={styles.pullRightView} {...props} />;
}

const styles = StyleSheet.create({
  centralizingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
    textAlign: 'center',
  },
  paddedBlock: {
    padding: 10,
  },
  pullRightView: {
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});
