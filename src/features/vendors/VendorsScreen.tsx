import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, BottomSheet, Button, CardSkeleton, EmptyState, ErrorState, FormField, IconButton, ListRow, ScreenContainer, SearchInput } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, spacing } from '../../theme';
import type { UserRole } from '../../types';
import { can } from '../../utils/access';
import { pageData } from '../../utils/apiUtils';

export function VendorsScreen({ role, onBack }: { role: UserRole; onBack?: () => void }) {
  const vendors = useLoader(() => api.vendors.list({ page: 1, limit: 50 }), { data: [], total: 0, page: 1, limit: 50, totalPages: 1 }, []);
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const canManage = can(role, ['owner', 'accountant']);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pageData(vendors.value).filter(vendor => !term || vendor.name.toLowerCase().includes(term));
  }, [vendors.value, query]);

  const save = async () => {
    if (!name || !contact) return Alert.alert('Required fields', 'Vendor name and contact are required.');
    setSaving(true);
    try {
      await api.vendors.create({ name, contact, gstNumber });
      setShow(false);
      setName('');
      setContact('');
      setGstNumber('');
      await vendors.refresh();
    } catch (error) {
      Alert.alert('Unable to save vendor', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Vendors" onBack={onBack} />
        <ScreenContainer><EmptyState icon="briefcase-outline" title="No access" description="Your role does not have access to vendors." /></ScreenContainer>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title="Vendors" subtitle="Supplier contacts & GST" onBack={onBack} right={<IconButton icon="add" accessibilityLabel="Add vendor" onPress={() => setShow(true)} backgroundColor={colors.primaryLight} color={colors.primaryDark} />} />
      <ScreenContainer refreshing={vendors.busy} onRefresh={vendors.refresh}>
        {vendors.error ? (
          <ErrorState description={vendors.error} onRetry={vendors.refresh} />
        ) : (
          <>
            <SearchInput value={query} onChangeText={setQuery} placeholder="Search vendors…" />
            {vendors.busy && !pageData(vendors.value).length ? (
              <View style={{ gap: spacing.md }}><CardSkeleton lines={1} /><CardSkeleton lines={1} /></View>
            ) : rows.length ? (
              <View style={{ gap: spacing.md }}>
                {rows.map(vendor => (
                  <ListRow
                    key={vendor.id}
                    icon="briefcase-outline"
                    title={vendor.name}
                    subtitle={`${vendor.contact}${vendor.gstNumber ? ` · GST ${vendor.gstNumber}` : ''}`}
                  />
                ))}
              </View>
            ) : (
              <EmptyState icon="briefcase-outline" title="No vendors found" description={query ? 'Try a different search.' : 'Supplier contacts will appear here.'} actionLabel={!query ? 'Add vendor' : undefined} onAction={() => setShow(true)} />
            )}
          </>
        )}
      </ScreenContainer>

      <BottomSheet visible={show} title="New vendor" onClose={() => setShow(false)}>
        <FormField label="Name" value={name} onChangeText={setName} placeholder="Vendor name" />
        <FormField label="Contact" value={contact} onChangeText={setContact} placeholder="Phone or email" />
        <FormField label="GST number" value={gstNumber} onChangeText={setGstNumber} placeholder="Optional" />
        <Button label={saving ? 'Saving…' : 'Save vendor'} onPress={save} loading={saving} style={{ marginBottom: spacing.md }} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: colors.background } });
