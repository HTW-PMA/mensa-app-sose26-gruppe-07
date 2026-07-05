import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { SustainabilityBanner } from '../components/common/SustainabilityBanner';
import { MensaCard } from '../components/mensa/MensaCard';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { useAppState } from '../context/AppContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCanteens } from '../hooks/useCanteens';
import { TabParamList } from '../navigation/TabNavigator';

type HomeNav = BottomTabNavigationProp<TabParamList, 'Home'>;

const QUICK_ACCESS = [
  { label: 'Speiseplan', sub: 'heute ansehen', icon: 'calendar-outline' as const, tab: 'Speiseplan' as const },
  { label: 'Favoriten', sub: 'ansehen', icon: 'star-outline' as const, tab: 'Favoriten' as const },
  { label: 'Gerichtefinder', sub: 'passende Gerichte finden', icon: 'paw-outline' as const, tab: 'Gerichtefinder' as const },
  { label: 'Benachrichtigungen', sub: 'verwalten', icon: 'notifications-outline' as const, tab: 'Profil' as const },
];

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const [searchQuery, setSearchQuery] = useState('');
  const { canteens, loading } = useCanteens();
  const { setSelectedCanteenId, apiError } = useAppState();
  const { isCanteenFavorite, toggleCanteenFavorite } = useFavorites();

  const filteredCanteens = canteens.filter((canteen) =>
    canteen.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="paw" size={22} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.appName}>Mensabär</Text>
            <View style={styles.locationRow}>
              <Ionicons name="heart" size={12} color={COLORS.salbeigruen} />
              <Text style={styles.location}>Berlin</Text>
            </View>
          </View>
        </View>
        <View style={styles.bellContainer}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.waldgruen}
          />
          <View style={styles.notificationDot} />
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mensa oder Gericht suchen..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="options-outline" size={18} color={COLORS.textMuted} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroEmoji}>🐻‍🍳</Text>
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Ich helfe dir, <Text style={styles.heroHighlight}>das Richtige</Text>{' '}
            zu finden!
          </Text>
          <Text style={styles.heroSubtitle}>
            Passende Gerichte basierend auf deinen Vorlieben und Allergien.
          </Text>
          <Pressable
            style={styles.heroButton}
            onPress={() => navigation.navigate('Gerichtefinder')}
          >
            <Ionicons name="sparkles" size={14} color={COLORS.white} />
            <Text style={styles.heroButtonText}>Zum Gerichtefinder</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
          </Pressable>
        </View>
      </View>

      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Berliner Mensen</Text>
        <Text style={styles.sectionLink}>Alle anzeigen ›</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.waldgruen} style={styles.loader} />
      ) : (
        filteredCanteens.map((canteen) => (
          <MensaCard
            key={canteen.id}
            canteen={canteen}
            isFavorite={isCanteenFavorite(canteen.id)}
            onPress={() => {
              setSelectedCanteenId(canteen.id);
              navigation.navigate('Speiseplan');
            }}
            onToggleFavorite={() => toggleCanteenFavorite(canteen.id)}
          />
        ))
      )}

      <Text style={styles.sectionTitle}>Schnellzugriff</Text>
      <View style={styles.quickGrid}>
        {QUICK_ACCESS.map((item) => (
          <Pressable
            key={item.label}
            style={styles.quickCard}
            onPress={() => navigation.navigate(item.tab)}
          >
            <Ionicons name={item.icon} size={24} color={COLORS.waldgruen} />
            <Text style={styles.quickLabel}>{item.label}</Text>
            <Text style={styles.quickSub}>{item.sub}</Text>
          </Pressable>
        ))}
      </View>

      <SustainabilityBanner />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.waldgruen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.waldgruen,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  bellContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.salbeigruen,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.waldgruen,
  },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  heroIcon: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 48,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 6,
  },
  heroHighlight: {
    color: COLORS.salbeigruen,
  },
  heroSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
    lineHeight: 18,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.waldgruen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: LAYOUT.borderRadius.sm,
    gap: 6,
  },
  heroButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginBottom: 12,
  },
  sectionLink: {
    fontSize: 13,
    color: COLORS.salbeigruen,
    fontWeight: '600',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  quickCard: {
    width: '47%',
    backgroundColor: COLORS.creme,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 16,
    alignItems: 'flex-start',
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.waldgruen,
    marginTop: 8,
  },
  quickSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
  },
});
