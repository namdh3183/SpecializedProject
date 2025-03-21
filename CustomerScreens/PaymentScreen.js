import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";

const PaymentScreen = ({ navigation }) => {
  const [payments, setPayments] = useState([
    { id: "1", court: "Sân 1", date: "2025-03-06", time: "18:00 - 19:00", price: 100000 },
    { id: "2", court: "Sân 2", date: "2025-03-07", time: "19:00 - 20:00", price: 120000 },
  ]);

  const [selectedMethod, setSelectedMethod] = useState(null);

  const totalAmount = payments.reduce((sum, item) => sum + item.price, 0);

  const paymentMethods = [
    { id: "1", name: "Ví điện tử" },
    { id: "2", name: "Chuyển khoản" },
    { id: "3", name: "Tiền mặt" },
  ];

  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentItem}>
      <Text style={styles.courtName}>{item.court}</Text>
      <Text style={styles.detail}>📅 {item.date} | 🕒 {item.time}</Text>
      <Text style={styles.price}>💰 {item.price.toLocaleString()} VNĐ</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>

      {/* Danh sách các khoản thanh toán */}
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentItem}
        contentContainerStyle={styles.list}
      />

      {/* Hiển thị tổng tiền */}
      <Text style={styles.totalAmount}>Tổng tiền: {totalAmount.toLocaleString()} VNĐ</Text>

      {/* Chọn phương thức thanh toán */}
      <Text style={styles.subtitle}>Chọn phương thức thanh toán:</Text>
      <View style={styles.paymentMethods}>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedMethod === method.id && styles.selectedMethod,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Text style={styles.methodText}>{method.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Nút xác nhận thanh toán */}
      <TouchableOpacity
        style={[styles.confirmButton, !selectedMethod && styles.disabledButton]}
        disabled={!selectedMethod}
        onPress={() => alert("Thanh toán thành công!")}
      >
        <Text style={styles.confirmText}>Xác nhận thanh toán</Text>
      </TouchableOpacity>

      {/* Nút trở về */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Trở về</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3f278f",
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  list: {
    width: "90%",
  },
  paymentItem: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  courtName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3f278f",
  },
  detail: {
    fontSize: 16,
    color: "#333",
    marginVertical: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e3c87f",
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 10,
  },
  paymentMethods: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
  },
  paymentMethod: {
    backgroundColor: "#ed85be",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  selectedMethod: {
    backgroundColor: "#e3c87f",
  },
  methodText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: "#e3c87f",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#777",
  },
  confirmText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#ed85be",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  backText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PaymentScreen;
