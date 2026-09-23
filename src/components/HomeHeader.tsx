import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { colors, spacing, typography } from '../theme';

function greetingWord() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** The branded Home-screen header: time-of-day greeting, name, role context, and an avatar entry point to Profile. */
export function HomeHeader({ name, roleLabel, onAvatarPress }: { name: string; roleLabel: string; onAvatarPress: () => void }) {
  const firstName = name.split(' ')[0] || name;
  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>{greetingWord()},</Text>
        <Text style={styles.name} numberOfLines={1}>{firstName}</Text>
        <Text style={styles.subtitle}>{roleLabel} workspace</Text>
      </View>
      <Pressable onPress={onAvatarPress} accessibilityRole="button" accessibilityLabel="Open profile">
        <Avatar name={name} size={48} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.background, gap: spacing.md },
  greeting: { ...typography.body, color: colors.textSecondary },
  name: { ...typography.display, fontSize: 26, color: colors.textPrimary },
  subtitle: { ...typography.secondary, color: colors.textSecondary, marginTop: 2 },
});
