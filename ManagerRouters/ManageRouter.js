// ManageStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ManageScreen from '../ManagerScreens/Manage';
import CourtDetail from '../ManagerScreens/CourtDetail';

const Stack = createStackNavigator();

const ManageStack = () => {
  return (
    <Stack.Navigator initialRouteName="Manage">
      <Stack.Screen 
        name="Manage" 
        component={ManageScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CourtDetail" 
        component={CourtDetail} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ManageStack;