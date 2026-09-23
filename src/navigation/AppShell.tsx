import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AttendanceScreen } from '../features/attendance/AttendanceScreen';
import { AuditScreen } from '../features/audit/AuditScreen';
import { HomeScreen } from '../features/dashboard/HomeScreen';
import { DocumentsScreen } from '../features/documents/DocumentsScreen';
import { DprsScreen } from '../features/dpr/DprsScreen';
import { FinanceScreen } from '../features/finance/FinanceScreen';
import { MoreScreen } from '../features/more/MoreScreen';
import { PeopleScreen } from '../features/people/PeopleScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { ProjectsScreen } from '../features/projects/ProjectsScreen';
import { CategoriesScreen } from '../features/categories/CategoriesScreen';
import { VendorsScreen } from '../features/vendors/VendorsScreen';
import { StockScreen } from '../features/stock/StockScreen';
import { TasksScreen } from '../features/tasks/TasksScreen';
import { primaryTabs, secondarySections, type Section } from './sections';
import { colors, shadows, spacing, typography } from '../theme';
import type { Session } from '../types';

export function AppShell({ session, onLogout }: { session: Session; onLogout: () => Promise<void> }) {
  const [section, setSection] = useState<Section>('home');
  const insets = useSafeAreaInsets();
  const visibleTabs = useMemo(() => primaryTabs.filter(tab => tab.roles.includes(session.user.role)), [session.user.role]);
  const isSecondary = secondarySections.includes(section);
  const activeTab: Section = isSecondary ? 'more' : section;

  const backToMore = () => setSection('more');

  return (
    <View style={styles.root}>
      <View style={{ flex: 1 }}>
        {section === 'home' && <HomeScreen role={session.user.role} userName={session.user.name} onNavigate={setSection} />}
        {section === 'dpr' && <DprsScreen role={session.user.role} />}
        {section === 'tasks' && <TasksScreen role={session.user.role} />}
        {section === 'attendance' && <AttendanceScreen role={session.user.role} onBack={backToMore} />}
        {section === 'projects' && <ProjectsScreen role={session.user.role} />}
        {section === 'stock' && <StockScreen role={session.user.role} onBack={backToMore} />}
        {section === 'categories' && <CategoriesScreen role={session.user.role} onBack={backToMore} />}
        {section === 'vendors' && <VendorsScreen role={session.user.role} onBack={backToMore} />}
        {section === 'finance' && <FinanceScreen role={session.user.role} onBack={backToMore} />}
        {section === 'people' && <PeopleScreen role={session.user.role} onBack={backToMore} />}
        {section === 'documents' && <DocumentsScreen onBack={backToMore} />}
        {section === 'audit' && <AuditScreen role={session.user.role} onBack={backToMore} />}
        {section === 'profile' && <ProfileScreen user={session.user} onLogout={onLogout} onBack={backToMore} />}
        {section === 'more' && <MoreScreen role={session.user.role} onNavigate={setSection} />}
      </View>
      <View style={[styles.nav, shadows.sm, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
        {visibleTabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <Pressable key={tab.id} onPress={() => setSection(tab.id)} style={styles.navItem} hitSlop={4} accessibilityRole="tab" accessibilityState={{ selected: active }}>
              <Ionicons name={active ? tab.iconActive : tab.icon} size={23} color={active ? colors.primary : colors.textMuted} />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  nav: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: spacing.xs },
  navLabel: { ...typography.caption, color: colors.textMuted, textTransform: 'none' },
  navLabelActive: { color: colors.primary },
});
