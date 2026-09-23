import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '../../api';
import { CardSkeleton, EmptyState, ErrorState, HomeHeader, ListRow, ProgressBar, ScreenContainer, StatusBadge, toneForStatus } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import type { Section } from '../../navigation/sections';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { Dashboard, UserRole } from '../../types';
import { can } from '../../utils/access';
import { formatDate, roleName } from '../../utils/formatters';

const EMPTY_DASHBOARD: Dashboard = { kpis: {}, recentActivity: { pendingDprs: [], recentExpenses: [], activeProjectsList: [] } };

const KPI_TILES: Array<{ key: keyof Dashboard['kpis']; label: string; icon: 'business' | 'document-text' | 'people' | 'checkmark-done'; tone: 'green' | 'blue' | 'orange' | 'coral'; suffix?: string }> = [
  { key: 'activeProjects', label: 'Active Projects', icon: 'business', tone: 'green' },
  { key: 'pendingDprs', label: 'Pending DPRs', icon: 'document-text', tone: 'blue' },
  { key: 'totalLabour', label: 'Total Workers', icon: 'people', tone: 'orange' },
  { key: 'attendanceRate', label: 'Attendance', icon: 'checkmark-done', tone: 'coral', suffix: '%' },
];

const QUICK_ACTIONS: Array<{ section: Section; label: string; icon: 'checkmark-done-outline' | 'document-text-outline' | 'time-outline' | 'cube-outline'; roles: UserRole[] }> = [
  { section: 'tasks', label: 'My Tasks', icon: 'checkmark-done-outline', roles: ['owner', 'engineer', 'supervisor', 'labour'] },
  { section: 'dpr', label: 'DPR', icon: 'document-text-outline', roles: ['owner', 'engineer', 'supervisor'] },
  { section: 'attendance', label: 'Attendance', icon: 'time-outline', roles: ['owner', 'supervisor', 'labour', 'engineer'] },
  { section: 'stock', label: 'Stock', icon: 'cube-outline', roles: ['owner', 'engineer'] },
];

export function HomeScreen({ role, userName, onNavigate }: { role: UserRole; userName: string; onNavigate: (section: Section) => void }) {
  const dashboard = useLoader(() => api.dashboard(), EMPTY_DASHBOARD, []);
  const kpis = dashboard.value.kpis;
  const quickActions = QUICK_ACTIONS.filter(action => can(role, action.roles));
  const pendingDprs = dashboard.value.recentActivity.pendingDprs;
  const activeProjects = dashboard.value.recentActivity.activeProjectsList;

  return (
    <View style={styles.flex}>
      <HomeHeader name={userName} roleLabel={roleName(role)} onAvatarPress={() => onNavigate('profile')} />
      <ScreenContainer refreshing={dashboard.busy} onRefresh={dashboard.refresh}>
        {dashboard.error ? (
          <ErrorState description={dashboard.error} onRetry={dashboard.refresh} />
        ) : (
          <>
            <View style={styles.kpiGrid}>
              {dashboard.busy && !Object.keys(kpis).length
                ? KPI_TILES.map(tile => <CardSkeleton key={tile.key} lines={1} />)
                : KPI_TILES.filter(tile => kpis[tile.key] !== undefined).map(tile => {
                    const palette = colors.pastel[tile.tone];
                    return (
                      <View key={tile.key} style={[styles.kpiCard, shadows.sm]}>
                        <View style={[styles.kpiIcon, { backgroundColor: palette.bg }]}>
                          <Ionicons name={tile.icon} size={18} color={palette.fg} />
                        </View>
                        <Text style={styles.kpiValue}>{kpis[tile.key]}{tile.suffix ?? ''}</Text>
                        <Text style={styles.kpiLabel} numberOfLines={1}>{tile.label}</Text>
                      </View>
                    );
                  })}
            </View>

            {quickActions.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick actions</Text>
                <View style={styles.quickRow}>
                  {quickActions.map(action => (
                    <Pressable key={action.section} onPress={() => onNavigate(action.section)} style={({ pressed }) => [styles.quickAction, shadows.sm, pressed && styles.pressed]}>
                      <Ionicons name={action.icon} size={20} color={colors.primary} />
                      <Text style={styles.quickLabel}>{action.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending DPRs</Text>
              {dashboard.busy && !pendingDprs.length ? (
                <View style={{ gap: spacing.md }}><CardSkeleton /><CardSkeleton /></View>
              ) : pendingDprs.length ? (
                <View style={{ gap: spacing.md }}>
                  {pendingDprs.map(dpr => (
                    <ListRow
                      key={dpr.id}
                      title={dpr.siteName}
                      subtitle={`${dpr.labourCount} labour · ${formatDate(dpr.date)}`}
                      badge={<StatusBadge tone={toneForStatus(dpr.status)}>{dpr.status}</StatusBadge>}
                      onPress={() => onNavigate('dpr')}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState icon="document-text-outline" title="No pending DPRs" description="Daily progress reports awaiting review will show up here." />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active projects</Text>
              {dashboard.busy && !activeProjects.length ? (
                <View style={{ gap: spacing.md }}><CardSkeleton lines={2} /></View>
              ) : activeProjects.length ? (
                <View style={{ gap: spacing.md }}>
                  {activeProjects.map(project => (
                    <Pressable key={project.id} onPress={() => onNavigate('projects')} style={({ pressed }) => [styles.projectCard, shadows.sm, pressed && styles.pressed]}>
                      <View style={styles.projectHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
                          <Text style={styles.projectLocation} numberOfLines={1}>{project.location}</Text>
                        </View>
                        <StatusBadge tone={toneForStatus(project.status)}>{project.status.replace('-', ' ')}</StatusBadge>
                      </View>
                      <ProgressBar value={project.progress} />
                      <Text style={styles.projectProgress}>{project.progress}% complete</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <EmptyState icon="business-outline" title="No active projects" description="Active projects you can access will appear here." />
              )}
            </View>
          </>
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  kpiCard: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs },
  kpiIcon: { width: 34, height: 34, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { ...typography.display, fontSize: 24, color: colors.textPrimary, marginTop: spacing.xs },
  kpiLabel: { ...typography.secondary, color: colors.textSecondary },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.sectionTitle, color: colors.textPrimary },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  quickAction: { flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  quickLabel: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  pressed: { opacity: 0.85 },
  projectCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  projectHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  projectName: { ...typography.cardTitle, color: colors.textPrimary },
  projectLocation: { ...typography.secondary, color: colors.textSecondary, marginTop: 2 },
  projectProgress: { ...typography.caption, textTransform: 'none', color: colors.textSecondary },
});
