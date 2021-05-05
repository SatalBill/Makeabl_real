import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import QR from '../assets/images/icon/QR.png'

export default function ProfileImage({ ...props }) {
  return (
    <View style={{ marginRight: 20, marginTop: 15 }}>
      {
        props.QRbutton ?
          <TouchableOpacity onPress={()=>props.navigationProps.navigate('QRscan')}>
            <Image source={QR} style={styles.img} resizeMode="contain" />
          </TouchableOpacity>
          :
          <Image source={props.imageURL} style={styles.img} resizeMode="contain" />
      }
    </View>
  )
}
const styles = StyleSheet.create({
  img: { width: 30, height: 30 }
})