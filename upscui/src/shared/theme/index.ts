export const colors = {
  primary: '#1565C0',
  primaryLight: '#5E92F3',
  primaryDark: '#003C8F',
  secondary: '#FF8F00',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  error: '#B00020',
  success: '#2E7D32',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
  card: '#FFFFFF',
};

export const darkColors = {
  ...colors,
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#333333',
  card: '#2C2C2C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
};
