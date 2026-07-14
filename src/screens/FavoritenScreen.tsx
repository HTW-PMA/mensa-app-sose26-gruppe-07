import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SustainabilityBanner } from '../components/common/SustainabilityBanner';
import { DishCard } from '../components/dish/DishCard';
import { MensaCard } from '../components/mensa/MensaCard';
import { COLORS } from '../constants/colors';
import { useFavorites } from '../context/FavoritesContext';
import { useCanteens } from '../hooks/useCanteens';
import { useAppState } from '../context/AppContext';
import { TabParamList } from '../navigation/TabNavigator';

type FavoritesNav = BottomTabNavigationProp<TabParamList, 'Favoriten'>;

export function FavoritenScreen() {
  const navigation = useNavigation<FavoritesNav>();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const { canteens, error } = useCanteens();
  const { selectedCanteenId, setSelectedCanteenId } = useAppState();
  const {
    favoriteCanteenIds,
    favoriteMeals,
    isCanteenFavorite,
    isMealFavorite,
    toggleCanteenFavorite,
    toggleMealFavorite,
  } = useFavorites();

  const favoriteCanteens = useMemo(
    () => canteens.filter((canteen) => favoriteCanteenIds.includes(canteen.id)),
    [canteens, favoriteCanteenIds],
  );

  return (
    <ScreenContainer>
      <ScreenHeader title="Favoriten" showBack={false} />

      <SegmentedControl
        options={[
          { label: 'Meine Mensen', icon: 'heart' },
          { label: 'Meine Gerichte', icon: 'restaurant' },
        ]}
        selectedIndex={segmentIndex}
        onSelect={setSegmentIndex}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {segmentIndex === 0 ? 'Lieblingsmensen' : 'Lieblingsgerichte'}
        </Text>
        <Text style={styles.sectionSub}>
          {segmentIndex === 0
            ? 'Deine favorisierten Mensen'
            : 'Deine favorisierten Gerichte'}
        </Text>
      </View>

      {error && segmentIndex === 0 ? <Text style={styles.errorText}>{error}</Text> : null}

      {segmentIndex === 0 ? (
        favoriteCanteens.length > 0 ? (
          favoriteCanteens.map((canteen) => (
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
          ))
        ) : (
          <Text style={styles.emptyText}>
            Noch keine Lieblingsmensen. Tippe auf das Herz bei einer Mensa.
          </Text>
        )
      ) : favoriteMeals.length > 0 ? (
        favoriteMeals.map((meal) => (
          <DishCard
            key={meal.id}
            meal={meal}
            isFavorite={isMealFavorite(meal.id)}
            onToggleFavorite={() => toggleMealFavorite(meal)}
          />
        ))
      ) : (
        <Text style={styles.emptyText}>
          Noch keine Lieblingsgerichte. Tippe auf das Herz bei einem Gericht.
        </Text>
      )}

      <SustainabilityBanner />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.waldgruen },
  sectionSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 24,
    lineHeight: 22,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
  },
});
