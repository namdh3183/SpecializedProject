import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import MainRouters from '../CustomerRouters/MainRouters';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // Mock validation logic
    if (username === 'admin' && password === 'password') {
      navigation.replace('ManagerMainRouter'); // Navigate to main app
    }
    if(username === 'customer' && password === 'password') {
      navigation.replace('MainRouters');
    } else {
      alert('Invalid username or password!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign In" onPress={handleSignIn} />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
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
  },
});