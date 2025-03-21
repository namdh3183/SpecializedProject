import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Tiêu đề */}
      <Text style={styles.title}>Quản lý sân cầu lông</Text>

      {/* Danh sách các chức năng */}
      <ScrollView contentContainerStyle={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: "#ed85be" }]} // Hồng nhạt
          onPress={() => navigation.navigate("Booking")}
        >
          <Text style={styles.menuText}>Đặt sân</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: "#e3c87f" }]} // Vàng nhạt
          onPress={() => navigation.navigate("History")}
        >
          <Text style={styles.menuText}>Lịch sử đặt sân</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: "#3f278f" }]} // Tím xanh
          onPress={() => navigation.navigate("Profile")}
        >
          <Text style={styles.menuText}>Thông tin cá nhân</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: "#ed85be" }]} // Hồng nhạt
          onPress={() => navigation.navigate("Payment")}
        >
          <Text style={styles.menuText}>Thanh toán</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: "#e3c87f" }]} // Vàng nhạt
          onPress={() => navigation.navigate("Review")}
        >
          <Text style={styles.menuText}>Đánh giá</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3f278f", // Tím xanh làm nền
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff", // Trắng
    marginBottom: 20,
  },
  menuContainer: {
    width: "90%",
    alignItems: "center",
  },
  menuItem: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  menuText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff", // Trắng
  },
});

export default Home;
