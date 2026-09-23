import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '../../api';
import { AppHeader, CardSkeleton, EmptyState, ErrorState, ScreenContainer, StatusBadge } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, spacing, typography } from '../../theme';
import type { UserRole } from '../../types';
import { pageData } from '../../utils/apiUtils';
import { formatDateTime, roleName } from '../../utils/formatters';

export function AuditScreen({ role = 'owner', onBack }: { role?: UserRole; onBack?: () => void }) {
  const audit = useLoader(() => api.audit.list({ page: 1, limit: 50 }), { data: [], total: 0, page: 1, limit: 50, totalPages: 1 }, []);

  if (role !== 'owner') {
    return (
      <View style={styles.flex}>
        <AppHeader title="Audit Logs" onBack={onBack} />
        <ScreenContainer><EmptyState icon="shield-checkmark-outline" title="No access" description="Only owners can access audit logs." /></ScreenContainer>
      </View>
    );
  }

  const entries = pageData(audit.value);

  return (
    <View style={styles.flex}>
      <AppHeader title="Audit Logs" subtitle="Accountable system history" onBack={onBack} />
      <ScreenContainer refreshing={audit.busy} onRefresh={audit.refresh}>
        {audit.error ? (
          <ErrorState description={audit.error} onRetry={audit.refresh} />
        ) : audit.busy && !entries.length ? (
          <View style={{ gap: spacing.md }}><CardSkeleton lines={1} /><CardSkeleton lines={1} /></View>
        ) : entries.length ? (
          <View>
            {entries.map((item, index) => (
              <Fragment key={item.id}>
                <View style={styles.row}>
                  <View style={styles.timelineColumn}>
                    <View style={styles.dot} />
                    {index < entries.length - 1 ? <View style={styles.line} /> : null}
                  </View>
                  <View style={styles.content}>
                    <View style={styles.contentHeader}>
                      <Text style={styles.title}>{item.module}: {item.action}</Text>
                      {item.role ? <StatusBadge tone="neutral">{roleName(item.role as UserRole)}</StatusBadge> : null}
                    </View>
                    <Text style={styles.detail}>Record {item.recordId} · {formatDateTime(item.createdAt)}</Text>
                  </View>
                </View>
              </Fragment>
            ))}
          </View>
        ) : (
          <EmptyState icon="shield-checkmark-outline" title="No audit records" description="System activity history will appear here." />
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', gap: spacing.md },
  timelineColumn: { width: 16, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
  content: { flex: 1, paddingBottom: spacing.lg, gap: 2 },
  contentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  title: { ...typography.body, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  detail: { ...typography.secondary, color: colors.textSecondary },
});
