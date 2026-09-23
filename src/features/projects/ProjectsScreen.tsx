import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, BottomSheet, Button, CardSkeleton, EmptyState, ErrorState, FilterChip, FormField, IconButton, ProgressBar, ScreenContainer, SearchInput, StatusBadge, toneForStatus } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { Project, ProjectStatus, UserRole } from '../../types';
import { can } from '../../utils/access';
import { pageData } from '../../utils/apiUtils';
import { rupees } from '../../utils/formatters';

const FILTERS: Array<{ label: string; value: ProjectStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'On Hold', value: 'on-hold' },
  { label: 'Completed', value: 'completed' },
];

export function ProjectsScreen({ role = 'owner' }: { role?: UserRole }) {
  const list = useLoader(() => api.projects.list({ page: 1, limit: 40 }), { data: [], total: 0, page: 1, limit: 40, totalPages: 1 }, []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [manager, setManager] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);
  const canManage = can(role, ['owner', 'engineer']);

  const projects = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pageData(list.value).filter(project => {
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesTerm = !term || project.name.toLowerCase().includes(term) || project.location.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [list.value, query, statusFilter]);

  const open = (project?: Project) => {
    setEditing(project ?? ({ id: 0 } as Project));
    setName(project?.name ?? '');
    setLocation(project?.location ?? '');
    setBudget(project ? String(project.budget) : '');
    setManager(project?.manager ?? '');
    setStartDate(project?.startDate ?? '');
    setEndDate(project?.endDate ?? '');
  };

  const save = async () => {
    if (!name || !location || !budget || !manager || !startDate || !endDate) return Alert.alert('Required fields', 'Complete all project fields.');
    setSaving(true);
    try {
      const data = { name, location, budget: Number(budget), manager, startDate, endDate };
      editing?.id ? await api.projects.update(editing.id, data) : await api.projects.create(data);
      setEditing(null);
      await list.refresh();
    } catch (error) {
      Alert.alert('Unable to save project', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Projects"
        subtitle={`${projects.length} of ${pageData(list.value).length}`}
        right={canManage ? <IconButton icon="add" accessibilityLabel="Create project" onPress={() => open()} backgroundColor={colors.primaryLight} color={colors.primaryDark} /> : undefined}
      />
      <ScreenContainer refreshing={list.busy} onRefresh={list.refresh}>
        {list.error ? (
          <ErrorState description={list.error} onRetry={list.refresh} />
        ) : (
          <>
            <SearchInput value={query} onChangeText={setQuery} placeholder="Search projects…" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {FILTERS.map(filter => (
                <FilterChip key={filter.value} label={filter.label} active={statusFilter === filter.value} onPress={() => setStatusFilter(filter.value)} />
              ))}
            </ScrollView>

            {list.busy && !pageData(list.value).length ? (
              <View style={{ gap: spacing.md }}><CardSkeleton lines={2} /><CardSkeleton lines={2} /></View>
            ) : projects.length ? (
              <View style={{ gap: spacing.md }}>
                {projects.map(project => (
                  <Pressable key={project.id} onPress={() => canManage && open(project)} style={({ pressed }) => [styles.card, shadows.sm, pressed && canManage && styles.pressed]}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name} numberOfLines={1}>{project.name}</Text>
                        <Text style={styles.location} numberOfLines={1}>{project.location} · {project.manager}</Text>
                      </View>
                      <StatusBadge tone={toneForStatus(project.status)}>{project.status.replace('-', ' ')}</StatusBadge>
                    </View>
                    <ProgressBar value={project.progress} />
                    <View style={styles.cardFooter}>
                      <Text style={styles.progressLabel}>{project.progress}% complete</Text>
                      <Text style={styles.budget}>{rupees(project.spent)} / {rupees(project.budget)}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="business-outline"
                title="No projects found"
                description={query || statusFilter !== 'all' ? 'Try a different search or filter.' : 'Projects you can access will appear here.'}
                actionLabel={canManage && !query && statusFilter === 'all' ? 'Create project' : undefined}
                onAction={canManage ? () => open() : undefined}
              />
            )}
          </>
        )}
      </ScreenContainer>

      <BottomSheet visible={!!editing} title={editing?.id ? 'Edit project' : 'New project'} onClose={() => setEditing(null)}>
        <FormField label="Name" value={name} onChangeText={setName} placeholder="Project name" />
        <FormField label="Location" value={location} onChangeText={setLocation} placeholder="Location" />
        <FormField label="Manager" value={manager} onChangeText={setManager} placeholder="Manager" />
        <FormField label="Budget" value={budget} onChangeText={setBudget} placeholder="Amount in rupees" keyboardType="numeric" />
        <FormField label="Start date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
        <FormField label="End date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
        <Button label={saving ? 'Saving…' : 'Save project'} onPress={save} loading={saving} style={{ marginTop: spacing.sm, marginBottom: spacing.md }} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  filterRow: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  name: { ...typography.cardTitle, color: colors.textPrimary },
  location: { ...typography.secondary, color: colors.textSecondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { ...typography.caption, textTransform: 'none', color: colors.textSecondary },
  budget: { ...typography.caption, textTransform: 'none', color: colors.textPrimary, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
