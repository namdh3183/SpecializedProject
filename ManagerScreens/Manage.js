import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  Button,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * BookingItem wraps each booking detail in a TouchableOpacity.
 * When pressed, it opens a modal to confirm opening the court.
 * If confirmed and the current time is within the booking’s scheduled range, 
 * it updates the court's status to "in use" and deletes the booking from paymentSuccess.
 */
const BookingItem = ({ booking, court, navigation }) => {
  const [userName, setUserName] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch user details (same as before)
  useEffect(() => {
    if (booking.userId) {
      firestore()
        .collection('users')
        .doc(booking.userId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            setUserName(data.name ? data.name : data.email);
          } else {
            setUserName('Unknown User');
          }
        })
        .catch((error) => {
          console.error('Error fetching user: ', error);
          setUserName('Unknown User');
        });
    } else {
      setUserName('Unknown User');
    }
  }, [booking.userId]);

  const handleConfirmOpen = () => {
    const now = new Date();
    // Create Date objects from booking.date; then set hours/minutes based on booking.startTime and booking.endTime
    const startDate = new Date(booking.date);
    const endDate = new Date(booking.date);
    const [startHour, startMinute] = booking.startTime.split(':').map(Number);
    const [endHour, endMinute] = booking.endTime.split(':').map(Number);
    startDate.setHours(startHour, startMinute, 0, 0);
    endDate.setHours(endHour, endMinute, 0, 0);

    if (now >= startDate && now <= endDate) {
      // Current time is within the scheduled booking period.
      firestore()
        .collection('courts')
        .doc(court.id)
        .update({ status: 'in use' })
        .then(() => {
          // Delete the confirmed booking from "paymentSuccess"
          return firestore().collection('paymentSuccess').doc(booking.id).delete();
        })
        .then(() => {
          // Create a new order so that services/payment can be added later.
          const currentTimeISO = new Date().toISOString();
          return firestore().collection('orders').add({
            courtId: court.id,
            startTime: currentTimeISO,
            endTime: null,
            services: [],
          });
        })
        .then((orderRef) => {
          alert('Court opened successfully.');
          setModalVisible(false);
          // Optionally, navigate to CourtDetail with the new orderId.
          // This allows the manager to add services or proceed with payment.
          navigation.navigate('CourtDetail', {
            court: court,
            orderId: orderRef.id,
          });
        })
        .catch((error) => {
          alert('Error opening court: ' + error.message);
        });
    } else {
      alert('Current time is not within the scheduled booking period.');
      setModalVisible(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.bookingContainer}
      onPress={() => setModalVisible(true)}
    >
      <Text style={styles.bookingText}>Date: {booking.date}</Text>
      <Text style={styles.bookingText}>
        {booking.startTime} - {booking.endTime}
      </Text>
      <Text style={styles.bookingText}>
        User: {userName ? userName : booking.userId}
      </Text>
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Confirm Open Court</Text>
            <Text style={styles.modalText}>
              Open court for booking on {booking.date} from {booking.startTime} to {booking.endTime}?
            </Text>
            <View style={styles.modalButtons}>
              <Button title="Yes" onPress={handleConfirmOpen} />
              <Button title="No" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

const ManageScreen = ({ navigation }) => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const unsubscribe = firestore()
        .collection('courts')
        .orderBy('courtId', 'asc')
        .onSnapshot(
          (snapshot) => {
            const courtsList = [];
            snapshot.forEach((doc) => {
              courtsList.push({ id: doc.id, ...doc.data() });
            });
            setCourts(courtsList);
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching courts:', error);
            setLoading(false);
          }
        );
      return () => unsubscribe();
    }, [])
  );

  // Each CourtItem fetches its related booking details from paymentSuccess.
  const CourtItem = ({ item, navigation }) => {
    const [expanded, setExpanded] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    useEffect(() => {
      if (expanded) {
        setBookingsLoading(true);
        firestore()
          .collection('paymentSuccess')
          .where('courtName', '==', item.courtId)
          .orderBy('startTime', 'asc')
          .get()
          .then((snapshot) => {
            const bookingList = [];
            snapshot.forEach((doc) => {
              bookingList.push({ id: doc.id, ...doc.data() });
            });
            const now = new Date();
            // For each booking, parse the booking end time manually.
            const validBookings = bookingList.filter((booking) => {
              const bookingEnd = new Date(booking.date);
              const [endHour, endMinute] = booking.endTime.split(':').map(Number);
              bookingEnd.setHours(endHour, endMinute, 0, 0);
              return bookingEnd >= now;
            });
            setBookings(validBookings);
            setBookingsLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching bookings:', error);
            setBookingsLoading(false);
          });
      } else {
        setBookings([]);
      }
    }, [expanded, item.courtId]);

    const toggleDropdown = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded((prev) => !prev);
    };

    return (
      <TouchableOpacity
        style={[
          styles.itemContainer,
          item.status === 'in use' && styles.itemContainerInUse,
        ]}
        onPress={() => navigation.navigate('CourtDetail', { court: item })}
      >
        <View style={styles.itemMainContent}>
          <View style={styles.leftContent}>
            <Text style={[styles.courtText, item.status === 'in use' && styles.courtTextInUse]}>
              Court {item.courtId}
            </Text>
            <Text
              style={[
                styles.statusText,
                item.status === 'available' ? styles.available : styles.inUse,
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}
          >
            <Ionicons
              name={expanded ? 'chevron-down-outline' : 'chevron-forward-outline'}
              size={24}
              color="#3f278f"
            />
          </TouchableOpacity>
        </View>
        {expanded && (
          <View style={styles.dropdownContent}>
            {bookingsLoading ? (
              <ActivityIndicator size="small" color="#3f278f" />
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <BookingItem key={booking.id} booking={booking} court={item} />
              ))
            ) : (
              <Text style={styles.dropdownText}>No bookings available</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCourtItem = ({ item }) => <CourtItem item={item} navigation={navigation} />;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3f278f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {courts.length === 0 ? (
        <Text style={styles.emptyText}>No courts available</Text>
      ) : (
        <FlatList
          data={courts}
          keyExtractor={(item) => item.id}
          renderItem={renderCourtItem}
          contentContainerStyle={{ paddingVertical: 10 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    width: screenWidth - 30,
    alignSelf: 'center',
    backgroundColor: '#e3c87f',
    marginVertical: 8,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e3c87f',
    borderRadius: 20,
  },
  itemContainerInUse: {
    backgroundColor: '#ff4d4d',
    borderColor: '#ff4d4d',
  },
  itemMainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContent: {
    flexDirection: 'column',
  },
  courtText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#3f278f',
  },
  courtTextInUse: {
    color: '#ffffff',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  available: {
    color: 'green',
  },
  inUse: {
    color: '#ffffff',
  },
  dropdownButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContent: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#3f278f',
  },
  // Enhanced style for each booking container.
  bookingContainer: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  bookingText: {
    fontSize: 14,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default ManageScreen;