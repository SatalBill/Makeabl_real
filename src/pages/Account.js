import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, StatusBar, Dimensions, TouchableOpacity, ActivityIndicator, Image, Alert, Keyboard, FlatList, Text, TextInput, Button, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import AsyncStorage from "@react-native-community/async-storage";
import Spinner from 'react-native-loading-spinner-overlay';
import IntlPhoneInput from 'react-native-intl-phone-input';
import RNPickerSelect from "react-native-picker-select";
import ImagePicker from 'react-native-image-picker'
import FastImage from 'react-native-fast-image'
import Toast from 'react-native-simple-toast';
import Modal from 'react-native-modal';
import { connect } from 'react-redux'
import dayjs from 'dayjs'
import FlashMessage, { showMessage } from 'react-native-flash-message';
import OneSignal from 'react-native-onesignal';
import { BarIndicator } from 'react-native-indicators'

import { FetchPackageHistory, FetchSiteList } from '../actions/Account/Account'
import CustomTextInput from '../components/CustomTextInput'
import TextComponent from '../components/TextComponent'
import config, { BASE_PATH } from "../api/config";
import AuthButton from "../components/AuthButton";
import MainButton from '../components/MainButton'
import PriceList from '../constants/PriceList'
import Colors from '../constants/Colors'
import { amazon } from '../api/config'
import Card from '../components/Card'
import QR from '../assets/images/icon/QR.png'

const logo = require('../assets/images/logo.png')
const { width, height } = Dimensions.get('window')
const faceCenter = require('../assets/images/faceCenter.png')

let reg_strong = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/;
let reg_average = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30}$/;

