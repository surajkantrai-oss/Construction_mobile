import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, BottomSheet, Button, CardSkeleton, EmptyState, ErrorState, FormField, IconButton, ListRow, ScreenContainer } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, spacing } from '../../theme';
import type { UserRole } from '../../types';
import { can } from '../../utils/access';
import { pageData } from '../../utils/apiUtils';

export function CategoriesScreen({ role, onBack }: { role: UserRole; onBack?: () => void }) {
  const categories = useLoader(() => api.categories.list({ page: 1, limit: 50 }), { data: [], total: 0, page: 1, limit: 50, totalPages: 1 }, []);
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const canManage = can(role, ['owner', 'engineer']);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.categories.create(name.trim());
      setName('');
      setShow(false);
      await categories.refresh();
    } catch (error) {
      Alert.alert('Unable to save category', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Material Categories" onBack={onBack} />
        <ScreenContainer><EmptyState icon="pricetags-outline" title="No access" description="Your role does not have access to categories." /></ScreenContainer>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title="Material Categories" subtitle="Classify stock items" onBack={onBack} right={<IconButton icon="add" accessibilityLabel="Add category" onPress={() => setShow(true)} backgroundColor={colors.primaryLight} color={colors.primaryDark} />} />
      <ScreenContainer refreshing={categories.busy} onRefresh={categories.refresh}>
        {categories.error ? (
          <ErrorState description={categories.error} onRetry={categories.refresh} />
        ) : categories.busy && !pageData(categories.value).length ? (
          <View style={{ gap: spacing.md }}><CardSkeleton lines={1} /><CardSkeleton lines={1} /></View>
        ) : pageData(categories.value).length ? (
          <View style={{ gap: spacing.md }}>
            {pageData(categories.value).map(category => <ListRow key={category.id} icon="pricetags-outline" title={category.name} />)}
          </View>
        ) : (
          <EmptyState icon="pricetags-outline" title="No categories found" description="Material classifications will appear here." actionLabel="Add category" onAction={() => setShow(true)} />
        )}
      </ScreenContainer>

      <BottomSheet visible={show} title="New category" onClose={() => setShow(false)}>
        <FormField label="Category name" value={name} onChangeText={setName} placeholder="e.g. Civil" />
        <Button label={saving ? 'Saving…' : 'Save category'} onPress={save} loading={saving} style={{ marginBottom: spacing.md }} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: colors.background } });
