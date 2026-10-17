import { StyleSheet } from 'react-native';

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  micro: 10,
  caption: 11,
  bodySm: 12,
  body: 14,
  bodyLg: 15,
  titleSm: 16,
  title: 18,
  titleLg: 20,
  header: 24,
  hero: 28,
};

export const BorderRadius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  pill: 9999,
  round: 9999,
};

export const CommonStyles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardShadowSubtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  floatingShadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  headerShadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
});
