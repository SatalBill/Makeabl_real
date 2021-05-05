import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import Colors from '../constants/Colors'

const Quantity = ({ ...props }) => (
  <View style={styles.container}>
    <View style={styles.quantityArea}>
      <Text>{props.quantity}</Text>
    </View>
    <View style={styles.btnArea}>
      <TouchableOpacity onPress={() => { props.plus }} style={styles.btn}>
        <Text style={{ color: 'white', fontSize: 22 }}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => { props.minus }} style={styles.btn}>
        <Text style={{ color: 'white', fontSize: 26 }}>-</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', },
  quantityArea: { width: '80%', justifyContent: 'center', alignItems: "center" },
  btnArea: { width: '20%', flexDirection: 'column', height: 50 },
  btn: { justifyContent: 'center', alignItems: "center", backgroundColor: Colors.authButton, width: '100%', height: 25 }
})
export default Quantity;
