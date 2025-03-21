import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainRouters from "./CustomerRouters/MainRouters";

const App = () => {
  return (
    <NavigationContainer>
      <MainRouters/>
    </NavigationContainer>
  );
};

export default App;
