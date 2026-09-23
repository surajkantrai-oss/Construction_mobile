import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { apiUrl } from '../../api';
import { Button, FormField } from '../../components';
import { colors, radius, spacing, typography } from '../../theme';

export function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onLogin(email.trim(), password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.brandWrap}>
          <View style={styles.logo}>
            <Ionicons name="business" size={30} color={colors.onPrimary} />
          </View>
          <Text style={styles.brand}>BuildCorp</Text>
          <Text style={styles.tagline}>Construction management, wherever the work is.</Text>
        </View>

        <View style={styles.form}>
          <FormField label="Email address" value={email} onChangeText={setEmail} placeholder="you@company.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={submit} loading={busy} style={styles.submit} />
        </View>

        <Text style={styles.endpoint}>API: {apiUrl}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xxl, gap: spacing.xxl },
  brandWrap: { alignItems: 'center', gap: spacing.xs },
  logo: { width: 64, height: 64, borderRadius: radius.hero, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  brand: { ...typography.display, color: colors.textPrimary },
  tagline: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  form: { gap: spacing.md, maxWidth: 420, width: '100%', alignSelf: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.errorBg, borderRadius: radius.control, padding: spacing.sm },
  errorText: { ...typography.secondary, color: colors.error, flex: 1 },
  submit: { marginTop: spacing.xs },
  endpoint: { ...typography.caption, textTransform: 'none', color: colors.textMuted, textAlign: 'center' },
});
