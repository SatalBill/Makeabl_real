import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import Colors from '../constants/Colors'

const CustomTextInput = ({ inputData: { type, value, onChangeHandle, placeholder, editable } }) => (
  <TextInput
    style={styles.input}
    value={value}
    onChangeText={(text) => { onChangeHandle(type, text) }}
    placeholder={placeholder}
    autoCapitalize="none"
    keyboardType={type === 'phone' || type === 'currentAmount' ? 'phone-pad' : type === 'email' ? 'email-address' : 'default'}
    autoCorrect={false}
    blurOnSubmit={true}
    secureTextEntry={(type === 'password' || type === 'confirmPassword') ? true : false}
    editable={editable}
  />
)
const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingLeft: 15,
    marginTop: 7,
    marginBottom: 15,
    borderColor: Colors.borderColor
  }
})
export default CustomTextInput