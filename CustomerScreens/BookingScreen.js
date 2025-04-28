import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import firestore from "@react-native-firebase/firestore";

const BookingScreen = ({ route, navigation }) => {
  const { court } = route.params;
  const [bookingDate, setBookingDate] = useState(new Date());
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleBooking = async () => {
    // Kiểm tra các điều kiện đầu vào
    if (!bookingDate || !startTime || !endTime) {
      Alert.alert("Lỗi", "Vui lòng chọn ngày và giờ bắt đầu/kết thúc.");
      return;
    }

    if (startTime >= endTime) {
      Alert.alert("Lỗi", "Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
      return;
    }

    try {
      await firestore().collection("bookings").add({
        courtId: court.name,
        date: bookingDate.toDateString(),
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: "pending", // Có thể dùng để xác nhận sau
      });

      Alert.alert("Thành công", "Bạn đã đặt sân thành công!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đặt sân. Vui lòng thử lại.");
      console.error("Booking error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt sân: {court.name}</Text>

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputBox}>
        <Text style={styles.inputText}>
          📅 Ngày: {bookingDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          display="default"
          value={bookingDate}
          onChange={(e, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) setBookingDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.inputBox}>
        <Text style={styles.inputText}>
          ⏰ Giờ bắt đầu: {startTime ? startTime.toLocaleTimeString() : "Chọn giờ"}
        </Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          mode="time"
          display="default"
          value={new Date()}
          onChange={(e, selectedTime) => {
            setShowStartPicker(Platform.OS === "ios");
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.inputBox}>
        <Text style={styles.inputText}>
          ⏳ Giờ kết thúc: {endTime ? endTime.toLocaleTimeString() : "Chọn giờ"}
        </Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          mode="time"
          display="default"
          value={new Date()}
          onChange={(e, selectedTime) => {
            setShowEndPicker(Platform.OS === "ios");
            if (selectedTime) setEndTime(selectedTime);
          }}
        />
      )}

      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookText}>Xác nhận đặt sân</Text>
      </TouchableOpacity>

         {/* Nút Quay lại dưới */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonBottom}>
              <Text style={styles.backIcon}>←</Text>
              <Text style={styles.backText}>Quay lại</Text>
            </TouchableOpacity>
    </View>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 24,
    textAlign: "center",
  },
  inputBox: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  bookButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  backIcon: {
    fontSize: 18,
    marginRight: 6,
    color: "#007AFF",
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
});

