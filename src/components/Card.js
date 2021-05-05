import React, { Component, Children } from 'react';
import { View, StyleSheet } from 'react-native';

export default function Card({ ...props }) {
  return <View style={styles.container}>
    {props.children}
  </View>
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 25,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  }
})