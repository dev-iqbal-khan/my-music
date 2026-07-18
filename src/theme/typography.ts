import { TextStyle } from 'react-native';
import { colors } from './colors';

// iOS system font (SF Pro) is the default family on iOS.
export const type: Record<string, TextStyle> = {
  largeTitle: { fontSize: 34, fontWeight: '700', color: colors.label, letterSpacing: 0.37 },
  title2: { fontSize: 22, fontWeight: '700', color: colors.label },
  title3: { fontSize: 20, fontWeight: '600', color: colors.label },
  headline: { fontSize: 17, fontWeight: '600', color: colors.label },
  body: { fontSize: 17, fontWeight: '400', color: colors.label },
  callout: { fontSize: 16, fontWeight: '400', color: colors.label },
  subhead: { fontSize: 15, fontWeight: '400', color: colors.secondaryLabel },
  footnote: { fontSize: 13, fontWeight: '400', color: colors.secondaryLabel },
  caption: { fontSize: 12, fontWeight: '400', color: colors.secondaryLabel },
};
