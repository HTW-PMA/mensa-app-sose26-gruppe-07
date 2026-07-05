import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { Canteen } from '../../types/api';

interface MensaCardProps {
  canteen: Canteen;
  isFavorite?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  showChevron?: boolean;
}

export function MensaCard({
  canteen,
  isFavorite,
  onPress,
  onToggleFavorite,
  showChevron = true,
}: MensaCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={{ uri: canteen.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{canteen.name}</Text>
        <View style={styles.statusRow}>
          {canteen.distance ? (
            <Text style={styles.meta}>{canteen.distance}</Text>
          ) : null}
          {canteen.isOpen !== undefined ? (
            <Text
              style={[
                styles.status,
                canteen.isOpen ? styles.statusOpen : styles.statusClosed,
              ]}
            >
              {canteen.isOpen ? '• Geöffnet' : '• Geschlossen'}
            </Text>
          ) : null}
        </View>
        {canteen.openingHours ? (
          <View style={styles.hoursRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.hours}>{canteen.openingHours}</Text>
          </View>
        ) : null}
      </View>

      {showChevron ? (
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      ) : null}

      {onToggleFavorite ? (
        <Pressable onPress={onToggleFavorite} style={styles.heartButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={COLORS.waldgruen}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  image: {
    width: 72,
    height: 56,
    borderRadius: LAYOUT.borderRadius.sm,
    marginRight: 12,
    backgroundColor: COLORS.creme,
  },
  content: {
    flex: 1,
    paddingRight: 24,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusOpen: {
    color: COLORS.salbeigruen,
  },
  statusClosed: {
    color: COLORS.textMuted,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hours: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  heartButton: {
    position: 'absolute',
    bottom: 12,
    right: 36,
  },
});
