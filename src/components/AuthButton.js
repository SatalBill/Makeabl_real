import React from 'react';
import { TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import TextComponent from './TextComponent'
import Colors from '../constants/Colors'
import { BarIndicator } from 'react-native-indicators'

const { width } = Dimensions.get('window')

const AuthButton = ({ ...props }) => (
  <TouchableOpacity style={styles.look} onPress={props.onPress} onPressIn={props.onPressIn} activeOpacity={0.7} disabled={props.disabled}>
    {
      props.isUploading ?
        <BarIndicator color='white' count={3} size={17} />
        :
        <TextComponent heavy white medium>{props.title}</TextComponent>
    }
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  look: {
    alignSelf: "center",
    height: 40,
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: '#40DCFDff',
    borderRadius: 20,
    width: '90%',
    // elevation: 5,
    // shadowOffset: 50,
    // shadowColor: Colors.authButton,
    // shadowOffset: {
    //   width: 0,
    //   height: 0
    // },
    // shadowOpacity: 0.5,
    // shadowRadius: 20
  },
})
export default AuthButton