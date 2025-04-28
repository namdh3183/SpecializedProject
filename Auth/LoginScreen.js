import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '525095539327-32qp8icaj3u4uu96c7441i1d1oov4fuv.apps.googleusercontent.com',
    });
  }, []);

  const createOrUpdateUser = async (user) => {
    const userDoc = firestore().collection('users').doc(user.uid);
    const userSnapshot = await userDoc.get();

    if (!userSnapshot.exists) {
      await userDoc.set({
        uid: user.uid,
        email: user.email,
        role: 'customer',
      });
    }
  };

  const validateInputs = () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Incomplete Information', 'Please enter both email and password.');
      return false;
    }
    return true;
  };

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
      console.error('Error fetching user role:', error);
      return 'customer';
    }
  };

  const handleEmailSignIn = async () => {
    if (!validateInputs()) return;

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const role = await getUserRole(user.uid);

      if (role === 'manager') {
        navigation.replace('ManagerMainRouter');
      } else {
        navigation.replace('MainRouters');
      }

      // Alert.alert('Signed In', `Welcome back, ${user.email}!`);
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      Alert.alert('Sign In Failed', error.message);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      let idToken = signInResult.idToken || signInResult.data?.idToken;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;
      }

      if (!idToken) throw new Error('No ID token found');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      await createOrUpdateUser(user);

      const role = await getUserRole(user.uid);
      if (role === 'manager') {
        navigation.replace('ManagerMainRouter');
      } else {
        navigation.replace('MainRouters');
      }

      Alert.alert(
        'Signed In with Google',
        `Welcome, ${user.displayName || 'User'}!\nUID: ${user.uid}\nEmail: ${user.email}`
      );
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Google Sign-In Failed', error.message);
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
          style={[styles.input, { flex: 1 }]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon
            name={passwordVisible ? 'visibility' : 'visibility-off'}
            size={24}
            color="#3f278f"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('ResetPassword')}
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.button}>
        <Button title="Sign In with Email" onPress={handleEmailSignIn} color="#ed85be" />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
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

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    marginBottom: 8,
    width: screenWidth - 35,
  },
  icon: {
    marginLeft: -35,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginRight: 10,
    marginBottom: 12,
  },
  forgotPasswordText: {
    color: '#3f278f',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginBottom: 12,
    width: screenWidth - 35,
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
});
