import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

export function Card({ children, style, padded = true, elevated = true }: { children: ReactNode; style?: ViewStyle | ViewStyle[]; padded?: boolean; elevated?: boolean }) {
  return <View style={[styles.card, padded && styles.padded, elevated && shadows.sm, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border },
  padded: { padding: spacing.lg },
});
