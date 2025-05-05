import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

// Helper: Format price with a space every three digits.
const formatPrice = (price) => {
  return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Helper: Format duration (ms to "Xh Ym").
const formatDuration = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const CourtDetail = ({ route, navigation }) => {
  const { court, orderId: routeOrderId } = route.params; // May be passed in at creation.
  
  // Session and order states.
  const [currentStatus, setCurrentStatus] = useState(court.status);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [orderId, setOrderId] = useState(routeOrderId || null);
  const [courtPrice, setCourtPrice] = useState(null);

  // For services, payment, and modals.
  const [availableServices, setAvailableServices] = useState([]);
  const [isServiceModalVisible, setServiceModalVisible] = useState(false);
  const [serviceQuantities, setServiceQuantities] = useState({});
  const [addedServices, setAddedServices] = useState([]);
  const [isPaymentModalVisible, setPaymentModalVisible] = useState(false);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);

  /* ------------------ Data Fetching ------------------ */
  // Fetch available services.
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await firestore().collection('services').get();
        const servicesArray = servicesSnapshot.docs.map(doc => ({
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

  // Fetch court price.
  useEffect(() => {
    const fetchCourtPrice = async () => {
      try {
        const docSnapshot = await firestore().collection('court_price').doc('normal').get();
        if (docSnapshot.exists) {
          setCourtPrice(docSnapshot.data().price);
        } else {
          setCourtPrice(60000);
        }
      } catch (error) {
        console.error('Error fetching court price:', error);
        setCourtPrice(60000);
      }
    };
    fetchCourtPrice();
  }, []);

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

  // When re-entering the screen, if orderId is not set but the court is still "in use",
  // try to recover an active order (endTime === null) for this court.
  useEffect(() => {
    if (!orderId && currentStatus !== 'available') {
      firestore()
        .collection('orders')
        .where('courtId', '==', court.id)
        .where('endTime', '==', null)
        .limit(1)
        .get()
        .then((snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setOrderId(doc.id);
          }
        })
        .catch((error) => {
          console.error('Error retrieving active order:', error);
        });
    }
  }, [orderId, court.id, currentStatus]);

  /* ------------------ Helper Functions ------------------ */
  // Update the court status.
  const updateCourtStatus = async (newStatus) => {
    try {
      await firestore().collection('courts').doc(court.id).update({ status: newStatus });
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error('Error updating court status:', error);
    }
  };

  // Create a new order.
  const createOrder = async (startTime) => {
    try {
      const orderRef = await firestore().collection('orders').add({
        courtId: court.id,
        startTime,
        endTime: null,
        services: [],
      });
      return orderRef;
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  // Update an existing order.
  const updateOrder = async (updateData) => {
    try {
      if (orderId) {
        await firestore().collection('orders').doc(orderId).update(updateData);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  // Show confirmation to open the court.
  const showOpenConfirmation = async () => {
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
            const orderRef = await createOrder(currentTime);
            if (orderRef) {
              setOrderId(orderRef.id);
            }
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

  // Check if there is an active booking for this court at the current time.
  const handleOpenCourt = async () => {
    const now = new Date();
    const today = now.toDateString(); // e.g., "Sun May 04 2025"
    let bookingFound = null;
    try {
      const snapshot = await firestore()
        .collection('paymentSuccess')
        .where('courtName', '==', court.courtId)
        .where('date', '==', today)
        .get();
      snapshot.forEach((doc) => {
        const booking = { id: doc.id, ...doc.data() };
        const bookingStart = new Date(booking.date);
        const bookingEnd = new Date(booking.date);
        const [sHour, sMin] = booking.startTime.split(':').map(Number);
        const [eHour, eMin] = booking.endTime.split(':').map(Number);
        bookingStart.setHours(sHour, sMin, 0, 0);
        bookingEnd.setHours(eHour, eMin, 0, 0);
        if (now >= bookingStart && now <= bookingEnd) {
          bookingFound = booking;
        }
      });
    } catch (error) {
      console.error('Error checking active booking:', error);
    }
    if (bookingFound) {
      // If a booking exists, ask for confirmation via a reminder modal.
      setReminderModalVisible(true);
    } else {
      showOpenConfirmation();
    }
  };

  // Reminder modal handlers.
  const handleReminderConfirm = () => {
    showOpenConfirmation();
    setReminderModalVisible(false);
  };

  const handleReminderCancel = () => {
    setReminderModalVisible(false);
  };

  // Open payment modal and set the end time.
  const handlePay = async () => {
    const currentTimeISO = new Date().toISOString();
    setEndTime(currentTimeISO);
    setPaymentModalVisible(true);
  };

  // --- Service Modal Functions ---
  const handleAddService = () => {
    const initialQuantities = {};
    availableServices.forEach(service => {
      initialQuantities[service.id] = 0;
    });
    setServiceQuantities(initialQuantities);
    setServiceModalVisible(true);
  };

  const increaseQuantity = (serviceId) => {
    const serviceItem = availableServices.find(s => s.id === serviceId);
    const currentQuantity = serviceQuantities[serviceId] || 0;
    if (serviceItem && currentQuantity >= serviceItem.inventory) {
      Alert.alert("Out of Stock", `${serviceItem.name} is out of stock.`);
      return;
    }
    setServiceQuantities(prev => ({
      ...prev,
      [serviceId]: currentQuantity + 1,
    }));
  };

  const decreaseQuantity = (serviceId) => {
    setServiceQuantities(prev => ({
      ...prev,
      [serviceId]: Math.max((prev[serviceId] || 0) - 1, 0),
    }));
  };

  const confirmAddServices = async () => {
    if (!orderId) {
      Alert.alert("Error", "No active order found.");
      return;
    }
    const servicesToAdd = availableServices
      .filter(service => serviceQuantities[service.id] > 0)
      .map(service => ({
        serviceId: service.id,
        name: service.name,
        unitPrice: service.unitPrice,
        quantity: serviceQuantities[service.id],
      }));
    if (servicesToAdd.length > 0) {
      try {
        const orderRef = firestore().collection('orders').doc(orderId);
        const orderSnapshot = await orderRef.get();
        if (!orderSnapshot.exists) {
          Alert.alert("Error", "Order not found.");
          return;
        }
        let currentServices = orderSnapshot.data().services || [];
        servicesToAdd.forEach(newService => {
          const index = currentServices.findIndex(s => s.serviceId === newService.serviceId);
          if (index >= 0) {
            currentServices[index].quantity += newService.quantity;
          } else {
            currentServices.push(newService);
          }
        });
        await orderRef.update({ services: currentServices });
        // Fetch the updated order document.
        const updatedOrder = await orderRef.get();
        setAddedServices(updatedOrder.data().services || []);
        
        // Reduce inventory in Firestore.
        for (const service of servicesToAdd) {
          await firestore().collection('services').doc(service.serviceId).update({
            inventory: firestore.FieldValue.increment(-service.quantity),
          });
        }
        Alert.alert("Success", "Services added successfully.");
      } catch (error) {
        console.error('Error updating services in order:', error);
        Alert.alert("Error", error.message);
      }
    }
    setServiceModalVisible(false);
  };

  // --- Compute Payment Details ---
  let computedTotalTimeMs = 0;
  let computedTotalPrice = 0;
  if (startTime && endTime) {
    computedTotalTimeMs = new Date(endTime) - new Date(startTime);
    const totalHours = computedTotalTimeMs / (1000 * 60 * 60);
    const effectiveCourtPrice = courtPrice != null ? courtPrice : 60000;
    const courtCost = totalHours * effectiveCourtPrice;
    const serviceCost = addedServices.reduce(
      (acc, service) => acc + service.quantity * service.unitPrice,
      0
    );
    computedTotalPrice = courtCost + serviceCost;
  }

  // --- Confirm Payment & Generate PDF ---
  const confirmPayment = async () => {
    try {
      await updateCourtStatus('available');
      await updateOrder({ endTime: endTime, totalPrice: computedTotalPrice });

      // Build HTML for PDF bill.
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; color: #3f278f; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
              th { background-color: #f0f0f0; }
              .total { font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>Payment Summary</h1>
            <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
            <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()}</p>
            <table>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
              </tr>
              <tr>
                <td>Total Time</td>
                <td>${formatDuration(computedTotalTimeMs)}</td>
                <td>${courtPrice != null ? courtPrice : 60000} VND</td>
              </tr>
              ${addedServices.map(service => `
                <tr>
                  <td>${service.name}</td>
                  <td>${service.quantity}</td>
                  <td>${service.unitPrice} VND</td>
                </tr>
              `).join('')}
            </table>
            <p class="total">Total Price: ${formatPrice(computedTotalPrice)} VND</p>
          </body>
        </html>
      `;

      // Generate PDF.
      let options = {
        html: htmlContent,
        fileName: `Payment_Bill_${orderId || 'temp'}`,
        directory: '',
      };

      const pdfFile = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated at:', pdfFile.filePath);

      setPaymentModalVisible(false);
      // Clear order-related state after payment.
      setStartTime(null);
      setEndTime(null);
      setAddedServices([]);
      setOrderId(null);
      navigation.navigate('Manage');
      console.log('Payment confirmed. Total price:', computedTotalPrice);
    } catch (error) {
      console.error('Error confirming payment:', error);
      Alert.alert("Payment Error", error.message);
    }
  };

  /* ------------------ UI Rendering ------------------ */
  return (
    <View style={styles.container}>
      {/* Court Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.courtText}>Court {court.courtId}</Text>
        <Text style={[styles.statusText, currentStatus === 'available' ? styles.available : styles.inUse]}>
          {currentStatus.toUpperCase()}
        </Text>
      </View>

      {/* Display Start Time */}
      {startTime && (
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>Start Time: {new Date(startTime).toLocaleString()}</Text>
        </View>
      )}

      {/* Display Added Services Table */}
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
          <TouchableOpacity style={styles.floatingButton} onPress={handleOpenCourt}>
            <Ionicons name="play" size={40} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.verticalButtonContainer}>
          <TouchableOpacity style={[styles.floatingButton, { marginBottom: 20 }]} onPress={handleAddService}>
            <Ionicons name="add-outline" size={40} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton} onPress={handlePay}>
            <Ionicons name="cash-outline" size={40} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Service Modal */}
      <Modal
        visible={isServiceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setServiceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Services</Text>
              {availableServices.map(service => (
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
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={isPaymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Payment Summary</Text>
              <View style={styles.modalSummary}>
                <Text style={styles.summaryText}>Start Time: {new Date(startTime).toLocaleString()}</Text>
                <Text style={styles.summaryText}>End Time: {new Date(endTime).toLocaleString()}</Text>
              </View>
              <View style={{ marginVertical: 10 }} />
              <View style={styles.paymentTableHeader}>
                <Text style={[styles.paymentCell, { flex: 2, fontWeight: 'bold' }]}>Item</Text>
                <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
                  Quantity
                </Text>
                <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>
                  Unit Price
                </Text>
              </View>
              {startTime && endTime && (
                <View style={styles.paymentTableRow}>
                  <Text style={[styles.paymentCell, { flex: 2 }]}>Total Time</Text>
                  <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center' }]}>
                    {formatDuration(computedTotalTimeMs)}
                  </Text>
                  <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center' }]}>
                    {courtPrice != null ? courtPrice : 60000} VND
                  </Text>
                </View>
              )}
              {addedServices.map((service, index) => (
                <View key={index} style={styles.paymentTableRow}>
                  <Text
                    style={[styles.paymentCell, { flex: 2 }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {service.name}
                  </Text>
                  <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center' }]}>{service.quantity}</Text>
                  <Text style={[styles.paymentCell, { flex: 1, textAlign: 'center' }]}>{service.unitPrice} VND</Text>
                </View>
              ))}
              <View style={styles.totalPriceContainer}>
                <Text style={styles.totalPriceLabel}>Total Price:</Text>
                <Text style={styles.totalPriceValue}>
                  {formatPrice(computedTotalPrice)} VND
                </Text>
              </View>
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setPaymentModalVisible(false)} color={'red'} />
                <Button title="Confirm" onPress={confirmPayment} color={'green'} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reminder Modal */}
      <Modal
        visible={reminderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Booking Conflict</Text>
            <Text style={styles.modalText}>
              There is a booking scheduled for this court at the current time. Are you sure you want to open the court?
            </Text>
            <View style={styles.modalButtons}>
              <Button title="Yes" onPress={handleReminderConfirm} />
              <Button title="No" onPress={handleReminderCancel} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CourtDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ffffff',
  },
  infoContainer: {
    marginBottom: 20,
  },
  courtText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3f278f',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  available: {
    color: 'green',
  },
  inUse: {
    color: '#ff4d4d',
  },
  timeContainer: {
    marginVertical: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#3f278f',
  },
  tableContainer: {
    marginVertical: 20,
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
  tableCell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  floatingButton: {
    backgroundColor: '#3f278f',
    width: 70,
    height: 70,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    flexDirection: 'column',
    alignItems: 'center',
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
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
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
  modalSummary: {
    marginTop: 10,
  },
  summaryText: {
    fontSize: 14,
    textAlign: 'left',
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
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  serviceName: {
    fontSize: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    justifyContent: 'space-between',
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3f278f',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});