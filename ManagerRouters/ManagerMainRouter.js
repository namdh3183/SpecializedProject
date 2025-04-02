import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ManageScreen from '../ManagerScreens/Manage';
import InventoryScreen from '../ManagerScreens/Inventory';
import SettingScreen from '../ManagerScreens/Setting';
import RevenueScreen from '../ManagerScreens/Revenue';

const Tab = createBottomTabNavigator();

export default function ManagerMainRouter() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Add icon based on the current route name
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Manage') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Setting') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Revenue') {
            iconName = focused ? 'cash' : 'cash-outline';
          }

          // Return the icon component
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Customize active and inactive colors
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Manage" component={ManageScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Revenue" component={RevenueScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>

  );
}