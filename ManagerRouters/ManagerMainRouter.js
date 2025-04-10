import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ManageScreen from '../ManagerScreens/Manage';
import InventoryScreen from '../ManagerScreens/Inventory';
import RevenueScreen from '../ManagerScreens/Revenue';
import SettingScreen from '../ManagerScreens/Setting';
import ManageRouter from '../ManagerRouters/ManageRouter';

const Tab = createBottomTabNavigator();

export default function ManagerMainRouter() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: '#ffffff', // Header background color (same as tab bar)
        },
        headerTintColor: '#3f278f', // Header text color (Deep Purple)
        tabBarIcon: ({ focused, color }) => {
          const iconSize = 30;
          let iconName = '';

          if (route.name === 'Manage') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Revenue') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Setting') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#3f278f', // Deep Purple for active tab
        tabBarInactiveTintColor: '#ed85be', // Light Pink for inactive tab
        tabBarStyle: {
          backgroundColor: '#ffffff', // White background for tab bar
          borderTopColor: '#e3c87f',    // Light Yellow top border (optional)
          height: 70,                  // Increased tab bar height
          paddingTop: 5,              // Extra top padding
        },
        tabBarLabelStyle: {
          fontSize: 14,
          marginBottom: 10,
        },
      })}
    >
      <Tab.Screen name="Manage" component={ManageRouter} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Revenue" component={RevenueScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  );
}