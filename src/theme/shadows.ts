import { Platform } from 'react-native';

const elevation = (opacity: number, blur: number, offsetY: number, androidElevation: number) =>
  Platform.select({
    ios: { shadowColor: '#1C1917', shadowOpacity: opacity, shadowRadius: blur, shadowOffset: { width: 0, height: offsetY } },
    android: { elevation: androidElevation },
    default: {},
  })!;

export const shadows = {
  none: {},
  sm: elevation(0.04, 6, 2, 1),
  md: elevation(0.06, 12, 4, 3),
  lg: elevation(0.09, 20, 8, 6),
};
