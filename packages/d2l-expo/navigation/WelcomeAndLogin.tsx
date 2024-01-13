import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { CombinedDarkTheme, CombinedDefaultTheme } from '../constants/Themes';
import useColorScheme from '../hooks/useColorScheme';
import LoginScreen from './LoginScreen';

export default function WelcomeAndLogin() {
  // This theming code is duplicated from Navigation.tsx, just so we can theme the LoginScreen
  // A better solution would be to move the AppRoot and the LoginScreen inside the original NavigationContainer
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CombinedDarkTheme : CombinedDefaultTheme;
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <LoginScreen />
      </NavigationContainer>
    </PaperProvider>
  );
}
