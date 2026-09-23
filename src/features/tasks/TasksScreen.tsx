import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, BottomSheet, Button, CardSkeleton, EmptyState, ErrorState, FilterChip, ScreenContainer, StatusBadge, toneForStatus } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, radius, spacing, typography } from '../../theme';
import type { Task, TaskStatus, UserRole } from '../../types';
import { can } from '../../utils/access';
import { formatDate } from '../../utils/formatters';

const FILTERS: Array<{ label: string; value: TaskStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'To do', value: 'todo' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
];

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];

const PRIORITY: Record<Task['priority'], { label: string; color: string; icon: 'flag' }> = {
  high: { label: 'High priority', color: colors.error, icon: 'flag' },
  medium: { label: 'Medium priority', color: colors.warning, icon: 'flag' },
  low: { label: 'Low priority', color: colors.textMuted, icon: 'flag' },
};

export function TasksScreen({ role }: { role: UserRole }) {
  const list = useLoader(() => (can(role, ['supervisor', 'engineer', 'labour']) ? api.tasks.mine() : api.tasks.list()), [], [role]);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [task, setTask] = useState<Task | null>(null);
  const [status, setStatus] = useState<Task['status']>('todo');
  const [saving, setSaving] = useState(false);

  const tasks = useMemo(() => (filter === 'all' ? list.value : list.value.filter(item => item.status === filter)), [list.value, filter]);

  const update = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await api.tasks.update(task.id, { status });
      setTask(null);
      await list.refresh();
    } catch (error) {
      Alert.alert('Unable to update task', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Tasks" subtitle="Assigned work and progress" />
      <ScreenContainer refreshing={list.busy} onRefresh={list.refresh}>
        {list.error ? (
          <ErrorState description={list.error} onRetry={list.refresh} />
        ) : (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {FILTERS.map(item => <FilterChip key={item.value} label={item.label} active={filter === item.value} onPress={() => setFilter(item.value)} />)}
            </ScrollView>

            {list.busy && !list.value.length ? (
              <View style={{ gap: spacing.md }}><CardSkeleton lines={2} /><CardSkeleton lines={2} /></View>
            ) : tasks.length ? (
              <View style={{ gap: spacing.md }}>
                {tasks.map(item => {
                  const priority = PRIORITY[item.priority];
                  return (
                    <Pressable key={item.id} onPress={() => { setTask(item); setStatus(item.status); }} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        <StatusBadge tone={toneForStatus(item.status)}>{item.status.replace('-', ' ')}</StatusBadge>
                      </View>
                      {item.project ? <Text style={styles.project} numberOfLines={1}>{item.project}</Text> : null}
                      <View style={styles.metaRow}>
                        <View style={styles.priorityRow}>
                          <Ionicons name={priority.icon} size={13} color={priority.color} />
                          <Text style={[styles.priorityLabel, { color: priority.color }]}>{priority.label}</Text>
                        </View>
                        <Text style={styles.due}>Due {formatDate(item.dueDate)}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <EmptyState icon="checkmark-done-outline" title="No tasks found" description={filter !== 'all' ? 'Try a different filter.' : 'Tasks assigned to you will appear here.'} />
            )}
          </>
        )}
      </ScreenContainer>

      <BottomSheet visible={!!task} title={task?.title ?? 'Task'} onClose={() => setTask(null)}>
        {task?.description ? <Text style={styles.description}>{task.description}</Text> : null}
        <Text style={styles.statusLabel}>Status</Text>
        <View style={styles.statusOptions}>
          {STATUS_OPTIONS.map(value => (
            <FilterChip key={value} label={value.replace('-', ' ')} active={status === value} onPress={() => setStatus(value)} />
          ))}
        </View>
        <Button label={saving ? 'Updating…' : 'Update task'} onPress={update} loading={saving} style={{ marginTop: spacing.md, marginBottom: spacing.md }} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  filterRow: { gap: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs },
  pressed: { opacity: 0.85 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...typography.cardTitle, color: colors.textPrimary, flex: 1 },
  project: { ...typography.secondary, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  priorityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priorityLabel: { ...typography.caption, textTransform: 'none', fontWeight: '700' },
  due: { ...typography.caption, textTransform: 'none', color: colors.textSecondary },
  description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  statusLabel: { ...typography.caption, textTransform: 'uppercase', color: colors.textMuted, marginTop: spacing.sm },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
