import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, FONTFAMILY, FONTSIZE } from '../theme/theme';

const ThankyouScreen = ({ route, navigation }) => {
  const {
    courtName,
    date,
    startTime,
    endTime,
    amount,
    payerEmail,
  } = route.params || {};

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/845/845646.png' }}
        style={styles.successIcon}
      />
      <Text style={styles.title}>Payment Success!</Text>

      <View style={styles.detailBox}>
        <Text style={styles.label}>Court:</Text>
        <Text style={styles.value}>{courtName}</Text>

        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{date}</Text>

        <Text style={styles.label}>Time:</Text>
        <Text style={styles.value}>{startTime} - {endTime}</Text>

        <Text style={styles.label}>Money :</Text>
        <Text style={styles.value}>{amount?.toLocaleString()} VND</Text>

        <Text style={styles.label}>Email Payment:</Text>
        <Text style={styles.value}>{payerEmail || 'Không có'}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBlackHex,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: FONTSIZE.size_28,
    color: COLORS.primaryWhiteHex,
    fontFamily: FONTFAMILY.poppins_bold,
    marginVertical: 20,
  },
  detailBox: {
    width: '100%',
    backgroundColor: COLORS.primaryGreyHex,
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
  },
  label: {
    color: COLORS.primaryWhiteHex,
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_16,
    marginTop: 10,
  },
  value: {
    color: COLORS.primaryOrangeHex,
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_18,
  },
  button: {
    backgroundColor: COLORS.primaryOrangeHex,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.primaryWhiteHex,
    fontSize: FONTSIZE.size_18,
    fontFamily: FONTFAMILY.poppins_medium,
  },
});

export default ThankyouScreen;
