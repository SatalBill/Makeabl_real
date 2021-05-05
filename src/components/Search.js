import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../constants/Colors'

const Search = ({ ...props }) => (
  <View style={styles.input}>
    <FontAwesome style={{ margin: 5 }} name="search" size={18} />
    <TextInput
      style={{ width: '80%' }}
      value={props.value}
      onChangeText={props.onChangeText}
      onClear={props.onClear}
      placeholder="Search..."
      autoCapitalize="none"
      keyboardType={'default'}
      autoCorrect={false}
      blurOnSubmit={true}
    />
  </View>
);

const styles = StyleSheet.create({
  input: {
    width: '70%',
    height: 40,
    borderRadius: 20,
    paddingLeft: 7,
    flexDirection: 'row',
    alignItems: "center",
    marginRight: 15,
    backgroundColor: Colors.white,
    borderColor: '#ced4da',
    borderWidth: 1,
    marginBottom: 15
  },
})

export default Search;
