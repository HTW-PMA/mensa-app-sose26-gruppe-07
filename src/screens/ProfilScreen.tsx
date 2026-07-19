import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import {
  getMealReminderSettings,
  MealReminderSettings,
  saveMealReminder,
} from '../services/notificationService';

export function ProfilScreen() {
  const [reminder, setReminder] = useState<MealReminderSettings>({
    enabled: false,
    hour: 11,
    minute: 30,
  });
  const [reminderLoading, setReminderLoading] = useState(true);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  useEffect(() => {
    getMealReminderSettings()
      .then(setReminder)
      .finally(() => setReminderLoading(false));
  }, []);

  const updateReminder = async (next: MealReminderSettings) => {
    setReminderLoading(true);
    setReminderMessage(null);
    try {
      const saved = await saveMealReminder(next);
      setReminder(saved);
      setReminderMessage(
        saved.enabled
          ? `Tägliche Erinnerung um ${formatTime(saved.hour, saved.minute)} aktiviert.`
          : 'Essens-Erinnerung deaktiviert.',
      );
    } catch (error) {
      setReminderMessage(
        error instanceof Error
          ? error.message
          : 'Essens-Erinnerung konnte nicht gespeichert werden.',
      );
    } finally {
      setReminderLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Einstellungen" showBack={false} />

      <Text style={styles.intro}>
        Verwalte deine lokale Essens-Erinnerung.
      </Text>

      <Text style={styles.groupTitle}>Benachrichtigungen</Text>
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <View style={styles.settingsIcon}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.waldgruen} />
          </View>
          <View style={styles.reminderText}>
            <Text style={styles.settingsTitle}>Tägliche Essens-Erinnerung</Text>
            <Text style={styles.settingsSubtitle}>
              Erinnert dich lokal an den aktuellen Speiseplan.
            </Text>
          </View>
          {reminderLoading ? (
            <ActivityIndicator size="small" color={COLORS.waldgruen} />
          ) : (
            <Switch
              value={reminder.enabled}
              onValueChange={(enabled) => updateReminder({ ...reminder, enabled })}
              trackColor={{ false: COLORS.border, true: COLORS.salbeigruen }}
              thumbColor={COLORS.white}
            />
          )}
        </View>

        <Text style={styles.reminderLabel}>Uhrzeit</Text>
        <View style={styles.timeOptions}>
          {REMINDER_TIMES.map((time) => {
            const active = reminder.hour === time.hour && reminder.minute === time.minute;
            return (
              <Pressable
                key={time.label}
                disabled={reminderLoading}
                onPress={() => updateReminder({ ...reminder, ...time })}
                style={[styles.timeButton, active && styles.timeButtonActive]}
              >
                <Text style={[styles.timeText, active && styles.timeTextActive]}>
                  {time.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {reminderMessage ? <Text style={styles.reminderMessage}>{reminderMessage}</Text> : null}
      </View>

      <Text style={styles.version}>App-Version 1.0.0</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  intro: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 8,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.creme,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.waldgruen,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    marginBottom: 16,
  },
  reminderCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderText: {
    flex: 1,
    marginRight: 8,
  },
  reminderLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
  },
  timeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.sm,
    paddingVertical: 9,
    backgroundColor: COLORS.creme,
  },
  timeButtonActive: {
    backgroundColor: COLORS.waldgruen,
    borderColor: COLORS.waldgruen,
  },
  timeText: {
    color: COLORS.waldgruen,
    fontWeight: '600',
    fontSize: 12,
  },
  timeTextActive: {
    color: COLORS.white,
  },
  reminderMessage: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 10,
  },
});

const REMINDER_TIMES = [
  { label: '11:00', hour: 11, minute: 0 },
  { label: '11:30', hour: 11, minute: 30 },
  { label: '12:00', hour: 12, minute: 0 },
];

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} Uhr`;
}
