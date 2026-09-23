import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export function FilterChip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  pressed: { opacity: 0.75 },
  label: { ...typography.secondary, color: colors.textSecondary, fontWeight: '600' },
  labelActive: { color: colors.primaryDark },
});
