/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import * as React from 'react';
import {
  ActivityIndicator,
  Button as DefaultButton,
  StyleSheet,
  Text as DefaultText,
  TouchableOpacity,
  View as DefaultView,
} from 'react-native';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

// Find the theme's color for the colorName you provide
// But also allows your caller to override the theme's color
// If caller wants to set their own color, they must provide an option for both light and dark themes
// See the Button function for an example
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type ButtonProps = ThemeProps & DefaultButton['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function SoftText(props: TextProps) {
  const { style, ...otherProps } = props;
  return <Text style={[{ opacity: 0.6 }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Button(props: ButtonProps) {
  const { lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');

  return <DefaultButton color={color} {...otherProps} />;
}

export function SecondaryButton(props: ButtonProps) {
  const { title, ...otherProps } = props;
  //const secondaryColor = useThemeColor({}, 'secondary');

  // We cannot control the text color of React Native buttons
  // So if we want a light button with dark text, we would need to create our own, using TouchableOpacity
  // But anyway, for now, our secondary buttons will just look like text links

  return (
    <TouchableOpacity {...otherProps}>
      <Text style={styles.link}>{title}</Text>
    </TouchableOpacity>
  );
}

export function LoadingSpinner() {
  const color = useThemeColor({}, 'tint');
  return <ActivityIndicator size={70} color={color} />;
}

const styles = StyleSheet.create({
  link: {
    color: '#55f',
    textDecorationLine: 'underline',
  },
});
