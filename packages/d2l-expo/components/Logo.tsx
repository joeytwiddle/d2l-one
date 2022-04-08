import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { View } from './Themed';

export default function Logo() {
  return (
    <View style={styles.logoContainer}>
      <Image style={styles.logo} source={require('../assets/images/icon.png')} />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {},
  logo: {
    width: 80,
    height: 80,
  },
});
