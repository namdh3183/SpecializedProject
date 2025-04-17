import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const DetailScreen = ({ route }) => {
  const { court } = route.params;
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh */}
      <Image source={{ uri: court.image }} style={styles.image} />

      {/* Tên sân */}
      <Text style={styles.title}>{court.name}</Text>

      {/* Địa điểm */}
      <Text style={styles.location}>📍 {court.location || "Không rõ vị trí"}</Text>

      {/* Trạng thái */}
      <Text style={styles.status}>
        🟢 Trạng thái:{" "}
        <Text style={{ fontWeight: "bold", color: court.status === "available" ? "green" : "red" }}>
          {court.status === "available" ? "Còn trống" : "Đã đặt"}
        </Text>
      </Text>

      {/* Mô tả */}
      <View style={styles.descriptionBox}>
        <Text style={styles.sectionTitle}>📝 Mô tả chi tiết:</Text>
        <Text style={styles.descriptionText}>
          {court.Description || "Không có mô tả cho sân này."}
        </Text>
      </View>

      {/* Nút Đặt sân */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate("Booking", { court })}
      >
        <Text style={styles.bookText}>Đặt sân ngay</Text>
      </TouchableOpacity>

      {/* Nút Quay lại dưới */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonBottom}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    marginBottom: 12,
  },
  descriptionBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#444",
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bookText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButtonBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  backIcon: {
    fontSize: 18,
    marginRight: 5,
    color: "#007AFF",
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
});
