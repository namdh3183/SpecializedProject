import React, { useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
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

  const CourtItem = ({ item, navigation }) => {
    const [expanded, setExpanded] = useState(false);

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
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    width: screenWidth - 30, // nearly full screen width with horizontal margin
    alignSelf: 'center',
    backgroundColor: '#e3c87f', // default light yellow for available courts
    marginVertical: 8,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e3c87f', // matching border for a smooth look
    borderRadius: 20,
  },
  // New style for court items in use: red background with matching border
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
    color: '#3f278f', // deep purple text for available courts
  },
  // For courts in use, change courtText to white for better contrast
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
  // For courts in use, keep the status text white
  inUse: {
    color: '#ffffff',
  },
  dropdownButton: {
    width: 40, // expanded touchable area for easier press
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