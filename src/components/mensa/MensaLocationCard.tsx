import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { Canteen } from '../../types/api';

interface MensaLocationCardProps {
  canteen: Canteen;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function MensaLocationCard({
  canteen,
  isFavorite,
  onToggleFavorite,
}: MensaLocationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.name}>{canteen.name}</Text>
        {canteen.address ? (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.salbeigruen} />
            <Text style={styles.address}>{canteen.address}</Text>
          </View>
        ) : null}
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
      {onToggleFavorite ? (
        <Pressable onPress={onToggleFavorite} style={styles.heartButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={COLORS.waldgruen}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 4,
  },
  address: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginRight: 6,
  },
  status: {
    fontSize: 13,
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
    fontSize: 13,
    color: COLORS.textMuted,
  },
  heartButton: {
    padding: 4,
  },
});
