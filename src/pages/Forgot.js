import React, { Component } from 'react';
import { Text, View, ScrollView, StatusBar, SafeAreaView, StyleSheet, Image, TouchableOpacity, Keyboard, Dimensions, Alert } from 'react-native';
import TextComponent from '../components/TextComponent'
import CustomTextInput from '../components/CustomTextInput'
import AuthButton from '../components/AuthButton'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Colors'
import config, { BASE_PATH } from "../api/config";
import Spinner from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient'

const { height, width } = Dimensions.get('window')
const logo = require('../assets/images/logo.png')
let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default class Forgot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      confirmPassword: '',
      isLoading: false,
      passwordShow: false,
      unRegistered: false,
      timeFlag: false,
      id: '',
      emailSent: false
    };
  }
  _onChangeHandle = (type, text) => {
    this.setState({
      [type]: text
    })
  }
  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false
    })
    Alert.alert('Warning', 'network error')
  }
  _onSend = () => {
    // console.log('Email sent');
    const { email, timeFlag } = this.state
    Keyboard.dismiss()
    if (email == "") {
      Alert.alert('Warning', 'Please enter email')
    } else if (reg.test(email) === false) {
      Alert.alert('Warning', 'Email syntax error')
    } else {
      var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 8000)
      this.setState({ isLoading: true })
      fetch(config.auth.forgotpwd, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Auth-Key': 'simplerestapi'
        },
        body: `email=${email}`
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          this.setState({ isLoading: false })
          clearTimeout(myTimer)
          // console.log('status =>', responseJson['status']);
          if (responseJson['status'] == 200) {
            this.setState({
              passwordShow: true,
              id: responseJson['id'],
              emailSent: true,
              unRegistered: false
            })
          } else {
            this.setState({ unRegistered: true })
          }
        })
        .catch((err) => {
          // console.log('JSON.stringify(err)=>', err);
          if (!timeFlag) {
            this.setState({ isLoading: false })
            Alert.alert('Warning', "Network Error!")
            clearTimeout(myTimer);
          } else {
            this.setState({ timeFlag: false, isLoading: false })
          }
        })
    }
  }
  _onReset = () => {
    // console.log('password reset');
    const { password, confirmPassword, id, timeFlag } = this.state
    Keyboard.dismiss()
    if (password == "") {
      Alert.alert('Warning', 'Please enter password')
    } else if (confirmPassword == "") {
      Alert.alert('Warning', 'Please enter confirm password')
    } else if (password != confirmPassword) {
      Alert.alert('Warning', "Confirm password doesn't match password")
    } else {
      let details = {
        'id': id,
        'password': password
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
      fetch(config.auth.resetpwd, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Auth-Key': 'simplerestapi'
        },
        body: formBody
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          this.setState({ isLoading: false })
          clearTimeout(myTimer)
          // console.log('status =>', responseJson['status']);
          if (responseJson['status'] == 200) {
            Alert.alert('Warning', responseJson['message'])
            this.props.navigation.navigate('Login')
          } else {
            Alert.alert('Warning', 'Reset password failed')
          }
        })
        .catch((err) => {
          // console.log('JSON.stringify(err)=>', err);
          if (!timeFlag) {
            if (err.message == "Request failed with status code 401") {
              this.setState({ isLoading: false })
              Alert.alert('Warning', "Network Error!")
            }
            clearTimeout(myTimer);
          } else {
            this.setState({ timeFlag: false })
          }
        })
    }
  }
  _onSignIn = () => {
    this.props.navigation.navigate('Login')
  }

  render() {
    const { email, password, confirmPassword, passwordShow, unRegistered } = this.state
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.authButton, }}>
        <LinearGradient colors={[Colors.authButton, Colors.authButtonTr]} style={{ position: 'absolute', width: '100%', height: '120%' }} />
        <Spinner
          visible={this.state.isLoading}
          textContent={'Loading...'}
          textStyle={{ color: 'white' }}
        />
        <StatusBar hidden />
        <TouchableOpacity style={{ position: 'absolute', top: 20, left: 20 }} activeOpacity={0.7} onPress={() => this.props.navigation.goBack()}>
          <Ionicons name={Platform.OS === "android" ? 'arrow-back' : 'arrow-back'} size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.title}>
          <TextComponent white title>makeabl</TextComponent>
          <Image source={logo} style={styles.logo} />
        </View>
        <View style={{ width: '100%', alignItems: "center" }}>
          <View style={styles.whiteboard}>
            <View style={unRegistered ? styles.redbac : styles.greenbac}>
              {
                unRegistered ?
                  <Text style={{ color: Colors.redCha }}>Unregistered Email!</Text>
                  :
                  this.state.emailSent ?
                    <Text style={{ color: Colors.greenCha }}>Please enter new password</Text>
                    :
                    <Text style={{ color: Colors.greenCha }}>Please enter your Email!</Text>
              }
            </View>
            <TextComponent>Email</TextComponent>
            <CustomTextInput inputData={{
              value: email,
              type: 'email',
              onChangeHandle: this._onChangeHandle,
              placeholder: 'Enter email',
              editable: !this.state.emailSent
            }} />
            {
              passwordShow &&
              <>
                <CustomTextInput inputData={{
                  value: password,
                  type: 'password',
                  onChangeHandle: this._onChangeHandle,
                  placeholder: 'Enter password',
                }} />
                <CustomTextInput inputData={{
                  value: confirmPassword,
                  type: 'confirmPassword',
                  onChangeHandle: this._onChangeHandle,
                  placeholder: 'Re-enter password',
                }} />
              </>
            }

            <View style={{ width: '50%', alignSelf: "center" }}>
              <AuthButton title={passwordShow ? "Reset" : "Send"} onPress={() => { passwordShow ? this._onReset() : this._onSend() }} />
            </View>

            <View style={styles.forgot}>
              <TextComponent>Remember It? </TextComponent>
              <TouchableOpacity onPress={() => this._onSignIn()} style={{ marginTop: 5 }}>
                <TextComponent main heavy xmedium>Sign In here</TextComponent>
              </TouchableOpacity>
            </View>
            <View style={styles.forgot2}>
              <TextComponent> © 2020 makeabl </TextComponent>
              <Image source={logo} style={styles.logo2} />
            </View>
          </View>
        </View>

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bgImage: {
    width: '100%',
    height: '100%',
    alignItems: "center",
  },
  title: {
    width: '100%',
    justifyContent: 'center',
    alignItems: "center",
    flexDirection: 'row',
    marginTop: 60,
    marginLeft: 20
  },
  logo: {
    width: 40,
    height: 42,
    marginLeft: -5,
    marginTop: -30
  },
  logo2: {
    width: 20,
    height: 21,
    marginLeft: -5,
    marginTop: -15
  },
  forgot: {
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 20,
  },
  forgot2: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 20,
  },
  multi: {
    width: '100%',
    borderRadius: 20,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    paddingLeft: 15,
    marginTop: 7,
    marginBottom: 15,
    justifyContent: 'center',
  },
  whiteboard: {
    width: '92%',
    paddingHorizontal: 25,
    paddingVertical: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 20,
  },
  whiteboard2: {
    width: '92%',
    paddingHorizontal: 25,
    paddingVertical: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 20,
    height: height - 175
  },
  greenbac: {
    alignItems: "center",
    backgroundColor: Colors.greenBac,
    padding: 20,
    borderRadius: 5,
    marginBottom: 20
  },
  redbac: {
    alignItems: "center",
    backgroundColor: Colors.redBac,
    padding: 20,
    borderRadius: 5,
    marginBottom: 20
  }
})