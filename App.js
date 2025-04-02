import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainRouters from "./CustomerRouters/MainRouters";
import ManagerMainRouter from './ManagerRouters/ManagerMainRouter';
import AuthNavigator from './Auth/AuthNavigator';


const App = () => {
  return (
    <NavigationContainer>
      <AuthNavigator/>
    </NavigationContainer>
  )
}

export default App;
