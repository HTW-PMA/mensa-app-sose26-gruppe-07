import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Mehr erfahren</Text>
        <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
      </Pressable>
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.waldgruen,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: LAYOUT.borderRadius.sm,
    gap: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },
});
