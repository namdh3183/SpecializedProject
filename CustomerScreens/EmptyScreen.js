import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import firestore from "@react-native-firebase/firestore";

const EmptyScreen = ({ navigation }) => {
  const [highlightCourts, setHighlightCourts] = useState([]);
  const [popularCourts, setPopularCourts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCourts, setFilteredCourts] = useState([]);

  const [backgroundImage, setBackgroundImage] = useState(
    "https://static.vecteezy.com/system/resources/thumbnails/047/419/102/small_2x/badminton-shuttlecock-on-the-floor-with-blur-badminton-indoor-sport-game-court-background-with-space-for-text-photo.jpg"
  );

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const highlightSnapshot = await firestore()
          .collection("courts")
          .where("status", "==", "available")
          .limit(4)
          .get();

        const popularSnapshot = await firestore()
          .collection("courts")
          .where("status", "==", "available")
          .limit(6)
          .get();

        const highlightData = highlightSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            name: data.courtId || "Tên sân",
            location: data.Location,
            image: data.Avatar,
          };
        });

        const popularData = popularSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            name: data.courtId,
            image: data.Avatar,
          };
        });

        setHighlightCourts(highlightData);
        setPopularCourts(popularData);
        setFilteredCourts(highlightData);  // Set initial courts to be shown
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu sân:", error);
      }
    };

    fetchCourts();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);

    // Nếu không có gì nhập vào, hiển thị tất cả sân
    if (!query) {
      setFilteredCourts(highlightCourts);
      return;
    }

    const filtered = highlightCourts.filter((court) =>
      court.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredCourts(filtered);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: backgroundImage }} style={styles.headerImage} />
        <Text style={styles.logoText}>
          pub<Text style={{ fontWeight: "bold" }}>Realty</Text>
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput
          placeholder="Tìm kiếm theo tên sân..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Highlight Courts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sân nổi bật</Text>
        {filteredCourts.map((court, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate("Detail", { court })}
          >
            <View style={styles.highlightCard}>
              <Image source={{ uri: court.image }} style={styles.highlightImage} />
              <View style={styles.highlightLabel}>
                <Text style={styles.highlightTag}>BOOK NOW</Text>
                <Text style={styles.highlightTitle}>Sân : {court.name}</Text>
                <Text style={styles.highlightDesc}>{court.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Popular Courts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sân phổ biến</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {popularCourts.map((item, index) => (
            <TouchableOpacity key={index} style={styles.cityCard}>
              <Image source={{ uri: item.image }} style={styles.cityImage} />
              <Text style={styles.cityText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default EmptyScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { height: 200, position: "relative" },
  headerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  logoText: {
    position: "absolute",
    top: 50,
    left: 20,
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  searchBox: {
    backgroundColor: "#fff",
    elevation: 5,
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: { fontSize: 16 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  highlightCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    backgroundColor: "#eee",
    marginBottom: 15,
  },
  highlightImage: { width: "100%", height: 180 },
  highlightLabel: { padding: 12 },
  highlightTag: {
    backgroundColor: "#f9c74f",
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
    borderRadius: 5,
    marginBottom: 5,
    fontSize: 12,
  },
  highlightTitle: { fontSize: 18, fontWeight: "bold", color: "#000" },
  highlightDesc: { color: "#000", fontSize: 14, marginTop: 4 },
  cityCard: {
    marginRight: 10,
    position: "relative",
    width: 140,
    height: 100,
    borderRadius: 10,
    overflow: "hidden",
  },
  cityImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cityText: {
    position: "absolute",
    bottom: 5,
    left: 5,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
