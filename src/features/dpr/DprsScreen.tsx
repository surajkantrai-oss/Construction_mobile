import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, ApiError } from '../../api';
import { AppHeader, BottomSheet, Button, CardSkeleton, EmptyState, ErrorState, FilterChip, FormField, IconButton, ListRow, ScreenContainer, SearchInput, StatusBadge, toneForStatus } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import { colors, radius, spacing, typography } from '../../theme';
import type { DPR, DPRStatus, UserRole } from '../../types';
import { can } from '../../utils/access';
import { pageData } from '../../utils/apiUtils';
import { formatDate } from '../../utils/formatters';

const FILTERS: Array<{ label: string; value: DPRStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function DprsScreen({ role }: { role: UserRole }) {
  const list = useLoader(() => api.dprs.list({ page: 1, limit: 40 }), { data: [], total: 0, page: 1, limit: 40, totalPages: 1 }, []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DPRStatus | 'all'>('all');
  const canManage = can(role, ['owner', 'engineer', 'supervisor']);

  const [editing, setEditing] = useState<DPR | null>(null);
  const [siteName, setSiteName] = useState('');
  const [labourCount, setLabourCount] = useState('0');
  const [work, setWork] = useState('');
  const [used, setUsed] = useState('');
  const [wastage, setWastage] = useState('None');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [bill, setBill] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [saving, setSaving] = useState(false);

  const dprs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pageData(list.value).filter(dpr => {
      const matchesStatus = statusFilter === 'all' || dpr.status === statusFilter;
      const matchesTerm = !term || dpr.siteName.toLowerCase().includes(term) || dpr.workDescription.toLowerCase().includes(term);
      return matchesStatus && matchesTerm;
    });
  }, [list.value, query, statusFilter]);

  const open = (dpr?: DPR) => {
    setEditing(dpr ?? ({ id: 0 } as DPR));
    setSiteName(dpr?.siteName ?? '');
    setLabourCount(String(dpr?.labourCount ?? 0));
    setWork(dpr?.workDescription ?? '');
    setUsed(dpr?.materialUsed ?? '');
    setWastage(dpr?.materialWastage ?? 'None');
    setNotes(dpr?.notes ?? '');
    setImages([]);
    setBill(null);
  };

  const chooseImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, selectionLimit: 5, quality: 0.75 });
    if (!result.canceled) setImages(result.assets.slice(0, 5));
  };
  const removeImage = (uri: string) => setImages(current => current.filter(image => image.uri !== uri));

  const chooseBill = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    if (!result.canceled) setBill(result.assets[0]);
  };

  const save = async () => {
    if (!siteName || !work || !used || !wastage) return Alert.alert('Required fields', 'Complete the DPR details.');
    setSaving(true);
    try {
      const form = new FormData();
      [['siteName', siteName], ['labourCount', labourCount], ['workDescription', work], ['materialUsed', used], ['materialWastage', wastage], ['notes', notes]].forEach(([key, value]) => form.append(key, value));
      images.forEach((image, index) => form.append('images', { uri: image.uri, name: image.fileName ?? `site-photo-${index}.jpg`, type: image.mimeType ?? 'image/jpeg' } as unknown as Blob));
      if (bill) form.append('bill', { uri: bill.uri, name: bill.name, type: bill.mimeType ?? 'application/pdf' } as unknown as Blob);
      editing?.id ? await api.dprs.update(editing.id, form) : await api.dprs.create(form);
      setEditing(null);
      await list.refresh();
    } catch (error) {
      Alert.alert('Unable to save DPR', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader
        title="Daily Progress Reports"
        subtitle="Site reports and evidence"
        right={canManage ? <IconButton icon="add" accessibilityLabel="Submit DPR" onPress={() => open()} backgroundColor={colors.primaryLight} color={colors.primaryDark} /> : undefined}
      />
      <ScreenContainer refreshing={list.busy} onRefresh={list.refresh}>
        {list.error ? (
          <ErrorState description={list.error} onRetry={list.refresh} />
        ) : (
          <>
            <SearchInput value={query} onChangeText={setQuery} placeholder="Search DPRs…" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
              {FILTERS.map(filter => (
                <FilterChip key={filter.value} label={filter.label} active={statusFilter === filter.value} onPress={() => setStatusFilter(filter.value)} />
              ))}
            </ScrollView>

            {list.busy && !pageData(list.value).length ? (
              <View style={{ gap: spacing.md }}><CardSkeleton lines={2} /><CardSkeleton lines={2} /></View>
            ) : dprs.length ? (
              <View style={{ gap: spacing.md }}>
                {dprs.map(dpr => (
                  <ListRow
                    key={dpr.id}
                    title={dpr.siteName}
                    subtitle={`${dpr.labourCount} labour · ${formatDate(dpr.date)}${dpr.imageUrls?.length ? ` · ${dpr.imageUrls.length} photo${dpr.imageUrls.length > 1 ? 's' : ''}` : ''}`}
                    badge={<StatusBadge tone={toneForStatus(dpr.status)}>{dpr.status}</StatusBadge>}
                    onPress={canManage ? () => open(dpr) : undefined}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="document-text-outline"
                title="No DPRs found"
                description={query || statusFilter !== 'all' ? 'Try a different search or filter.' : 'Submitted site reports will appear here.'}
                actionLabel={canManage && !query && statusFilter === 'all' ? 'Submit DPR' : undefined}
                onAction={canManage ? () => open() : undefined}
              />
            )}
          </>
        )}
      </ScreenContainer>

      <BottomSheet visible={!!editing} title={editing?.id ? 'Edit DPR' : 'Submit DPR'} onClose={() => setEditing(null)}>
        <SectionLabel>Basic information</SectionLabel>
        <FormField label="Site / block" value={siteName} onChangeText={setSiteName} placeholder="Site section" />
        <FormField label="Labour count" value={labourCount} onChangeText={setLabourCount} placeholder="0" keyboardType="numeric" />

        <SectionLabel>Work progress</SectionLabel>
        <FormField label="Work completed" value={work} onChangeText={setWork} placeholder="Describe completed work" multiline />
        <FormField label="Materials used" value={used} onChangeText={setUsed} placeholder="Materials and quantities" multiline />
        <FormField label="Material wastage" value={wastage} onChangeText={setWastage} placeholder="Wastage details" multiline />
        <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Weather, issues, remarks" multiline />

        <SectionLabel>Site evidence</SectionLabel>
        <View style={styles.photoRow}>
          {images.map(image => (
            <View key={image.uri} style={styles.photoThumb}>
              <Image source={{ uri: image.uri }} style={styles.photoImage} />
              <Pressable onPress={() => removeImage(image.uri)} style={styles.photoRemove} accessibilityRole="button" accessibilityLabel="Remove photo">
                <Ionicons name="close" size={14} color={colors.onPrimary} />
              </Pressable>
            </View>
          ))}
          {images.length < 5 ? (
            <Pressable onPress={chooseImages} style={styles.photoAdd} accessibilityRole="button" accessibilityLabel="Add site photos">
              <Ionicons name="camera-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.photoAddLabel}>Photos {images.length}/5</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable onPress={chooseBill} style={styles.billRow} accessibilityRole="button">
          <Ionicons name={bill ? 'document-attach' : 'attach-outline'} size={18} color={colors.primary} />
          <Text style={styles.billLabel} numberOfLines={1}>{bill ? bill.name : 'Attach bill or receipt'}</Text>
        </Pressable>

        <Button label={saving ? 'Submitting…' : 'Save DPR'} onPress={save} loading={saving} style={{ marginTop: spacing.sm, marginBottom: spacing.md }} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  filterRow: { gap: spacing.sm },
  sectionLabel: { ...typography.caption, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.textMuted, marginTop: spacing.sm },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoThumb: { width: 76, height: 76, borderRadius: radius.control, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoRemove: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' },
  photoAdd: { width: 76, height: 76, borderRadius: radius.control, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: colors.surfaceSecondary },
  photoAddLabel: { ...typography.caption, textTransform: 'none', color: colors.textSecondary },
  billRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceSecondary, borderRadius: radius.input, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  billLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
});
