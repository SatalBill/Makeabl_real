import React, {Component} from 'react';
import {SafeAreaView, Image, Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');
const header = require('../assets/images/header.png');

export default class CustomHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <SafeAreaView
        style={{flex: 1, backgroundColor: '#23DDFA'}}
        forceInset={{top: 'always'}}>
        <Image
          source={header}
          style={{width: width, height: width * 0.27}}
          resizeMode="stretch"
        />
      </SafeAreaView>
    );
  }
}
