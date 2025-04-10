import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ManageScreen = ({ navigation }) => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('courts')
      .orderBy('courtId', 'asc')
      .onSnapshot(
        snapshot => {
          const courtsList = [];
          snapshot.forEach(doc => {
            courtsList.push({ id: doc.id, ...doc.data() });
          });
          setCourts(courtsList);
          setLoading(false);
        },
        error => {
          console.error('Error fetching courts:', error);
          setLoading(false);
        }
      );
    return () => unsubscribe();
  }, []);

  const CourtItem = ({ item, navigation }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleDropdown = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(prev => !prev);
      // Later: Fetch booking data from Firestore as needed
    };

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => navigation.navigate('CourtDetail', { court: item })}
      >
        <View style={styles.itemMainContent}>
          <View style={styles.leftContent}>
            <Text style={styles.courtText}>Court {item.courtId}</Text>
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
            <Text style={styles.dropdownText}>No bookings available</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCourtItem = ({ item }) => {
    return <CourtItem item={item} navigation={navigation} />;
  };

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
    backgroundColor: '#ffffff', // White screen background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    width: screenWidth - 30, // Nearly full screen width with horizontal margin
    alignSelf: 'center',
    backgroundColor: '#e3c87f', // Light Yellow
    marginVertical: 8,
    paddingVertical: 20, // Height for the item (without dropdown)
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e3c87f', // Matching border for a smooth look
    borderRadius: 20,
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
    color: '#3f278f', // Deep Purple text
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
    color: 'red',
  },
  dropdownButton: {
    width: 40, // Expanded touchable area for easier press
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
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

export default ManageScreen;