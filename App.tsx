import { useEffect, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { authApi, sessionStore } from './src/api';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { AppShell } from './src/navigation/AppShell';
import { appStyles as styles } from './src/theme/appStyles';
import type { Session } from './src/types';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    sessionStore.load().then(setSession).finally(() => setStarting(false));
  }, []);

  const login = async (email: string, password: string) => {
    const nextSession = await authApi.login(email, password);
    await sessionStore.save(nextSession);
    setSession(nextSession);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // The locally stored session must still be cleared.
    }
    await sessionStore.clear();
    setSession(null);
  };

  if (starting) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.brand}>BuildCorp</Text>
        <Text style={styles.muted}>Preparing your workspace…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="dark" />
      {session ? (
        <AppShell session={session} onLogout={logout} />
      ) : (
        <LoginScreen onLogin={login} />
      )}
    </SafeAreaView>
  );
}
