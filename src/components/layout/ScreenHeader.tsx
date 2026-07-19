import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface ScreenHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  centerTitle?: boolean;
}

export function ScreenHeader({
  title,
  showBack = false,
  onBack,
  centerTitle = true,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={COLORS.waldgruen} />
            <Text style={styles.backText}>Zurück</Text>
          </Pressable>
        ) : null}
      </View>

      {title ? (
        <Text style={[styles.title, centerTitle && styles.titleCenter]}>
          {title}
        </Text>
      ) : (
        <View style={styles.titlePlaceholder} />
      )}

      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    minHeight: 48,
  },
  side: {
    width: 80,
    alignItems: 'flex-start',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: COLORS.waldgruen,
    fontSize: 14,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  titleCenter: {
    textAlign: 'center',
  },
  titlePlaceholder: {
    flex: 1,
  },
});
