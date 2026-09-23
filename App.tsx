import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { authApi, sessionStore } from './src/api';
import { LoginScreen } from './src/features/auth/LoginScreen';
import { AppShell } from './src/navigation/AppShell';
import { colors, radius, spacing, typography } from './src/theme';
import type { Session } from './src/types';

function AppContent() {
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
        <View style={styles.logo}>
          <Ionicons name="business" size={28} color={colors.onPrimary} />
        </View>
        <Text style={styles.brand}>BuildCorp</Text>
        <Text style={styles.muted}>Preparing your workspace…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.app} edges={session ? ['top', 'left', 'right'] : undefined}>
      <StatusBar style="dark" />
      {session ? (
        <AppShell session={session} onLogout={logout} />
      ) : (
        <LoginScreen onLogin={login} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: spacing.xs },
  logo: { width: 56, height: 56, borderRadius: radius.hero, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  brand: { ...typography.display, fontSize: 26, color: colors.textPrimary },
  muted: { ...typography.body, color: colors.textSecondary },
});
