import React, { useState, useEffect } from "react";
import {
  View,
  Text,
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
  const [reservedHours, setReservedHours] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    loadReservedHours();
  }, [bookingDate, court.name]);

  const loadReservedHours = async () => {
    setReservedHours([]);
    const snapshot = await firestore()
      .collection("bookings")
      .where("courtId", "==", court.name)
      .where("date", "==", bookingDate.toDateString())
      .get();

    const reserved = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const start = parseInt(data.startTime.split(":")[0], 10);
      const end = parseInt(data.endTime.split(":")[0], 10);
      for (let i = start; i < end; i++) {
        reserved.push(i);
      }
    });
    setReservedHours(reserved);
  };

  const handleBooking = async () => {
    if (!startTime || !endTime) {
      Alert.alert("Lỗi", "Vui lòng chọn giờ bắt đầu và kết thúc.");
      return;
    }
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    for (let i = startHour; i < endHour; i++) {
      if (reservedHours.includes(i)) {
        Alert.alert("Lỗi", "Có giờ đã bị đặt. Chọn giờ khác.");
        return;
      }
    }
  
    try {
      await firestore().collection("bookings").add({
        courtId: court.name,
        date: bookingDate.toDateString(),
        startTime: `${startHour}:00`,
        endTime: `${endHour}:00`,
        timestamp: firestore.FieldValue.serverTimestamp(),
        status: "pending",  // Trạng thái đặt là "pending" trước khi thanh toán
      });
  
      const newReserved = [];
      for (let i = startHour; i < endHour; i++) {
        newReserved.push(i);
      }
      setReservedHours((prev) => [...prev, ...newReserved]);
      setStartTime(null);
      setEndTime(null);
      Alert.alert("Vui lòng thanh toán nhé.");
  
      const price = calculatePrice();
      navigation.navigate("Paypal", { courtName: court.name, date: bookingDate.toDateString(), startTime: `${startHour}:00`, endTime: `${endHour}:00`, price });  
    } catch (error) {
      console.error("Lỗi đặt sân:", error);
      Alert.alert("Lỗi", "Không thể đặt sân.");
    }
  };
  
  
  const renderHourPicker = (setTime, type) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const now = new Date();
    const isToday = bookingDate.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return (
      <View style={styles.hourPicker}>
        {hours.map((hour) => {
          const hourDate = new Date(bookingDate);
          hourDate.setHours(hour, 0, 0, 0);

          const isPast =
            isToday &&
            (hour < currentHour || (hour === currentHour && currentMinute > 0));

          const disabled = isPast || reservedHours.includes(hour); // Khóa giờ đã đặt

          return (
            <TouchableOpacity
              key={hour}
              style={[styles.hourButton, disabled && styles.disabledHourButton]}
              onPress={() => setTime(hourDate)}
              disabled={disabled}
            >
              <Text
                style={[styles.hourText, disabled && styles.disabledHourText]}
              >
                {hour}:00
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const calculatePrice = () => {
    if (!startTime || !endTime) return 0;
    const hours = endTime.getHours() - startTime.getHours();
    const isSunday = bookingDate.getDay() === 0; // Kiểm tra ngày Chủ Nhật
    return hours * (isSunday ? 65000 : 60000); // Nếu Chủ Nhật, giá sẽ là 65000 VND
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt sân: {court.name}</Text>

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.inputBox}
      >
        <Text style={styles.inputText}>
          📅 Ngày: {bookingDate.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          display="default"
          value={bookingDate}
          minimumDate={new Date()}
          onChange={(e, selectedDate) => {
            setShowDatePicker(Platform.OS === "ios");
            if (selectedDate) setBookingDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => setShowStartPicker(true)}
        style={styles.inputBox}
      >
        <Text style={styles.inputText}>
          ⏰ Giờ bắt đầu: {startTime ? startTime.toLocaleTimeString() : "Chọn giờ"}
        </Text>
      </TouchableOpacity>
      {showStartPicker && renderHourPicker(setStartTime, "start")}

      <TouchableOpacity
        onPress={() => setShowEndPicker(true)}
        style={styles.inputBox}
      >
        <Text style={styles.inputText}>
          ⏳ Giờ kết thúc: {endTime ? endTime.toLocaleTimeString() : "Chọn giờ"}
        </Text>
      </TouchableOpacity>
      {showEndPicker && renderHourPicker(setEndTime, "end")}

      <Text style={{ fontSize: 16, marginTop: 10 }}>
        Tổng tiền: {calculatePrice().toLocaleString()}đ
      </Text>

      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookText}>Xác nhận đặt sân</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButtonBottom}
      >
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
  hourPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  hourButton: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  disabledHourButton: {
    backgroundColor: "#ccc",
    borderColor: "#bbb",
  },
  hourText: {
    fontSize: 16,
    color: "#333",
  },
  disabledHourText: {
    color: "#888",
  },
});
