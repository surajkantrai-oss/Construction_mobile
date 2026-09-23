import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing, typography } from '../theme';

/**
 * Bottom-anchored sheet for forms/selectors. Replaces the old page-sheet Modal, which on Android could
 * ride up awkwardly when the keyboard opened — this pins to the bottom, respects the safe area, and lets
 * KeyboardAvoidingView push only the sheet (not the whole screen) up when a field is focused.
 */
export function BottomSheet({ visible, title, onClose, children, maxHeightRatio = 0.9 }: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxHeightRatio?: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
          <View style={[styles.sheet, shadows.lg, { maxHeight: `${maxHeightRatio * 100}%`, paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.hero, borderTopRightRadius: radius.hero },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginTop: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...typography.sectionTitle, color: colors.textPrimary, flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: spacing.md },
});
