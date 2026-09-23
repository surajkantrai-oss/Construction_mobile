import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', size = 'md', disabled = false, loading = false, fullWidth = true, style }: ButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerColor = variant === 'primary' || variant === 'danger' ? colors.onPrimary : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        variantStyles[variant],
        fullWidth ? styles.fullWidth : styles.compact,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={spinnerColor} /> : <Text style={[styles.label, size === 'sm' && styles.labelSm, textVariantStyles[variant]]}>{label}</Text>}
    </Pressable>
  );
}

export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => <Button {...props} variant="primary" />;
export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => <Button {...props} variant="secondary" />;

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: radius.control + 3, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, flexDirection: 'row', gap: spacing.sm },
  sm: { minHeight: 38, paddingHorizontal: spacing.md, borderRadius: radius.control },
  fullWidth: { alignSelf: 'stretch' },
  compact: { alignSelf: 'flex-start' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  label: { ...typography.body, fontWeight: '700' },
  labelSm: { fontSize: 13 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceSecondary },
  outline: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.error },
});

const textVariantStyles = StyleSheet.create({
  primary: { color: colors.onPrimary },
  secondary: { color: colors.textPrimary },
  outline: { color: colors.primary },
  ghost: { color: colors.primary },
  danger: { color: colors.onPrimary },
});
