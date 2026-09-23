import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export function SearchInput({ value, onChangeText, placeholder = 'Search…' }: { value: string; onChangeText: (v: string) => void; placeholder?: string }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceSecondary, borderRadius: radius.input, paddingHorizontal: spacing.md, height: 46, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, fontSize: 15, color: colors.textPrimary, height: '100%' },
});
