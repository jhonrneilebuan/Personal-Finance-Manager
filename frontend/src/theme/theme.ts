import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const palette = {
  emerald: '#0B5D4B',
  mint: '#39B88F',
  amber: '#F4B740',
  coral: '#E86D5A',
  blue: '#3578E5',
  ink: '#17201D',
  cloud: '#F5F7FA',
};

export const createAppTheme = (dark: boolean): MD3Theme => ({
  ...(dark ? MD3DarkTheme : MD3LightTheme),
  roundness: 8,
  colors: {
    ...(dark ? MD3DarkTheme.colors : MD3LightTheme.colors),
    primary: palette.emerald,
    secondary: palette.mint,
    tertiary: palette.amber,
    error: palette.coral,
    background: dark ? '#101513' : palette.cloud,
    surface: dark ? '#18201D' : '#FFFFFF',
    surfaceVariant: dark ? '#22302B' : '#E7F0EC',
    outlineVariant: dark ? '#32423D' : '#DCE6E1',
  },
});
