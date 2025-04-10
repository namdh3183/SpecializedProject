import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import firestore from '@react-native-firebase/firestore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "525095539327-32qp8icaj3u4uu96c7441i1d1oov4fuv.apps.googleusercontent.com",
    });
  }, []);

  // Create a new user document if not exists
  const createOrUpdateUser = async (user) => {
    const userDoc = firestore().collection('users').doc(user.uid);
    const userSnapshot = await userDoc.get();

    if (!userSnapshot.exists) {
      await userDoc.set({
        uid: user.uid,
        email: user.email,
        role: 'customer' // Default role
      });
    }
  };

  // Validate user inputs for email sign-in
  const validateInputs = () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert("Incomplete Information", "Please enter both email and password.");
      return false;
    }
    return true;
  };

  // Fetch user role from Firestore
  const getUserRole = async (uid) => {
    try {
      const userDoc = await firestore().collection('users').doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        return userData.role || 'customer';
      } else {
        console.error('User document does not exist.');
        return 'customer';
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      return 'customer';
    }
  };

  // Handle email/password sign-in
  const handleEmailSignIn = async () => {
    
    if (!validateInputs()) return;

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Fetch user role from Firestore
      const role = await getUserRole(user.uid);
      if (role === 'manager') {
        navigation.replace("ManagerMainRouter");
      } else {
        navigation.replace("MainRouters");
      }

      Alert.alert("Signed In", `Welcome back, ${user.email}!`);
    } catch (error) {
      console.error("Email Sign-In Error:", error);
      Alert.alert("Sign In Failed", error.message);
    }
  };

  // Handle Google Sign-In
  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      // Try to get the ID token from the sign-in result.
      let idToken = signInResult.idToken || signInResult.data?.idToken;

      // Fallback: if no idToken is found, explicitly get tokens.
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      }

      if (!idToken) {
        throw new Error("No ID token found");
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      await createOrUpdateUser(user);

      // Fetch role for navigation consistency
      const role = await getUserRole(user.uid);
      if (role === 'manager') {
        navigation.replace("ManagerMainRouter");
      } else {
        navigation.replace("MainRouters");
      }

      // Use Alert.alert for consistency
      Alert.alert("Signed In with Google", `Welcome, ${user.displayName || "User"}!\nUID: ${user.uid}\nEmail: ${user.email}`);
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      Alert.alert("Google Sign-In Failed", error.message);
    }
  };

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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon
            name={passwordVisible ? "visibility" : "visibility-off"}
            size={24}
            color="#3f278f"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.button}>
        <Button title="Sign In with Email" onPress={handleEmailSignIn} color="#ed85be" />
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>


      <View style={styles.separator} />
      <Text style={{ opacity: 0.6, marginBottom: 20 }}>or</Text>

      <View style={styles.button}>
        <Button title="Sign-In with Google account" onPress={onGoogleButtonPress} color="#f54e42" />
      </View>
    </View>
  );
}

import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

console.log(`Screen Width: ${screenWidth}, Screen Height: ${screenHeight}`);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 36,
    textAlign: 'center',
    color: '#3f278f',
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    width: screenWidth - 35,
  },
  passwordContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  link: {
    color: '#3f278f',
    textAlign: 'center',
  },
  separator: {
    marginTop: 20,
    borderWidth: 0.5,
    width: screenWidth - 200,
  },
  button: {
    marginBottom: 12,
    width: screenWidth - 35,
  },
  icon: {
    marginStart: -35,
    marginVertical: 10,
  }
});
