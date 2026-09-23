import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export function ProgressBar({ value, height = 8 }: { value: number; height?: number }) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View style={[styles.fill, { width: `${clamped}%`, height, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.surfaceSecondary, overflow: 'hidden', width: '100%' },
  fill: { backgroundColor: colors.primary },
});
