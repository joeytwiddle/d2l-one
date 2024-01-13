//import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';
import { ColorSchemeName } from 'react-native';

// The useColorScheme value is always either light or dark, but the built-in
// type suggests that it can be null. This will not happen in practice, so this
// makes it a bit easier to work with.
export default function useColorScheme(): NonNullable<ColorSchemeName> {
  // If we want to re-enable this, it looks like we'll need to use <View> and <Text> components from Themed.tsx
  //return _useColorScheme() as NonNullable<ColorSchemeName>;
  // With the dark theme, half of our components were invisible!
  return 'light';
}
