import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { IconName } from '../navigation/sections';
import { colors, radius, shadows, spacing, typography } from '../theme';

export type ModuleTone = 'green' | 'blue' | 'orange' | 'coral';

export function ModuleCard({ label, description, icon, tone, onPress }: { label: string; description: string; icon: IconName; tone: ModuleTone; onPress: () => void }) {
  const palette = colors.pastel[tone];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, shadows.sm, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
        <Ionicons name={icon} size={22} color={palette.fg} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs },
  pressed: { opacity: 0.85 },
  iconWrap: { width: 44, height: 44, borderRadius: radius.control + 3, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  label: { ...typography.cardTitle, color: colors.textPrimary },
  description: { ...typography.secondary, color: colors.textSecondary },
});
