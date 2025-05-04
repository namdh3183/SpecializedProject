import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "../CustomerScreens/Home";
import BookingScreen from "../CustomerScreens/BookingScreen";
import HistoryScreen from "../CustomerScreens/HistoryScreen";
import ProfileScreen from "../CustomerScreens/ProfileScreen";
import PaymentScreen from "../CustomerScreens/PaymentScreen";
import ReviewScreen from "../CustomerScreens/ReviewScreen";
import EmptyScreen from "../CustomerScreens/EmptyScreen";
import DetailScreen from "../CustomerScreens/DetailScreen";
import PaypalScreen from "../CustomerScreens/PaypalScreen";
import ThankYouScreen from "../CustomerScreens/ThankyouScreen";

const Stack = createNativeStackNavigator();

const MainRouters = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="EmptyScreen" component={EmptyScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Paypal" component={PaypalScreen} />
      <Stack.Screen name="Thankyou" component={ThankYouScreen} />



    </Stack.Navigator>
  );
};

export default MainRouters;
