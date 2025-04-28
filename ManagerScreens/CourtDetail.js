import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  Button 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';

// Helper function to format price with a space every three digits
const formatPrice = (price) => {
  return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Helper function to format duration (ms to "Xh Ym")
const formatDuration = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const CourtDetail = ({ route, navigation }) => {
  const { court } = route.params;

  // States for court session details
  const [currentStatus, setCurrentStatus] = useState(court.status);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [orderId, setOrderId] = useState(null);
  
  // State: fetched court price from "court_price" collection
  const [courtPrice, setCourtPrice] = useState(null);

  // States for managing services and modals
  const [availableServices, setAvailableServices] = useState([]);
  const [isServiceModalVisible, setServiceModalVisible] = useState(false);
  const [serviceQuantities, setServiceQuantities] = useState({});
  const [addedServices, setAddedServices] = useState([]);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);

  // Fetch available services from Firestore ("services" collection)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await firestore().collection('services').get();
        const servicesArray = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAvailableServices(servicesArray);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  // Fetch court price from Firestore collection "court_price"
  useEffect(() => {
    const fetchCourtPrice = async () => {
      try {
        const docSnapshot = await firestore().collection('court_price').doc('normal').get();
        if (docSnapshot.exists) {
          setCourtPrice(docSnapshot.data().price);
        } else {
          // Fallback if document does not exist
          setCourtPrice(60000);
        }
      } catch (error) {
        console.error('Error fetching court price:', error);
        setCourtPrice(60000);
      }
    };
    fetchCourtPrice();
  }, []);

  // Function to update court status in Firestore and state.
  const updateCourtStatus = async (newStatus) => {
    try {
      await firestore().collection('courts').doc(court.id).update({ status: newStatus });
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error('Error updating court status:', error);
    }
  };

  // Create a new order in Firestore (with empty services array).
  const createOrder = async (startTime) => {
    try {
      const orderRef = await firestore().collection('orders').add({
        courtId: court.id,
        startTime,
        endTime: null,
        services: [],
      });
      setOrderId(orderRef.id);
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  // Update order document; updateData can include additional info.
  const updateOrder = async (updateData) => {
    try {
      if (orderId) {
        await firestore().collection('orders').doc(orderId).update(updateData);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Confirm opening the court.
  const confirmOpenCourt = () => {
    const currentTime = new Date().toISOString();
    Alert.alert(
      'Open Court',
      'Are you sure you want to open the court?',
      [
        {
          text: 'Yes',
          onPress: async () => {
            setStartTime(currentTime);
            await updateCourtStatus('in use');
            await createOrder(currentTime);
          },
        },
        {
          text: 'No',
          onPress: () => console.log('Court not opened'),
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  };

  // Instead of processing payment immediately, open the Payment modal.
  const handlePay = () => {
    const currentTime = new Date().toISOString();
    setEndTime(currentTime);
    setPaymentModalVisible(true);
  };

  // Service Modal functions.
  const handleAddService = () => {
    const initialQuantities = {};
    availableServices.forEach((service) => {
      initialQuantities[service.id] = 0;
    });
    setServiceQuantities(initialQuantities);
    setServiceModalVisible(true);
  };

  const increaseQuantity = (serviceId) => {
    // Find the service in your availableServices array
    const serviceItem = availableServices.find((s) => s.id === serviceId);
    // Get the current selected quantity (defaults to 0)
    const currentQuantity = serviceQuantities[serviceId] || 0;
    
    // Check if the current quantity is already equal to the available stock
    if (serviceItem && currentQuantity >= serviceItem.inventory) {
      Alert.alert("Out of Stock", `${serviceItem.name} is out of stock.`);
      return;
    }
    
    // Otherwise, increment the quantity
    setServiceQuantities((prev) => ({
      ...prev,
      [serviceId]: currentQuantity + 1,
    }));
  };

  const decreaseQuantity = (serviceId) => {
    setServiceQuantities((prev) => ({
      ...prev,
      [serviceId]: Math.max((prev[serviceId] || 0) - 1, 0),
    }));
  };

  const confirmAddServices = async () => {
    const servicesToAdd = availableServices
      .filter((service) => serviceQuantities[service.id] > 0)
      .map((service) => ({
        serviceId: service.id,
        name: service.name,
        unitPrice: service.unitPrice,
        quantity: serviceQuantities[service.id],
      }));

    if (servicesToAdd.length > 0 && orderId) {
      try {
        const orderRef = firestore().collection('orders').doc(orderId);
        const orderSnapshot = await orderRef.get();
        let currentServices = orderSnapshot.data().services || [];
        servicesToAdd.forEach((newService) => {
          const index = currentServices.findIndex(
            (s) => s.serviceId === newService.serviceId
          );
          if (index >= 0) {
            currentServices[index].quantity += newService.quantity;
          } else {
            currentServices.push(newService);
          }
        });
        await orderRef.update({ services: currentServices });
        setAddedServices(currentServices);

        // Reduce inventory in Firestore
        servicesToAdd.forEach(async (service) => {
          await firestore()
            .collection('services')
            .doc(service.serviceId)
            .update({
              inventory: firestore.FieldValue.increment(-service.quantity),
            });
        });

        // Update local availableServices to reflect new inventory.
        const updatedAvailableServices = availableServices.map((service) => {
          const added = servicesToAdd.find((s) => s.serviceId === service.id);
          if (added) {
            return { ...service, inventory: service.inventory - added.quantity };
          }
          return service;
        });
        setAvailableServices(updatedAvailableServices);
      } catch (error) {
        console.error('Error updating services in order:', error);
      }
    }
    setServiceModalVisible(false);
  };

  // If the court is in use but orderId isn’t set (e.g., after navigation), fetch the active order.
  useEffect(() => {
    if (currentStatus === 'in use' && !orderId) {
      const fetchActiveOrder = async () => {
        try {
          const querySnapshot = await firestore()
            .collection('orders')
            .where('courtId', '==', court.id)
            .where('endTime', '==', null)
            .limit(1)
            .get();
          if (!querySnapshot.empty) {
            const activeOrder = querySnapshot.docs[0];
            const orderData = activeOrder.data();
            setOrderId(activeOrder.id);
            setAddedServices(orderData.services || []);
            setStartTime(orderData.startTime);
          }
        } catch (error) {
          console.error('Error fetching active order:', error);
        }
      };
      fetchActiveOrder();
    }
  }, [currentStatus, orderId, court.id]);

  // Real-time listener for order changes.
  useEffect(() => {
    if (orderId) {
      const unsubscribe = firestore()
        .collection('orders')
        .doc(orderId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            setAddedServices(data.services || []);
            setStartTime(data.startTime);
          }
        });
      return () => unsubscribe();
    }
  }, [orderId]);

  // Compute payment details if startTime & endTime are set.
  let computedTotalTimeMs = 0;
  let computedTotalPrice = 0;
  if (startTime && endTime) {
    computedTotalTimeMs = new Date(endTime) - new Date(startTime);
    const totalHours = computedTotalTimeMs / (1000 * 60 * 60);
    // Use courtPrice from Firestore; fallback to 60000 if not available.
    const effectiveCourtPrice = courtPrice != null ? courtPrice : 60000;
    const courtCost = totalHours * effectiveCourtPrice;
    const serviceCost = addedServices.reduce(
      (acc, service) => acc + service.quantity * service.unitPrice,
      0
    );
    computedTotalPrice = courtCost + serviceCost;
  }

  // Confirm payment: update the order document and clear order state, then navigate to the manage screen.
  const confirmPayment = async () => {
    try {
      await updateCourtStatus('available');
      await updateOrder({ endTime: endTime, totalPrice: computedTotalPrice });
      setPaymentModalVisible(false);
      // Clear order-related state
      setStartTime(null);
      setEndTime(null);
      setAddedServices([]);
      setOrderId(null);
      // Navigate to manage screen
      navigation.navigate("Manage"); // Adjust route name as needed
      console.log('Payment confirmed. Total price:', computedTotalPrice);
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Court Information */}
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

      {/* Display Start Time Only on main screen */}
      {startTime && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            Start Time: {new Date(startTime).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Display added services as a table */}
      {addedServices.length > 0 && (
        <View style={styles.tableContainer}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableHeader]}>Service</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Quantity</Text>
            <Text style={[styles.tableCell, styles.tableHeader]}>Unit Price</Text>
          </View>
          {addedServices.map((service, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{service.name}</Text>
              <Text style={styles.tableCell}>{service.quantity}</Text>
              <Text style={styles.tableCell}>{service.unitPrice} VND</Text>
            </View>
          ))}
        </View>
      )}

      {/* Floating Action Buttons */}
      {currentStatus === 'available' ? (
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
          <TouchableOpacity style={styles.floatingButton} onPress={handlePay}>
            <Ionicons name="cash-outline" size={40} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal for Adding Services (unchanged) */}
      <Modal
        visible={isServiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setServiceModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Services</Text>
            {availableServices.map((service) => (
              <View key={service.id} style={styles.serviceRow}>
                <Text style={styles.serviceName}>
                  {service.name} ({service.inventory})
                </Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => decreaseQuantity(service.id)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>
                    {serviceQuantities[service.id] || 0}
                  </Text>
                  <TouchableOpacity onPress={() => increaseQuantity(service.id)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setServiceModalVisible(false)} />
              <Button title="Add" onPress={confirmAddServices} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Payment Summary</Text>
            
            {/* Display Start and End Times above the table */}
            <View style={styles.modalSummary}>
              <Text style={styles.summaryText}>
                Start Time: {new Date(startTime).toLocaleString()}
              </Text>
              <Text style={styles.summaryText}>
                End Time: {new Date(endTime).toLocaleString()}
              </Text>
            </View>
            {/* Blank row separator */}
            <View style={{ marginVertical: 10 }} />
            
            {/* Payment Summary Table Header */}
            <View style={styles.paymentTableHeader}>
              <Text style={[styles.paymentCell, { flex: 2, fontWeight: 'bold' }]}>Item</Text>
              <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
                Quantity
              </Text>
              <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
                Unit Price
              </Text>
            </View>
            {/* Total Time Row */}
            {startTime && endTime && (
              <View style={styles.paymentTableRow}>
                <Text style={[styles.paymentCell, { flex: 2 }]}>Total Time</Text>
                <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center' }]}>
                  {formatDuration(computedTotalTimeMs)}
                </Text>
                <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center' }]}>
                  {(courtPrice != null ? courtPrice : 60000)} VND
                </Text>
              </View>
            )}
            {/* Service Rows */}
            {addedServices.map((service, index) => (
              <View key={index} style={styles.paymentTableRow}>
                <Text
                  style={[styles.paymentCell, { flex: 2 }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {service.name}
                </Text>
                <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center' }]}>
                  {service.quantity}
                </Text>
                <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center' }]}>
                  {service.unitPrice} VND
                </Text>
              </View>
            ))}

            {/* Total Price Container with left/right alignment and formatted price */}
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>Total Price:</Text>
              <Text style={styles.totalPriceValue}>
                {formatPrice(computedTotalPrice)} VND
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setPaymentModalVisible(false)} color={'red'} />
              <Button title="Confirm" onPress={confirmPayment} color={'green'}/>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' 
  },
  infoContainer: { 
    position: 'absolute', 
    top: 20, 
    left: 20 
  },
  timeContainer: { 
    marginTop: 100, 
    marginLeft: 20 
  },
  timeText: { 
    fontSize: 20, 
    color: '#3f278f' 
  },
  courtText: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#3f278f', 
    marginBottom: 10 
  },
  statusText: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  available: { 
    color: 'green' 
  },
  inUse: { 
    color: 'red' 
  },
  floatingButtonContainer: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30 
  },
  floatingButton: { 
    backgroundColor: '#3f278f', 
    width: 70, 
    height: 70, 
    borderRadius: 40, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  verticalButtonContainer: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    flexDirection: 'column', 
    alignItems: 'center' 
  },
  tableContainer: {
    marginTop: 40,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  modalContainer: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '80%', 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 20 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center' 
  },
  serviceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  serviceName: { 
    fontSize: 16 
  },
  quantityContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: 100, 
    justifyContent: 'space-between'
  },
  quantityButton: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#3f278f', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginHorizontal: 5 
  },
  quantityButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  quantityText: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginTop: 20 
  },
  paymentTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 5,
    marginBottom: 5,
  },
  paymentTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  paymentCell: {
    paddingHorizontal: 5,
    fontSize: 14,
  },
  modalSummary: {
    marginTop: 10,
  },
  summaryText: {
    fontSize: 14,
    textAlign: 'left',
  },
  totalPriceContainer: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: '#fdd835',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingLeft: 10
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10
  },
});

export default CourtDetail;