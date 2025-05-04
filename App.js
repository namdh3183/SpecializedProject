import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainRouters from "./CustomerRouters/MainRouters";
import ManagerMainRouter from './ManagerRouters/ManagerMainRouter';
import AuthNavigator from './Auth/AuthNavigator';
import { Linking } from 'react-native';

// Deep linking config
const linking = {
  prefixes: ['com.managercourt.app://'],
  config: {
    screens: {
      Thankyou: 'payment/return',
      Cancel: 'payment/cancel',
    },
  },
};

const App = () => {
  return (
    <NavigationContainer linking={linking}>
      <AuthNavigator />
    </NavigationContainer>
  );
};

export default App;
