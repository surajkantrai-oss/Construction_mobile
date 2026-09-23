import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, BottomSheet, Button, CardSkeleton, EmptyState, ErrorState, FormField, IconButton, ScreenContainer } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, radius, spacing, typography } from '../../theme';
import type { UserRole } from '../../types';
import { can } from '../../utils/access';
import { pageData } from '../../utils/apiUtils';
import { formatDate, rupees } from '../../utils/formatters';

export function FinanceScreen({ role = 'owner', onBack }: { role?: UserRole; onBack?: () => void }) {
  const transactions = useLoader(() => api.transactions.list({ page: 1, limit: 40 }), { data: [], total: 0, page: 1, limit: 40, totalPages: 1 }, []);
  const vendors = useLoader(() => api.vendors.list({ page: 1, limit: 50 }), { data: [], total: 0, page: 1, limit: 50, totalPages: 1 }, []);
  const [show, setShow] = useState(false);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('debit');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const canManage = can(role, ['owner', 'accountant']);

  const save = async () => {
    if (!vendorId || !amount) return Alert.alert('Required fields', 'Choose a vendor and enter an amount.');
    setSaving(true);
    try {
      await api.transactions.create({ vendorId, amount: Number(amount), type, description });
      setShow(false);
      setVendorId(null);
      setAmount('');
      setDescription('');
      await transactions.refresh();
    } catch (error) {
      Alert.alert('Unable to save transaction', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <View style={styles.flex}>
        <AppHeader title="Finance" onBack={onBack} />
        <ScreenContainer><EmptyState icon="cash-outline" title="No access" description="Your role does not have access to finance records." /></ScreenContainer>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <AppHeader title="Finance" subtitle="Vendor credits and debits" onBack={onBack} right={<IconButton icon="add" accessibilityLabel="Add transaction" onPress={() => setShow(true)} backgroundColor={colors.primaryLight} color={colors.primaryDark} />} />
      <ScreenContainer refreshing={transactions.busy} onRefresh={transactions.refresh}>
        {transactions.error ? (
          <ErrorState description={transactions.error} onRetry={transactions.refresh} />
        ) : transactions.busy && !pageData(transactions.value).length ? (
          <View style={{ gap: spacing.md }}><CardSkeleton lines={1} /><CardSkeleton lines={1} /></View>
        ) : pageData(transactions.value).length ? (
          <View style={{ gap: spacing.md }}>
            {pageData(transactions.value).map(transaction => {
              const isCredit = transaction.type === 'credit';
              return (
                <View key={transaction.id} style={styles.row}>
                  <View style={[styles.typeIcon, { backgroundColor: isCredit ? colors.successBg : colors.errorBg }]}>
                    <Text style={{ color: isCredit ? colors.success : colors.error, fontWeight: '800' }}>{isCredit ? '+' : '−'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vendor} numberOfLines={1}>{transaction.vendor?.name ?? `Vendor ${transaction.vendorId}`}</Text>
                    <Text style={styles.description} numberOfLines={1}>{transaction.description || 'No description'} · {formatDate(transaction.createdAt)}</Text>
                  </View>
                  <Text style={[styles.amount, { color: isCredit ? colors.success : colors.error }]}>{isCredit ? '+' : '−'} {rupees(transaction.amount)}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <EmptyState icon="cash-outline" title="No transactions found" description="Vendor credits and debits will appear here." actionLabel="Add transaction" onAction={() => setShow(true)} />
        )}
      </ScreenContainer>

      <BottomSheet visible={show} title="New transaction" onClose={() => setShow(false)}>
        <Text style={styles.fieldLabel}>Vendor</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vendorRow}>
          {pageData(vendors.value).map(vendor => (
            <Pressable key={vendor.id} onPress={() => setVendorId(vendor.id)} style={[styles.vendorChip, vendorId === vendor.id && styles.vendorChipActive]}>
              <Text style={[styles.vendorChipLabel, vendorId === vendor.id && styles.vendorChipLabelActive]} numberOfLines={1}>{vendor.name}</Text>
            </Pressable>
          ))}
          {!pageData(vendors.value).length ? <Text style={styles.description}>No vendors available.</Text> : null}
        </ScrollView>
        <FormField label="Amount" value={amount} onChangeText={setAmount} placeholder="Amount in rupees" keyboardType="numeric" />
        <View style={styles.typeRow}>
          <View style={{ flex: 1 }}><Button label="Debit" variant={type === 'debit' ? 'primary' : 'secondary'} onPress={() => setType('debit')} /></View>
          <View style={{ flex: 1 }}><Button label="Credit" variant={type === 'credit' ? 'primary' : 'secondary'} onPress={() => setType('credit')} /></View>
        </View>
        <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Reference or remarks" multiline />
        <Button label={saving ? 'Saving…' : 'Save transaction'} onPress={save} loading={saving} style={{ marginBottom: spacing.md }} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  typeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  vendor: { ...typography.cardTitle, fontSize: 15, color: colors.textPrimary },
  description: { ...typography.secondary, color: colors.textSecondary },
  amount: { ...typography.cardTitle, fontVariant: ['tabular-nums'] },
  fieldLabel: { ...typography.caption, textTransform: 'none', color: colors.textPrimary, fontWeight: '600' },
  vendorRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  vendorChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, maxWidth: 160 },
  vendorChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  vendorChipLabel: { ...typography.secondary, color: colors.textSecondary, fontWeight: '600' },
  vendorChipLabelActive: { color: colors.primaryDark },
  typeRow: { flexDirection: 'row', gap: spacing.md },
});
