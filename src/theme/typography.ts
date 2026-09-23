import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select<string | undefined>({ ios: 'System', android: 'sans-serif', default: undefined });
const fontFamilyMedium = Platform.select<string | undefined>({ ios: 'System', android: 'sans-serif-medium', default: undefined });

type Style = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight'>;

export const typography: Record<'display' | 'pageTitle' | 'sectionTitle' | 'cardTitle' | 'body' | 'secondary' | 'caption', Style> = {
  display: { fontFamily, fontSize: 32, fontWeight: '700', lineHeight: 38 },
  pageTitle: { fontFamily, fontSize: 28, fontWeight: '700', lineHeight: 34 },
  sectionTitle: { fontFamily: fontFamilyMedium, fontSize: 20, fontWeight: '600', lineHeight: 26 },
  cardTitle: { fontFamily: fontFamilyMedium, fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body: { fontFamily, fontSize: 15, fontWeight: '400', lineHeight: 21 },
  secondary: { fontFamily, fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontFamily: fontFamilyMedium, fontSize: 12, fontWeight: '500', lineHeight: 16 },
};
