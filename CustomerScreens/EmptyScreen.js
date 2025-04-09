import React from "react";
import { View, Text, StyleSheet } from "react-native";

const EmptyScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chọn chức năng bên dưới để bắt đầu</Text>
    </View>
  );
};

export default EmptyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  text: {
    fontSize: 18,
    color: "#555",
  },
});
