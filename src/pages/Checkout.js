import React, { Component } from 'react';
import { Image, View, ScrollView, StyleSheet, SafeAreaView, StatusBar, Dimensions, TouchableOpacity, Alert } from 'react-native';
import TextComponent from '../components/TextComponent'
import CustomTextInput from '../components/CustomTextInput'
import Colors from '../constants/Colors'
import Card from '../components/Card'
import AuthButton from '../components/AuthButton';
import CountryPicker from 'react-native-country-picker-modal';
import IntlPhoneInput from 'react-native-intl-phone-input';
import axios from 'axios';
import config from '../api/config';
import Credendials from '../constants/Credentials'
import qs from 'qs';
import { decode, encode } from 'base-64';
import PriceList from '../constants/PriceList';
import { WebView } from 'react-native-webview'
import FlashMessage, { showMessage } from 'react-native-flash-message';
import OneSignal from 'react-native-onesignal';
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-community/async-storage';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

const { width, height } = Dimensions.get('window')
const check = require('../assets/images/check.png')
const uncheck = require('../assets/images/uncheck.png')

class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isChecked: true,
      shippingFee: 0,
      address: '',
      name: '',
      phone: '',

      countryCode: 'HK',
      country: 'HongKong',
      withFilter: true,
      withFlag: true,
      withCountryNameButton: true,
      withAlphaFilter: true,
      withCallingCode: true,
      withEmoji: true,
      symbol: "$",
      totalPrice: 0,
      approvalUrl: '',
      site_id: 0,
      isChecking: false,
      myHeaders: {},
      accessToken: ''
    };
    OneSignal.addEventListener('received', this.onReceived);

  }

  componentDidMount = async () => {
    let symbol = this.props.navigation.getParam('symbol')
    let totalPrice = this.props.navigation.getParam('totalPrice')
    let currency_rate = this.props.navigation.getParam('currency_rate')
    let site_id = this.props.navigation.getParam('site_id')
    let userID = await AsyncStorage.getItem('userID')
    let userToken = await AsyncStorage.getItem('userToken')
    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': userToken.replace(/['"]+/g, ''),
      'User-ID': userID.replace(/['"]+/g, '')
    }
    await this.setState({
      symbol: symbol,
      totalPrice: totalPrice,
      currency_rate: currency_rate,
      site_id: site_id,
      myHeaders: myHeaders
    })

    fetch(config.auth.token, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then(response => response.json())
      .then((res) => {
        if (res['status'] == 201) {
          this.props.navigation.navigate('Login')
        } 
      })
      .catch((error) => {
        console.log('token_error=>', error)
      })
    
    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      setTimeout(() => {
        if (userToken == "") {
          this.props.navigation.navigate('Auth')
        }
      }, 5000);
    });
  }

  componentWillUnmount() {
    this.focusListener.remove()
    OneSignal.removeEventListener('received', this.onReceived);

  }

  onReceived(notification) {
    showMessage({
      message: `${notification.payload.body}`,
      type: "success",
    });
  }
  _onChangeHandle = (type, text) => {
    this.setState({
      [type]: text
    })
  }

  onChangeMobile = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
    if (isVerified) {
      this.setState({
        phone: dialCode + unmaskedPhoneNumber,
        phoneNumberIsVerified: 'true'
      })
    } else this.setState({ phoneNumberIsVerified: 'false' })
  };

  _onPay = () => {
    this.setState({ isChecking: true })
    const url = 'https://api-m.paypal.com/v1/oauth2/token';
    const data = {
      grant_type: 'client_credentials',
    };
    const auth = {
      username: Credendials.username,
      password: Credendials.password,
    };
    const options = {
      method: 'post',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Credentials': true,
      },
      data: qs.stringify(data),
      auth: auth,
      url,
    };
    const details = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "transactions": [{
        "amount": {
          // "total": 0.01,
          "total": (this.state.totalPrice + priceList.shippingFee) * this.state.currency_rate,
          "currency": "USD",
          "details": {
            // "subtotal": 0.01,
            "subtotal": this.state.totalPrice * this.state.currency_rate,
            "tax": "0",
            // "shipping": "0",
            "shipping": priceList.shippingFee,
            "handling_fee": "0",
            "shipping_discount": "0",
            "insurance": "0"
          }
        }
      }],
      "redirect_urls": {
        "return_url": "https://example.com/return",
        "cancel_url": "https://example.com/cancel"
      },
    }

    axios(options)
      .then((response) => {
        // console.log('-----response-----', response.data.access_token);
        this.setState({
          accessToken: response.data.access_token
        })
        axios.post('https://api-m.paypal.com/v1/payments/payment', details, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${response.data.access_token}`,
          },
        })
          .then((response) => {
            this.setState({ isChecking: false })
            const { id, links } = response.data;
            const approvalUrl = links.find(
              (data) => data.rel == 'approval_url',
            );
            // console.log('---------id------------', id, response.data);
            // console.log('---------approve---------', approvalUrl);
            this.setState({
              paymentId: id,
              approvalUrl: approvalUrl.href
            })
          })
          .catch((err) => {
            // console.log('------error2222------', { ...err });
            Alert.alert('Warning', 'Something went wrong.')
            this.setState({ isChecking: false })
          });
      })
      .catch((err) => {
        // console.log('------error111------', err);
        Alert.alert('Warning', 'Something went wrong.')
        this.setState({ isChecking: false })
      });
  };

  _onNavigationStateChange = (webViewState) => {
    // console.log('webViewState-----------------------', webViewState);
    if (webViewState.url.includes('https://example.com/')) {

      // const { PayerID, paymentId } = webViewState.url
      const paymentId = webViewState.url.substring(37, webViewState.url.indexOf('&token'))
      const PayerID = webViewState.url.substring(webViewState.url.indexOf('&PayerID=') + 9)
      // console.log('--------PayerID--------', PayerID);
      // console.log('--------paymentId--------', paymentId);
      // axios.post(`https://api.paypal.com/v1/payments/payment/${paymentId}/execute`, { payer_id: PayerID },
      axios.post(`https://api-m.paypal.com/v1/payments/payment/${paymentId}/execute`, { payer_id: PayerID },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      )
        .then((response) => {
          this.setState({
            approvalUrl: null
          })
          // console.log('-----------transaction response----------');
          let txn_id = response.data.transactions[0].related_resources[0].sale.id
          let payment_amount = response.data.transactions[0].related_resources[0].sale.amount.total
          let payer_email = response.data.payer.payer_info.email
          let payer_status = response.data.transactions[0].related_resources[0].sale.state
          this.orderHandler(txn_id, payment_amount, payer_email, payer_status);
        })
        .catch(err => {
          // console.log('=======Start========')
          // console.log(err)
          // console.log('=======End  ========')
        })
    }
  }

  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false,
    });
    // Alert.alert('Warning', 'network error');
    // console.log('NetworkSensor');
  };

  orderHandler = (txn_id, payment_amount, payer_email, payer_status) => {
    const { myHeaders, timeFlag } = this.state;
    this.setState({ isLoading: true })
    let details = {
      'isDelivery': this.state.shippingFee == 0 ? 0 : 1,
      'total_price': this.state.totalPrice,
      'site_id': this.state.site_id,
      'name': this.state.name,
      'phone': this.state.phone,
      'address': this.state.address,
      'country': this.state.country,
      'txn_id': txn_id,
      'payment_amount': payment_amount,
      'payer_email': payer_email,
      'payer_status': payer_status,
    };
    var myTimer = setTimeout(
      function () {
        this.NetworkSensor();
      }.bind(this),
      15000,
    );

    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    // console.log('formBody=>', typeof (formBody));
    // console.log('myHeaders=>', myHeaders);
    try {
      fetch(config.api.orderAdd, {
        method: 'POST',
        headers: this.state.myHeaders,
        body: formBody,
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          this.setState({ isLoading: false });
          clearTimeout(myTimer);
          // console.log('responseJson ==================>', responseJson);
          if (responseJson['status'] == 200) {
            // console.log('======= success ======');
            this.props.navigation.push('Account', {
              Digital: 'orderHistory',
            });
            // console.log('====******==');
          } else {
            // console.log('Something went wrong.');
          }
        })
        .catch((err) => {
          // console.log('err=====================>', err);
          clearTimeout(myTimer);
          if (!timeFlag) {
            this.setState({ isLoading: false });
            // Alert.alert('Warning', "Network Error!")
          } else {
            this.setState({ timeFlag: false });
          }
        });
    } catch (error) {
      // console.log({ ...error });
      Alert.alert('Warning', 'Network error. Please try again')
    }

  };

  render() {
    const { isChecked,
      name,
      phone,
      address,
      countryCode,
      withFilter,
      withFlag,
      withCountryNameButton,
      withAlphaFilter,
      withCallingCode,
      withEmoji,
      approvalUrl
    } = this.state

    const onSelect = (country) => {
      console.log(country.name);
      this.setState({
        countryCode: country.cca2,
        country: country.name
      })
    }
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.isChecking}
          textContent={'Loading...'}
          textStyle={{ color: 'white' }}
        />
        {
          !approvalUrl ?
            <>
              <StatusBar hidden />
              <FlashMessage position="bottom" duration={5500} animationDuration={700} icon="success" />
              <ScrollView>
                <View style={styles.main}>
                  <TextComponent text large heavy>CHECKOUT</TextComponent>
                  <TouchableOpacity style={styles.address} onPress={() => this.setState({ isChecked: true, shippingFee: 0 })}>
                    <Image source={isChecked ? check : uncheck} style={{ width: 25, height: 25, marginHorizontal: 20, marginVertical: 10 }} resizeMode="contain" />
                    <View>
                      <TextComponent heavy medium>Pick up at site</TextComponent>
                      {/* <TextComponent grey medium>{site_name}</TextComponent> */}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.address} onPress={() => this.setState({ isChecked: false, shippingFee: PriceList.shippingFee })}>
                    <Image source={!isChecked ? check : uncheck} style={{ width: 25, height: 25, marginHorizontal: 20, marginVertical: 10 }} resizeMode="contain" />
                    <View>
                      <TextComponent heavy medium>Shipping</TextComponent>
                      {/* <TextComponent grey medium>From {site_name}</TextComponent> */}
                    </View>
                  </TouchableOpacity>
                  {
                    !isChecked &&
                    <Card>

                      <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 20 }}>
                        <TextComponent text>Name</TextComponent>
                        <CustomTextInput inputData={{
                          value: name,
                          type: 'name',
                          onChangeHandle: this._onChangeHandle,
                          placeholder: 'Enter Name',
                        }} />
                      </View>

                      <View style={{ width: '100%', paddingHorizontal: 20, }}>
                        <TextComponent>Mobile</TextComponent>
                        <View style={{ marginTop: 7, marginBottom: 15 }}>
                          <IntlPhoneInput
                            defaultCountry="HK"
                            onChangeText={this.onChangeMobile}
                            phoneInputStyle={{ fontSize: 15, padding: 0 }}
                            flagStyle={{ fontSize: 22, padding: 0 }}
                            dialCodeTextStyle={{ paddingLeft: 15 }}
                            placeholder="Enter mobile number"
                            containerStyle={styles.phoneContainer}
                            disableCountryChange={isChecked}
                          />
                          {/* {this.state.phoneNumberIsVerified == 'false' && (
                    <Text style={{ color: 'red' }}>invalid phone number!</Text>
                  )} */}
                        </View>
                      </View>

                      <View style={{ width: '60%', padding: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TextComponent style={{ marginTop: 0 }}>Country  </TextComponent>
                        <CountryPicker
                          {...{
                            countryCode,
                            withFilter,
                            withFlag,
                            withCountryNameButton,
                            withAlphaFilter,
                            withCallingCode,
                            withEmoji,
                            onSelect
                          }}
                          style={{ width: width * 0.2 }}
                        />
                        {/* {country !== null && (
                    <TextComponent>zzz{JSON.stringify(country, null, 2)}</TextComponent>
                  )} */}
                      </View>

                      <View style={{ width: '100%', paddingHorizontal: 20, }}>
                        <TextComponent text>Address</TextComponent>
                        <CustomTextInput inputData={{
                          value: address,
                          type: 'address',
                          onChangeHandle: this._onChangeHandle,
                          placeholder: 'Enter Address',
                        }} />
                      </View>
                    </Card>
                  }


                  <View style={{ backgroundColor: 'white', padding: 15, marginVertical: 30, elevation: 5, borderRadius: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                      <TextComponent>Shipping fee</TextComponent>
                      <TextComponent>{this.state.symbol}{this.state.shippingFee}</TextComponent>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                      <TextComponent>Sub total</TextComponent>
                      <TextComponent>{this.state.symbol}{this.state.totalPrice}</TextComponent>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 }}>
                      <TextComponent>Total</TextComponent>
                      <TextComponent>{this.state.symbol}{this.state.totalPrice + this.state.shippingFee}</TextComponent>
                    </View>
                  </View>
                  <AuthButton title="Payment" onPress={() => this._onPay()} />


                </View>
              </ScrollView>

            </>
            :
            <View style={{ flex: 1 }}>
              <WebView
                style={{ height: height, width: width }}
                source={{ uri: approvalUrl }}
                onNavigationStateChange={this._onNavigationStateChange}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                style={{ marginTop: 20 }}
              />
            </View>
        }

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0fa',
    marginTop: 15
  },
  main: {
    flex: 1,
    width: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  address: {
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    borderRadius: 10,
    elevation: 5,
    paddingVertical: 7,
    marginVertical: 7,
    alignItems: 'center',
  },
  cardArea: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width
  },
  phoneContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 21,
    borderColor: Colors.borderColor,
    borderWidth: 1
  },
})
export default Checkout;
