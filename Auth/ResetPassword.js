import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const ResetPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const sendVerificationCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    try {
      // Gửi email reset password
      await auth().sendPasswordResetEmail(email);

      // Lưu thông tin vào Firestore
      await firestore().collection('reset_password_requests').add({
        email: email,
        requestedAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert("Check your email to reset your password!");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Reset error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.button} onPress={sendVerificationCode}>
        <Text style={styles.buttonText}>Send Verification Link</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.backToLoginText}>← Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#F50057',
  },
  input: {
    width: '90%',
    padding: 15,
    borderColor: '#D3D3D3',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  button: {
    width: '90%',
    backgroundColor: '#F50057',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToLogin: {
    marginTop: 10,
  },
  backToLoginText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default ResetPassword;
