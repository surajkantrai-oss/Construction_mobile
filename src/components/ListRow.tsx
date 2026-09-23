import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';
import type { IconName } from '../navigation/sections';
import { colors, radius, shadows, spacing, typography } from '../theme';

/** Standard tappable/static row used across list screens: icon, title, subtitle, trailing badge, chevron. */
export function ListRow({ title, subtitle, badge, icon, onPress }: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  icon?: IconName;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.row}>
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={18} color={colors.textSecondary} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {badge}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </View>
  );
  return (
    <View style={[styles.card, shadows.sm]}>
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed} accessibilityRole="button">
          {content}
        </Pressable>
      ) : content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.cardTitle, fontSize: 15, color: colors.textPrimary },
  subtitle: { ...typography.secondary, color: colors.textSecondary },
  pressed: { opacity: 0.7 },
});
