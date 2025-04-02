import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Configure Google Sign-In when the screen is loaded
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "525095539327-32qp8icaj3u4uu96c7441i1d1oov4fuv.apps.googleusercontent.com",
    });
  }, []);

  const handleSignInWithEmail = () => {
    navigation.replace("ManagerMainRouter");
  };

  // Email and Password Sign-In
  const handleEmailSignIn = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      Alert.alert("Signed In", `Welcome back, ${user.email}!`);
      console.log("Signed In User:", user);
      navigation.replace("MainRouters"); // Navigate to main app screen
    } catch (error) {
      console.error("Email Sign-In Error:", error);
      Alert.alert("Sign In Failed", error.message);
    }
  };



  // Google Sign-In Handling Code
  async function onGoogleButtonPress() {
    try {
      // Check if your device supports Google Play Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Trigger Google Sign-In
      const signInResult = await GoogleSignin.signIn();
      // Retrieve the ID token
      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        idToken = signInResult.idToken; // Older versions of google-signin
      }
      if (!idToken) {
        throw new Error("No ID token found");
      }
      // Log the ID token for debugging purposes (optional)
      console.log("ID Token:", idToken);
      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      // Retrieve the user's information
      const user = userCredential.user;
      // Show an alert with user info
      alert(`Signed In User:\nUID: ${user.uid}\nName: ${user.displayName}\nEmail: ${user.email}`);
      
      navigation.replace('MainRouters')
      return userCredential;
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      alert(`Google Sign-In Failed: ${error.message}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In with Email" onPress={handleEmailSignIn} />
      <Button title="Manager" onPress={handleSignInWithEmail} />
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
      <Button
        title="Google Sign-In"
        onPress={onGoogleButtonPress}
        color="#DB4437" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
  },
  link: {
    marginTop: 16,
    color: 'blue',
    textAlign: 'center',
    marginBottom: 16,
  },
  separator: {
    marginVertical: 20,
  },
});