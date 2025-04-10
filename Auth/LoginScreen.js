import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "525095539327-32qp8icaj3u4uu96c7441i1d1oov4fuv.apps.googleusercontent.com",
    });
  }, []);

  const handleSignInWithEmail = () => {
    navigation.replace("ManagerMainRouter");
  };

  const handleEmailSignIn = async () => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      Alert.alert("Signed In", `Welcome back, ${user.email}!`);
      navigation.replace("MainRouters");
    } catch (error) {
      console.error("Email Sign-In Error:", error);
      Alert.alert("Sign In Failed", error.message);
    }
  };

  async function onGoogleButtonPress() {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult.idToken || signInResult.data?.idToken;
      if (!idToken) throw new Error("No ID token found");

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      alert(`Signed In User:\nUID: ${user.uid}\nName: ${user.displayName}\nEmail: ${user.email}`);
      navigation.replace('MainRouters');
      return userCredential;
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      alert(`Google Sign-In Failed: ${error.message}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      
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

      <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate("ResetPassword")}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleEmailSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={onGoogleButtonPress}>
        <Text style={styles.buttonText}>Sign In with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.managerButton} onPress={handleSignInWithEmail}>
        <Text style={styles.managerText}>Manager</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 36,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotText: {
    color: '#007AFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginBottom: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 24,
  },
  managerButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  managerText: {
    color: '#555',
    fontSize: 14,
  },
});
