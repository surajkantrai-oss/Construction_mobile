import { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export type FormFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  helper?: string;
};

export function FormField({ label, error, helper, onFocus, onBlur, multiline, ...inputProps }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        onFocus={event => { setFocused(true); onFocus?.(event); }}
        onBlur={event => { setFocused(false); onBlur?.(event); }}
        style={[styles.input, multiline && styles.multiline, focused && styles.focused, !!error && styles.errorBorder]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { ...typography.caption, color: colors.textPrimary, textTransform: 'none' },
  input: { backgroundColor: colors.surfaceSecondary, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.input, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: 15, color: colors.textPrimary, minHeight: 48 },
  multiline: { minHeight: 100, textAlignVertical: 'top', paddingTop: spacing.md },
  focused: { borderColor: colors.primary, backgroundColor: colors.surface },
  errorBorder: { borderColor: colors.error },
  error: { ...typography.caption, color: colors.error, textTransform: 'none' },
  helper: { ...typography.caption, color: colors.textMuted, textTransform: 'none' },
});
