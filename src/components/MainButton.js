import React from 'react';
import { TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import TextComponent from './TextComponent'
import Colors from '../constants/Colors'

const { width } = Dimensions.get('window')

const MainButton = ({ ...props }) => (
  <TouchableOpacity style={{...styles.main, width: props.width}} onPress={props.onPress} activeOpacity={0.7} disabled={props.disabled}>
    <TextComponent heavy white medium>{props.title}</TextComponent>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  main: {
    height: 42,
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: Colors.authButton,
    borderRadius: 21,
    paddingHorizontal: 20,
    // elevation: 3,
    // shadowColor: Colors.authButton,
    // shadowOffset: {
    //   height: 0,
    //   width: 0
    // },
    // shadowOpacity: 0.8,
    // shadowRadius: 10
  },
})
export default MainButton