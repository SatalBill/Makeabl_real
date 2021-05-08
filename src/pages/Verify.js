import React, { Component } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, TouchableOpacity, Platform } from 'react-native';
import TextComponent from '../components/TextComponent';
import Colors from '../constants/Colors'
import config from '../api/config'
import CodeInput from 'react-native-confirmation-code-input';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage'
import Toast from 'react-native-simple-toast';

let myInterval

export default class Permissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verification: '',
      otp: '',
      userID: '',
      verifyCode: '',
      timeFlag: false,
      isLoading: false,
      resendTime: 0,
      isFace: 0,
      email: '',
      password: '',
      push_token: ''
    };
  }

  componentDidMount = async () => {
    const userID = (await AsyncStorage.getItem('userID')).toString()
    const verifyCode = (await AsyncStorage.getItem('verifyCode')).toString()
    const isFace = (await AsyncStorage.getItem('isFace')).toString().replace(/['"]+/g, '')
    const push_token = (await AsyncStorage.getItem('push_token')).toString()
    // const email = this.props.navigation.getParam('email')
    // const password = this.props.navigation.getParam('password')
    this.setState({
      userID: userID,
      verifyCode: verifyCode,
      isFace: parseInt(isFace),
      push_token: push_token
    })
    console.log('verify_code===', this.state.verifyCode);
    console.log('userID===', this.state.userID);
    console.log('isFace_typeof===', typeof (this.state.isFace));
    console.log('isFace===', this.state.isFace);
  }

  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false
    })
    Alert.alert('Warning', 'Network error')
  }

  _resend = async () => {
    const { userID } = this.state
    await this.setState({ resendTime: 10 })
    console.log('resendTime====', this.state.resendTime);

    await clearInterval(myInterval);
    myInterval = setInterval(() => {
      console.log(this.state.resendTime);
      if (this.state.resendTime <= 0) {
        clearInterval(myInterval)
      } else {
        this.setState({ resendTime: this.state.resendTime - 1 })
      }
    }, 1000);

    fetch(config.auth.resend, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Auth-Key': 'simplerestapi'
      },
      body: `userID=${userID.toString()}`
    })
      .then((response) => response.json())
      .then((res) => {
        console.log('Resend Code==', res['verifyCode']);
        this.setState({ verifyCode: JSON.stringify(res['verifyCode']) })
        if (res.status == 200) {
          Toast.showWithGravity('Verification code has been resent', Toast.LONG, Toast.TOP);
        }
      })
      .catch((error) => {
        console.log(error);
        throw error;
      })
  }

  _onVerifyOTP = async (otp_number) => {
    console.log(this.state.push_token);
    await this.setState({ otp: otp_number });
    let details = {
      'userID': this.state.userID.replace(/['"]+/g, ''),
      'verify_code': this.state.otp.replace(/['"]+/g, ''),
      'push_token': this.state.push_token,
      'push_os': Platform.OS == 'android' ? 1 : 0
    };
    var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 8000)
    this.setState({ isLoading: true })

    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    console.log('formBody=>', formBody);
    fetch(config.auth.verify, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Auth-Key': 'simplerestapi'
      },
      body: formBody
    })
      .then((response) => response.json())
      .then(async (res) => {
        console.log('verifyRes==', res);
        clearTimeout(myTimer)
        this.setState({ isLoading: false })

        if (res.status == 207) {
          Alert.alert('Warning', 'Wrong verify code')
        } else if (res.status == 200) {
          await AsyncStorage.setItem('userToken', JSON.stringify(res['token']))
          await AsyncStorage.setItem('photoURL', (res['photo_url'] == "" || res['photo_url'] == null) ? "emptyPhoto" : JSON.stringify(res['photo_url']))
          await AsyncStorage.setItem('qrURL', (res['qr_url'] == "" || res['qr_url'] == null) ? "emptyQR" : JSON.stringify(res['qr_url']))
          await AsyncStorage.setItem('email', JSON.stringify(res['email']))
          await AsyncStorage.setItem('mobile', "No mobile")
          await AsyncStorage.setItem('address', "No address")
          if (this.state.isFace == 0) {
            this.props.navigation.navigate("Register")
          } else {
            this.props.navigation.navigate('App')
          }

        }
      })
      .catch((error) => {
        console.log('verify_error==', error);
        this.setState({ isLoading: false })
        if (!this.state.timeFlag) {
          if (error.message == "Request failed with status code 401") {
            Alert.alert('Warning', "Network Error!")
          }
          clearTimeout(myTimer);
        } else {
          this.setState({ timeFlag: false })
        }
      })
  };

  render() {
    const { isLoading, verifyCode, resendTime } = this.state
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.header}>
          <Spinner
            visible={isLoading}
            textContent={'Verifying...'}
            textStyle={{ color: 'white' }}
          />
          <View style={{ position: 'absolute', width: '50%', height: 200, right: 0, backgroundColor: Colors.authButton, zIndex: -1, }}></View>
          <View>
            <View style={{ backgroundColor: Colors.authButton, width: '100%', height: 120, borderBottomLeftRadius: 60, justifyContent: 'flex-end' }}>
              <View style={{ marginLeft: 60, marginBottom: 25 }}>
                <TextComponent xlarge heavy white>Email Verification</TextComponent>
              </View>
            </View>
            <View style={{ padding: 20, backgroundColor: 'white', width: '100%', borderTopRightRadius: 60 }}>
              <TextComponent medium heavy grey>Please enter 4 code you received on your Email</TextComponent>
              <TextComponent medium heavy grey></TextComponent>

              <View style={{ height: 120, justifyContent: 'space-between' }}>
                <CodeInput
                  ref="codeInputRef2"
                  keyboardType="number-pad"
                  className='border-box'
                  // compareWithCode={verifyCode}
                  secureTextEntry={false}
                  activeColor="rgba(49, 180, 4, 1)"
                  inactiveColor="rgba(49, 180, 4, 0.3)"
                  autoFocus={true}
                  codeLength={4}
                  ignoreCase={true}
                  inputPosition="center"
                  containerStyle={{ marginTop: 30 }}
                  codeInputStyle={{ borderWidth: 1.5 }}
                  onFulfill={(otp) => this._onVerifyOTP(otp)}
                // onFulfill={(compareWithCode, code) => this._onVerifyOTP(compareWithCode)}
                />
                <View style={styles.textContainer}>
                  <Text> Didn't Receive code? </Text>
                  {
                    resendTime > 0 ?
                      <Text style={{ marginBottom: 5 }}>resend in <TextComponent darkred> {resendTime} </TextComponent>s</Text>
                      :
                      <TouchableOpacity onPress={() => { this._resend(); }}>
                        <Text style={styles.decor_underline}> Tap here to resend </Text>
                      </TouchableOpacity>
                  }

                </View>
              </View>

            </View>
          </View>

        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flex: 1,
    justifyContent: 'space-between'
  },
  switch: {
    alignItems: "center",
    justifyContent: 'center',
    width: '15%'
  },
  chkbox: {
    padding: 10,
    width: '10%',
  },
  box: {
    padding: 15,
    flexDirection: 'row',
    alignItems: "center",
    height: 70,
    borderRadius: 35
  },
  boxContainer: {
    width: '100%',
    borderRadius: 5,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 10,
    elevation: 15,
  },
  textContainer: {
    marginTop: 50,
    width: '90%',
    marginLeft: '5%',
    flexDirection: 'row',
    marginTop: 50,
    paddingVertical: 5
  },
  decor_underline: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    color: Colors.authButton
  },
})