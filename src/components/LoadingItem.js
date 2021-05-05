import React, { Component } from 'react';
import { Animated, Dimensions } from 'react-native';
import Colors from '../constants/Colors'

const { width, height } = Dimensions.get('window')

export default class CustomItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scaleValue: new Animated.Value(0),
    };
  }

  componentDidMount() {
    Animated.timing(this.state.scaleValue, {
      toValue: 1,
      duration: 1000,
      delay: this.props.index * 400,
      useNativeDriver: false
    }).start();
  }

  render() {
    return (
      <Animated.View
        style={{
          opacity: this.state.scaleValue,
          alignItems: 'flex-end',
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: Colors.borderColor,
          margin: 10,
          borderRadius: 15,
          height: width * 0.5,
          padding: 20
        }}>
        {this.props.children}
      </Animated.View>
    );
  }
}