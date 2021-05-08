import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import TextComponent from '../components/TextComponent';
import Colors, { shadeColor } from '../constants/Colors';
import AuthButton from '../components/AuthButton';
import { WebView } from 'react-native-webview';
import {
  FetchPackageInfo,
  FetchPackageCountry,
  FetchPackageSite,
} from '../actions/PackagePass/PackagePass';
import { connect } from 'react-redux';
import config, { amazon, BASE_PATH, PACKAGE_PATH } from '../api/config';
import FastImage from 'react-native-fast-image';
import RNPickerSelect from 'react-native-picker-select';
import LoadingItem from '../components/LoadingItem';
import DateTimePicker from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
// import PayPal from 'react-native-paypal-wrapper';
import AsyncStorage from '@react-native-community/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import Credendials from '../constants/Credentials';
import qs from 'qs';
import { decode, encode } from 'base-64';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import OneSignal from 'react-native-onesignal';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

const { width, height } = Dimensions.get('window');
const PAY_PAL_CLIENT_ID =
  'AUzLLjbL6PfskIo6zDSQXJbTxwNTpyYlpjXz9J_xOrtIazPdPMZWyIwDIR_bJx-4R0ksz8bTdZY2n5Rp';
const isAndroid = Platform.OS == 'android'

class PurchasePass extends Component {
  constructor(props) {
    super(props);
    this.state = {
      packageData: [],
      packageCountry_id: 0,
      packageSite_id: 0,
      packageCountry: [],
      packageSite: [],
      isLoading: true,
      isChecking: false,
      data: [
        { id: 1, empty: ' ' },
        { id: 2, empty: ' ' },
        { id: 3, empty: ' ' },
        { id: 4, empty: ' ' },
        { id: 5, empty: ' ' },
      ],
      loadMore: false,
      isVisible: false,
      from_date: '',
      to_date: '',
      isActive: 0,
      buyPrice: 0,
      buyValidity: 0,
      buyTitle: '',
      symbol: '',
      ISO: '',
      timeFlag: false,
      token: '',
      userID: '',
      myHeaders: '',
      package_country_id_temp: '',
      currency_rate: 1,
      accessToken: '',
      approvalUrl: '',
    };
    OneSignal.addEventListener('received', this.onReceived);
  }

