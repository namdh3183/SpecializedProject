import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const snapshot = await firestore().collection("bookings").get();
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        court: doc.data().courtId,
        date: doc.data().date,
        startTime: doc.data().startTime,
        endTime: doc.data().endTime,
        status: doc.data().status,
      }));
      setHistory(bookings);
    };

    fetchHistory();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.courtName}>{item.court}</Text>
      <Text style={styles.detail}>📅 {item.date} | 🕒 {item.startTime} - {item.endTime}</Text>
      <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStatusStyle = (status) => {
  switch (status) {
    case "completed":
      return { color: "#3f278f" };
    case "cancelled":
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
