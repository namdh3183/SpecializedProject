import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Buffer } from 'buffer';
import { COLORS, FONTFAMILY, FONTSIZE } from '../theme/theme';

const CLIENT_ID = 'Ae5jGjjz6aLhb_U1MTDtmLiiqtdy5qyGIq_fbjTJp9tIZ0hCDGvgKRyA6NcB_L7uSJJEA6WwrFDJypMw';
const CLIENT_SECRET = 'EOtIhfclxSjdi1qzGiib0b81JwWE7f1vdzrJgZbEy9IOeK27hHBoquBJYGKLmtUN7gjwzgCtUXsK3bBS';
const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com';
const RETURN_URL = 'com.managercourt.app://payment/return';
const CANCEL_URL = 'com.managercourt.app://payment/cancel';

const btoa = (str) => Buffer.from(str).toString('base64');
const getAmountInUSD = (amountVND) => (amountVND / 24000).toFixed(2);

const PaypalScreen = ({ navigation, route }) => {
  const { courtId, courtName, date, time, startTime, endTime } = route.params;
  const [amountVND, setAmountVND] = useState(0);
  const [webViewUrl, setWebViewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const userId = auth().currentUser?.uid ?? null;

  const getAccessToken = async () => {
    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await res.json();
    if (!data.access_token) throw new Error('Lỗi lấy access token');
    return data.access_token;
  };

  const fetchCourtPrice = async () => {
    const day = new Date(date).getDay();
    const priceDoc = day === 0 ? 'sunday' : 'normal';
    const snapshot = await firestore().collection('court_price').doc(priceDoc).get();
    if (!snapshot.exists) throw new Error('Không tìm thấy giá sân');
    return snapshot.data()?.price ?? 0;
  };

  const createOrder = async (accessToken, amountUSD) => {
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amountUSD,
          },
          description: `Đặt sân ${courtName} ngày ${date} từ ${startTime} đến ${endTime}`,
        },
      ],
      application_context: {
        return_url: RETURN_URL,
        cancel_url: CANCEL_URL,
        brand_name: 'Court Booking App',
        landing_page: 'LOGIN',
        user_action: 'PAY_NOW',
      },
    };

    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    const approveUrl = data.links?.find((link) => link.rel === 'approve')?.href;
    if (!approveUrl) throw new Error('Không tìm thấy link approve');
    return approveUrl;
  };

  const captureOrder = async (token, accessToken) => {
    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return await res.json();
  };

  const handleWebViewNavigation = async (navState) => {
    const { url } = navState;
    if (!url || isProcessing) return;

    if (url.startsWith(RETURN_URL)) {
      const token = new URL(url).searchParams.get('token');
      if (!token) return;

      try {
        setIsProcessing(true);
        setWebViewUrl(null);

        const accessToken = await getAccessToken();
        const captureResponse = await captureOrder(token, accessToken);

        if (captureResponse.status === 'COMPLETED') {
          await firestore().collection('paymentSuccess').add({
            userId,
            courtId: courtId ?? null,
            courtName: courtName ?? '',
            date: date ?? '',
            time: time ?? '',
            startTime: startTime ?? '',
            endTime: endTime ?? '',
            amount: amountVND ?? 0,
            method: 'PayPal',
            status: 'completed',
            paidAt: firestore.FieldValue.serverTimestamp(),
            paypalOrderId: captureResponse?.id ?? '',
            payerEmail: captureResponse?.payer?.email_address ?? null,
          });

          // ✅ TRUYỀN PARAM VỀ ThankyouScreen
          navigation.replace('Thankyou', {
            courtName,
            amount: amountVND,
            date,
            startTime,
            endTime,
            payerEmail: captureResponse?.payer?.email_address ?? '',
          });
        } else {
          throw new Error('Thanh toán không thành công');
        }
      } catch (error) {
        Alert.alert('Lỗi', error.message);
      } finally {
        setIsProcessing(false);
      }
    } else if (url.startsWith(CANCEL_URL)) {
      Alert.alert('Hủy', 'Bạn đã hủy thanh toán');
      navigation.goBack();
    }
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const vnd = await fetchCourtPrice();
        setAmountVND(vnd);

        const accessToken = await getAccessToken();
        const usd = getAmountInUSD(vnd);
        const approvalUrl = await createOrder(accessToken, usd);

        setWebViewUrl(approvalUrl);
      } catch (err) {
        Alert.alert('Lỗi', err.message);
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };

    setup();
  }, []);

  return (
    <View style={styles.container}>
      {(isLoading || isProcessing) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryOrangeHex} />
          <Text style={styles.loadingText}>
            {isLoading ? 'Đang kết nối đến PayPal...' : 'Đang xử lý thanh toán...'}
          </Text>
        </View>
      )}
      {webViewUrl && (
        <WebView
          source={{ uri: webViewUrl }}
          onNavigationStateChange={handleWebViewNavigation}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
          originWhitelist={['*']}
          startInLoadingState={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primaryBlackHex },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.primaryWhiteHex,
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
  },
  webview: { flex: 1 },
});

export default PaypalScreen;
