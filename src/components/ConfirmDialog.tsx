import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors, radius, shadows, spacing, typography } from '../theme';

/** Centered confirmation dialog for destructive/important actions (logout, delete, etc). Always vertically centered, never collides with the status bar/notch. */
export function ConfirmDialog({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive, onConfirm, onCancel, loading }: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Dismiss" />
        <View style={[styles.card, shadows.lg]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <View style={{ flex: 1 }}><Button label={cancelLabel} variant="secondary" onPress={onCancel} disabled={loading} /></View>
            <View style={{ flex: 1 }}><Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} onPress={onConfirm} loading={loading} /></View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { width: '100%', maxWidth: 380, backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.xl, gap: spacing.sm },
  title: { ...typography.sectionTitle, color: colors.textPrimary },
  message: { ...typography.body, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
});
