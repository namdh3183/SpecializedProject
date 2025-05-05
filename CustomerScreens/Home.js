import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";

// Import screens
import EmptyScreen from "./EmptyScreen";
import HistoryScreen from "./HistoryScreen";
import ProfileScreen from "./ProfileScreen";
import PaymentScreen from "./PaymentScreen";
import ReviewScreen from "./ReviewScreen";

const Tab = createBottomTabNavigator();

const Home = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "home-outline";
              break;
            
            case "History":
              iconName = "time-outline";
              break;
            case "Profile":
              iconName = "person-outline";
              break;
            case "Payment":
              iconName = "card-outline";
              break;
            case "Review":
              iconName = "star-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3f278f",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={EmptyScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default Home;
