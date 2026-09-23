import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

const toneStyles: Record<BadgeTone, { bg: string; fg: string }> = {
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  error: { bg: colors.errorBg, fg: colors.error },
  info: { bg: colors.infoBg, fg: colors.info },
  neutral: { bg: colors.surfaceSecondary, fg: colors.textSecondary },
  primary: { bg: colors.primaryLight, fg: colors.primaryDark },
};

/** Maps common backend status strings to a badge tone. */
export function toneForStatus(status?: string): BadgeTone {
  const value = (status || '').toLowerCase();
  if (['approved', 'done', 'active', 'present', 'in stock', 'credit'].includes(value)) return 'success';
  if (['rejected', 'absent', 'low stock', 'debit'].includes(value)) return 'error';
  if (['pending', 'submitted', 'in-progress', 'review', 'late'].includes(value)) return 'warning';
  return 'neutral';
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  const palette = toneStyles[tone];
  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs, borderRadius: radius.pill, alignSelf: 'flex-start' },
  label: { ...typography.caption, textTransform: 'capitalize' },
});
