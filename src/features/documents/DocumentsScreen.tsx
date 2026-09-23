import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { api, ApiError, uploadUrl } from '../../api';
import { AppHeader, CardSkeleton, EmptyState, ErrorState, IconButton, ListRow, ScreenContainer, SearchInput } from '../../components';
import { useLoader } from '../../hooks/useLoader';
import type { IconName } from '../../navigation/sections';
import { colors, spacing } from '../../theme';
import { formatDate } from '../../utils/formatters';

const fileIcon = (type: string): IconName => {
  const value = type.toLowerCase();
  if (value.includes('pdf')) return 'document-text-outline';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'image'].some(ext => value.includes(ext))) return 'image-outline';
  if (['xls', 'xlsx', 'csv'].some(ext => value.includes(ext))) return 'grid-outline';
  return 'document-outline';
};

export function DocumentsScreen({ onBack }: { onBack?: () => void }) {
  const docs = useLoader(() => api.documents.list(), [], []);
  const [query, setQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return docs.value.filter(document => !term || document.name.toLowerCase().includes(term));
  }, [docs.value, query]);

  const upload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
    if (result.canceled) return;
    setUploading(true);
    try {
      const file = result.assets[0];
      const form = new FormData();
      form.append('file', { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' } as unknown as Blob);
      form.append('folder', 'General');
      await api.documents.create(form);
      await docs.refresh();
    } catch (error) {
      Alert.alert('Upload failed', error instanceof ApiError ? error.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <AppHeader title="Documents" subtitle="Images and PDFs" onBack={onBack} right={<IconButton icon={uploading ? 'hourglass-outline' : 'cloud-upload-outline'} accessibilityLabel="Upload document" onPress={() => void upload()} disabled={uploading} backgroundColor={colors.primaryLight} color={colors.primaryDark} />} />
      <ScreenContainer refreshing={docs.busy} onRefresh={docs.refresh}>
        {docs.error ? (
          <ErrorState description={docs.error} onRetry={docs.refresh} />
        ) : (
          <>
            <SearchInput value={query} onChangeText={setQuery} placeholder="Search documents…" />
            {docs.busy && !docs.value.length ? (
              <View style={{ gap: spacing.md }}><CardSkeleton lines={1} /><CardSkeleton lines={1} /></View>
            ) : rows.length ? (
              <View style={{ gap: spacing.md }}>
                {rows.map(document => (
                  <ListRow
                    key={document.id}
                    icon={fileIcon(document.type)}
                    title={document.name}
                    subtitle={`${document.type} · ${document.size} · ${document.folder} · ${formatDate(document.date)}`}
                    onPress={document.filename ? () => Linking.openURL(uploadUrl(document.filename!)) : undefined}
                  />
                ))}
              </View>
            ) : (
              <EmptyState icon="folder-open-outline" title="No documents found" description={query ? 'Try a different search.' : 'Uploaded files will appear here.'} actionLabel={!query ? 'Upload document' : undefined} onAction={() => void upload()} />
            )}
          </>
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1, backgroundColor: colors.background } });
