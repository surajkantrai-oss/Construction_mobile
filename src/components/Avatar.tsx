import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.primaryDark, fontWeight: '700' },
});
