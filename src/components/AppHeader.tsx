import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

/** Standard header for secondary/detail screens: optional back button, title, subtitle, right-side actions. */
export function AppHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={8} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -spacing.sm },
  title: { ...typography.pageTitle, fontSize: 24, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 2 },
  right: { flexDirection: 'row', gap: spacing.sm },
});
