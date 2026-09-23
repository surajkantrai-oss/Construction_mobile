import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, Button, CardSkeleton, EmptyState, ErrorState, ListRow, ScreenContainer, StatusBadge, toneForStatus } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, radius, spacing, typography } from '../../theme';
import type { UserRole } from '../../types';
import { can } from '../../utils/access';
import { formatDate, roleName } from '../../utils/formatters';

export function AttendanceScreen({ role, onBack }: { role: UserRole; onBack?: () => void }) {
  const list = useLoader(() => api.attendance.list(), [], []);
  const [sending, setSending] = useState(false);

  const summary = useMemo(() => {
    const present = list.value.filter(item => item.status === 'present' || item.status === 'late').length;
    const absent = list.value.filter(item => item.status === 'absent').length;
    return { present, absent, total: list.value.length };
  }, [list.value]);

  const act = async (action: 'check-in' | 'check-out') => {
    setSending(true);
    try {
      await api.attendance.mobile(action);
      await list.refresh();
    } catch (error) {
      Alert.alert('Attendance update failed', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Attendance" subtitle={formatDate(new Date().toISOString())} onBack={onBack} />
      <ScreenContainer refreshing={list.busy} onRefresh={list.refresh}>
        {list.error ? (
          <ErrorState description={list.error} onRetry={list.refresh} />
        ) : (
          <>
            {can(role, ['owner', 'supervisor', 'labour', 'engineer']) && (
              <View style={styles.actionRow}>
                <View style={{ flex: 1 }}><Button label={sending ? 'Working…' : 'Check in'} onPress={() => void act('check-in')} loading={sending} /></View>
                <View style={{ flex: 1 }}><Button label="Check out" variant="outline" onPress={() => void act('check-out')} disabled={sending} /></View>
              </View>
            )}

            <View style={styles.summaryRow}>
              <SummaryStat label="Present" value={summary.present} tone="success" />
              <SummaryStat label="Absent" value={summary.absent} tone="error" />
              <SummaryStat label="Total" value={summary.total} tone="neutral" />
            </View>

            {list.busy && !list.value.length ? (
              <View style={{ gap: spacing.md }}><CardSkeleton lines={1} /><CardSkeleton lines={1} /></View>
            ) : list.value.length ? (
              <View style={{ gap: spacing.md }}>
                {list.value.map(item => (
                  <ListRow
                    key={item.id}
                    title={item.name ?? `User ${item.userId}`}
                    subtitle={`${item.role ? `${roleName(item.role)} · ` : ''}${formatDate(item.date)} · ${item.checkIn ?? '—'} to ${item.checkOut ?? '—'}`}
                    badge={<StatusBadge tone={toneForStatus(item.status)}>{item.status}</StatusBadge>}
                  />
                ))}
              </View>
            ) : (
              <EmptyState icon="time-outline" title="No attendance records" description="Check-ins and check-outs will appear here." />
            )}
          </>
        )}
      </ScreenContainer>
    </View>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone: 'success' | 'error' | 'neutral' }) {
  const color = tone === 'success' ? colors.success : tone === 'error' ? colors.error : colors.textPrimary;
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  summaryRow: { flexDirection: 'row', gap: spacing.md },
  summaryCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, alignItems: 'center', gap: 2 },
  summaryValue: { ...typography.sectionTitle, fontSize: 22 },
  summaryLabel: { ...typography.secondary, color: colors.textSecondary },
});
