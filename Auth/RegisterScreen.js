import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Manage the visibility for both password fields
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const validateRegistrationInputs = () => {
    if (
      email.trim() === '' ||
      password.trim() === '' ||
      confirmPassword.trim() === ''
    ) {
      Alert.alert("Incomplete Information", "Please fill in all fields.");
      return false;
    }
    return true;
  };

  // Email Registration with password match checking and creating Firestore document
  const handleEmailRegistration = async () => {
    if (!validateRegistrationInputs()) return;
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return; // Don't proceed if password and confirmPassword don't match
    }
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Create a user document in Firestore with a default role of 'customer'
      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        role: 'customer' // Set the default user role
      });
      
      Alert.alert("Account Created", `Welcome, ${user.email}!`);
      console.log("Registered User:", user);
      // Navigate to your main app screen (adjust route as necessary)
      navigation.replace("ManagerMainRouter");
    } catch (error) {
      console.error("Registration Error:", error);
      Alert.alert("Registration Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Password Input with Show/Hide Icon */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
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
      {/* Confirm Password Input with Show/Hide Icon */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!confirmPasswordVisible}
        />
        <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
          <Icon
            name={confirmPasswordVisible ? "visibility" : "visibility-off"}
            size={24}
            color="#3f278f"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
      {/* Registration Button */}
      <Button title="Register" onPress={handleEmailRegistration} color="#ed85be" />
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width; // Screen width
const screenHeight = Dimensions.get('window').height; // Screen height

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
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginLeft: -35,
  },
  link: {
    marginTop: 16,
    color: '#3f278f',
    textAlign: 'center',
  },
});