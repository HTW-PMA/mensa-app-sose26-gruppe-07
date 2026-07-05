import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { SpeiseplanScreen } from '../screens/SpeiseplanScreen';
import { FavoritenScreen } from '../screens/FavoritenScreen';
import { GerichtefinderScreen } from '../screens/GerichtefinderScreen';
import { ProfilScreen } from '../screens/ProfilScreen';

export type TabParamList = {
  Home: undefined;
  Speiseplan: undefined;
  Favoriten: undefined;
  Gerichtefinder: undefined;
  Profil: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_CONFIG: {
  name: keyof TabParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: 'Home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'Speiseplan', label: 'Speiseplan', icon: 'restaurant-outline', iconActive: 'restaurant' },
  { name: 'Favoriten', label: 'Favoriten', icon: 'star-outline', iconActive: 'star' },
  { name: 'Gerichtefinder', label: 'Gerichtefinder', icon: 'paw-outline', iconActive: 'paw' },
  { name: 'Profil', label: 'Profil', icon: 'person-outline', iconActive: 'person' },
];

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.waldgruen,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const config = TAB_CONFIG.find((tab) => tab.name === route.name);
          const iconName = focused
            ? (config?.iconActive ?? 'ellipse')
            : (config?.icon ?? 'ellipse-outline');
          return (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
        tabBarLabel: ({ focused, color }) => {
          const config = TAB_CONFIG.find((tab) => tab.name === route.name);
          return (
            <Text style={[styles.tabLabel, { color }, focused && styles.tabLabelActive]}>
              {config?.label}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Speiseplan" component={SpeiseplanScreen} />
      <Tab.Screen name="Favoriten" component={FavoritenScreen} />
      <Tab.Screen name="Gerichtefinder" component={GerichtefinderScreen} />
      <Tab.Screen name="Profil" component={ProfilScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabIconContainer: {
    padding: 4,
    borderRadius: 8,
  },
  tabIconActive: {
    backgroundColor: COLORS.creme,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});
