import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, Dimensions, StatusBar, Platform, LogBox } from "react-native";
import Navigator from "./navigators/AppNavigation";
import Colors from "./constants/Colors"
import TextComponent from "./components/TextComponent"
import store from "./store";
import { Provider } from "react-redux";
import LinearGradient from 'react-native-linear-gradient'
import Credentials from './constants/Credentials'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage'
import OneSignal from 'react-native-onesignal';

const { width, height } = Dimensions.get("window")
const logo = require("./assets/images/logo.png")
const guest1 = require('./assets/images/welcome/1.jpg')
const guest2 = require('./assets/images/welcome/2.jpg')
const guest3 = require('./assets/images/welcome/3.jpg')
const guest4 = require('./assets/images/welcome/4.jpg')
const guest5 = require('./assets/images/welcome/5.jpg')
const guest6 = require('./assets/images/welcome/6.jpg')
const guest7 = require('./assets/images/welcome/7.jpg')
const guest8 = require('./assets/images/welcome/8.jpg')
const guest9 = require('./assets/images/welcome/9.jpg')
const guest10 = require('./assets/images/welcome/10.jpg')

function myiOSPromptCallback(permission) {
  // do something with permission value
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      introVisible: true,
      guestData: [
        { id: 1, src: guest1, wid: 0.7 * 60, positionX: width * 0.45, positionY: height * 0.08 },
        { id: 2, src: guest2, wid: 1 * 60, positionX: width * 0.15, positionY: height * 0.15 },
        { id: 3, src: guest3, wid: 1.2 * 60, positionX: width * 0.65, positionY: height * 0.1 },
        { id: 4, src: guest4, wid: 0.8 * 60, positionX: width * 0.4, positionY: height * 0.25 },
        { id: 5, src: guest5, wid: 0.85 * 60, positionX: width * 0.65, positionY: height * 0.3 },
        { id: 6, src: guest6, wid: 0.85 * 60, positionX: width * 0.6, positionY: height * 0.65 },
        { id: 7, src: guest7, wid: 0.75 * 60, positionX: width * 0.2, positionY: height * 0.7 },
        { id: 8, src: guest8, wid: 0.7 * 60, positionX: width * 0.4, positionY: height * 0.83 },
        { id: 9, src: guest9, wid: 1 * 60, positionX: width * 0.75, positionY: height * 0.85 },
        { id: 10, src: guest10, wid: 1.2 * 60, positionX: width * 0.1, positionY: height * 0.85 },
      ],
      logoData: [
        { id: 1, positionX: 0.2 * width, positionY: 0.05 * height, angle: 0 },
        { id: 2, positionX: 0.77 * width, positionY: 0.2 * height, angle: 0 },
        { id: 3, positionX: 0.17 * width, positionY: 0.27 * height, angle: 0 },
        { id: 4, positionX: 0.4 * width, positionY: 0.7 * height, angle: 0 },
        { id: 5, positionX: 0.85 * width, positionY: 0.75 * height, angle: 0 },
      ],
      pressed: false
    };
    OneSignal.setLogLevel(6, 0);

    // Replace 'YOUR_ONESIGNAL_APP_ID' with your OneSignal App ID.
    OneSignal.init(Credentials.oneSignalKey, { kOSSettingsKeyAutoPrompt: false, kOSSettingsKeyInAppLaunchURL: false, kOSSettingsKeyInFocusDisplayOption: 2 });
    OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.

    // The promptForPushNotifications function code will show the iOS push notification prompt. We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step below)
    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
  }
  componentDidMount() {
    LogBox.ignoreAllLogs();
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }

  onReceived(notification) {
    console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  onIds(device) {
    console.log('Device info: ', device);
    AsyncStorage.setItem('push_token', device["userId"])
  }

  render() {
    const { introVisible, guestData, logoData, pressed } = this.state
    if (introVisible) {

      return (
        <View style={styles.container}>
          <StatusBar hidden />
          <LinearGradient colors={[Colors.authButton, Colors.authButtonTr]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          <View style={{ justifyContent: 'center', alignItems: "center" }}>
            <TextComponent xlarge white heavy>SHOW ME MY</TextComponent>
            <TextComponent xlarge white heavy>
              MAKEABL
              <View style={{ flexDirection: 'column' }}>
                <Image source={logo} style={{ marginBottom: -4, width: 20, height: 20, marginLeft: -7 }} resizeMode="stretch" />
                <TextComponent></TextComponent>
              </View>
              {' '}MOMENTS
            </TextComponent>
            <TextComponent></TextComponent>
            <View style={{ width: '50%' }}>
              <TouchableOpacity
                style={styles.enter}
                onPress={() => this.setState({ introVisible: false })}
                activeOpacity={0.8}>
                <TextComponent heavy medium main>Enter</TextComponent>
              </TouchableOpacity>
            </View>
          </View>
          {
            guestData.map((item, i) => (
              <Image key={i} source={item.src} style={{ ...styles.guest, width: item.wid, height: item.wid, left: item.positionX, top: item.positionY }} resizeMode="cover" />
            ))
          }
          {
            logoData.map((item, i) => (
              <Image key={i} source={logo} style={{ transform: [{ rotate: `${item.angle}deg` }], position: 'absolute', top: item.positionY, left: item.positionX, width: 30 }} resizeMode="contain" />
            ))
          }
        </View>
      );
    } else {
      return (
        <Provider store={store}>
          <Navigator />
        </Provider>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.authButton,
    justifyContent: 'center',
  },
  login: {
    backgroundColor: Colors.white,
    width: width * 0.4,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: "center"
  },
  guest: {
    position: 'absolute',
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 3
  },
  enter: {
    alignSelf: "center",
    height: hp('5%'),
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: 'white',
    borderRadius: hp('2.5%'),
    width: '90%',
  },
});
