import React, { Component } from "react";

import { View, Dimensions, Text, Animated, LogBox, Alert } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import Icon from "react-native-vector-icons/Ionicons";
import * as Animatable from "react-native-animatable";
import config from '../api/config';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

const overlayColor = "rgba(0,0,0,0.7)"; // this gives us a black color with a 50% transparency

const rectDimensions = SCREEN_WIDTH * 0.65; // this is equivalent to 255 from a 393 device width
const rectBorderWidth = SCREEN_WIDTH * 0.02; // this is equivalent to 2 from a 393 device width
const rectBorderColor = "white";

const scanBarWidth = SCREEN_WIDTH * 0.46; // this is equivalent to 180 from a 393 device width
const scanBarHeight = SCREEN_WIDTH * 0.005; //this is equivalent to 1 from a 393 device width
const scanBarColor = "#ff0000";

const iconScanColor = "blue";

LogBox.ignoreAllLogs()

class QrCodeCamera extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scaleOpacity: new Animated.Value(0),
      scaleWidth: new Animated.Value(0),
      myHeaders: {},
      isLoading: false
    };
  }
  componentDidMount = async () => {
    let token = await AsyncStorage.getItem('userToken');
    let userID = await AsyncStorage.getItem('userID');
    await this.setState({
      token: token,
      userID: userID
    })
    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': this.state.token.replace(/['"]+/g, ''),
      'User-ID': this.state.userID.replace(/['"]+/g, ''),
    };
    await this.setState({ myHeaders });
  }
  sendScannedData(qrtoken) {
    this.setState({ isLoading: true });
    fetch(config.api.prePackage, {
      method: 'POST',
      headers: this.state.myHeaders,
      body: `qrtoken=${qrtoken}`
    })
      .then((response) => response.json())
      .then((res) => {
        console.log('>>>res>>>', res);
        this.setState({ isLoading: false });
        if (res.status == 200) {
          this.props.navigation.navigate('PurchasePass')
          setTimeout(() => {
            Alert.alert('Success', 'Pre-paid package is added!','')
          }, 200);
        } else {
          this.props.navigation.goBack()
          setTimeout(() => {
            Alert.alert('Failed', 'QR is invalid!')
          }, 200);
        }
      })
      .catch(err => {
        this.setState({ isLoading: false });
        this.props.navigation.goBack()
        console.log('>>>',err);
        setTimeout(() => {
          alert('Network error')
        }, 200);
      })
  }

  onSuccess(e) {
    // console.log(e.data);
    Animated.timing(this.state.scaleOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false
    }).start()
    Animated.timing(this.state.scaleWidth, {
      toValue: 40,
      duration: 200,
      useNativeDriver: false
    }).start()
    setTimeout(() => {
      Alert.alert(
        `Successfylly scanned!`,
        `Are you sure want to send this data?`,
        [
          { text: 'CANCEL', style: 'cancel', onPress: () => this.props.navigation.goBack() },
          { text: 'OK', onPress: () => { this.sendScannedData(e.data) } }
        ]
      )
    }, 500);
  }

  makeSlideOutTranslation(translationType, fromValue) {
    return {
      from: {
        [translationType]: SCREEN_WIDTH * -0.18
      },
      to: {
        [translationType]: fromValue
      }
    };
  }

  render() {
    return (
      <QRCodeScanner
        showMarker
        onRead={this.onSuccess.bind(this)}
        cameraStyle={{ height: SCREEN_HEIGHT }}
        customMarker={
          <View style={styles.rectangleContainer}>
            <View style={styles.topOverlay}>
              <Text style={{ fontSize: 30, color: "white" }}>
                QR CODE SCANNER
              </Text>
            </View>
            <Spinner
              visible={this.state.isLoading}
              textContent={'Sending...'}
              textStyle={{ color: 'white' }}
            />
            <View style={{ flexDirection: "row" }}>
              <View style={styles.leftAndRightOverlay} />

              <View style={styles.rectangle}>
                <Icon
                  name="qr-code-sharp"
                  size={SCREEN_WIDTH * 0.73}
                  color={'transparent'}
                />
                <Animatable.View
                  style={styles.scanBar}
                  direction="alternate-reverse"
                  iterationCount="infinite"
                  duration={1700}
                  easing="linear"
                  animation={this.makeSlideOutTranslation(
                    "translateY",
                    SCREEN_WIDTH * -0.6
                  )}
                />
                <Animated.View style={{
                  opacity: this.state.scaleOpacity,
                  width: this.state.scaleWidth,
                  height: this.state.scaleWidth,
                  borderRadius: this.state.scaleWidth * 0.5,
                  backgroundColor: '#77ff00',
                  borderRadius: 20,
                  position: 'absolute',
                }}>

                </Animated.View>
              </View>

              <View style={styles.leftAndRightOverlay} />
            </View>

            <View style={styles.bottomOverlay} />
          </View>
        }
      />
    );
  }
}

const styles = {
  rectangleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  rectangle: {
    height: rectDimensions,
    width: rectDimensions,
    borderWidth: rectBorderWidth,
    borderColor: rectBorderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderRadius: 10
  },

  topOverlay: {
    flex: 1,
    height: SCREEN_WIDTH,
    width: SCREEN_WIDTH,
    backgroundColor: overlayColor,
    justifyContent: "center",
    alignItems: "center"
  },

  bottomOverlay: {
    flex: 1,
    height: SCREEN_WIDTH,
    width: SCREEN_WIDTH,
    backgroundColor: overlayColor,
    paddingBottom: SCREEN_WIDTH * 0.25
  },

  leftAndRightOverlay: {
    height: SCREEN_WIDTH * 0.65,
    width: SCREEN_WIDTH,
    backgroundColor: overlayColor
  },

  scanBar: {
    width: scanBarWidth,
    height: scanBarHeight,
    backgroundColor: scanBarColor
  }
};

export default QrCodeCamera;