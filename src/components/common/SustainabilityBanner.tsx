import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';

export function SustainabilityBanner() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="leaf" size={20} color={COLORS.white} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Nachhaltig genießen 🍃</Text>
        <Text style={styles.subtitle}>
          Bewusst essen mit Kennzeichnungen für vegane, vegetarische und
          CO₂-arme Gerichte.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 14,
    marginTop: 16,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.salbeigruen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
});
