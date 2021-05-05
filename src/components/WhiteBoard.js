import React, { Component, Children } from 'react';
import { View, StyleSheet } from 'react-native';

export default function WhiteBoard({ ...props }) {
  return <View style={styles.container}>
    {props.children}
  </View>
}
const styles = StyleSheet.create({
  container: {
    width: '92%',
    paddingHorizontal: 25,
    paddingVertical: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 20
  }
})