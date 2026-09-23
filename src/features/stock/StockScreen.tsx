import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, BottomSheet, Button, CardSkeleton, EmptyState, ErrorState, FormField, IconButton, ListRow, ScreenContainer, SearchInput, StatusBadge } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, spacing } from '../../theme';
import type { UserRole } from '../../types';
import { can } from '../../utils/access';
import { pageData } from '../../utils/apiUtils';

export function StockScreen({ role = 'owner', onBack }: { role?: UserRole; onBack?: () => void }) {
  const materials = useLoader(() => api.materials.list({ page: 1, limit: 50 }), { data: [], total: 0, page: 1, limit: 50, totalPages: 1 }, []);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [movement, setMovement] = useState<'in' | 'out'>('in');
  const [saving, setSaving] = useState(false);
  const canManage = can(role, ['owner', 'engineer']);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pageData(materials.value)
      .map(material => ({ material, quantity: (material.stocks ?? []).reduce((total, stock) => total + (stock.type === 'in' ? stock.quantity : -stock.quantity), 0) }))
      .filter(row => !term || row.material.name.toLowerCase().includes(term));
  }, [materials.value, query]);

  const save = async () => {
    if (!name || !unit) return Alert.alert('Required fields', 'Material name and unit are required.');
    setSaving(true);
    try {
      const material = await api.materials.create({ name, unit });
      if (quantity) await api.materials.stock({ materialId: material.id, quantity: Number(quantity), type: movement, note: 'Added from mobile' });
      setForm(false);
      setName('');
      setUnit('');
      setQuantity('');
      await materials.refresh();
    } catch (error) {
      Alert.alert('Unable to save material', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Materials & Stock"
        subtitle="Inventory and movement"
        onBack={onBack}
        right={canManage ? <IconButton icon="add" accessibilityLabel="Add material" onPress={() => setForm(true)} backgroundColor={colors.primaryLight} color={colors.primaryDark} /> : undefined}
      />
      <ScreenContainer refreshing={materials.busy} onRefresh={materials.refresh}>
        {materials.error ? (
          <ErrorState description={materials.error} onRetry={materials.refresh} />
        ) : (
          <>
            <SearchInput value={query} onChangeText={setQuery} placeholder="Search materials…" />
            {materials.busy && !pageData(materials.value).length ? (
              <View style={{ gap: spacing.md }}><CardSkeleton lines={1} /><CardSkeleton lines={1} /></View>
            ) : rows.length ? (
              <View style={{ gap: spacing.md }}>
                {rows.map(({ material, quantity: qty }) => (
                  <ListRow
                    key={material.id}
                    icon="cube-outline"
                    title={material.name}
                    subtitle={`${qty} ${material.unit} · ${material.category?.name ?? 'Uncategorised'}`}
                    badge={<StatusBadge tone={qty > 0 ? 'success' : 'error'}>{qty > 0 ? 'In Stock' : 'Out of Stock'}</StatusBadge>}
                  />
                ))}
              </View>
            ) : (
              <EmptyState icon="cube-outline" title="No materials found" description={query ? 'Try a different search.' : 'Materials added to inventory will appear here.'} actionLabel={canManage && !query ? 'Add material' : undefined} onAction={canManage ? () => setForm(true) : undefined} />
            )}
          </>
        )}
      </ScreenContainer>

      <BottomSheet visible={form} title="Add material" onClose={() => setForm(false)}>
        <FormField label="Material name" value={name} onChangeText={setName} placeholder="e.g. Cement" />
        <FormField label="Unit" value={unit} onChangeText={setUnit} placeholder="e.g. bags" />
        <FormField label="Opening quantity (optional)" value={quantity} onChangeText={setQuantity} placeholder="0" keyboardType="numeric" />
        <View style={styles.movementRow}>
          <View style={{ flex: 1 }}><Button label="Stock in" variant={movement === 'in' ? 'primary' : 'secondary'} onPress={() => setMovement('in')} /></View>
          <View style={{ flex: 1 }}><Button label="Stock out" variant={movement === 'out' ? 'primary' : 'secondary'} onPress={() => setMovement('out')} /></View>
        </View>
        <Button label={saving ? 'Saving…' : 'Save material'} onPress={save} loading={saving} style={{ marginBottom: spacing.md }} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  movementRow: { flexDirection: 'row', gap: spacing.md },
});
