import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";

const StarRating = ({ rating, onRate }) => {
  return (
    <View style={{ flexDirection: "row", marginVertical: 10 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRate(star)}>
          <Text style={{ fontSize: 30, color: star <= rating ? "#FFD700" : "#ccc" }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const DetailScreen = ({ route }) => {
  const { court } = route.params;
  const navigation = useNavigation();

  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingsList, setRatingsList] = useState([]);

  const fetchRatings = async () => {
    try {
      const snapshot = await firestore()
        .collection("ratings")
      //  .where("courtId", "==", court.id)
        .orderBy("createdAt", "desc")
        .get();
  
      const data = snapshot.docs.map((doc) => doc.data());
      setRatingsList(data);
    } catch (error) {
      console.warn("Lỗi lấy đánh giá:", error);
    }
  };
  

  useEffect(() => {
    fetchRatings();
  }, []); 

  const submitRating = async () => {
    const user = auth().currentUser;
    if (!user) return alert("Bạn cần đăng nhập để đánh giá.");

    if (!comment.trim()) return alert("Vui lòng nhập bình luận.");
    if (ratingValue === 0) return alert("Vui lòng chọn số sao.");

    try {
      await firestore().collection("ratings").add({
        courtId: court.id,
        userId: user.uid,
        rating: ratingValue,
        comment: comment,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setRatingValue(0);
      setComment("");
      fetchRatings(); // Fetch ratings again after submitting a new one
    } catch (error) {
      console.warn("Gửi đánh giá thất bại:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: court.image }} style={styles.image} />
      <Text style={styles.title}>{court.name}</Text>
      <Text style={styles.location}>📍 {court.location || "Không rõ vị trí"}</Text>

      <View style={styles.descriptionBox}>
        <Text style={styles.sectionTitle}>📝 Mô tả chi tiết:</Text>
        <Text style={styles.descriptionText}>
          {court.description || "Không có mô tả cho sân này."}
        </Text>
      </View>

      {/* Đánh giá */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>⭐ Đánh giá sân</Text>

        <StarRating rating={ratingValue} onRate={setRatingValue} />

        <TextInput
          placeholder="Viết bình luận..."
          value={comment}
          onChangeText={setComment}
          style={styles.commentBox}
        />

        <TouchableOpacity style={styles.bookButton} onPress={submitRating}>
          <Text style={styles.bookText}>Gửi đánh giá</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginTop: 20 }}>
      <Text style={styles.sectionTitle}>📋 Các đánh giá:</Text>
      {ratingsList.length === 0 ? (
        <Text>Chưa có đánh giá nào cho sân này.</Text>
      ) : (
        ratingsList.map((r, idx) => (
          <View key={idx} style={styles.ratingItem}>
            <Text style={{ fontSize: 16, color: "#FFD700" }}>
              {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
            </Text>
            <Text>{r.comment}</Text>
          </View>
        ))
      )}
    </View>


      <TouchableOpacity
        style={[styles.bookButton, { marginTop: 30 }]}
        onPress={() => navigation.navigate("Booking", { court })}
      >
        <Text style={styles.bookText}>Đặt sân ngay</Text>
      </TouchableOpacity>

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
  commentBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 10,
    padding: 8,
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
  ratingItem: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
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