  componentDidMount = async () => {
    // await this.props.FetchPackageInfo(0, 0);
    // await this.props.FetchPackageCountry();
    // await this.props.FetchPackageSite(0);
    let userID = await AsyncStorage.getItem('userID');
    let userToken = await AsyncStorage.getItem('userToken');
    await this.setState({ userID: userID, userToken: userToken });
    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': this.state.userToken.replace(/['"]+/g, ''),
      'User-ID': this.state.userID.replace(/['"]+/g, ''),
    };
    await this.setState({ myHeaders });

    fetch(config.auth.token, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then(response => response.json())
      .then((res) => {
        if (res['status'] == 201) {
          this.props.navigation.navigate('Login')
        } else this.start()
      })
      .catch((error) => {
        // console.log('token_error=>', error)
      })

    setTimeout(() => {
      this._onFetchPackageSite();
    }, 1000);
    
  };
  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);

  }
  onReceived(notification) {
    showMessage({
      message: `${notification.payload.body}`,
      type: "success",
    });
  }
  _onFetchPackageInfo = (siteID) => {
    fetch(config.api.getPackageInfo + '/' + siteID, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        await this.setState({
          packageData: responseJSON['package_list'],
          isLoading: false,
        });
      })
      .catch((err) => console.log('packageErr=>', err));
  };
  _onFetchPackageSite = () => {
    this.setState({ packageSiteTemp: [] });
    fetch(config.api.getPackageSite, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        // console.log('site_list=>>>>>>', responseJSON);
        this.setState({ isLoading: false });
        responseJSON['site_list'].map((item, i) => {
          if (item != '') {
            let obj = {};
            obj.label = item.title;
            obj.value = item.id;
            this.state.packageSiteTemp.push(obj);
          }
        });
        this.setState({ packageSite: this.state.packageSiteTemp });
      })
      .catch((err) => console.log('packageSiteErr=>', err));
  };

  start = () => {
    this._onFetchPackageInfo(0);
    // this._onFetchPackageSite()
  };

  _onChangeSite = async (e) => {
    this.setState({ packageSite_id: e, isLoading: true });
    // this.props.FetchPackageInfo(this.state.packageCountry_id, e)
    this._onFetchPackageInfo(e);
    // setTimeout(() => {
    //   this.setState({
    //     packageData: this.props.packageInfo ? this.props.packageInfo : '',
    //   })
    // }, 2500);
  };

  _checkPackage = (date) => {
    var ddate = new Date(date).getDate(); //To get the Current Date
    var month = new Date(date).getMonth() + 1; //To get the Current Month
    var year = new Date(date).getFullYear(); //To get the Current Year
    var srch_date = year + '-' + month + '-' + ddate + ' 08:00:00';

    // var selectedDay = new Date(date).getTime()
    // var srch_date = dayjs(selectedDay).format('YYYY-MM-DD hh:mm:ss')
    // console.log('srch_date=>', srch_date);
    fetch(config.api.checkPackage, {
      method: 'POST',
      headers: this.state.myHeaders,
      body: `srch_date=${srch_date}`,
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        // console.log(responseJSON);
        this.setState({ isChecking: false });
        if (responseJSON['status'] == 200) {
          this._onPay();
        } else {
          Alert.alert('Warning', 'You have already bought package on that day. Please select another date.');
        }
      });
  };

  _onConfirmPicker = (date) => {
    // console.log(date);
    var from_date = new Date(date).getTime();
    var to_date = new Date(date).getTime() + this.state.buyValidity * 60 * 60 * 1000; //Future date - current date
    this.setState({
      from_date: dayjs(from_date).format('YYYY-MM-DD'),
      to_date: dayjs(to_date).format('YYYY-MM-DD'),
      isVisible: false,
    });
    setTimeout(() => {
      this.setState({ isChecking: true })
      this._checkPackage(date);
    }, isAndroid ? 100 : 500);
  };

  // _onPay = () => {
  //   const options = {
  //     merchantName: 'sss',
  //     merchantPrivacyPolicyUri: 'https://example.com/privacy',
  //     merchantUserAgreementUri: 'https://example.com/useragreement',
  //   };
  //   PayPal.initialize(PayPal.NO_NETWORK, PAY_PAL_CLIENT_ID);
  //   PayPal.pay({
  //     price: `${this.state.buyPrice}`,
  //     // price: '0.1',
  //     // currency: `${this.state.ISO}`,
  //     currency: `USD`,
  //     description: `Digital Pass in ${this.state.buyPrice} ${this.state.ISO}`,
  //   })
  //     .then((confirm) => {
  //       console.log('confirm', confirm['response']);
  //       this.paymentHandler(
  //         this.state.packageID,
  //         this.state.from_date,
  //         this.state.to_date,
  //         this.state.buyValidity,
  //         confirm['response']['id'],
  //         confirm['response']['state'],
  //         'example@gmail.com',
  //         this.state.buyPrice,
  //       );
  //     })
  //     .catch((error) => {
  //       if (error.message !== 'User cancelled') {
  //         Alert.alert(error.message);
  //       }
  //       console.log(error);
  //     });
  // };

  _onPay = () => {
    // const url = 'https://api.sandbox.paypal.com/v1/oauth2/token';
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
        "payment_method": "paypal",
      },
      "transactions": [
        {
          "amount": {
            "total": this.state.buyPrice * this.state.currency_rate,
            // total: 0.01,
            "currency": "USD",
            "details": {
              // subtotal: 0.01,
              "subtotal": this.state.buyPrice * this.state.currency_rate,
              "tax": '0',
              "shipping": '0',
              "handling_fee": '0',
              "shipping_discount": '0',
              "insurance": '0',
            },
          },
        },
      ],
      "redirect_urls": {
        "return_url": 'https://example.com/return',
        "cancel_url": 'https://example.com/cancel',
      },
    };

    axios(options)
      .then((response) => {
        // console.log('-----response-----', response.data.access_token);
        this.setState({
          accessToken: response.data.access_token,
        });
        // axios.post('https://api.sandbox.paypal.com/v1/payments/payment', details, {
        axios
          .post('https://api-m.paypal.com/v1/payments/payment', details, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${response.data.access_token}`,
            },
          })
          .then((response) => {
            this.setState({ isChecking: false });
            const { id, links } = response.data;
            const approvalUrl = links.find(
              (data) => data.rel == 'approval_url',
            );

            // console.log('---------id------------', id, response.data);
            // console.log('---------approve---------', approvalUrl);

            // Linking.openURL(approvalUrl.href);

            this.setState({
              paymentId: id,
              approvalUrl: approvalUrl.href,
            });
          })
          .catch((err) => {
            // console.log('------error2222------', { ...err });
            Alert.alert('Warning', 'Something went wrong.');
            this.setState({ isChecking: false });
          });
      })
      .catch((err) => {
        // console.log('------error111------', err);
        Alert.alert('Warning', 'Something went wrong.');
        this.setState({ isChecking: false });
      });
  };

  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false,
    });
    Alert.alert('Warning', 'Network error');
  };

  paymentHandler = (id, from, to, validity, txnID, price, email, payStatus) => {
    // console.log('=====', id, from, to, validity, txnID, price, email, payStatus,);
    const { myHeaders, timeFlag } = this.state;
    let details = {
      package_id: id,
      from_date: from,
      to_date: to,
      validity: validity,
      txn_id: txnID,
      payment_amount: parseFloat(price).toFixed(2),
      payer_email: email,
      payment_status: payStatus,
    };
    var myTimer = setTimeout(
      function () {
        this.NetworkSensor();
      }.bind(this),
      15000,
    );
    this.setState({ isLoading: true });

    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    try {
      fetch(config.api.packageBuy, {
        method: 'POST',
        headers: myHeaders,
        body: formBody,
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          this.setState({ isLoading: false });
          clearTimeout(myTimer);
          // console.log('responseJson =>', responseJson);
          if (responseJson['status'] == 200) {
            // console.log('=============');
            Alert.alert('Warning', `${this.state.buyPrice}${this.state.ISO} was paid successfully!`);
            this.props.navigation.push('Account', {
              Digital: 'digitalHistory',
              from_date: this.state.from_date,
              to_date: this.state.to_date,
              buyPrice: this.state.buyPrice,
            });
            // console.log('====******==');
          }
        })
        .catch((err) => {
          // console.log('err=>', err);
          clearTimeout(myTimer);
          if (!timeFlag) {
            this.setState({ isLoading: false });
            // alert("Network Error!")
          } else {
            this.setState({ timeFlag: false });
          }
        });
    } catch (error) {
      // console.log({ ...error });
      Alert.alert('Warning', 'Network error. Please try again');
    }
  };

  _onCancelPicker = () => {
    this.setState({ isVisible: false });
  };

  _onBuyNow = async (item) => {
    await this.setState({
      isVisible: true,
      buyPrice: item.price,
      buyValidity: item.validity,
      buyTitle: item.title,
      symbol: item.symbol,
      ISO: item.iso_code,
      packageID: item.id,
      currency_rate: item.currency_rate,
    });
    // this.props.navigation.navigate('Paypal', { packageItem: item })
    // console.log(this.state.ISO);
    // console.log(this.state.ISO.toString());
  };

  renderPackages = ({ item }) => (
    <View style={{ marginVertical: 5, elevation: 10 }}>
      {/* <Image source={item.url} style={styles.package} resizeMode="cover" /> */}
      <FastImage
        style={styles.package}
        source={{
          uri: amazon + item.package.toString().split('\n')[0],
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}>
        <ActivityIndicator
          size="large"
          style={StyleSheet.absoluteFill}
          color={Colors.authButton}
          animating={item.package ? false : true}
        />
      </FastImage>
      <View
        style={{
          ...styles.blurView,
          borderLeftColor:
            item.title == 'Bronze Digital'
              ? shadeColor(Colors.bronze, 40)
              : item.title == 'Silver Digital'
                ? shadeColor(Colors.silver, 40)
                : item.title == 'Gold Digital'
                  ? shadeColor(Colors.gold, 40)
                  : Colors.authButton,
        }}>
        {
          Platform.OS == 'android' ?
            <>
              <TextComponent white heavy large>{item.title}</TextComponent>
              <TextComponent white heavy medium>{item.symbol} {item.price} ({item.validity} Hrs)</TextComponent>
              <TextComponent white heavy medium>{item.image == '' ? '∞' : item.image} Photos</TextComponent>
              <TextComponent white heavy medium>{item.video == '' ? '∞' : item.video} Videos</TextComponent>
            </>
            :
            <>
              <TextComponent white heavy xlarge>{item.title}</TextComponent>
              <TextComponent white heavy large>{item.symbol} {item.price} ({item.validity} Hrs)</TextComponent>
              <TextComponent white heavy large>{item.image == '' ? '∞' : item.image} Photos</TextComponent>
              <TextComponent white heavy large>{item.video == '' ? '∞' : item.video} Videos</TextComponent>
            </>
        }
      </View>

      <View
        style={{ position: 'absolute', width: width * 0.3, top: 15, right: 10 }}>
        <AuthButton
          title="Buy Now"
          onPress={() => {
            this._onBuyNow(item);
          }}
        />
      </View>
    </View>
  );

  renderItem = ({ item }) => {
    return (
      <LoadingItem index={item.index}>
        <View style={{ backgroundColor: '#0002', padding: 20, borderRadius: 10 }}>
          <View style={styles.short}></View>
          <View style={styles.long}></View>
          <View style={styles.short}></View>
          <View style={styles.long}></View>
        </View>
        <View
          style={{
            width: 100,
            height: 42,
            backgroundColor: '#999',
            borderRadius: 21,
            position: 'absolute',
            top: 20,
            right: 20,
          }}></View>
      </LoadingItem>
    );
  };

  renderFooter = () => {
    return this.state.loadMore ? <ActivityIndicator size={'large'} /> : null;
  };

  handleLoadMore = () => {
    console.log('handle Load More.');
  };

  _onNavigationStateChange = (webViewState) => {
    console.log('webViewState-----------------------', webViewState);
    if (webViewState.url.includes('https://example.com/')) {
      this.setState({
        approvalUrl: null,
      });
      // const { PayerID, paymentId } = webViewState.url
      const paymentId = webViewState.url.substring(
        37,
        webViewState.url.indexOf('&token'),
      );
      const PayerID = webViewState.url.substring(
        webViewState.url.indexOf('&PayerID=') + 9,
      );
      console.log('--------PayerID--------', PayerID);
      console.log('--------paymentId--------', paymentId);
      // axios.post(`https://api.paypal.com/v1/payments/payment/${paymentId}/execute`, { payer_id: PayerID },
      axios
        .post(
          `https://api-m.paypal.com/v1/payments/payment/${paymentId}/execute`,
          { payer_id: PayerID },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.state.accessToken}`,
            },
          },
        )
        .then((response) => {
          // let txn_id = response['data']['transactions'][0]['related_resources'][0]['sale']['id']
          let req_id = response.data.id
          let txn_id = response.data.transactions[0].related_resources[0].sale.id
          let payment_amount = response.data.transactions[0].related_resources[0].sale.amount.total
          let payer_email = response.data.payer.payer_info.email
          let payer_status = response.data.transactions[0].related_resources[0].sale.state
          this.paymentHandler(
            this.state.packageID,
            this.state.from_date,
            this.state.to_date,
            this.state.buyValidity,
            txn_id,
            payment_amount,
            payer_email,
            payer_status,
          );
          console.log('-----------req_id------------', req_id);
          console.log('-----------txn_id------------', txn_id);
        })
        .catch((err) => {
          console.log('=======Start========');
          // console.log({ ...err })
          console.log(err);
          console.log('=======End========');
        });
    }
  };

  render() {
    const { packageData, isVisible, packageSite, approvalUrl } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        {!approvalUrl ? (
          <>
            <StatusBar hidden />
            <FlashMessage position="bottom" duration={5500} animationDuration={700} icon="success" />
            <DateTimePicker
              isVisible={isVisible}
              mode="date"
              onConfirm={this._onConfirmPicker}
              onCancel={this._onCancelPicker}
            />
            <Spinner
              visible={this.state.isChecking}
              textContent={'Checking...'}
              textStyle={{ color: 'white' }}
            />
            <View style={styles.main}>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 30,
                  justifyContent: 'center',
                }}>
                <View style={{ ...styles.pickerContainer3, marginVertical: 5 }}>
                  <RNPickerSelect
                    placeholder={{ label: 'site...', value: 0 }}
                    items={this.state.packageSite}
                    onValueChange={(value) => {
                      this._onChangeSite(value);
                    }}
                    style={{
                      ...pickerSelectStyles,
                      iconContainer: {
                        top: 10,
                        right: 12,
                      },
                    }}
                    value={this.state.packageSite_id}
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
              </View>
              <View style={{ marginTop: 20, height: isAndroid ? height - 200 : height - 250 }}>
                {this.state.isLoading ? (
                  <FlatList
                    data={this.state.data}
                    renderItem={this.renderItem.bind(this)}
                    keyExtractor={(item, index) => index.toString()}
                  />
                ) : (
                    <FlatList
                      vertical
                      showsVerticalScrollIndicator={false}
                      data={this.state.packageData ? this.state.packageData : []}
                      renderItem={this.renderPackages}
                      keyExtractor={(item, index) => index.toString()}
                    // ListFooterComponent={this.renderFooter}
                    // onEndReached={this.handleLoadMore}
                    // onEndReachedThreshold={0}
                    />
                  )}
              </View>
            </View>
          </>
        ) : (
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
          )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0fa',
    marginTop: 20
  },
  main: {
    flex: 1,
    width: '92%',
    paddingTop: 10,
    marginLeft: '4%',
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    width: '45%',
    marginLeft: '2.5%',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 20,
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  pickerContainer3: {
    width: '90%',
    borderWidth: 1,
    borderColor: Colors.authButton,
    borderRadius: 20,
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  buynow: {
    backgroundColor: Colors.authButton,
    borderRadius: 5,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: -15,
  },
  package: {
    width: width * 0.92,
    height: width * 0.5,
    borderRadius: 20,
  },
  blurView: {
    position: 'absolute',
    marginTop: width * 0.11,
    marginLeft: 20,
    backgroundColor: '#0007',
    paddingHorizontal: 10,
    borderRadius: 10,
    borderLeftWidth: 5,
    paddingVertical: 10
    // borderTopWidth: 10,
    // borderBottomWidth: 10,
    // borderTopColor: '#0007',
    // borderBottomColor: '#0007',
  },
  short: {
    width: width * 0.2,
    height: 12,
    backgroundColor: '#72777B',
    borderRadius: 6,
    marginTop: 12,
  },
  long: {
    width: width * 0.3,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginTop: 12,
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

const mapStateToProps = (state) => {
  return {
    packageInfo: state.package.packageInfo,
    packageCountry: state.package.packageCountry,
    packageSite: state.package.packageSite,
  };
};

export default connect(mapStateToProps, {
  FetchPackageInfo,
  FetchPackageCountry,
  FetchPackageSite,
})(PurchasePass);
