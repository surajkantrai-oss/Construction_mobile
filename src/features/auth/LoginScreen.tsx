import { useState } from 'react';
import { Text, View } from 'react-native';
import { apiUrl } from '../../api';
import { appStyles as styles } from '../../theme/appStyles';
import { Button, Field } from '../../ui';

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
    <View style={styles.login}>
      <View style={styles.logo}><Text style={styles.logoText}>B</Text></View>
      <Text style={styles.brand}>BuildCorp</Text>
      <Text style={styles.tagline}>Construction management, wherever the work is.</Text>
      <View style={{ width: '100%', maxWidth: 420, gap: 10 }}>
        <Field value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" />
        <Field value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={submit} disabled={busy} />
      </View>
      <Text style={styles.endpoint}>API: {apiUrl}</Text>
    </View>
  );
}
