import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function SettingScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);

  // Refresh user info every time the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      const currentUser = auth().currentUser;
      setUserProfile(currentUser);
    }, [])
  );

  // Sign-out function.
  const handleSignOut = async () => {
    try {
      await auth().signOut();
      Alert.alert("Signed Out", "You have been successfully signed out.");
      navigation.replace("Login"); // Adjust route name if needed.
    } catch (error) {
      Alert.alert("Sign Out Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Section with Avatar, Name, and Email */}
      <View style={styles.profileRow}>
        <View style={styles.avatarContainer}>
          {userProfile?.photoURL ? (
            <Image
              source={{ uri: userProfile.photoURL }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {userProfile?.displayName ? userProfile.displayName : 'Unknown'}
          </Text>
          <Text style={styles.userEmail}>
            {userProfile?.email ? userProfile.email : 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Navigation Row to Manager Profile */}
      <TouchableOpacity
        style={styles.profileLine}
        onPress={() => navigation.navigate('ManagerProfile')}
      >
        <Text style={styles.profileText}>User Profile</Text>
        <Ionicons name="chevron-forward" size={24} color="#888" />
      </TouchableOpacity>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3f278f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#3f278f',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  profileLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 30,
  },
  profileText: {
    fontSize: 18,
    color: '#3f278f',
  },
  signOutButton: {
    width: '100%',
    backgroundColor: '#f54e42',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  signOutText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});