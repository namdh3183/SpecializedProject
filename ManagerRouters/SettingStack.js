// SettingStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingScreen from '../ManagerScreens/Setting';
import ManagerProfile from '../ManagerScreens/ManagerProfile';

const Stack = createStackNavigator();

export default function SettingStack() {
  return (
    <Stack.Navigator initialRouteName="Setting">
      <Stack.Screen
        name="Setting"
        component={SettingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManagerProfile"
        component={ManagerProfile}
        options={{  headerShown: false }}
      />
    </Stack.Navigator>
  );
}