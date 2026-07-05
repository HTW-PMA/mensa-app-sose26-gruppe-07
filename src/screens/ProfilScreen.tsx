import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

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
    icon: 'notifications-outline',
    title: 'Benachrichtigungen',
    subtitle: 'Einstellungen zu Mitteilungen',
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
});
