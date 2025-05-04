import firestore from '@react-native-firebase/firestore';

export const savePayment = async (paymentData) => {
  try {
    await firestore().collection('payments').add(paymentData);
    console.log('Payment saved successfully');
  } catch (error) {
    console.error('Error saving payment:', error);
  }
};
