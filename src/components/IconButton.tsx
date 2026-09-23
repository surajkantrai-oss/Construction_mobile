import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet } from 'react-native';
import type { IconName } from '../navigation/sections';
import { colors, radius } from '../theme';

export function IconButton({ icon, onPress, size = 22, color = colors.textPrimary, backgroundColor = colors.surfaceSecondary, accessibilityLabel, disabled }: {
  icon: IconName;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  accessibilityLabel: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.base, { backgroundColor }, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Ionicons name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: 44, height: 44, borderRadius: radius.control + 3, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