class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      addressTemp: '',
      password: '',
      phone: '',
      phoneTemp: '',
      phoneNumberIsVerified: '',
      userID: '',
      userToken: '',
      timeFlag: false,
      orderHistory: [],
      order: [],
      packageHistory: [],
      QRHistory: [],
      siteList: [],
      showPassword: true,
      edit: false,
      siteAddModalVisible: false,
      site_id_add: 0,
      array: [],
      arrNum: [],
      arrNumTemp: [],
      myHeaders: {},
      filePath: '',
      faceRegisterModal: false,
      isRegistering: false,
      cnt: 0,
      orderModalVisible: false,
      isPending: 0,
      isChecking: false,
      isUploading: false,
      initialPending: 5,
      pendingModal: false
    };
    OneSignal.addEventListener('received', this.onReceived);

  }

  componentDidMount = async () => {
    let userID = await AsyncStorage.getItem('userID')
    let userToken = await AsyncStorage.getItem('userToken')

    const avatar = (await AsyncStorage.getItem('photoURL')).toString()
    const avatarQR = (await AsyncStorage.getItem('qrURL')).toString()
    const avatarURI = `${amazon}${avatar.replace(/['"]+/g, '')}`
    const QR_avatarURI = `${avatarQR.replace(/['"]+/g, '')}`

    const email = (await AsyncStorage.getItem('email')).toString().replace(/['"]+/g, '')
    const mobile = (await AsyncStorage.getItem('mobile')).toString().replace(/['"]+/g, '')
    const address = (await AsyncStorage.getItem('address')).toString().replace(/['"]+/g, '')
    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': userToken.replace(/['"]+/g, ''),
      'User-ID': userID.replace(/['"]+/g, '')
    }
    await this.setState({
      avatarURI: avatarURI,
      QR_avatarURI: QR_avatarURI,
      email: email,
      phone: mobile,
      address: address,
      myHeaders: myHeaders,
      avatar: avatar,
      avatarQR: avatarQR,
      timeFlag: false,
      userID: userID,
    })
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
        console.log('token_error=>', error)
      })

    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      setTimeout(() => {
        this._onFetchPackageHistory()
        this._onFetchQRHistory()
        this._onFetchOrderHistory()
      }, 300);
      setTimeout(() => {
        if (userToken == "") {
          this.props.navigation.navigate('Auth')
        }
      }, 5000);
    });
    setTimeout(async () => {
      const prevRoute = this.props.navigation.getParam('Digital')
      // console.log('prevRoute=>', prevRoute);
      if (prevRoute == 'digitalHistory') {
        this.scrollToElement(1300)
      } else if (prevRoute == 'orderHistory') {
        this.scrollToElement(1500)
      }
    }, 500);

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

  start = () => {
    this.setState({ isLoading: true })
    this._onFetchPackageHistory()
    this._onFetchOrderHistory()
    this._onFetchQRHistory()
    this._onFetchSiteList()
    this._onGetSite()
    this._cnt()
  }

  _cnt = () => {
    setTimeout(() => {
      var myInterval = setInterval(() => {
        if (this.state.cnt >= 3) {
          this.setState({ isLoading: false })
          clearInterval(myInterval)
        }
      }, 500);
    }, 500);
  }

  _onFetchPackageHistory = () => {
    // console.log('_onFetchPackageHistory');
    fetch(config.api.getPackageHistory, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then(response => response.json())
      .then((res) => {
        // console.log("**************", res);
        this.setState({
          packageHistory: res,
          cnt: this.state.cnt + 1
        })

      })
      .catch((error) => {
        // console.log('getPackageHistory=>', error)
        this.setState({ cnt: this.state.cnt + 1 })
      })
  }

  _onFetchQRHistory = () => {
    // console.log('_onFetchPackageHistory');
    fetch(config.api.getQRdetail, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then(response => response.json())
      .then((res) => {
        console.log("****** QR ********", res);
        this.setState({
          QRHistory: res,
        })

      })
      .catch((error) => {
        console.log('getQRHistory=>', error)
        this.setState({ cnt: this.state.cnt + 1 })
      })
  }

  _onFetchOrderHistory = () => {
    // console.log('_onFetchOrderHistory');
    fetch(config.api.getOrderHistory, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then((res) => res.json())
      .then(responseJSON => {
        // console.log("_onFetchPackageHistory=>", responseJSON);
        this.setState({ orderHistory: responseJSON['order_list'] })
      })
  }

  _onFetchSiteList = () => {
    this.setState({ arrNumTemp: [] })
    fetch(config.api.getSiteList, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then((res) => res.json())
      .then(async (responseJSON) => {
        await responseJSON['site_list'].map((item) => {
          this.state.arrNumTemp.push(item.site_id)
        })
        this.setState({
          arrNum: this.state.arrNumTemp,
          siteList: responseJSON['site_list'],
          cnt: this.state.cnt + 1
        })
        // console.log("this.state.arrNum=>", this.state.arrNum);
      })
  }

  _onGetSite = () => {
    this.setState({ arrayTemp: [] })
    fetch(config.auth.getSite, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Auth-Key': 'simplerestapi',
      },
    })
      .then((res) => res.json())
      .then((responseJSON) => {
        // console.log(responseJSON);
        responseJSON['site_list'].map((item, i) => {
          if (item != "") {
            let obj = {}
            obj.value = item.id
            obj.label = item.title
            this.state.arrayTemp.push(obj);
          }
        })
        this.setState({
          cnt: this.state.cnt + 1,
          array: this.state.arrayTemp
        })
        console.log('array =>', this.state.array);
      })
  }

  _onChangeHandle = (type, text) => {
    this.setState({
      [type]: text
    })
  }

  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false,
      isUploading: false
    })
    alert('network error')
  }

  _onSave = async () => {
    const { phone, password, address, timeFlag, userID, userToken } = this.state
    // console.log('save change');
    if (!(reg_strong.test(password) === true || password === "")) {
      Toast.showWithGravity(
        "Password must contain the following: \n" +
        "A lowercase letter\n" +
        "A capital letter\n" +
        "A number\n" +
        "A special character\n" +
        "Minimum 8 characters ", Toast.LONG, Toast.TOP);
    } else if (this.state.phoneNumberIsVerified) {
      Keyboard.dismiss()
      let details = {
        'mobile': phone,
        'password': password,
        'address': address
      };
      var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 50000)
      this.setState({ isLoading: true })

      let formBody = [];
      for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");
      // console.log('formbody=>', formBody);

      fetch(config.api.update, {
        method: 'POST',
        headers: this.state.myHeaders,
        body: formBody
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          this.setState({ isLoading: false, edit: false })
          clearTimeout(myTimer)
          // console.log('text=>', responseJson);
          if (responseJson['status'] == 200) {
            await AsyncStorage.setItem('mobile', phone)
            await AsyncStorage.setItem('address', address)
            Alert.alert('Success', 'Your account has been updated.')
          } else if (responseJson['status'] == 400) {
            alert(responseJson.message)
          }
        })
        .catch((err) => {
          // console.log('err =>', err);
          if (!timeFlag) {
            this.setState({ isLoading: false })
            alert("Network Error!")
            clearTimeout(myTimer);
          } else {
            this.setState({ timeFlag: false })
          }
        })
    }
  }

  _onEdit = () => {
    this.setState({
      edit: true,
      phoneTemp: this.state.phone,
      addressTemp: this.state.address
    })
    // console.log('onEdit');
  }

  _onCancel = () => {
    this.setState({
      edit: false,
      phone: this.state.phoneTemp,
      address: this.state.addressTemp
    })
    // console.log('onCancel');
  }

  _onBtnPressed = () => {
    this.state.edit ? this._onCancel() : this._onEdit()
  }

  _onPurchase = () => {
    this.props.navigation.navigate('PurchasePass')
  }

  _onScanQR = () => {
    this.props.navigation.navigate('QRscan')
  }

  scrollToElement = (height_position) => {
    // const node = this._nodes.get(indexOf);
    // const position = findNodeHandle(node);
    this.myScroll.scrollTo({ x: 0, y: height_position, animated: true });
  }

  _onNewSite = async () => {
    // console.log('newSite');
    const avatar = (await AsyncStorage.getItem('photoURL')).toString()
    this.setState({ avatar: avatar == "emptyPhoto" ? avatar : "NonEmptyPhoto", siteAddModalVisible: true })
  }

  _onRemoveSiteReady = (removeItem) => {
    Alert.alert(
      `Are you sure you would like to remove this venue?`,
      `${removeItem.title}`,
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'OK', onPress: () => { this._onRemoveSite(removeItem.id) } }
      ]
    )
  }

  _onRemoveSite = (removeID) => {
    // console.log(removeID);
    this.setState({ isLoading: true })
    var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 8000)
    fetch(config.api.removeSite, {
      method: 'POST',
      headers: this.state.myHeaders,
      body: `id=${removeID.toString()}`  ///////////////////////////////////////////////////////////////////
    })
      .then((response) => response.json())
      .then(async (responseJson) => {
        this.setState({ isLoading: false })
        clearTimeout(myTimer)
        // console.log('<<<<<<<<<<', responseJson);
        if (responseJson['status'] == 200) {
          this.setState({ siteList: responseJson['site_list'] })
          setTimeout(() => {
            this._onFetchSiteList()
            Alert.alert('Success!', 'Successfully removed')
          }, 100);
        } else {
          alert(responseJson.message)
        }
      })
      .catch((err) => {
        // console.log('err =>', err);
        this.setState({ isLoading: false })
        clearTimeout(myTimer);
        if (!this.state.timeFlag) {
          alert("Network Error!")
        } else {
          this.setState({ timeFlag: false })
        }
      })
  }

  _onClose = () => {
    this.setState({
      siteAddModalVisible: false,
      faceRegisterModal: false
    })
  }

  _onSiteValidation = (site_id_validation) => {
    if (site_id_validation == 0) {
      Toast.showWithGravity("Please select Venue", Toast.LONG, Toast.TOP)
    } else {
      this.setState({ isChecking: true })
      var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 20000)
      fetch(config.api.validationSite, {
        method: 'POST',
        headers: this.state.myHeaders,
        body: `site_id=${site_id_validation.toString()}`
      })
        .then((response) => response.json())
        .then(async (responseJSON) => {
          this.setState({ isChecking: false })
          clearTimeout(myTimer)
          if (responseJSON['status'] == 200) {
            if (responseJSON['isFace'] == 0 && this.state.avatar == "emptyPhoto") {
              this.setState({ siteAddModalVisible: false })
              setTimeout(() => {
                this.setState({ faceRegisterModal: true })
              }, 700);
            } else if (responseJSON['isFace'] == 0 && this.state.avatar != "emptyPhoto") {
              this._onAdd(site_id_validation, 0)
            } else if (responseJSON['isFace'] == 1 && this.state.avatarQR == "emptyQR") {
              this._onAdd(site_id_validation, 1)
            } else if (responseJSON['isFace'] == 1 && this.state.avatarQR != "emptyQR") {
              this._onAdd(site_id_validation, 0)
            }
          } else if (responseJSON['status'] == 210) {
            alert(responseJSON.message)
          }
        })
        .catch((err) => {
          // console.log('err =>', err);
          this.setState({ isChecking: false })
          clearTimeout(myTimer);
          if (!this.state.timeFlag) {
            alert("Network Error!")
          } else {
            this.setState({ timeFlag: false })
          }
        })
    }
  }

  _pickImageFront = () => {
    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, response => {
      console.log('Response = ');
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ');
      } else if (response.customButton) {
        console.log('User tapped custom button: ');
      } else {
        let source = response;
        this.setState({
          filePath: source.data,
        })
        // console.log('filePath=>', this.state.filePath);
      }
    });
  };

  _upload = async () => {
    // console.log('upload');
    if (this.state.filePath == "") {
      alert('Please take your face photo')
    } else {
      this.setState({ isUploading: true })
      // var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 59000)
      var formdata = new FormData();
      formdata.append("id", this.state.userID.toString().replace(/['"]+/g, ''));
      formdata.append("photo", "data:image/jpeg;base64," + this.state.filePath)

      var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
      }

      fetch(config.auth.faceregister, requestOptions)
        .then(response => response.json())
        .then(responseJSON => {
          if (!this.state.timeFlag) {
            // console.log('responseJSON=>', responseJSON)
            // clearTimeout(myTimer)
            this.setState({ isUploading: false })
            if (responseJSON["result"] == "success") {
              AsyncStorage.setItem('photoURL', JSON.stringify(responseJson['face_url']))
              // var myTimer_face = setTimeout(function () { this.NetworkSensor() }.bind(this), 59000)

              setTimeout(() => {
                // this.setState({ isRegistering: true })
                this._onAdd(this.state.site_id_add, 0)
              }, 500);
              // fetch(config.api.addSite, {
              //   method: 'POST',
              //   headers: this.state.myHeaders,
              //   body: `site_id=${this.state.site_id_add.toString()}`
              // })
              //   .then((response) => response.json())
              //   .then((responseJSON) => {
              //     this.setState({ isRegistering: false, faceRegisterModal: false })
              //     clearTimeout(myTimer_face)
              //     if (responseJSON['status'] == 200) {
              //       Alert.alert('Success', 'Venue has been successfully added')
              //       this.setState({ siteList: responseJSON['site_list'] })

              //     } else if (responseJSON['status'] == 210) {
              //       alert(responseJSON.message)
              //     } else alert(responseJSON)
              //   })
              //   .catch((err) => {
              // console.log('err =>', err);
              //     this.setState({ isUploading: false })
              //     clearTimeout(myTimer);
              // console.log('site_add_add=>');
              //     if (!this.state.timeFlag) {
              //       alert("Network Error!")
              //     } else {
              //       this.setState({ timeFlag: false })
              //     }
              //   })

            } else if (responseJSON["result"] == "no face") {
              Alert.alert("No face", "Please take your face photo.")
            } else if (responseJSON["result"] == "more one face") {
              Alert.alert("More one face", "There should be only one face in the photo.")
            } else if (responseJSON["result"] == "face is already exist") {
              Alert.alert("face is already exist", "Please upload another photo.")
            } else {
              alert('Something went wrong.')
              // console.log(responseJSON['result']);
            }
          }
        })
        .catch((err) => {
          // console.log('catchError=>', err);
          this.setState({ isUploading: false })
          // clearTimeout(myTimer);
          if (!this.state.timeFlag) {
            alert("Network Error!")
          } else {
            this.setState({ timeFlag: false })
          }
        })
    }

  }

  _onAdd = (site_id_add, qr_url) => {
    // console.log(site_id_add, qr_url);
    this.setState({ isLoading: true })
    var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 25000)
    fetch(config.api.addSite, {
      method: 'POST',
      headers: this.state.myHeaders,
      body: `site_id=${site_id_add.toString()}&qr_url=${qr_url.toString()}`
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        this.setState({ isLoading: false, siteAddModalVisible: false, faceRegisterModal: false, isUploading: false })
        clearTimeout(myTimer)
        if (responseJSON['status'] == 200) {
          // Alert.alert('Success', 'Venue has been successfully added')
          this.setState({ siteList: responseJSON['site_list'] })
          setTimeout(() => {
            this._onFetchSiteList()
          }, 100);
          // console.log('success=>');
          // if (this.state.avatar == 'emptyPhoto') {
          //   setTimeout(() => {
          //     this.setState({ faceRegisterModal: true })
          //   }, 700);
          // } else {
          // console.log('=>>', this.state.avatarURI);
          // }

        } else {
          // alert(responseJSON)
          // console.log(responseJSON);
        }
      })
      .catch((err) => {
        // console.log('_onAdd =>', err);
        this.setState({ isLoading: false })
        clearTimeout(myTimer);
        if (!this.state.timeFlag) {
          alert("Network Error!")
        } else {
          this.setState({ timeFlag: false })
        }
      })

  }

  _onChangeModalSite = async (e) => {
    this.setState({ site_id_add: e });
  }

  showToast = () => {
    alert('Please click on edit to modify the mobile number')
    this.setState({ phone: '' })
  }

  onChangeMobile = ({ dialCode, unmaskedPhoneNumber, phoneNumber, isVerified }) => {
    if (isVerified) {
      this.setState({
        phone: dialCode + unmaskedPhoneNumber,
        phoneNumberIsVerified: 'true'
      })
    } else this.setState({ phoneNumberIsVerified: 'false' })
  };

  _onOpenAvatar = (e) => {
    this.setState({
      avatarModalVisible: true,
      modalAvatarURI: e
    })
  }

  _onRefundReady = (item, isOrderRefund) => {
    Alert.alert(
      'Are you sure want to refund? ',
      'Your account will be in pending state and you will be log out automatically. Pending might takes less than 1 hour. If pending is approved, we will notify you via email.',
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'OK', onPress: () => { isOrderRefund ? this._onOrderRefund(item) : this._onPackageRefund(item) } }
      ]
    )
  }

  _onSignout = async () => {
    this.setState({ isLoading: true })
    fetch(config.auth.signout, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({ isLoading: false })
        if (responseJSON['status'] == 200) {
          AsyncStorage.removeItem('userToken');
          this.props.navigation.navigate('Login')
        } else {
          // console.log('Signout failed');
        }
      })
  }

  _onPackageRefund = (item) => {
    // console.log('_onPackageRefund', item.id);
    // console.log('_onPackageRefund_t', item.txn_id);
    try {
      let details = {
        'package_history_id': item.id,
        'txn_id': item.txn_id,
        // 'payment_gross': item.payment_amount,
      };
      var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 20000)
      this.setState({ isLoading: true })

      let formBody = [];
      for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      fetch(config.api.refund, {
        method: 'POST',
        headers: this.state.myHeaders,
        body: formBody
      })
        .then(response => response.json())
        .then(responseJSON => {
          this.setState({ isLoading: false })
          clearTimeout(myTimer)
          if (responseJSON['status'] == 200) {
            this.setState({ pendingModal: true })

            var pendingInterval = setInterval(() => {
              if (this.state.initialPending <= 0) {
                clearInterval(pendingInterval)
                this.setState({ pendingModal: false })
                this._onSignout()
              } else {
                this.setState({ initialPending: this.state.initialPending - 1 })
              }
            }, 1000);
          } else {
            alert('Refund failed.')
          }
        })
        .catch(err => {
          this.setState({ isLoading: false })
          clearTimeout(myTimer)
          // console.log(err);
        })
    } catch (error) {
      console.log(error);
    }

  }

  _onOrderRefund = (item) => {
    // console.log('_onOrderRefund');
    try {
      let details = {
        'order_history_id': item.id,
        'txn_id': item.txn_id,
        // 'payment_gross': item.payment_amount,
      };
      var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 20000)
      this.setState({ isLoading: true })

      let formBody = [];
      for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      fetch(config.api.refundOrder, {
        method: 'POST',
        headers: this.state.myHeaders,
        body: formBody
      })
        .then(response => response.json())
        .then(responseJSON => {
          this.setState({ isLoading: false })
          clearTimeout(myTimer)
          if (responseJSON['status'] == 200) {
            alert('Successfully refunded')
          } else {
            alert('Refund failed.')
          }
        })
        .catch(err => {
          clearTimeout(myTimer)
          this.setState({ isLoading: false })
          // console.log(err);
        })
    } catch (error) {
      // console.log(error);
    }
  }

  renderSite = ({ item }) => (
    <View style={styles.siteList}>
      <View style={{ width: '15%' }}>
        <TextComponent text medium heavy center> {this.state.arrNum.indexOf(item.site_id) + 1} </TextComponent>
      </View>
      <View style={{ width: '70%' }}>
        {/* <TextComponent text medium heavy center>{this.formatTextEclips(item.siteName, 15)}</TextComponent> */}
        <Text style={styles.siteListName} numberOfLines={1}>{item.title}</Text>
      </View>
      <View style={{ width: '15%', alignItems: 'flex-end' }}>
        <TouchableOpacity onPress={() => { this._onRemoveSiteReady(item) }}>
          <MaterialCommunityIcons name="close-box" color={'red'} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  )

  formatTextEclips = (text, length = 15) => {
    return text.length > length ? text.slice(0, length) + '...' : text
  }

  renderPackageHistory = ({ item }) => (
    <View style={styles.packageItem}>
      <View style={styles.refundRow}>
        <View>
          <TextComponent xmedium>{this.formatTextEclips(item.package, 15)}</TextComponent>
          <TextComponent green>{item.site}</TextComponent>
        </View>
        <View>
          <Button
            title="Refund"
            onPress={() => { this._onRefundReady(item, 0) }}
            color={Colors.authButton}
            // disabled={false}
            disabled={(new Date(`${new Date().getFullYear()}-${new Date().getMonth() < 9 ? '0' : ''}${new Date().getMonth() + 1}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}T${new Date().getHours() < 10 ? '0' : ''}${new Date().getHours()}:${new Date().getMinutes() < 10 ? '0' : ''}${new Date().getMinutes()}:${new Date().getSeconds() < 10 ? '0' : ''}${new Date().getSeconds()}`).getTime() - new Date(`${item.created_at.slice(0, 10)}T${item.created_at.slice(11, 19)}`).getTime() > 10 * 60 * 60 * 1000) || item.waste_image_count > 0 || item.waste_video_count > 0 ? true : false}
          />
        </View>

      </View>
      <View style={styles.priceArea}>
        <TextComponent darkred xmedium>{item.symbol}{item.price}</TextComponent>
        <View>
          <TextComponent darkred>image: {item.type == 1 ? "Unlimited" : `total ${item.image_count}/${item.image_count - item.waste_image_count} left`}</TextComponent>
          <TextComponent darkred>video:  {item.type == 1 ? "Unlimited" : `total ${item.video_count}/${item.video_count - item.waste_video_count} left`}</TextComponent>
        </View>
        <View style={{ ...styles.isActive, backgroundColor: (new Date(`${item.from_date.slice(0, 10)}T${item.from_date.slice(11, 19)}`).getTime() < new Date(`${new Date().getFullYear()}-${new Date().getMonth() < 9 ? '0' : ''}${new Date().getMonth() + 1}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}T${new Date().getHours() < 10 ? '0' : ''}${new Date().getHours()}:${new Date().getMinutes() < 10 ? '0' : ''}${new Date().getMinutes()}:${new Date().getSeconds() < 10 ? '0' : ''}${new Date().getSeconds()}`).getTime() && new Date(`${item.to_date.slice(0, 10)}T${item.to_date.slice(11, 19)}`).getTime() > new Date(`${new Date().getFullYear()}-${new Date().getMonth() < 9 ? '0' : ''}${new Date().getMonth() + 1}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}T${new Date().getHours() < 10 ? '0' : ''}${new Date().getHours()}:${new Date().getMinutes() < 10 ? '0' : ''}${new Date().getMinutes()}:${new Date().getSeconds() < 10 ? '0' : ''}${new Date().getSeconds()}`).getTime()) ? Colors.authButton : 'red' }}></View>
      </View>
      <TextComponent>{(item.from_date).slice(0, 10)}  to  {(item.to_date).slice(0, 10)}</TextComponent>
    </View>
  )

  renderQRHistory = ({ item }) => (
    <View style={styles.packageItem}>
      <View style={styles.refundRow}>
        <View>
          <TextComponent xmedium>{this.formatTextEclips(item.package, 15)}</TextComponent>
          <TextComponent green>{item.site}</TextComponent>
        </View>


      </View>
      <View style={styles.priceArea}>
        <TextComponent darkred xmedium>{item.symbol}{item.price}</TextComponent>
        <View>
          <TextComponent darkred>image: {item.type == 1 ? "Unlimited" : `total ${item.image_count}/${item.image_count - item.waste_image_count} left`}</TextComponent>
          <TextComponent darkred>video:  {item.type == 1 ? "Unlimited" : `total ${item.video_count}/${item.video_count - item.waste_video_count} left`}</TextComponent>
        </View>
        <View style={{ ...styles.isActive, backgroundColor: (new Date(`${item.from_date.slice(0, 10)}T${item.from_date.slice(11, 19)}`).getTime() < new Date(`${new Date().getFullYear()}-${new Date().getMonth() < 9 ? '0' : ''}${new Date().getMonth() + 1}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}T${new Date().getHours() < 10 ? '0' : ''}${new Date().getHours()}:${new Date().getMinutes() < 10 ? '0' : ''}${new Date().getMinutes()}:${new Date().getSeconds() < 10 ? '0' : ''}${new Date().getSeconds()}`).getTime() && new Date(`${item.to_date.slice(0, 10)}T${item.to_date.slice(11, 19)}`).getTime() > new Date(`${new Date().getFullYear()}-${new Date().getMonth() < 9 ? '0' : ''}${new Date().getMonth() + 1}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}T${new Date().getHours() < 10 ? '0' : ''}${new Date().getHours()}:${new Date().getMinutes() < 10 ? '0' : ''}${new Date().getMinutes()}:${new Date().getSeconds() < 10 ? '0' : ''}${new Date().getSeconds()}`).getTime()) ? Colors.authButton : 'red' }}></View>
      </View>
      <TextComponent>{(item.from_date).slice(0, 10)}  to  {(item.to_date).slice(0, 10)}</TextComponent>
    </View>
  )

  _onOrderModalVisible = (item) => {
    // console.log('_onOrderModalVisible clicked');
    this.setState({ orderModalVisible: true })
    fetch(config.api.getOrderdetail + '/' + item.id, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then(res => res.json())
      .then(async responseJSON => {
        // console.log('------OrderDetail-------', responseJSON);
        let totalPrice = 0
        await responseJSON.map((item) => {
          totalPrice = totalPrice + parseFloat(item.price)
        })
        // console.log('--------totalPrice---------', totalPrice);
        this.setState({
          order: responseJSON,
          totalPrice: totalPrice,
          symbolToShow: responseJSON[0]['symbol'],
          isDelivery: item.isDelivery
        })
        // console.log('--------this.state.totalPrice---------', this.state.totalPrice);
      })
      .catch(err => {
        // console.log(err);
      })
  }

  renderOrderHistory = ({ item }) => (
    <TouchableOpacity style={styles.orderItem} onPress={() => this._onOrderModalVisible(item)}>
      <View style={{ width: '60%' }}>
        <TextComponent heavy>#{item.orderID}</TextComponent>
        <TextComponent xmedium green>{item.site_name}</TextComponent>
        <TextComponent></TextComponent>
        <TextComponent medium darkred heavy>{item.total_price} USD</TextComponent>
      </View>
      <View style={{ width: '40%', flexDirection: 'column', alignItems: 'center', }}>
        {/* <Image source={item.imgURL} style={{ width: width * 0.15, height: width * 0.15 }} resizeMode="contain" /> */}
        <View>
          <Button
            title="Refund"
            onPress={() => { this._onRefundReady(item, 1) }}
            color={Colors.authButton}
            disabled={(new Date(`${new Date().getFullYear()}-${new Date().getMonth() < 9 ? '0' : ''}${new Date().getMonth() + 1}-${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate()}T${new Date().getHours() < 10 ? '0' : ''}${new Date().getHours()}:${new Date().getMinutes() < 10 ? '0' : ''}${new Date().getMinutes()}:${new Date().getSeconds() < 10 ? '0' : ''}${new Date().getSeconds()}`).getTime() - new Date(`${item.created_at.slice(0, 10)}T${item.created_at.slice(11, 19)}`).getTime() > 1 * 60 * 60 * 1000) ? true : false} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <FontAwesome5 name={item.isDelivery == 1 ? 'shipping-fast' : 'lock'} color="grey" size={18} />
          <Text numberOfLines={1} style={{ color: 'grey' }}> {item.isDelivery == 1 ? 'Shipment' : 'Pick-up'} </Text>
        </View>
        <TextComponent darkred >{item.created_at.slice(0, 10)}</TextComponent>
      </View>
    </TouchableOpacity>
  )

  renderOrderDetail = ({ item }) => (
    <View>
      <Image source={{ uri: amazon + item.comp_photo_url.split("\n")[0] }} style={styles.merchandiseDetail} resizeMode={'contain'} />
      <View style={styles.orderModalList}>
        <View style={styles.innerModalList}>
          <View style={{ flexDirection: 'row' }}>
            <TextComponent center medium white>{this.formatTextEclips(item.title, 15)}</TextComponent>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TextComponent center white>Size: </TextComponent>
            <TextComponent center white>{item.size}</TextComponent>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TextComponent center white>Price: </TextComponent>
            <TextComponent center white>{item.symbol}{item.price}</TextComponent>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <TextComponent center white>Quantity: </TextComponent>
            <TextComponent center white>{item.quantity}</TextComponent>
          </View>
        </View>
      </View>
    </View>
  )



  render() {
    const {
      email,
      address,
      password,
      phone,
      orderHistory,
      showPassword,
      edit,
      siteAddModalVisible,
      site_id_add,
      avatarModalVisible,
      orderModalVisible,
      faceRegisterModal,
      order,
      filePath,
      isChecking,
      isUploading,
      pendingModal } = this.state
    return (
      <SafeAreaView style={styles.container}>
        <FlashMessage position="bottom" duration={5500} animationDuration={700} icon="success" />

        <StatusBar hidden />
        <Spinner
          visible={this.state.isLoading}
          textContent={'Loading...'}
          textStyle={{ color: 'white' }}
        />
        <Modal
          isVisible={siteAddModalVisible}
          backdropColor="#B4B3DB"
          backdropOpacity={0.8}
          animationIn="zoomInDown"
          animationOut="zoomOutUp"
          animationInTiming={1000}
          animationOutTiming={500}
          backdropTransitionInTiming={1000}
          backdropTransitionOutTiming={500}
        >
          <View style={styles.modalBody}>
            <View style={styles.modalHeader}>
              <TextComponent large heavy text>Add Venue</TextComponent>
              <TouchableOpacity onPress={() => this._onClose()}>
                <FontAwesome name="close" size={24} color={Colors.deactive} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer2}>
              <RNPickerSelect
                placeholder={{ label: "Venue...", value: 0 }}
                items={this.state.array}
                onValueChange={(value) => { this._onChangeModalSite(value) }}
                style={{
                  ...pickerSelectStyles,
                  iconContainer: {
                    top: 10,
                    right: 12,
                  }
                }}
                disabled={isChecking}
                value={this.state.site_id_add}
                useNativeAndroidPickerStyle={false}
                textInputProps={{ underlineColor: "yellow" }}
                Icon={() => {
                  return <Image source={require('../assets/images/Icon.png')} style={{ width: 20, height: 20, position: "absolute", right: 0 }} />;
                }}
              />
            </View>
            <View style={styles.btnGroup}>
              <TouchableOpacity style={styles.close} onPress={() => this._onClose()} disabled={isChecking}>
                <TextComponent heavy white medium>Close</TextComponent>
              </TouchableOpacity>
              <TouchableOpacity style={styles.add} onPress={() => this._onSiteValidation(site_id_add)} disabled={isChecking}>
                {
                  isChecking ?
                    <BarIndicator color='white' count={3} size={17} />
                    :
                    <TextComponent heavy white medium>Add</TextComponent>
                }
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          isVisible={avatarModalVisible}
          backdropColor="#B4B3DB"
          backdropOpacity={0.8}
          animationIn="zoomInDown"
          animationOut="zoomOutUp"
          animationInTiming={1000}
          animationOutTiming={500}
          backdropTransitionInTiming={1000}
          backdropTransitionOutTiming={500}
        >
          <View style={styles.avatarModalBody}>
            <TouchableOpacity onPress={() => this.setState({ avatarModalVisible: false })} style={styles.closeIcon} activeOpacity={0.8}>
              <FontAwesome name="close" size={24} color={Colors.deactive} />
            </TouchableOpacity>
            {
              this.state.avatarURI != "" &&
              <FastImage
                style={{ width: width * 0.8, height: width * 0.8 }}
                source={{
                  uri: this.state.modalAvatarURI,
                  priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.contain}
              >
                <ActivityIndicator size='large' style={StyleSheet.absoluteFill} color="white"
                  animating={this.state.avatarURI != "" ? false : true} />
              </FastImage>
            }
          </View>
        </Modal>

        <Modal
          isVisible={orderModalVisible}
          backdropColor="#B4B3DB"
          backdropOpacity={0.8}
          animationIn="zoomInDown"
          animationOut="zoomOutUp"
          animationInTiming={1000}
          animationOutTiming={500}
          backdropTransitionInTiming={1000}
          backdropTransitionOutTiming={500}
        >
          <View style={styles.orderModalBody}>
            <TouchableOpacity onPress={() => this.setState({ orderModalVisible: false })} style={styles.closeIcon} activeOpacity={0.8}>
              <FontAwesome name="close" size={24} color={Colors.deactive} />
            </TouchableOpacity>
            <View style={{ height: width }}>
              <FlatList
                data={order}
                renderItem={this.renderOrderDetail}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
            <View style={{ width: '100%', flexDirection: 'row', marginVertical: 20, justifyContent: 'center' }}>
              <View style={{ width: '30%', alignItems: 'flex-end' }}>
                <TextComponent>Sub Total: </TextComponent>
                <TextComponent>Shipping Fee: </TextComponent>
                <TextComponent>Total: </TextComponent>
              </View>
              <View style={{ width: '30%', alignItems: 'flex-start', marginLeft: 20 }}>
                <TextComponent>{this.state.symbolToShow}{parseFloat(this.state.totalPrice).toFixed(2)}</TextComponent>
                <TextComponent>{this.state.symbolToShow}{this.state.isDelivery ? PriceList.shippingFee : 0}</TextComponent>
                <TextComponent>{this.state.symbolToShow}{(parseFloat(this.state.totalPrice) + parseFloat(PriceList.shippingFee)).toFixed(2)}</TextComponent>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          isVisible={faceRegisterModal}
          backdropColor="#B4B3DB"
          backdropOpacity={0.8}
          animationIn="zoomInDown"
          animationOut="zoomOutUp"
          animationInTiming={200}
          animationOutTiming={500}
          backdropTransitionInTiming={200}
          backdropTransitionOutTiming={500}
        >
          <View style={styles.avatarModalBody2}>
            <View style={styles.whiteboard2}>
              <ScrollView style={{ width: '100%', flex: 1 }}>
                <View style={{ flex: 1 }}>
                  <TextComponent large heavy center>Upload Selfie</TextComponent>
                  <TextComponent medium grey>To ensure you receive your images, we require a front face photo of you</TextComponent>
                  <TextComponent small grey></TextComponent>
                  <TextComponent medium grey>- Front Face Photo</TextComponent>
                  <TextComponent medium grey>- No Sun-glasses</TextComponent>
                  <TextComponent medium grey>- No Mask</TextComponent>
                  <TextComponent medium grey>- No Blur</TextComponent>
                </View>
                <View style={{ flex: 1 }}>
                  <TextComponent medium grey></TextComponent>
                  <TouchableOpacity onPress={() => this._pickImageFront()} disabled={isUploading} >
                    {filePath == '' ?
                      <Image source={faceCenter} style={styles.uploadedImage1} resizeMode="contain" />
                      :
                      <Image source={{ uri: 'data:image/jpeg;base64,' + this.state.filePath }} style={styles.uploadedImage} resizeMode="contain" />
                    }
                  </TouchableOpacity>
                </View>
                <View style={styles.btnGroup2}>
                  <View style={styles.uploadBtn}>
                    {/* <AuthButton title={!this.state.isUploading ? 'Upload' : ''} onPress={() => { this._upload() }} disabled={this.state.isUploading} /> */}
                    <TouchableOpacity style={styles.look} onPress={() => { this._upload() }} activeOpacity={0.7} disabled={this.state.isUploading}>
                      {
                        this.state.isUploading ?
                          <BarIndicator color='white' count={3} size={17} />
                          :
                          <TextComponent heavy white medium>Upload</TextComponent>
                      }
                    </TouchableOpacity>
                  </View>
                  <View style={styles.uploadBtn}>
                    <AuthButton title="Cancel" onPress={() => { this._onClose() }} disabled={this.state.isUploading} />
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>


        <Modal
          isVisible={pendingModal}
          backdropColor="#B4B3DB"
          backdropOpacity={0.8}
        >
          <View style={{ ...styles.orderModalBody, padding: 30 }}>
            <TextComponent center xmedium>Your request was successfully received. We will let you know the result of your request via email.</TextComponent>
            <TextComponent center large main>{this.state.initialPending}</TextComponent>
          </View>
        </Modal>

        <ScrollView ref={(ref) => this.myScroll = ref} >
          <View style={[styles.main, { marginTop: 10 }]}>

            {
              ((this.state.avatar != "emptyPhoto" && this.state.avatarQR == "emptyQR")
                || (this.state.avatar == "emptyPhoto" && this.state.avatarQR != "emptyQR")) &&
              <View style={styles.roundProfile}>
                <View style={{ ...styles.profileArea, flexDirection: 'row' }}>
                  <View style={styles.photo}>
                    <View style={{ alignItems: "center" }}>
                      <TouchableOpacity style={styles.avatar} activeOpacity={0.7} onPress={() => this._onOpenAvatar(this.state.avatar != "emptyPhoto" ? this.state.avatarURI : this.state.QR_avatarURI)}>
                        <FastImage
                          style={{ width: 90, height: 90, borderRadius: 45 }}
                          source={{
                            uri: this.state.avatar != "emptyPhoto" ? this.state.avatarURI : this.state.QR_avatarURI,
                            priority: FastImage.priority.high,
                          }}
                          resizeMode={FastImage.resizeMode.contain}
                        >
                          <ActivityIndicator size='large' style={StyleSheet.absoluteFill} color="white"
                            animating={this.state.avatarURI ? false : true} />
                        </FastImage>
                      </TouchableOpacity>
                      <TextComponent medium bold center>{email}</TextComponent>
                    </View>
                  </View>
                  <View style={styles.photoAmount}>
                    <View style={styles.count}>
                      <View>
                        <TextComponent grey medium>Photos</TextComponent>
                        <TextComponent large heavy center>{gNumOfPhoto}</TextComponent>
                      </View>
                      <View>
                        <TextComponent grey medium>Videos</TextComponent>
                        <TextComponent large heavy center>{gNumOfVideo}</TextComponent>
                      </View>
                    </View>

                  </View>
                </View>
              </View>
            }
            {
              this.state.avatar != "emptyPhoto" && this.state.avatarQR != "emptyQR" &&
              <View style={styles.roundProfile}>
                <View style={{ ...styles.profileArea, flexDirection: 'column' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={styles.photo}>
                      <View style={{ alignItems: "center" }}>
                        <TouchableOpacity style={styles.avatar} activeOpacity={0.7} onPress={() => this._onOpenAvatar(this.state.avatarURI)}>
                          {
                            (this.state.avatarURI != "" || this.state.avatarURI != null || this.state.avatarURI != undefined) &&
                            <FastImage
                              style={{ width: 90, height: 90, borderRadius: 45 }}
                              source={{
                                uri: this.state.avatarURI,
                                priority: FastImage.priority.high,
                              }}
                              resizeMode={FastImage.resizeMode.contain}
                            >
                              <ActivityIndicator size='large' style={StyleSheet.absoluteFill} color="white"
                                animating={this.state.avatarURI != "" ? false : true} />
                            </FastImage>
                          }
                        </TouchableOpacity>
                        <TextComponent medium bold center>{this.state.email}</TextComponent>
                      </View>
                    </View>

                    <View style={styles.photo}>
                      <View style={{ alignItems: "center" }}>
                        <TouchableOpacity style={styles.avatar} activeOpacity={0.7} onPress={() => this._onOpenAvatar(this.state.QR_avatarURI)}>
                          {
                            (this.state.avatarURI != "" || this.state.avatarURI != null || this.state.avatarURI != undefined) &&
                            <FastImage
                              style={{ width: 90, height: 90, borderRadius: 45 }}
                              source={{
                                uri: this.state.QR_avatarURI,
                                priority: FastImage.priority.high,
                              }}
                              resizeMode={FastImage.resizeMode.contain}
                            >
                              <ActivityIndicator size='large' style={StyleSheet.absoluteFill} color="white"
                                animating={this.state.avatarURI != "" ? false : true} />
                            </FastImage>
                          }
                        </TouchableOpacity>
                        <TextComponent medium bold center>QR</TextComponent>
                      </View>
                    </View>
                  </View>

                </View>
              </View>
            }

            <Card>
              <View style={{ width: '100%', padding: 30, }}>
                <View style={{ marginBottom: 20 }}>
                  <TextComponent main xmedium heavy>My Information</TextComponent>
                </View>
                <View style={{ width: '100%', height: 1, backgroundColor: Colors.borderColor, }}></View>

                <View style={{ width: '100%', height: 1, backgroundColor: Colors.borderColor, }}></View>
                <View style={{ flexDirection: 'row', padding: 10 }}>
                  <View style={{ width: '40%' }}>
                    <TextComponent text medium heavy>Mobile: </TextComponent>
                  </View>
                  <View style={{ width: '60%' }}>
                    <TextComponent text medium heavy>{phone}</TextComponent>
                  </View>
                </View>
                <View style={{ width: '100%', height: 1, backgroundColor: Colors.borderColor, }}></View>
                <View style={{ flexDirection: 'row', padding: 10 }}>
                  <View style={{ width: '40%' }}>
                    <TextComponent text medium heavy>E-mail: </TextComponent>
                  </View>
                  <View style={{ width: '60%' }}>
                    <TextComponent text medium heavy>{email}</TextComponent>
                  </View>
                </View>
                <View style={{ width: '100%', height: 1, backgroundColor: Colors.borderColor, }}></View>
                <View style={{ flexDirection: 'row', padding: 10 }}>
                  <View style={{ width: '40%' }}>
                    <TextComponent text medium heavy>Address: </TextComponent>
                  </View>
                  <View style={{ width: '60%' }}>
                    <TextComponent text medium heavy>{address}</TextComponent>
                  </View>
                </View>
              </View>
            </Card>

            <Card>
              <View style={{ width: '100%', padding: 30, }}>
                <TextComponent main xmedium heavy>My Venues</TextComponent>
                <TouchableOpacity activeOpacity={0.7} onPress={() => { this._onNewSite() }}>
                  <TextComponent main heavy right xmedium>Add</TextComponent>
                </TouchableOpacity>
                <View style={{ width: '100%', height: 1, backgroundColor: 'grey', }}></View>


                <FlatList
                  keyExtractor={(item, index) => index.toString()}
                  data={this.state.siteList}
                  renderItem={this.renderSite}
                  // onScroll={Animated.event(
                  //   [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  //   { useNativeDriver: false }
                  // )}
                  ListHeaderComponent={
                    <View style={{ flexDirection: 'row', padding: 10, backgroundColor: '#eff', }}>
                      <View style={{ width: '10%' }}>
                        <TextComponent text medium heavy center> # </TextComponent>
                      </View>
                      <View style={{ width: '70%' }}>
                        <TextComponent text medium heavy center>Venue</TextComponent>
                      </View>
                      <View style={{ width: '20%', alignItems: 'flex-end' }}>
                        <MaterialCommunityIcons name="trash-can-outline" color={'red'} size={24} />
                      </View>
                    </View>
                  }
                  ListFooterComponent={
                    <View style={{ width: '100%', }}></View>
                  }
                />

              </View>

            </Card>

            <Card>
              <View style={{ width: '100%', padding: 30, }}>
                <TextComponent main xmedium heavy>My Details</TextComponent>
                <TextComponent style={{ marginTop: 5 }}>Mobile</TextComponent>
                <View style={{ marginTop: 7, marginBottom: 15 }}>
                  <IntlPhoneInput
                    defaultCountry="HK"
                    onChangeText={edit ? this.onChangeMobile : this.showToast}
                    phoneInputStyle={{ fontSize: 15, padding: 0 }}
                    flagStyle={{ fontSize: 22, padding: 0 }}
                    dialCodeTextStyle={{ paddingLeft: 15 }}
                    placeholder="Enter mobile number"
                    containerStyle={styles.phoneContainer}
                    disableCountryChange={!edit}
                  />
                  {/* {this.state.phoneNumberIsVerified == 'false' && (
                    <Text style={{ color: 'red' }}>invalid phone number!</Text>
                  )} */}
                </View>
                <TextComponent>Password</TextComponent>
                <View style={styles.pwd}>
                  <TextInput
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      paddingRight: 50,
                    }}
                    value={password}
                    keyboardType={'default'}
                    onChangeText={(password) => { this.setState({ password }) }}
                    placeholder="Enter password"
                    secureTextEntry={showPassword ? false : true}
                    editable={edit}
                  />
                  <TouchableOpacity onPress={() => this.setState({ showPassword: !showPassword })} style={styles.eye}>
                    <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} color={'grey'} size={24} />
                  </TouchableOpacity>
                </View>
                {
                  password.length != 0 &&
                  <View style={{ flexDirection: 'row', alignItems: "center" }}>
                    <View style={{ ...styles.pwdStrong, width: width * 0.6, backgroundColor: 'grey' }}>
                      <View style={{
                        ...styles.pwdStrong,
                        backgroundColor: reg_average.test(password) === false ? 'red' : reg_strong.test(password) === false ? Colors.warning : Colors.pwdStrong,
                        width: reg_average.test(password) === false ? width * 0.15 : reg_strong.test(password) === false ? width * 0.3 : width * 0.6
                      }}></View>
                    </View>
                    <TextComponent>{reg_average.test(password) === false ? ' Too weak' : reg_strong.test(password) === false ? ' Average' : ' Strong'}</TextComponent>
                  </View>
                }


                <TextComponent text>Address</TextComponent>
                <CustomTextInput inputData={{
                  value: address,
                  type: 'address',
                  onChangeHandle: this._onChangeHandle,
                  placeholder: 'Enter Address',
                  editable: edit
                }} />

                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
                  {
                    edit &&
                    <View style={{ alignItems: 'center', width: '50%' }}>
                      <MainButton title="  Save  " onPress={() => this._onSave()} />
                    </View>
                  }
                  <View style={{ width: '50%', alignItems: 'center' }}>
                    <MainButton title={edit ? "Cancel" : "  Edit  "} onPress={() => this._onBtnPressed()} />
                  </View>
                </View>

              </View>

            </Card>

            <Card>
              <TextComponent large heavy main pa20>My Packages</TextComponent>
              <View style={{ width: '100%', padding: 20, }}>
                <TextComponent heavy main center>Direct Package</TextComponent>
                {
                  this.state.packageHistory != '' ?
                    <FlatList
                      data={this.state.packageHistory}
                      renderItem={this.renderPackageHistory}
                      keyExtractor={(item, index) => index.toString()}
                      ListFooterComponent={
                        <View style={{ width: '100%', height: 0.5, borderWidth: 0.5, borderColor: 'grey' }}></View>
                      }
                    />
                    :
                    <View style={{ marginVertical: 20 }}><TextComponent center>There is no history to display</TextComponent></View>
                }
                <TouchableOpacity style={styles.purchase} activeOpacity={0.7} onPress={() => { this._onPurchase() }}>
                  <TextComponent white heavy medium center>Purchase Pass</TextComponent>
                </TouchableOpacity>
              </View>

              <View style={{ width: '100%', padding: 20, }}>
                <TextComponent heavy main center>Pre-paid QR Package</TextComponent>
                {
                  this.state.QRHistory != '' ?
                    <FlatList
                      data={this.state.QRHistory}
                      renderItem={this.renderQRHistory}
                      keyExtractor={(item, index) => index.toString()}
                      ListFooterComponent={
                        <View style={{ width: '100%', height: 0.5, borderWidth: 0.5, borderColor: 'grey' }}></View>
                      }
                    />
                    :
                    <View style={{ marginVertical: 20 }}><TextComponent center>There is no history to display</TextComponent></View>
                }
                <TouchableOpacity style={styles.purchase} activeOpacity={0.7} onPress={() => { this._onScanQR() }}>
                  {/* <TextComponent white heavy medium center>Scan QR</TextComponent> */}
                  <Image source={QR} style={styles.img} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </Card>

            <Card>
              <View style={{ width: '100%', padding: 20, }}>
                <TextComponent large heavy main>My Orders</TextComponent>
                {
                  this.state.orderHistory != '' ?
                    <FlatList
                      data={orderHistory}
                      renderItem={this.renderOrderHistory}
                      keyExtractor={(item, index) => { index.toString() }}
                    />
                    :
                    <View style={{ marginVertical: 20 }}><TextComponent center>There is no order</TextComponent></View>
                }
              </View>
            </Card>

          </View>
        </ScrollView>

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
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  welcome: {
    backgroundColor: Colors.authButton,
    width: '100%',
    padding: 24,
    paddingBottom: 36,
    borderTopRightRadius: 5,
    borderTopLeftRadius: 5,
  },
  welcome1: {
    backgroundColor: Colors.white,
    width: '100%',
    padding: 24,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.authButton,
    elevation: 10,
    justifyContent: 'center',
    alignItems: "center",
    marginBottom: 5
  },
  profileArea: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  photo: {
    width: '50%',
    flexDirection: 'column',
  },
  photoAmount: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 30,
    justifyContent: 'space-around'
  },
  purchase: {
    height: 42,
    borderRadius: 21,
    zIndex: 12,
    backgroundColor: Colors.authButton,
    justifyContent: 'center',
    alignItems: "center",
    // elevation: 3,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 5,
    paddingHorizontal: 20,
    // shadowColor: Colors.authButton,
    // shadowOffset: {
    //   height: 0,
    //   width: 0
    // },
    // shadowOpacity: 0.8,
    // shadowRadius: 10
  },
  orderItem: {
    width: '100%',
    padding: 20,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#8888'
  },
  packageItem: {
    width: '100%',
    padding: 20,
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: '#8888',
  },
  siteList: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor
  },
  modalHeader: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderColor: Colors.borderColor,
    borderBottomWidth: 1,
    width: '90%'
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  btnGroup2: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: 'center'
  },
  close: {
    height: 42,
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: Colors.deactive,
    borderRadius: 21,
    paddingHorizontal: 20,
    marginRight: 40,
    width: '30%',
    marginLeft: '10%',
    alignSelf: "center"
  },
  add: {
    height: 42,
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: Colors.authButton,
    borderRadius: 21,
    paddingHorizontal: 20,
    marginRight: 40,
    width: '30%',
    alignSelf: "center",
    marginRight: '10%'
  },
  modalBody: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20
  },
  pickerContainer2: {
    width: '80%',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    backgroundColor: 'white',
    marginHorizontal: '2.5%',
    elevation: 5,
    borderRadius: 25,
    marginVertical: 20
  },
  priceArea: {
    flexDirection: 'row',
    alignItems: "center",
    width: '100%',
    justifyContent: 'space-between'
  },
  isActive: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  siteListName: {
    fontWeight: '700',
    fontSize: 17,
    textAlign: "center"
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
    top: 5
  },
  pwdStrong: {
    height: 5,
    borderRadius: 2.5
  },
  phoneContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 21,
    borderColor: Colors.borderColor,
    borderWidth: 1
  },
  roundProfile: {
    width: '100%',
    borderRadius: 25,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 10,
    elevation: 15,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    paddingHorizontal: 10,
  },
  count: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginLeft: 10
  },
  closeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    elevation: 10,
    justifyContent: 'center',
    alignItems: "center",
    position: 'absolute',
    zIndex: 100,
    top: -10,
    right: -10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  avatarModalBody: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
    width: width * 0.9,
    height: width * 0.9
  },
  orderModalBody: {
    backgroundColor: '#fff',
    width: width * 0.9,
    paddingHorizontal: 10
  },
  avatarModalBody2: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
    width: width * 0.9,
    height: height * 0.7
  },
  whiteboard2: {
    width: '92%',
    paddingVertical: 15,
    borderRadius: 20,
    flexDirection: 'column',
    flex: 1,
  },
  forgot2: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 20,
  },
  logo2: {
    width: 20,
    height: 21,
    marginLeft: -5,
    marginTop: -15
  },
  uploadedImage: {
    width: '96%',
    marginLeft: '2%',
    height: width * 0.7,
  },
  uploadedImage1: {
    width: '100%',
    height: width * 0.4,
    alignSelf: "center",
    marginTop: -10
  },
  uploadBtn: {
    width: '40%',
    alignSelf: "center",
    marginVertical: 20
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalBody2: {
    backgroundColor: '#fff9',
    width: '100%',
    height: '100%',
  },
  merchandiseDetail: {
    width: '100%',
    height: width * 0.6,
    margin: 10,
  },
  orderModalList: {
    width: '50%',
    justifyContent: 'flex-start',
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    paddingVertical: 10
  },
  innerModalList: {
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: Colors.authButton,
    paddingLeft: 10
  },
  look: {
    alignSelf: "center",
    height: 40,
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: Colors.authButton,
    borderRadius: 20,
    width: '90%',
    // elevation: 5,
    // shadowOffset: 50,
    // shadowColor: Colors.authButton,
    // shadowOffset: {
    //   width: 0,
    //   height: 0
    // },
    // shadowOpacity: 0.5
  },
  img: {
    width: 30,
    height: 30,
    tintColor: 'white'
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 4,
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
    packageHistory: state.account.packageHistory,
    siteList: state.account.siteList
  };
};

export default connect(mapStateToProps, { FetchPackageHistory, FetchSiteList })(Account);
