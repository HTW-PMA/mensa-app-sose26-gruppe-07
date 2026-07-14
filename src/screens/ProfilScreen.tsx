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

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  destructive,
}: SettingsItemProps) {
  return (
    <Pressable style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? COLORS.error : COLORS.waldgruen}
        />
      </View>
      <View style={styles.settingsText}>
        <Text
          style={[styles.settingsTitle, destructive && styles.destructiveText]}
        >
          {title}
        </Text>
        <Text style={styles.settingsSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
  );
}

const SETTINGS_ITEMS: SettingsItemProps[] = [
  {
    icon: 'person-circle-outline',
    title: 'Persönliche Daten',
    subtitle: 'Name, E-Mail, Profilbild bearbeiten',
  },
  {
    icon: 'leaf-outline',
    title: 'Ernährungspräferenzen',
    subtitle: 'Vorlieben, Allergien & Unverträglichkeiten',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Datenschutz',
    subtitle: 'Verwalte deine Daten und Privatsphäre',
  },
  {
    icon: 'settings-outline',
    title: 'App-Einstellungen',
    subtitle: 'Sprache, Design & weitere Optionen',
  },
];

const ACCOUNT_ITEMS: SettingsItemProps[] = [
  {
    icon: 'bookmark-outline',
    title: 'Gespeicherte Filter',
    subtitle: 'Deine bevorzugten Filter anzeigen & bearbeiten',
  },
  {
    icon: 'time-outline',
    title: 'Verlauf',
    subtitle: 'Zuletzt angesehene Gerichte',
  },
  {
    icon: 'help-circle-outline',
    title: 'Hilfe & FAQ',
    subtitle: 'Häufige Fragen und Unterstützung',
  },
  {
    icon: 'log-out-outline',
    title: 'Abmelden',
    subtitle: 'Von deinem Konto abmelden',
    destructive: true,
  },
];

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
      <ScreenHeader title="Profil" showBack={false} />

      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>LM</Text>
          </View>
          <Pressable style={styles.editAvatarButton}>
            <Ionicons name="pencil" size={12} color={COLORS.white} />
          </Pressable>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Lena Müller</Text>
          <Text style={styles.profileEmail}>lena.mueller@mail.de</Text>
          <View style={styles.mottoRow}>
            <Ionicons name="leaf" size={14} color={COLORS.salbeigruen} />
            <Text style={styles.motto}>Bewusst genießen, jeden Tag.</Text>
          </View>
        </View>
      </View>

      <Text style={styles.groupTitle}>Einstellungen</Text>
      <View style={styles.settingsGroup}>
        {SETTINGS_ITEMS.map((item) => (
          <SettingsItem key={item.title} {...item} />
        ))}
      </View>

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

      <Text style={styles.groupTitle}>Mein Konto</Text>
      <View style={styles.settingsGroup}>
        {ACCOUNT_ITEMS.map((item) => (
          <SettingsItem key={item.title} {...item} />
        ))}
      </View>

      <Text style={styles.version}>App-Version 1.0.0</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.creme,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.salbeigruen,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.waldgruen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  mottoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  motto: {
    fontSize: 12,
    color: COLORS.salbeigruen,
    fontStyle: 'italic',
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 8,
    marginTop: 8,
  },
  settingsGroup: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  settingsText: {
    flex: 1,
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
  destructiveText: {
    color: COLORS.error,
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
