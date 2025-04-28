import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';

// Provided formatPrice function: this formats a number with a space every three digits.
const formatPrice = (price) => {
  return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const RevenueScreen = () => {
  // States for date selection; default value is today.
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  // Boolean flags to show the date pickers.
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // States to keep the fetched orders and the computed revenue.
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Handler for the start date picker.
  const onStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  // Handler for the end date picker.
  const onEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  // Query Firestore orders that have an endTime (i.e. completed orders) within the selected date range.
  const fetchOrders = async () => {
    try {
      // The start date is used as-is (ISO string).
      const startISO = startDate.toISOString();

      // For the end date, set the time to the end of that day.
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      const endISO = endOfDay.toISOString();

      // Query orders having an endTime between startISO and endISO.
      const ordersSnapshot = await firestore()
        .collection('orders')
        .where('endTime', '>=', startISO)
        .where('endTime', '<=', endISO)
        .get();

      let ordersArray = [];
      let revenueSum = 0;
      ordersSnapshot.forEach(doc => {
        const data = doc.data();
        ordersArray.push({ id: doc.id, ...data });
        revenueSum += data.totalPrice || 0;
      });

      setOrders(ordersArray);
      setTotalRevenue(revenueSum);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  // Helper function to truncate a string if it is too long.
  const truncateText = (text, maxLength = 10) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <View style={styles.container}>
      {/* Date Picker Section at the Top */}
      <View style={styles.datePickerContainer}>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            Start Date: {startDate.toDateString()}
          </Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.dateButtonText}>
            End Date: {endDate.toDateString()}
          </Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}
        <Button title="Fetch Orders" onPress={fetchOrders} />
      </View>

      {/* Orders List (ScrollView) */}
      <ScrollView style={styles.ordersContainer}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderRow}>
            <Text style={styles.orderCell}>
              {new Date(order.endTime).toLocaleDateString()}
            </Text>
            <Text style={styles.orderCell}>
              {truncateText(order.id)}
            </Text>
            {/* Display the order's price using formatPrice */}
            <Text style={styles.orderCell}>
              {formatPrice(order.totalPrice)} VND
            </Text>
          </View>
        ))}
        {orders.length === 0 && (
          <Text style={styles.emptyText}>
            No orders for the selected period.
          </Text>
        )}
      </ScrollView>

      {/* Bottom Section: Highlighted Total Revenue */}
      <View style={styles.revenueContainer}>
        <Text style={styles.revenueLabel}>Total Revenue:</Text>
        <Text style={styles.revenueValue}>
          {formatPrice(totalRevenue)} VND
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#3f278f',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  ordersContainer: {
    flex: 1,
    marginVertical: 10,
  },
  orderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  orderCell: {
    flex: 1,
    fontSize: 20,  // Increased font size for easier reading
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  revenueContainer: {
    padding: 15,
    backgroundColor: '#fdd835',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default RevenueScreen;