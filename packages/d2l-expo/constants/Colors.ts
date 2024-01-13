const tintColorLight = 'hsl(117, 44%, 45%)';
const tintColorDark = 'hsl(117, 44%, 50%)';
const tintColorFaint = 'hsl(117, 44%, 60%)';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: tintColorLight,
    accent: tintColorLight,
    secondary: tintColorFaint,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: tintColorDark,
    accent: tintColorDark,
    secondary: '#222',
  },
};
