import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([
    { id: "1", court: "Sân 1", date: "2025-03-06", time: "18:00 - 19:00", status: "Đã hoàn thành" },
    { id: "2", court: "Sân 2", date: "2025-03-07", time: "19:00 - 20:00", status: "Đang chờ" },
    { id: "3", court: "Sân 3", date: "2025-03-08", time: "20:00 - 21:00", status: "Đã hủy" },
  ]);

  const handleCancel = (id) => {
    setHistory((prevHistory) =>
      prevHistory.map((item) =>
        item.id === id && item.status === "Đang chờ"
          ? { ...item, status: "Đã hủy" }
          : item
      )
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.courtName}>{item.court}</Text>
      <Text style={styles.detail}>📅 {item.date} | 🕒 {item.time}</Text>
      <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
      {item.status === "Đang chờ" && (
        <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancel(item.id)}>
          <Text style={styles.cancelText}>Hủy</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử đặt sân</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Trở về</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case "Đã hoàn thành":
      return { color: "#3f278f" };
    case "Đang chờ":
      return { color: "#e3c87f" };
    case "Đã hủy":
      return { color: "#ed85be" };
    default:
      return { color: "#ffffff" };
  }
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
  item: {
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
  status: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "#ed85be",
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    backgroundColor: "#e3c87f",
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

export default HistoryScreen;
