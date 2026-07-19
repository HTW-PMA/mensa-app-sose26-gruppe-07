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

export function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCanteens, setShowAllCanteens] = useState(false);
  const { canteens, loading, error, reload } = useCanteens();
  const { selectedCanteenId, setSelectedCanteenId } = useAppState();
  const { isCanteenFavorite, toggleCanteenFavorite } = useFavorites();

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase('de-DE');
  const filteredCanteens = canteens.filter((canteen) => {
    const searchableText = `${canteen.name} ${canteen.address ?? ''}`.toLocaleLowerCase(
      'de-DE',
    );
    return searchableText.includes(normalizedSearch);
  });
  const prioritizedCanteens = selectedCanteenId
    ? [
        ...filteredCanteens.filter((canteen) => canteen.id === selectedCanteenId),
        ...filteredCanteens.filter((canteen) => canteen.id !== selectedCanteenId),
      ]
    : filteredCanteens;
  const visibleCanteens =
    normalizedSearch || showAllCanteens
      ? filteredCanteens
      : prioritizedCanteens.slice(0, 5);

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
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mensa oder Adresse suchen..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
            Passende Gerichte basierend auf deiner aktuellen Auswahl.
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

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => reload(true)}>
            <Text style={styles.retryText}>Erneut laden</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Berliner Mensen</Text>
        {!loading && canteens.length > 5 && !normalizedSearch ? (
          <Pressable onPress={() => setShowAllCanteens((current) => !current)}>
            <Text style={styles.sectionLink}>
              {showAllCanteens ? 'Weniger anzeigen' : `Alle ${canteens.length} anzeigen`}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.waldgruen} style={styles.loader} />
      ) : (
        <>
          {visibleCanteens.map((canteen) => (
            <MensaCard
              key={canteen.id}
              canteen={canteen}
              isSelected={canteen.id === selectedCanteenId}
              isFavorite={isCanteenFavorite(canteen.id)}
              onPress={() => {
                setSelectedCanteenId(canteen.id);
                navigation.navigate('Speiseplan');
              }}
              onToggleFavorite={() => toggleCanteenFavorite(canteen.id)}
            />
          ))}
          {visibleCanteens.length === 0 && !error ? (
            <Text style={styles.emptyText}>Keine passende Mensa gefunden.</Text>
          ) : null}
        </>
      )}

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
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
  },
  errorContainer: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius.sm,
    padding: 12,
    marginBottom: 12,
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  retryText: {
    color: COLORS.waldgruen,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
});
