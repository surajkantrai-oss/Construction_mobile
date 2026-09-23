import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import type { IconName } from '../navigation/sections';
import { colors, spacing, typography } from '../theme';

export function EmptyState({ icon = 'file-tray-outline', title, description, actionLabel, onAction }: {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={26} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="outline" size="sm" fullWidth={false} style={styles.action} /> : null}
    </View>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }: { title?: string; description: string; onRetry: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, { backgroundColor: colors.errorBg }]}>
        <Ionicons name="alert-circle-outline" size={26} color={colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button label="Retry" onPress={onRetry} variant="outline" size="sm" fullWidth={false} style={styles.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl, gap: 4 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { ...typography.cardTitle, color: colors.textPrimary, textAlign: 'center' },
  description: { ...typography.secondary, color: colors.textSecondary, textAlign: 'center' },
  action: { marginTop: spacing.sm },
});
