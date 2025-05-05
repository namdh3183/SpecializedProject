import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function ManagerProfile({ navigation }) {
  const currentUser = auth().currentUser;

  const [name, setName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      await currentUser.updateProfile({
        displayName: name.trim() ? name.trim() : 'Unknown'
      });
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
      navigation.goBack(); // This will refresh the SettingScreen.
    } catch (error) {
      Alert.alert('Update Error', error.message);
    }
  };

  const handleCancel = () => {
    setName(currentUser?.displayName || '');
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manager Profile</Text>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Name:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        ) : (
          <Text style={styles.value}>{name || 'Unknown'}</Text>
        )}
      </View>
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email || 'Unknown'}</Text>
      </View>

      {isEditing ? (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, color: '#3f278f' },
  fieldContainer: { marginBottom: 20 },
  label: { fontSize: 18, color: '#333' },
  value: { fontSize: 18, marginTop: 5, color: '#3f278f' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    fontSize: 18,
    marginTop: 5,
    color: '#3f278f'
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 5,
    paddingHorizontal: 20,
  },
  editButton: { backgroundColor: '#3f278f', alignSelf: 'center' },
  saveButton: { backgroundColor: 'green', flex: 1, marginRight: 5 },
  cancelButton: { backgroundColor: '#f54e42', flex: 1, marginLeft: 5 },
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});