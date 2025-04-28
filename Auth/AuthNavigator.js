import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ManagerMainRouter from '../ManagerRouters/ManagerMainRouter';
import MainRouters from '../CustomerRouters/MainRouters';
import ResetPassword from './ResetPassword';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ManagerMainRouter" 
        component={ManagerMainRouter} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="MainRouters" 
        component={MainRouters} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}