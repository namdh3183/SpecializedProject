import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const BookingScreen = ({ navigation }) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [court, setCourt] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt sân cầu lông</Text>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Chọn ngày */}
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inputText}>Ngày: {date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Chọn giờ */}
        <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.inputText}>Giờ: {time.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}

        {/* Chọn sân */}
        <TextInput
          style={styles.textInput}
          placeholder="Nhập số sân"
          placeholderTextColor="#ddd"
          keyboardType="numeric"
          value={court}
          onChangeText={setCourt}
        />

        {/* Nút đặt sân */}
        <TouchableOpacity style={styles.button} onPress={() => alert("Đặt sân thành công!")}>
          <Text style={styles.buttonText}>Xác nhận đặt sân</Text>
        </TouchableOpacity>

         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>Trở về</Text>
          </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3f278f", // Màu tím xanh
    alignItems: "center",
    paddingTop: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
  },
  formContainer: {
    width: "90%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: 15,
    backgroundColor: "#ed85be", // Hồng nhạt
    borderRadius: 10,
    marginVertical: 10,
  },
  inputText: {
    fontSize: 18,
    color: "#ffffff",
    textAlign: "center",
  },
  textInput: {
    width: "100%",
    padding: 15,
    backgroundColor: "#e3c87f", // Vàng nhạt
    borderRadius: 10,
    marginVertical: 10,
    color: "#000",
    fontSize: 18,
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#3f278f", // Tím xanh
    borderRadius: 10,
    marginVertical: 20,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

export default BookingScreen;
