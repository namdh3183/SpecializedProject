import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";

// Import màn hình
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
            case "Trang chủ":
              iconName = "home-outline";
              break;
            
            case "Lịch sử":
              iconName = "time-outline";
              break;
            case "Cá nhân":
              iconName = "person-outline";
              break;
            case "Thanh toán":
              iconName = "card-outline";
              break;
            case "Đánh giá":
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
      <Tab.Screen name="Trang chủ" component={EmptyScreen} />
      <Tab.Screen name="Lịch sử" component={HistoryScreen} />
      <Tab.Screen name="Cá nhân" component={ProfileScreen} />
      <Tab.Screen name="Thanh toán" component={PaymentScreen} />
      <Tab.Screen name="Đánh giá" component={ReviewScreen} />
    </Tab.Navigator>
  );
};

export default Home;
