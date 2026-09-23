import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, Avatar, BottomSheet, Button, CardSkeleton, EmptyState, ErrorState, FilterChip, FormField, IconButton, ScreenContainer, SearchInput, StatusBadge } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, radius, spacing, typography } from '../../theme';
import type { UserRole } from '../../types';
import { pageData } from '../../utils/apiUtils';
import { roleName } from '../../utils/formatters';

const ROLES: UserRole[] = ['owner', 'engineer', 'supervisor', 'accountant', 'labour'];

export function PeopleScreen({ role = 'owner', onBack }: { role?: UserRole; onBack?: () => void }) {
  const employees = useLoader(() => api.employees.list({ page: 1, limit: 50 }), { data: [], total: 0, page: 1, limit: 50, totalPages: 1 }, []);
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeRole, setEmployeeRole] = useState<UserRole>('labour');
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pageData(employees.value).filter(employee => !term || employee.name.toLowerCase().includes(term) || employee.email.toLowerCase().includes(term));
  }, [employees.value, query]);

  const save = async () => {
    if (!name || !email) return Alert.alert('Required fields', 'Name and email are required.');
    setSaving(true);
    try {
      await api.employees.create({ name, email, phone, role: employeeRole });
      setShow(false);
      setName('');
      setEmail('');
      setPhone('');
      setEmployeeRole('labour');
      await employees.refresh();
    } catch (error) {
      Alert.alert('Unable to save employee', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (role !== 'owner') {
    return (
      <View style={styles.flex}>
        <AppHeader title="Employees" onBack={onBack} />
        <ScreenContainer><EmptyState icon="people-outline" title="No access" description="Only owners can manage employees." /></ScreenContainer>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title="Employees" subtitle="People and workforce" onBack={onBack} right={<IconButton icon="add" accessibilityLabel="Add employee" onPress={() => setShow(true)} backgroundColor={colors.primaryLight} color={colors.primaryDark} />} />
      <ScreenContainer refreshing={employees.busy} onRefresh={employees.refresh}>
        {employees.error ? (
          <ErrorState description={employees.error} onRetry={employees.refresh} />
        ) : (
          <>
            <SearchInput value={query} onChangeText={setQuery} placeholder="Search employees…" />
            {employees.busy && !pageData(employees.value).length ? (
              <View style={{ gap: spacing.md }}><CardSkeleton lines={1} /><CardSkeleton lines={1} /></View>
            ) : rows.length ? (
              <View style={{ gap: spacing.md }}>
                {rows.map(employee => (
                  <View key={employee.id} style={styles.row}>
                    <Avatar name={employee.name} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name} numberOfLines={1}>{employee.name}</Text>
                      <Text style={styles.detail} numberOfLines={1}>{employee.email}{employee.phone ? ` · ${employee.phone}` : ''}</Text>
                    </View>
                    <StatusBadge tone="neutral">{roleName(employee.role)}</StatusBadge>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="people-outline" title="No employees found" description={query ? 'Try a different search.' : 'Your workforce will appear here.'} actionLabel={!query ? 'Add employee' : undefined} onAction={() => setShow(true)} />
            )}
          </>
        )}
      </ScreenContainer>

      <BottomSheet visible={show} title="New employee" onClose={() => setShow(false)}>
        <FormField label="Name" value={name} onChangeText={setName} placeholder="Full name" />
        <FormField label="Email" value={email} onChangeText={setEmail} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" />
        <FormField label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" />
        <Text style={styles.fieldLabel}>Role</Text>
        <View style={styles.roleRow}>
          {ROLES.map(value => <FilterChip key={value} label={roleName(value)} active={employeeRole === value} onPress={() => setEmployeeRole(value)} />)}
        </View>
        <Button label={saving ? 'Saving…' : 'Save employee'} onPress={save} loading={saving} style={{ marginBottom: spacing.md }} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  name: { ...typography.cardTitle, fontSize: 15, color: colors.textPrimary },
  detail: { ...typography.secondary, color: colors.textSecondary },
  fieldLabel: { ...typography.caption, textTransform: 'none', color: colors.textPrimary, fontWeight: '600' },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
