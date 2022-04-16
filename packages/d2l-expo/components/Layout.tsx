import * as React from 'react';
import { StyleSheet } from 'react-native';
import { View as UnstyledView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// SafeAreaView doesn't need to wrap the entire content, only the header.  If there is no header, it can just be used for padding
// https://stackoverflow.com/a/59185120/99777

// The common wrapper for most screens
// This will limit the width on wide displays, so the content will appear in the center of the screen, rather than stretched left to right in a way that looks silly
export function PageContainer(props: any) {
  return (
    /*
    // This mostly worked, but it left-aligned the text "This page is under construction" somehow outside the 1000 centralised block
    <SafeAreaView style={styles.pageContainer} {...props} />
    */
    /*
    <SafeAreaView style={styles.pageContainerOuter}>
      <UnstyledView style={styles.pageContainerInner} {...props} />
    </SafeAreaView>
    */
    <>
      <SafeAreaView />
      <UnstyledView style={styles.pageContainerOuter}>
        <UnstyledView style={styles.pageContainerInner} {...props} />
      </UnstyledView>
    </>
  );
}

export function FullWidthPageContainer(props: any) {
  //return <SafeAreaView style={styles.fullWidthPageContainer} {...props} />;
  return (
    <>
      <SafeAreaView />
      <UnstyledView style={styles.fullWidthPageContainer} {...props} />
    </>
  );
}

export function CentralizingContainer(props: any) {
  return <UnstyledView style={styles.centralizingContainer} {...props} />;
}

export function PaddedBlock(props: any) {
  return <UnstyledView style={styles.paddedBlock} {...props} />;
}

export function FullWidth(props: any) {
  return <UnstyledView style={styles.fullWidth} {...props} />;
}

export function PullRightView(props: any) {
  return <UnstyledView style={styles.pullRightView} {...props} />;
}

const styles = StyleSheet.create({
  /*
  pageContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    //alignContent: 'center',
    //justifyContent: 'center',
  },
  */
  pageContainerOuter: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageContainerInner: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthPageContainer: {
    flex: 1,
    width: '100%',
  },
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
