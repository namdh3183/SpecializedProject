import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("https://i.pravatar.cc/150");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = auth().currentUser.uid;
      const userProfile = await firestore().collection('profiles').doc(userId).get();

      if (userProfile.exists) {
        const data = userProfile.data();
        setName(data.name);
        setEmail(auth().currentUser.email); // Get email from Firebase Auth
        setPhone(data.phone);
        setAvatar(data.avatar);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChangeAvatar = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setAvatar(source.uri);
        uploadAvatarToFirestore(source.uri);
      }
    });
  };

  const uploadAvatarToFirestore = async (uri) => {
    const userId = auth().currentUser.uid;
    try {
      await firestore().collection('profiles').doc(userId).update({
        avatar: uri,
      });
      Alert.alert("Success", "Avatar updated successfully!");
    } catch (error) {
      console.error("Error updating avatar: ", error);
      Alert.alert("Error", "Failed to update avatar.");
    }
  };

  const handleSave = async () => {
    const userId = auth().currentUser.uid;

    try {
      await firestore().collection('profiles').doc(userId).set({
        name,
        email,
        phone,
        avatar,
      });

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity onPress={handleChangeAvatar}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
      </TouchableOpacity>

      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full Name" />

      <TextInput style={styles.input} value={email} editable={false} placeholder="Email" />

      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Phone Number" />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace("Login")}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go Back</Text>
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
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  input: {
    width: "85%",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#e3c87f",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#ed85be",
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

export default ProfileScreen;
