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
        // .where("courtId", "==", court.id) // Uncomment when filtering by court is implemented
        .orderBy("createdAt", "desc")
        .get();

      const data = snapshot.docs.map((doc) => doc.data());
      setRatingsList(data);
    } catch (error) {
      console.warn("Failed to fetch ratings:", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const submitRating = async () => {
    const user = auth().currentUser;
    if (!user) return alert("You must be logged in to leave a review.");

    if (!comment.trim()) return alert("Please enter a comment.");
    if (ratingValue === 0) return alert("Please select a rating.");

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
      fetchRatings(); // Refresh the rating list
    } catch (error) {
      console.warn("Failed to submit rating:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: court.image }} style={styles.image} />
      <Text style={styles.title}>Court: {court.name}</Text>
      <Text style={styles.location}>📍 {court.location || "Location not specified"}</Text>

      <View style={styles.descriptionBox}>
        <Text style={styles.sectionTitle}>📝 Description:</Text>
        <Text style={styles.descriptionText}>
          {court.description || "No description available for this court."}
        </Text>
      </View>

      {/* Rating Section */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>⭐ Leave a Rating</Text>

        <StarRating rating={ratingValue} onRate={setRatingValue} />

        <TextInput
          placeholder="Write a comment..."
          value={comment}
          onChangeText={setComment}
          style={styles.commentBox}
        />

        <TouchableOpacity style={styles.bookButton} onPress={submitRating}>
          <Text style={styles.bookText}>Submit Review</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.sectionTitle}>📋 Reviews:</Text>
        {ratingsList.length === 0 ? (
          <Text>No reviews yet for this court.</Text>
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
        <Text style={styles.bookText}>Book Now</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonBottom}>
        <Text style={styles.backIcon}>←</Text>
        <Text style={styles.backText}>Back</Text>
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
