import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";

const ReviewScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState([
    { id: "1", name: "Nguyễn Văn A", rating: 5, comment: "Sân rất đẹp, phục vụ tận tình!" },
    { id: "2", name: "Trần Thị B", rating: 4, comment: "Sân khá rộng, nhưng hơi khó đặt lịch." },
  ]);

  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  const submitReview = () => {
    if (newReview.trim() !== "") {
      const newEntry = {
        id: Math.random().toString(),
        name: "Bạn",
        rating: rating,
        comment: newReview,
      };
      setReviews([newEntry, ...reviews]);
      setNewReview("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đánh giá</Text>

      {/* Danh sách đánh giá */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewName}>{item.name} - {item.rating}⭐</Text>
            <Text style={styles.reviewText}>{item.comment}</Text>
          </View>
        )}
      />

      {/* Nhập đánh giá mới */}
      <TextInput
        style={styles.input}
        placeholder="Nhập đánh giá của bạn..."
        value={newReview}
        onChangeText={setNewReview}
      />

      {/* Nút gửi đánh giá */}
      <TouchableOpacity style={styles.submitButton} onPress={submitReview}>
        <Text style={styles.buttonText}>Gửi đánh giá</Text>
      </TouchableOpacity>

      {/* Nút trở về */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Trở về</Text>
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
  reviewItem: {
    width: "90%",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3f278f",
  },
  reviewText: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
  input: {
    width: "90%",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: "#e3c87f",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  backButton: {
    backgroundColor: "#777",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
});

export default ReviewScreen;
