import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

const CourtDetail = ({ route, navigation }) => {
  // Retrieve the court data passed via navigation parameters
  const { court } = route.params;
  // Local state for the current status of the court.
  const [currentStatus, setCurrentStatus] = useState(court.status);

  // Function to update the court status in Firestore and update local state.
  const updateCourtStatus = async (newStatus) => {
    try {
      await firestore()
        .collection('courts')
        .doc(court.id)
        .update({ status: newStatus });
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error("Error updating court status:", error);
    }
  };

  // Trigger confirmation alert for opening the court.
  const confirmOpenCourt = () => {
    Alert.alert(
      'Open Court',
      'Are you sure you want to open the court?',
      [
        { 
          text: 'Yes', 
          onPress: () => {
            updateCourtStatus('in use');
          },
        },
        { 
          text: 'No', 
          onPress: () => console.log('Court not opened'), 
          style: 'cancel' 
        },
      ],
      { cancelable: false }
    );
  };

  // Stub for the Add Service button action.
  const handleAddService = () => {
    console.log('Add Service pressed');
    // Insert your add service logic here.
  };

  // Handler for Pay: sets status back to available.
  const handlePay = () => {
    updateCourtStatus('available');
    console.log('Pay pressed, court set to available');
  };

  return (
    <View style={styles.container}>
      {/* Court Information at the top left */}
      <View style={styles.infoContainer}>
        <Text style={styles.courtText}>Court {court.courtId}</Text>
        <Text
          style={[
            styles.statusText,
            currentStatus === 'available' ? styles.available : styles.inUse,
          ]}
        >
          {currentStatus.toUpperCase()}
        </Text>
      </View>

      {/* Show the open button only when the court is available; otherwise show the vertical buttons */}
      { currentStatus === 'available' ? (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity style={styles.floatingButton} onPress={confirmOpenCourt}>
            <Ionicons name="play" size={40} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.verticalButtonContainer}>
          <TouchableOpacity  
            style={[styles.floatingButton, { marginBottom: 20 }]}  
            onPress={handleAddService}
          >
            <Ionicons name="add-outline" size={40} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity  
            style={styles.floatingButton}  
            onPress={handlePay}
          >
            <Ionicons name="cash-outline" size={40} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // White background
  },
  infoContainer: {
    position: 'absolute',
    top: 20,
    left: 20, // Suitable spacing from the top left corner
  },
  courtText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f278f', // Deep Purple color
    marginBottom: 10,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  available: {
    color: 'green',
  },
  inUse: {
    color: 'red',
  },
  // Container to position the open button at the bottom right.
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  floatingButton: {
    backgroundColor: '#3f278f', // Deep Purple button background
    width: 70,   // Button width
    height: 70,  // Button height
    borderRadius: 40, // Fully circular
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Container to position the vertical button stack at the bottom right.
  verticalButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    flexDirection: 'column',  // Stack buttons vertically
    alignItems: 'center',
  },
});

export default CourtDetail;