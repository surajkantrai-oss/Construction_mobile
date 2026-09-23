import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModuleCard } from '../../components/ModuleCard';
import { moreItems, type Section } from '../../navigation/sections';
import { colors, spacing, typography } from '../../theme';
import type { UserRole } from '../../types';

export function MoreScreen({ role, onNavigate }: { role: UserRole; onNavigate: (section: Section) => void }) {
  const insets = useSafeAreaInsets();
  const items = moreItems.filter(item => item.roles.includes(role));
  return (
    <ScrollView style={styles.page} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>More</Text>
      <Text style={styles.subtitle}>Everything else, in one place</Text>
      <View style={styles.grid}>
        {items.map(item => (
          <ModuleCard key={item.id} label={item.label} description={item.description} icon={item.icon} tone={item.tone} onPress={() => onNavigate(item.id)} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, gap: spacing.lg },
  title: { ...typography.pageTitle, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
});
