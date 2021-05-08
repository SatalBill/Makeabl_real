import React, { Component, useEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  Platform,
  TextInput,
  Alert
} from 'react-native';
import TextComponent from '../components/TextComponent';
import CustomTextInput from '../components/CustomTextInput';
import AuthButton from '../components/AuthButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Colors';
import config, { BASE_PATH } from '../api/config';
import Spinner from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-simple-toast';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import RNPickerSelect from "react-native-picker-select";

const { height, width } = Dimensions.get('window');
const logo = require('../assets/images/logo.png');
let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
// lowercase, uppercase, one numeric digit, one special character
let reg_strong = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/;
// numeric digit, uppercase, lowercase
let reg_average = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30}$/;

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      push_token: '',
      confirmPassword: '',
      isRegister: false,
      selectedItems: [],
      isLoading: false,
      userID: '',
      timeFlag: false,
      userToken: '',
      array: [],
      site: [],
      siteTemp: [],
      qr_site: [],
      face_site: [],
      showPassword: false,
      isFaceSite: true,
      site_id: '',
    };
  }

  componentDidMount = () => {
    this.start();
  };

  start = async () => {
    this.getSite()
    const push_token = (await AsyncStorage.getItem('push_token')).toString()
    // console.log('push_token=>', push_token);
    this.setState({
      push_token: push_token
    })
  }

  getSite = () => {
    // console.log('getSite');
    fetch(config.auth.getSite, {
      method: 'GET',
      headers: {
        'Auth-Key': 'simplerestapi',
      },
    })
      .then((res) => res.json())
      .then((responseJSON) => {
        // console.log('reg_site_list=>', responseJSON);
        responseJSON['site_list'].map((item, i) => {
          if (item != '') {
            let obj = {};
            obj.label = item.title;
            obj.value = item.id;
            this.state.siteTemp.push(obj);
          }
        });
        this.setState({ site: this.state.siteTemp });
      })
      .catch((err) => {
        // console.log('catchErr=>', err);
      });
  };

  onChangeHandle = (type, text) => {
    this.setState({
      [type]: text,
    });
  };

  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false,
    });
    Alert.alert('Warning', 'Network error');
  };

  loginHandle = async () => {
    // console.log('login');
    const { email, password, timeFlag, push_token } = this.state;
    // console.log(this.state.push_token);
    Keyboard.dismiss();
    if (email == '') {
      Alert.alert('Warning', 'Please enter email');
    } else if (password == '') {
      Alert.alert('Warning', 'Please enter password');
    } else if (reg.test(email) === false) {
      Alert.alert('Warning', 'Email syntax error');
    } else {
      let details = {
        email: email,
        password: password,
        push_token: push_token,
        push_os: 1,
      };
      var myTimer = setTimeout(
        function () {
          this.NetworkSensor();
        }.bind(this),
        25000,
      );
      this.setState({ isLoading: true });

      let formBody = [];
      for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + '=' + encodedValue);
      }
      formBody = formBody.join('&');
      // console.log(formBody);
      fetch(config.auth.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Auth-Key': 'simplerestapi',
        },
        body: formBody,
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          if (!this.state.timeFlag) {
            this.setState({ isLoading: false });
            clearTimeout(myTimer);
            // console.log('status =>', responseJson['status']);
            if (responseJson['status'] == 200) {
              await AsyncStorage.setItem('userID', JSON.stringify(responseJson['id']));
              await AsyncStorage.setItem('userToken', JSON.stringify(responseJson['token']));
              await AsyncStorage.setItem('photoURL', responseJson['photo_url'] == '' || responseJson['photo_url'] == null ? 'emptyPhoto' : JSON.stringify(responseJson['photo_url']));
              await AsyncStorage.setItem('qrURL', responseJson['qr_url'] == '' || responseJson['qr_url'] == null ? 'emptyQR' : JSON.stringify(responseJson['qr_url']));
              await AsyncStorage.setItem('email', JSON.stringify(responseJson['email']));
              await AsyncStorage.setItem('mobile', responseJson['mobile'] == '' || responseJson['mobile'] == null ? 'No mobile' : JSON.stringify(responseJson['mobile']));
              await AsyncStorage.setItem('address', responseJson['address'] == '' || responseJson['address'] == null ? 'No address' : JSON.stringify(responseJson['address']));
              this.props.navigation.navigate('App');
            } else if (responseJson['status'] == 204) {
              setTimeout(() => { Alert.alert('Warning', 'Wrong email or password') }, 100);
            } else if (responseJson['status'] == 205) {
              Toast.showWithGravity('No activated. Please verify your email.', Toast.LONG, Toast.TOP);
              await AsyncStorage.setItem('userID', JSON.stringify(responseJson['id']));
              await AsyncStorage.setItem('userToken', JSON.stringify(responseJson['token']));
              this.props.navigation.navigate('Verify');
            } else if (responseJson['status'] == 206) {
              Toast.showWithGravity('No photo. Please upload your photo', Toast.LONG, Toast.TOP);
              await AsyncStorage.setItem('userID', JSON.stringify(responseJson['id']));
              await AsyncStorage.setItem('userToken', JSON.stringify(responseJson['token']));
              this.props.navigation.navigate('Register');
            } else if (responseJson['status'] == 207) {
              setTimeout(() => { Alert.alert('Warning', 'Your refund request is under pending status.') }, 100);
            }
          }
        })
        .catch((err) => {
          // console.log('Login Error=>', err);
          if (!timeFlag) {
            this.setState({ isLoading: false });
            Alert.alert('Warning', 'Network Error!');
            clearTimeout(myTimer);
          } else {
            this.setState({ timeFlag: false });
          }
        });
    }
  };

  registerHandle = async () => {
    const { email, password, timeFlag, site_id } = this.state;
    Keyboard.dismiss();
    if (this.state.email == '') {
      Toast.showWithGravity('Please enter email.', Toast.LONG, Toast.TOP);
    } else if (this.state.password == '') {
      Toast.showWithGravity('Please enter password.', Toast.LONG, Toast.TOP);
    } else if (reg_strong.test(password) === false) {
      Toast.showWithGravity(
        'Password must contain the following: \n' +
        'A lowercase letter\n' +
        'A capital letter\n' +
        'A number\n' +
        'A special character\n' +
        'Minimum 8 characters ',
        Toast.LONG,
        Toast.TOP,
      );
    } else if (reg.test(this.state.email) === false) {
      Toast.showWithGravity('Email syntax error.', Toast.LONG, Toast.TOP);
    } else if (this.state.confirmPassword == '') {
      Toast.showWithGravity('Re-enter password.', Toast.LONG, Toast.TOP);
    } else if (this.state.confirmPassword != this.state.password) {
      Toast.showWithGravity(
        'Passwords do not match. Please try again.',
        Toast.LONG,
        Toast.TOP,
      );
    } else if (this.state.site_id == '') {
      Toast.showWithGravity('Please select venue', Toast.LONG, Toast.TOP);
    } else {
      let details = {
        email: email,
        password: password,
        siteID: site_id,
      };
      var myTimer = setTimeout(
        function () {
          this.NetworkSensor();
        }.bind(this),
        30000,
      );
      this.setState({ isLoading: true });

      let formBody = [];
      for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + '=' + encodedValue);
      }
      formBody = formBody.join('&');
      // console.log(formBody);
      fetch(config.auth.register, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Auth-Key': 'simplerestapi',
        },
        body: formBody,
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          this.setState({ isLoading: false });
          clearTimeout(myTimer);
          if (responseJson['status'] == 200) {
            // console.log('responseJson===>', responseJson);
            await AsyncStorage.setItem('userID',JSON.stringify(responseJson['id']));
            await AsyncStorage.setItem('verifyCode',JSON.stringify(responseJson['verifyCode']));
            await AsyncStorage.setItem('isFace',JSON.stringify(responseJson['isFace']));
            this.props.navigation.navigate('Verify');
          } else if (responseJson['status'] == 207) {
            setTimeout(() => {
              Alert.alert('Warning', 'Email exists already');
            }, 100);
          }
        })
        .catch((err) => {
          // console.log('err =>', JSON.stringify(err));
          clearTimeout(myTimer);
          if (!timeFlag) {
            this.setState({ isLoading: false });
            Alert.alert('Warning', 'Network Error!!');
          } else {
            this.setState({ timeFlag: false });
          }
        });
    }
  };

  forgotPWD = () => {
    this.props.navigation.navigate('Forgot');
  };

  changeRoute = () => {
    this.setState({
      isRegister: !this.state.isRegister,
      email: '',
      password: '',
    });
  };

  _onChangeSite = (e) => {
    // console.log('site_id=>', e);
    this.setState({ site_id: e });
  };

  render() {
    const {
      email,
      password,
      confirmPassword,
      isRegister,
      site_id,
      showPassword,
      site,
    } = this.state;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.authButton }}>
        <LinearGradient
          colors={[Colors.authButton, Colors.authButtonTr]}
          style={{ position: 'absolute', width: '100%', height: '120%' }}
        />
        <Spinner
          visible={this.state.isLoading}
          textContent={'Loading...'}
          textStyle={{ color: 'white' }}
        />
        <StatusBar hidden />
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, left: 20 }}
          activeOpacity={0.7}
          onPress={() => this.props.navigation.navigate('Permissions')}>
          <Ionicons
            name={Platform.OS === 'android' ? 'arrow-back' : 'arrow-back'}
            size={28}
            color="white"
          />
        </TouchableOpacity>
        <View style={styles.title}>
          <TextComponent white title>
            makeabl
          </TextComponent>
          <Image source={logo} style={styles.logo} />
        </View>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={isRegister ? styles.whiteboard2 : styles.whiteboard}>
            <ScrollView style={{ width: '100%' }}>
              <TextComponent>Email</TextComponent>
              <CustomTextInput
                inputData={{
                  value: email,
                  type: 'email',
                  onChangeHandle: this.onChangeHandle,
                  placeholder: 'Enter email',
                }}
              />

              <TextComponent>Password</TextComponent>
              <View style={styles.pwd}>
                <TextInput
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingRight: 50,
                    letterSpacing: -0.5
                  }}
                  value={password}
                  keyboardType={'default'}
                  onChangeText={(password) => {
                    this.setState({ password });
                  }}
                  placeholder="Enter password"
                  secureTextEntry={showPassword ? false : true}
                />
                {isRegister && (
                  <TouchableOpacity
                    onPress={() => this.setState({ showPassword: !showPassword })}
                    style={styles.eye}>
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      color={'grey'}
                      size={24}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {password.length != 0 && isRegister && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: -15,
                  }}>
                  <View
                    style={{
                      ...styles.pwdStrong,
                      width: width * 0.6,
                      backgroundColor: 'grey',
                    }}>
                    <View
                      style={{
                        ...styles.pwdStrong,
                        backgroundColor:
                          reg_average.test(password) === false
                            ? 'red'
                            : reg_strong.test(password) === false
                              ? Colors.warning
                              : Colors.pwdStrong,
                        width:
                          reg_average.test(password) === false
                            ? width * 0.15
                            : reg_strong.test(password) === false
                              ? width * 0.3
                              : width * 0.6,
                      }}></View>
                  </View>
                  <TextComponent>
                    {reg_average.test(password) === false
                      ? ' Too weak'
                      : reg_strong.test(password) === false
                        ? ' Average'
                        : ' Strong'}
                  </TextComponent>
                </View>
              )}
              {isRegister && (
                <View>
                  <TextComponent>Confirm Password</TextComponent>
                  <CustomTextInput
                    inputData={{
                      value: confirmPassword,
                      type: 'confirmPassword',
                      onChangeHandle: this.onChangeHandle,
                      placeholder: 'Re-enter password',
                      borderColor:
                        password != confirmPassword
                          ? Colors.warning
                          : Colors.borderColor,
                    }}
                  />
                  {confirmPassword.length != 0 && (
                    <View style={{ marginTop: -15 }}>
                      <Text
                        style={{
                          color:
                            password == confirmPassword
                              ? Colors.pwdStrong
                              : 'red',
                        }}>
                        {password == confirmPassword
                          ? 'Great! Your passwords match. Please proceed to enter.'
                          : ' Passwords do not match. Please try again.'}
                      </Text>
                    </View>
                  )}

                  <TextComponent>Venue</TextComponent>
                  <View style={styles.pickerContainer}>
                    <RNPickerSelect
                      placeholder={{ label: 'Venue...', value: 0 }}
                      items={this.state.site ? this.state.site : []}
                      onValueChange={(item) => {
                        this._onChangeSite(item);
                      }}
                      style={{
                        ...pickerSelectStyles,
                        iconContainer: {
                          top: 10,
                          right: 12,
                        },
                      }}
                      value={site_id}
                      useNativeAndroidPickerStyle={false}
                      textInputProps={{ underlineColor: 'yellow' }}
                      Icon={() => {
                        return (
                          <Image
                            source={require('../assets/images/Icon.png')}
                            style={{
                              width: 20,
                              height: 20,
                              position: 'absolute',
                              right: 0,
                            }}
                          />
                        );
                      }}
                    />
                  </View>

                  {/* </View> */}
                </View>
              )}
              <View style={{
                width: '50%', alignSelf: 'center', shadowColor: 'black',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 2
              }}>
                <AuthButton
                  title={isRegister ? 'Register' : 'Login'}
                  onPress={() => {
                    isRegister ? this.registerHandle() : this.loginHandle();
                  }}
                />
              </View>
              {!isRegister && (
                <TouchableOpacity
                  onPress={() => {
                    this.forgotPWD();
                  }}
                  style={styles.forgot}>
                  <Icon name="lock" size={24} />
                  <TextComponent main heavy xmedium>
                    {' '}
                    Forgot your password?{' '}
                  </TextComponent>
                </TouchableOpacity>
              )}
              <View style={styles.forgot}>
                <TextComponent>
                  {isRegister ? 'Remember It?' : "Don't have an account?"}{' '}
                </TextComponent>
                <TouchableOpacity onPress={() => this.changeRoute()}>
                  <TextComponent main heavy xmedium>
                    {' '}
                    {isRegister ? 'Sign In here' : 'Sign up'}{' '}
                  </TextComponent>
                </TouchableOpacity>
              </View>
              <View style={styles.forgot2}>
                <TextComponent> © 2020 makeabl </TextComponent>
                <Image source={logo} style={styles.logo2} />
              </View>
            </ScrollView>
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
    alignItems: 'center',
  },
  title: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 60,
    marginLeft: 15,
  },
  logo: {
    width: 40,
    height: 42,
    marginLeft: -5,
    marginTop: -30,
  },
  logo2: {
    width: 20,
    height: 21,
    marginLeft: -5,
    marginTop: -15,
  },
  forgot: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  forgot2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  multi: {
    width: '100%',
    borderRadius: 20,
    borderColor: Colors.authButton,
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
    maxHeight: height - 200,
  },
  pwdStrong: {
    height: 5,
    borderRadius: 2.5,
  },
  pwd: {
    width: '100%',
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingLeft: 15,
    marginTop: 7,
    marginBottom: 15,
    borderColor: Colors.borderColor,
  },
  eye: {
    position: 'absolute',
    right: 10,
    top: 5,
  },
  switch: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '50%',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.authButton,
    borderRadius: 25,
    backgroundColor: 'white',
    marginBottom: 20,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    width: '100%',
  },
});
