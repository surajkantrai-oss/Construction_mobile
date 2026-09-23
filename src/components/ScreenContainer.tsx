import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, spacing } from '../theme';

/** Consistent scroll wrapper for screen bodies: standard horizontal padding, optional pull-to-refresh. */
export function ScreenContainer({ children, refreshing, onRefresh, scroll = true, contentStyle }: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) {
  if (!scroll) return <View style={[styles.page, styles.content, contentStyle]}>{children}</View>;
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.content, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.lg },
});
