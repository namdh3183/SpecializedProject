import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function SettingScreen({navigation}) {
  // Sign-out function
      const handleSignOut = async () => {
        try {
          await auth().signOut();
          alert("Signed Out", "You have been successfully signed out.");
          // Navigate the user back to the login screen (adjust route name accordingly)
          navigation.replace("Login");
        } catch (error) {
          console.error("Error signing out:", error);
          alert("Sign Out Error", error.message);
        }
      };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Setting</Text>
      <Button title="Sign Out" onPress={handleSignOut} color="#f54e42" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold'
  }
});