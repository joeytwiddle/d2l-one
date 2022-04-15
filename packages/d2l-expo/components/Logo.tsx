import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { View } from './Themed';

export default function Logo({ size = 'small' }: { size?: 'small' | 'large' }) {
  return (
    <View style={styles.logoContainer}>
      <Image
        style={size === 'large' ? styles.logoLarge : styles.logoSmall}
        source={require('../assets/images/icon.png')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {},
  logoSmall: {
    width: 80,
    height: 80,
  },
  logoLarge: {
    width: 180,
    height: 180,
  },
});
