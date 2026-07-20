import React from 'react';
import { StyleSheet } from 'react-native';
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
  {
    name: 'Speiseplan',
    label: 'Speiseplan',
    icon: 'calendar-outline',
    iconActive: 'calendar',
  },
  {
    name: 'Favoriten',
    label: 'Favoriten',
    icon: 'heart-outline',
    iconActive: 'heart',
  },
  {
    name: 'Gerichtefinder',
    label: 'Finder',
    icon: 'sparkles-outline',
    iconActive: 'sparkles',
  },
  {
    name: 'Profil',
    label: 'Mehr',
    icon: 'settings-outline',
    iconActive: 'settings',
  },
];

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: COLORS.waldgruen,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabel: TAB_CONFIG.find((tab) => tab.name === route.name)?.label,
        tabBarIcon: ({ focused, color, size }) => {
          const config = TAB_CONFIG.find((tab) => tab.name === route.name);
          const iconName = focused
            ? (config?.iconActive ?? 'ellipse')
            : (config?.icon ?? 'ellipse-outline');
          return <Ionicons name={iconName} size={size} color={color} />;
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
  },
  tabLabel: {
    fontSize: 10,
  },
});
