import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { authApi, ApiError } from '../../api';
import { AppHeader, Avatar, Button, ConfirmDialog, FormField, ScreenContainer, StatusBadge } from '../../components';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { User } from '../../types';
import { roleName } from '../../utils/formatters';

export function ProfileScreen({ user, onLogout, onBack }: { user: User; onLogout: () => Promise<void>; onBack?: () => void }) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmingLogoutAll, setConfirmingLogoutAll] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await authApi.profile({ name, phone });
      Alert.alert('Profile updated', 'Your details have been saved.');
    } catch (error) {
      Alert.alert('Unable to update profile', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await authApi.logoutAll();
      await onLogout();
    } catch (error) {
      Alert.alert('Unable to sign out all devices', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setLoggingOutAll(false);
      setConfirmingLogoutAll(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Profile" subtitle={`${roleName(user.role)} account`} onBack={onBack} />
      <ScreenContainer>
        <View style={[styles.identity, shadows.sm]}>
          <Avatar name={user.name} size={72} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <StatusBadge tone="primary">{roleName(user.role)}</StatusBadge>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={[styles.card, shadows.sm]}>
            <FormField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
            <FormField label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
            <Button label={saving ? 'Saving…' : 'Save changes'} onPress={save} loading={saving} style={{ marginTop: spacing.xs }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session</Text>
          <View style={[styles.card, shadows.sm]}>
            <Button label="Sign out" onPress={() => void onLogout()} variant="outline" />
            <Pressable onPress={() => setConfirmingLogoutAll(true)} style={styles.dangerLink} accessibilityRole="button">
              <Text style={styles.dangerLinkText}>Sign out of all devices</Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>

      <ConfirmDialog
        visible={confirmingLogoutAll}
        title="Sign out everywhere?"
        message="This ends your session on every device signed in with this account, including this one."
        confirmLabel="Sign out all"
        destructive
        loading={loggingOutAll}
        onCancel={() => setConfirmingLogoutAll(false)}
        onConfirm={confirmLogoutAll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  identity: { alignItems: 'center', gap: spacing.xs, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.xxl },
  name: { ...typography.sectionTitle, color: colors.textPrimary, marginTop: spacing.sm },
  email: { ...typography.secondary, color: colors.textSecondary, marginBottom: spacing.xs },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  dangerLink: { alignItems: 'center', paddingVertical: spacing.sm },
  dangerLinkText: { ...typography.secondary, color: colors.error, fontWeight: '600' },
});
