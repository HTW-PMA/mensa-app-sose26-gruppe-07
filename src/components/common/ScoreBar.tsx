import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ScoreBarProps {
  score: number;
  maxScore: number;
  segments?: number;
}

export function ScoreBar({ score, maxScore, segments = 4 }: ScoreBarProps) {
  const filledSegments = Math.round((score / Math.max(maxScore, 1)) * segments);

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {Array.from({ length: segments }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              index < filledSegments ? styles.segmentFilled : styles.segmentEmpty,
              index < segments - 1 && styles.segmentGap,
            ]}
          />
        ))}
      </View>
      <Text style={styles.scoreText}>
        {score}/{maxScore}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
  },
  bar: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  segment: {
    width: 8,
    height: 24,
    borderRadius: 2,
  },
  segmentFilled: {
    backgroundColor: COLORS.waldgruen,
  },
  segmentEmpty: {
    backgroundColor: COLORS.border,
  },
  segmentGap: {
    marginRight: 3,
  },
  scoreText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
