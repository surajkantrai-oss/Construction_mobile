import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

export function Skeleton({ width = '100%', height = 16, rounded = radius.sm, style }: { width?: number | `${number}%`; height?: number; rounded?: number; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[{ width, height, borderRadius: rounded, backgroundColor: colors.surfaceSecondary, opacity }, style]} />;
}

export function CardSkeleton({ lines = 2 }: { lines?: number }) {
  return (
    <View style={styles.card}>
      <Skeleton width="55%" height={18} />
      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        {Array.from({ length: lines }).map((_, index) => <Skeleton key={index} width={index === lines - 1 ? '70%' : '100%'} height={12} />)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
});
