import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Inventory = () => {
  const [services, setServices] = useState([]);

  // Fetch all services from the 'services' collection
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await firestore().collection('services').get();
        const servicesArray = servicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesArray);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableHeader]}>Name</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Stock</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Unit Price</Text>
        </View>
        {/* Table Rows */}
        {services.map(service => (
          <View key={service.id} style={styles.tableRow}>
            <Text style={styles.tableCell} numberOfLines={1} ellipsizeMode="tail">
              {service.name}
            </Text>
            <Text style={styles.tableCell}>{service.inventory}</Text>
            <Text style={styles.tableCell}>{service.unitPrice} VND</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  tableContainer: {
    marginTop: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10, // Increase vertical padding for larger text
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 5,
    fontSize: 18, // Increased font size for cells
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    fontSize: 18, // Set header font size to match cell size
  },
});

export default Inventory;