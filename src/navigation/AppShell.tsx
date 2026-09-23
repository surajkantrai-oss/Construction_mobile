import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Session } from '../types';
import { navigationItems, type Section } from './sections';
import { appStyles as styles } from '../theme/appStyles';
import { roleName } from '../utils/formatters';
import { HomeScreen } from '../features/dashboard/HomeScreen';
import { DprsScreen } from '../features/dpr/DprsScreen';
import { TasksScreen } from '../features/tasks/TasksScreen';
import { AttendanceScreen } from '../features/attendance/AttendanceScreen';
import { ProjectsScreen } from '../features/projects/ProjectsScreen';
import { StockScreen } from '../features/stock/StockScreen';
import { CategoriesScreen, VendorsScreen } from '../features/shared/FeatureScreens';
import { FinanceScreen } from '../features/finance/FinanceScreen';
import { PeopleScreen } from '../features/people/PeopleScreen';
import { DocumentsScreen } from '../features/documents/DocumentsScreen';
import { AuditScreen } from '../features/audit/AuditScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';

export function AppShell({ session, onLogout }: { session: Session; onLogout: () => Promise<void> }) {
  const [section, setSection] = useState<Section>('home');
  const allowedItems = useMemo(() => navigationItems.filter(item => item.roles.includes(session.user.role)), [session.user.role]);
  const initials = session.user.name.split(' ').map(part => part[0]).slice(0, 2).join('');
  return <View style={{ flex: 1 }}>
    <View style={styles.topbar}><View><Text style={styles.topbarName}>{session.user.name}</Text><Text style={styles.topbarRole}>{roleName(session.user.role)} workspace</Text></View><Pressable style={styles.avatar} onPress={() => setSection('profile')}><Text style={styles.avatarText}>{initials}</Text></Pressable></View>
    <View style={{ flex: 1 }}>
      {section === 'home' && <HomeScreen role={session.user.role} onNavigate={setSection} />}
      {section === 'dpr' && <DprsScreen role={session.user.role} />}
      {section === 'tasks' && <TasksScreen role={session.user.role} />}
      {section === 'attendance' && <AttendanceScreen role={session.user.role} />}
      {section === 'projects' && <ProjectsScreen role={session.user.role} />}
      {section === 'stock' && <StockScreen role={session.user.role} />}
      {section === 'categories' && <CategoriesScreen role={session.user.role} />}
      {section === 'vendors' && <VendorsScreen role={session.user.role} />}
      {section === 'finance' && <FinanceScreen role={session.user.role} />}
      {section === 'people' && <PeopleScreen role={session.user.role} />}
      {section === 'documents' && <DocumentsScreen />}
      {section === 'audit' && <AuditScreen role={session.user.role} />}
      {section === 'profile' && <ProfileScreen user={session.user} onLogout={onLogout} />}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nav} contentContainerStyle={styles.navItems}>
      {allowedItems.map(item => <Pressable key={item.id} onPress={() => setSection(item.id)} style={[styles.navItem, section === item.id && styles.navActive]}><Text style={styles.navIcon}>{item.icon}</Text><Text style={[styles.navLabel, section === item.id && styles.navLabelActive]}>{item.label}</Text></Pressable>)}
    </ScrollView>
  </View>;
}
