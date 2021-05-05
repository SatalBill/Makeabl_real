import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Dimensions, Image, TouchableOpacity, FlatList, BackHandler, Alert, ActivityIndicator, Platform } from 'react-native';
import TextComponent from '../components/TextComponent'
import Colors from '../constants/Colors'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import MainButton from '../components/MainButton'
import Fontisto from 'react-native-vector-icons/Fontisto'
import config, { amazon, BASE_PATH, GALLERY_PATH } from '../api/config'
import FastImage from 'react-native-fast-image'
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import { FetchOverlay, FetchFrame } from '../actions/GalleryDetail/GalleryDetail';
import { connect } from 'react-redux';
import { FetchGalleryInfo } from "../actions/Gallery/Gallery"
import dayjs from 'dayjs'
import AsyncStorage from "@react-native-community/async-storage";
import Credendials from '../constants/Credentials'
import PriceList from '../constants/PriceList'
import { WebView } from 'react-native-webview'
import axios from 'axios';
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

const PAY_PAL_CLIENT_ID = "AUzLLjbL6PfskIo6zDSQXJbTxwNTpyYlpjXz9J_xOrtIazPdPMZWyIwDIR_bJx-4R0ksz8bTdZY2n5Rp"
const { width, height } = Dimensions.get('window')
const mainWidth = width * 0.9
const mainHeight = width * 27 / 40  // ==> 0.9 * 3/4
const empty = require('../assets/images/c_empty.png')
const watermarkSample = require('../assets/images/watermark.png')

class GalleryDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgInfo: '',
      overlayInfo: '0',
      frameInfo: '0',
      overlay: [],
      mainOverlay: [
        {
          id: 0,
          country_id: 0,
          site_id: 0,
          location_id: 0,
          attachment: empty,
          comp_attachment: empty,
          orderID: 0,
          isDeleted: 0,
          created_at: '',
          watermark: '',
          title: 'None',
          width: 0,
          height: 0,
          rate: 0,
          rotate: 0,
          type_id: 0,
          category_id: 1,
        }
      ],
      frame: [],
      mainFrame: [
        {
          id: 0,
          country_id: 0,
          site_id: 0,
          location_id: 0,
          attachment: empty,
          comp_attachment: empty,
          orderID: 0,
          isDeleted: 0,
          created_at: '',
          watermark: '',
          title: 'None',
          width: 0,
          height: 0,
          rate: 0,
          rotate: 0,
          type_id: 0,
          category_id: 1,
        }
      ],
      overlayID: 0,
      frameID: 0,
      isPaid: false,          // pay you go
      isActivated: false,      // package buy
      isNone: true,
      imgInfo: '',
      processedImgInfo: '',
      tempOverlay: true,
      tempFrame: true,
      isShowPiece: false,
      pieceURL: '',
      positionX: '',
      positionY: '',
      rate: '',
      rotate: '',
      bg_comp_width: 0,
      bg_comp_height: 0,
      isPortrait: false,
      originIsPortrait: false,
      realRatio: 4 / 3,
      originRatio: 4 / 3,
      site_id: '',
      checkArr: [],
      watermark: '',
      orig_comp_detail_width: 0,
      orig_comp_detail_height: 0,
      temp_detail_width: 0,
      temp_detail_height: 0,
      isLoading: true,
      package_history_id: 0,
      restCount: 0,
      myHeaders: {},
      accessToken: '',
      singleDisabled: false,
      process_type: ''
    };
    OneSignal.addEventListener('received', this.onReceived);
  }

  componentDidMount = async () => {
    const imgInfo = this.props.navigation.getParam('imgInfo')
    let userID = await AsyncStorage.getItem('userID')
    let userToken = await AsyncStorage.getItem('userToken')

    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': userToken.replace(/['"]+/g, ''),
      'User-ID': userID.replace(/['"]+/g, '')
    }

    await this.setState({
      myHeaders: myHeaders,
      imgInfo: imgInfo
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
        // console.log('token_error=>', error)
      })

    try {
      Image.getSize(amazon + imgInfo.bg_comp_url, (bg_comp_width, bg_comp_height) => {
        this.setState({ bg_comp_width, bg_comp_height })
      }, (error) => {
        // console.error(`Couldn't get the image size: ${error.message}`);
      });
      Image.getSize(amazon + imgInfo.orig_comp_detail_url, (orig_comp_detail_width, orig_comp_detail_height) => {
        this.setState({
          orig_comp_detail_width: orig_comp_detail_width * 0.9,
          orig_comp_detail_height: orig_comp_detail_height * 0.9,
          temp_detail_width: orig_comp_detail_width * 0.9,
          temp_detail_height: orig_comp_detail_height * 0.9,
        })
      }, (error) => {
        // console.error(`Couldn't get the orig_image size: ${error.message}`);
      });
    } catch (error) {
      // console.log(error);
    }

    // console.log('isPortrait_first=>', this.state.isPortrait);
    // console.log('BG_URL=>', amazon + imgInfo.bg_comp_url);
    // console.log('Img_URL=>', amazon + imgInfo.orig_comp_detail_url);
    // console.log('bg_width & bg_height=>', this.state.bg_comp_width, this.state.bg_comp_height);
    // console.log('width & height=>', this.state.orig_comp_detail_width, this.state.orig_comp_detail_height);
    // console.log('isActivated=>', this.state.isActivated);
    // console.log('isPaid=>', this.state.isPaid);

    this.activeState(1)
    setTimeout(() => {
      this.measureImageSize()
    }, 3000);

    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    OneSignal.removeEventListener('received', this.onReceived);
  }

  onReceived(notification) {
    showMessage({
      message: `${notification.payload.body}`,
      type: "success",
    });
  }

  start = () => {
    this.onFetchOverlay()
    this.onFetchFrame()
  }

  measureImageSize = () => {
    if (this.state.bg_comp_width && this.state.bg_comp_height) {
      // console.log(this.state.bg_comp_width, this.state.bg_comp_height);
      this.setState({
        realRatio: this.state.bg_comp_width / this.state.bg_comp_height,
        originRatio: this.state.orig_comp_detail_width / this.state.orig_comp_detail_height,
      })
      if (this.state.realRatio > 4 / 3) {
        this.setState({ isPortrait: false })
      } else {
        this.setState({ isPortrait: true })
      }

      if (this.state.originRatio > 4 / 3) {
        this.setState({ originIsPortrait: false })
      } else {
        this.setState({ originIsPortrait: true })
      }
      // console.log('isPortrait?', this.state.isPortrait);
      // console.log('isPortrait?', this.state.realRatio);
    } else {
      // Toast.showWithGravity('This image is not processed yet.', Toast.LONG, Toast.BOTTOM);
      // console.log('This image is not processed yet.');
    }
  }

  activeState = (ee) => {
    var today = new Date().getTime()
    var srch_date = dayjs(today).format('YYYY-MM-DD HH:mm:ss')
    
    let details = {
      'srch_date': srch_date,
      'siteID': this.state.imgInfo.site_id,
    };
    let formBody = [];
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch(config.api.getActiveState, {
      method: 'POST',
      headers: this.state.myHeaders,
      body: formBody
    })
      .then(response => response.json())
      .then(async (res) => {
        ee == 1 && this.start()
        // console.log('********************', res);
        if (res['status'] == 200) {
          let result = res['result'][0]

          await this.setState({
            // isActivated: (dayjs(today).format('YYYY-MM-DD HH:mm:ss') > result['from_date'] && dayjs(today).format('YYYY-MM-DD HH:mm:ss') < result['to_date']) ? true : false,
            isActivated: true,
            package_history_id: result['id'],
            restCount: result['image_count'] != "" ? result['image_count'] - result['waste_image_count'] : "unlimited",
            isLoading: false,
            process_type: res['process_type']
          })
          this.watermarkShow()
        } else if (res['status'] == 210) {
          this.setState({
            isActivated: false,
            package_history_id: 0,
            restCount: "noPackage",
          })
        }
      })
      .catch((error) => { console.log('checkActive=>', error); })
  }

  watermarkShow = () => {
    var watermarkShow = true;
    if (this.state.isActivated) {
      // console.log('this.state.isActivated',this.state.isActivated);
      // console.log('this.state.restCount', this.state.restCount);
      if (this.state.restCount == 'unlimited' || this.state.restCount > 0) {
        // console.log('this.state.restCount', this.state.restCount);
        watermarkShow = false
      } else {
        watermarkShow = true
      }
    }
    if (watermarkShow == true) {
      if (this.state.isPaid) {
        watermarkShow = false
      } else {
        watermarkShow = true
      }
    }
    return watermarkShow
  }

  onFetchOverlay = () => {
    // console.log('==============--------------', this.state.imgInfo.site_id);
    fetch(config.api.getOverlayInfo + '/' + this.state.imgInfo.site_id, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        await this.setState({
          isLoading: false,
          overlay: responseJSON,
          watermark: (responseJSON[0] == "" || responseJSON[0] == null || responseJSON[0] == undefined) ? 'emptyWatermark' : responseJSON[0]['watermark']
        })
        this.state.overlay.map(item => {
          if (item != "" && parseInt(item.orderID) == 1) {
            let obj = {}
            obj.id = parseInt(item.id)
            obj.country_id = item.country_id
            obj.site_id = item.site_id
            obj.location_id = item.location_id
            obj.attachment = item.attachment
            obj.comp_attachment = item.comp_attachment
            obj.orderID = item.orderID
            obj.isDeleted = item.isDeleted
            obj.created_at = item.created_at
            obj.watermark = item.watermark
            obj.title = item.title
            obj.width = item.width
            obj.height = item.height
            obj.rate = item.rate
            obj.rotate = item.rotate
            obj.type_id = item.type_id
            obj.category_id = item.category_id
            this.state.mainOverlay.push(obj)
          } else if (item != "" && parseInt(item.orderID) == 2) {
            let secondObj = {}
            secondObj.id = parseInt(item.id)
            secondObj.location_id = item.location_id
            secondObj.comp_attachment = item.comp_attachment
            this.state.checkArr.push(secondObj)
            // console.log('=========>>>>>', this.state.checkArr);
          }
        })
      })
      .catch(err => console.log('_onFetchVideo=>', err))
  }

  onFetchFrame = () => {
    // console.log('==============--------------', this.state.imgInfo.site_id);
    fetch(BASE_PATH + '/api/frame/' + this.state.imgInfo.site_id, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        await this.setState({ frame: responseJSON })
        this.state.frame.map(item => {
          if (item != "") {
            let obj = {}
            obj.id = parseInt(item.id)
            obj.country_id = item.country_id
            obj.site_id = item.site_id
            obj.location_id = item.location_id
            obj.attachment = item.attachment
            obj.comp_attachment = item.comp_attachment
            obj.orderID = item.orderID
            obj.isDeleted = item.isDeleted
            obj.created_at = item.created_at
            obj.watermark = item.watermark
            obj.title = item.title
            obj.width = item.width
            obj.height = item.height
            obj.rate = item.rate
            obj.rotate = item.rotate
            obj.type_id = item.type_id
            obj.category_id = item.category_id
            this.state.mainFrame.push(obj)
          }
        })
      })
      .catch(err => console.log('_onFetchVideo=>', err))
  }

  onBackPress = () => {
    if (this.state.isPaid) {
      Alert.alert(
        'Warning!',
        "If you go back without process image now, you are not able to process until you pay again. Are you sure want to go back?",
        [
          { text: 'CANCEL', style: 'cancel' },
          {
            text: 'OK', onPress: () => {
              this.props.navigation.navigate('Gallery')
            }
          }
        ]
      )
    } else {
      this.props.navigation.navigate('Gallery')
    }
    return true;
  }
  overlayFunc = async (item) => {
    // console.log(item.location_id);
    await this.setState({
      overlayInfo: item.comp_attachment.toString().split("\n")[0],
      overlayID: item.location_id,
      positionX: item.width,
      positionY: item.height,
      rate: item.rate,
      rotate: item.rotate,
      orig_comp_detail_width: item.id != 0 ? width : this.state.temp_detail_width,
      orig_comp_detail_height: item.id != 0 ? width * 3 / 4 : this.state.temp_detail_height
    })
    // console.log('orig_width, height=>', this.state.orig_comp_detail_width, this.state.orig_comp_detail_height);
    if (item.id != 0) {
      this.setState({ isNone: false, tempOverlay: false })
    } else this.setState({ isNone: true, tempOverlay: true })

    this.state.checkArr.map((pieceItem) => {
      if (pieceItem != "" && pieceItem.location_id == item.location_id) {
        this.setState({ isShowPiece: true, pieceURL: pieceItem.comp_attachment })
        // console.log('--------->>>>>', this.state.pieceURL);
      } else {
        this.setState({ isShowPiece: false })
      }
    })
  }
  renderOverlay = ({ item }) => (
    <TouchableOpacity onPress={() => this.overlayFunc(item)} style={styles.overlay} disabled={this.state.imgInfo.bg_comp_url == "" ? true : false}>
      {/* <Image source={item.img} style={{ ...styles.overlayImage, borderColor: this.state.overlayID == item.location_id ? Colors.authButton : 'white' }} /> */}
      <FastImage
        style={{
          ...styles.overlayImage,
          borderColor: this.state.overlayID == item.location_id ? Colors.authButton : 'white',
          opacity: this.state.imgInfo.bg_comp_url == "" ? 0.3 : 1
        }}
        source={item.id != 0 ? {
          uri: amazon + item.comp_attachment.toString().split("\n")[0],
          priority: FastImage.priority.normal,
        } : empty}
        resizeMode={FastImage.resizeMode.cover}
      >
        <ActivityIndicator size='small' style={StyleSheet.absoluteFill} color={Colors.authButton}
          animating={this.state.overlayInfo ? false : true} />
      </FastImage>
      {
        this.state.overlayID == item.location_id ?
          <Text style={{ fontWeight: '700' }} numberOfLines={1}>{item.title}</Text>
          :
          <Text style={{ fontSize: 12 }} numberOfLines={1}>{item.title}</Text>
      }
    </TouchableOpacity>
  )

  frameFunc = async (item) => {
    await this.setState({
      frameInfo: item.comp_attachment.toString().split("\n")[0],
      frameID: item.location_id
    })
    if (item.id != 0) {
      this.setState({ tempFrame: false })
    } else this.setState({ tempFrame: true })
  }
  renderFrame = ({ item }) => (
    <TouchableOpacity onPress={() => this.frameFunc(item)} style={styles.overlay}>
      {/* <Image source={{ uri: amazon + item.comp_attachment }} style={{ width: width * 0.25, height: width * 0.25, borderRadius: 5, borderWidth: 3, borderColor: this.state.frameID == item.location_id ? Colors.authButton : 'white' }} /> */}
      <FastImage
        style={{ ...styles.overlayImage, borderColor: this.state.frameID == item.location_id ? Colors.authButton : 'white' }}
        source={item.id != 0 ? {
          uri: amazon + item.comp_attachment.toString().split("\n")[0],
          priority: FastImage.priority.normal,
        } : empty}
        resizeMode={FastImage.resizeMode.cover}
      >
        <ActivityIndicator size='small' style={StyleSheet.absoluteFill} color={Colors.authButton}
          animating={this.state.frameInfo ? false : true} />
      </FastImage>
      {
        this.state.frameID == item.location_id ?
          <Text style={{ fontWeight: '700' }} numberOfLines={1}>{item.title}</Text>
          :
          <Text style={{ fontSize: 12 }} numberOfLines={1}>{item.title}</Text>
      }
    </TouchableOpacity>
  )

  _onProcessReady = () => {
    if (this.state.tempFrame && this.state.tempOverlay) {
      Toast.showWithGravity('Please select overlay or frame', Toast.LONG, Toast.BOTTOM);
    } else {
      if (this.state.isActivated || this.state.isPaid) {
        if (this.state.restCount == 'unlimited' || this.state.restCount > 1 || this.state.isPaid) {
          Alert.alert(
            'Confirm Process',
            '',
            [
              { text: 'CANCEL', style: 'cancel' },
              { text: 'OK', onPress: () => { this._onProcess() } }
            ]
          )
        } else {
          Alert.alert('Warning!', "You have run out of packages you have purchased. Please purchase a single content.")
        }
      } else {
        Alert.alert('Warning!', "You haven’t purchased any packages or single content items yet. Please purchase either one to complete the processing transaction. Thanks!")
      }
    }

  }

  _onProcess = () => {
    // console.log(this.state.imgInfo.id, this.state.overlayID, this.state.frameID);
    this.setState({ isLoading: true })
    var formdata = new FormData();
    formdata.append("gallery_id", this.state.imgInfo.id);
    formdata.append("overlay_id", this.state.overlayID)
    formdata.append("frame_id", this.state.frameID)
    formdata.append("package_history_id", this.state.package_history_id)
    formdata.append("process_type", this.state.process_type)

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    }

    fetch(config.api.guestImageProcess, requestOptions)
    this.activeState(2)
    setTimeout(() => {
      this.setState({ isLoading: false })
      if (!this.state.isActivated && this.state.isPaid) {
        this.setState({ isPaid: false })
      }
    }, 2000);
    setTimeout(() => {
      Alert.alert('Request was received successfully.', 'You will get processed image in less than 10 seconds.')

    }, 2100);

    // .then(response => response.json())
    // .then(async (result) => {
    //   // console.log('result=>', result)
    //   this.setState({ isLoading: false })
    //   if (result["result"] == "success") {
    //     await this.props.FetchGalleryInfo(0, 0);
    //     alert("Successfully Processed!")
    //     if (!this.state.isActivated && this.state.isPaid) {
    //       this.setState({ isPaid: false })
    //     }
    //   } else if (result["result"] != "success") {
    //     alert('Photo process failed')
    //   }
    // })
    // .catch(error => {
    //   this.setState({ isLoading: false })
    //   // console.log('error', error)
    //   alert('Network connection error')
    // });
  }

  _onPayReady = () => {
    console.log(this.state.buyPrice * this.state.currency_rate);
    Alert.alert(
      'Confirm Payment',
      'This purchase will allow you to purchase a single piece of content.',
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'OK', onPress: () => { this._onPayYouGo() } }
      ]
    )
  }

  _onPayYouGo = () => {
    this.setState({ isLoading: true })
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
        "payment_method": "paypal"
      },
      "transactions": [{
        "amount": {
          "total": PriceList.gDetailPrice,
          "currency": "USD",
          "details": {
            "subtotal": PriceList.gDetailPrice,
            "tax": "0",
            "shipping": "0",
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
        // axios.post('https://api.sandbox.paypal.com/v1/payments/payment', details, {
        axios.post('https://api-m.paypal.com/v1/payments/payment', details, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${response.data.access_token}`,
          },
        })
          .then((response) => {
            this.setState({ isLoading: false })
            const { id, links } = response.data;
            const approvalUrl = links.find(
              (data) => data.rel == 'approval_url',
            );

            // console.log('---------id------------', id, response.data);
            // console.log('---------approve---------', approvalUrl);

            // Linking.openURL(approvalUrl.href);

            this.setState({
              paymentId: id,
              approvalUrl: approvalUrl.href
            })

          })
          .catch((err) => {
            // console.log('------error2222------', { ...err });
            alert('Something went wrong.')
            this.setState({ isLoading: false })
          });
      })
      .catch((err) => {
        // console.log('------error111------', err);
        alert('Something went wrong.')
        this.setState({ isLoading: false })
      });
  };

  _onNavigationStateChange = (webViewState) => {
    // console.log('-----------webViewState------------', webViewState);
    if (webViewState.url.includes('https://example.com/')) {
      this.setState({
        approvalUrl: null
      })
      // const { PayerID, paymentId } = webViewState.url
      const paymentId = webViewState.url.substring(37, webViewState.url.indexOf('&token'))
      const PayerID = webViewState.url.substring(webViewState.url.indexOf('&PayerID=') + 9)
      // console.log('--------PayerID--------', PayerID);
      // console.log('--------paymentId--------', paymentId);
      axios.post(`https://api-m.paypal.com/v1/payments/payment/${paymentId}/execute`, { payer_id: PayerID },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      )
        .then((response) => {
          // console.log('response', response);
          this.setState({ isPaid: true, package_history_id: 0 })
          alert('You can now proceed to process the image')
        })
        .catch(err => {
          // console.log('=======Start========')
          console.log({ ...err })
          // console.log(err)
          // console.log('=======End========')
        })
    }
  }

  render() {
    const {
      mainFrame,
      overlay,
      imgInfo,
      overlayInfo,
      frameInfo,
      isNone,
      watermark,
      tempOverlay,
      pieceURL,
      isShowPiece,
      mainOverlay,
      positionX,
      positionY,
      rotate,
      rate,
      originIsPortrait,
      isPaid,
      isActivated,
      approvalUrl
    } = this.state
    return (
      <SafeAreaView style={styles.container}>
        {
          !approvalUrl ?
            <>
              <StatusBar hidden />
              <FlashMessage position="bottom" duration={5500} animationDuration={700} icon="success" />
              <ScrollView>
                <Spinner
                  visible={this.state.isLoading}
                  textContent={'Processing...'}
                  textStyle={{ color: 'white' }}
                />
                <View style={styles.main}>

                  <View style={styles.board}>
                    <View style={styles.imgContainer}>
                      {overlayInfo != "" &&
                        <Image style={styles.photo} source={{ uri: amazon + overlayInfo }} resizeMode="contain" />
                        // <FastImage
                        //   style={styles.photo}
                        //   source={{
                        //     uri: amazon + overlayInfo,
                        //     priority: FastImage.priority.normal,
                        //   }}
                        //   resizeMode={FastImage.resizeMode.contain}
                        // >
                        //   <ActivityIndicator size='small' style={StyleSheet.absoluteFill} color={Colors.authButton}
                        //     animating={overlayInfo != "0" ? false : true} />
                        // </FastImage>
                      }
                      {
                        isNone && tempOverlay ?
                          <Image style={styles.photo1} source={{ uri: amazon + imgInfo.orig_comp_detail_url }} resizeMode="contain" />
                          // <FastImage
                          //   style={styles.photo1}
                          //   source={{
                          //     uri: amazon + imgInfo.orig_comp_detail_url,
                          //     priority: FastImage.priority.normal,
                          //   }}
                          //   resizeMode={FastImage.resizeMode.contain}
                          // >
                          //   <ActivityIndicator size='small' style={StyleSheet.absoluteFill} color={Colors.authButton}
                          //     animating={imgInfo ? false : true} />
                          // </FastImage>
                          :
                          this.state.isPortrait ?
                            <Image style={{
                              position: 'absolute',
                              height: mainHeight * rate,
                              width: 1 / this.state.realRatio * mainHeight * rate,
                              left: mainWidth * positionX - 1 / this.state.realRatio * mainHeight * rate / 2,
                              bottom: mainHeight * positionY,
                              transform: [{ rotate: `${rotate}deg` }],
                              // borderWidth: 1,
                              // borderColor: 'blue'
                            }}
                              source={{ uri: amazon + imgInfo.bg_comp_url }} resizeMode="contain" />
                            // <FastImage
                            //   style={{
                            //     position: 'absolute',
                            //     height: mainHeight * rate,
                            //     width: 1 / this.state.realRatio * mainHeight * rate,
                            //     left: mainWidth * positionX - 1 / this.state.realRatio * mainHeight * rate / 2,
                            //     bottom: mainHeight * positionY,
                            //     transform: [{ rotate: `${rotate}deg` }]
                            //   }}
                            //   source={{
                            //     uri: amazon + imgInfo.bg_comp_url,
                            //     priority: FastImage.priority.normal,
                            //   }}
                            //   resizeMode={FastImage.resizeMode.contain}
                            // >
                            //   <ActivityIndicator size='small' style={StyleSheet.absoluteFill} color={Colors.authButton}
                            //     animating={imgInfo ? false : true} />
                            // </FastImage>
                            :
                            <Image style={{
                              position: 'absolute',
                              width: mainWidth * rate,
                              height: 1 / this.state.realRatio * mainWidth * rate,
                              left: mainWidth * positionX - mainWidth * rate / 2,
                              bottom: mainHeight * positionY,
                              transform: [{ rotate: `${rotate}deg` }],
                              // borderWidth: 1,
                              // borderColor: 'red'
                            }}
                              source={{ uri: amazon + imgInfo.bg_comp_url }} resizeMode="contain" />
                        // <FastImage
                        //   style={{
                        //     position: 'absolute',
                        //     width: mainWidth * rate,
                        //     height: 1 / this.state.realRatio * mainWidth * rate,
                        //     left: mainWidth * positionX - mainWidth * rate / 2,
                        //     bottom: mainHeight * positionY,
                        //     transform: [{ rotate: `${rotate}deg` }]
                        //   }}
                        //   source={{
                        //     uri: amazon + imgInfo.bg_comp_url,
                        //     priority: FastImage.priority.normal,
                        //   }}
                        //   resizeMode={FastImage.resizeMode.contain}
                        // >
                        //   <ActivityIndicator size='small' style={StyleSheet.absoluteFill} color={Colors.authButton}
                        //     animating={imgInfo ? false : true} />
                        // </FastImage>
                      }
                      {isShowPiece && <Image style={styles.photo1} source={{ uri: amazon + pieceURL }} resizeMode="contain" />}
                      {frameInfo != "" && <Image style={{ ...styles.photo1, width: !this.state.tempOverlay ? this.state.orig_comp_detail_width * 0.9 : this.state.orig_comp_detail_width }} source={{ uri: amazon + frameInfo }} resizeMode="stretch" />}

                      {/* {
                        (isPaid || isActivated) ?
                          (this.state.restCount == "unlimited" || this.state.restCount > 0 || isPaid) ?
                            []
                            :
                            <View style={{
                              ...styles.watermarkContainer,
                              width: this.state.orig_comp_detail_width,
                              height: this.state.orig_comp_detail_height,
                              marginTop: originIsPortrait ? -mainHeight : -mainHeight + (mainHeight - this.state.orig_comp_detail_height) / 2,
                            }}>
                              <Image style={styles.watermark} source={watermark == "emptyWatermark" ? watermarkSample : { uri: amazon + watermark }} resizeMode="stretch" />
                            </View>
                          :
                          <View style={{
                            ...styles.watermarkContainer,
                            width: this.state.orig_comp_detail_width,
                            height: this.state.orig_comp_detail_height,
                            marginTop: originIsPortrait ? -mainHeight : -mainHeight + (mainHeight - this.state.orig_comp_detail_height) / 2,
                          }}>
                            <Image style={styles.watermark} source={watermark == "emptyWatermark" ? watermarkSample : { uri: amazon + watermark }} resizeMode="stretch" />
                          </View>
                      } */}

                      {
                        this.watermarkShow() == true &&
                        <View style={{
                          ...styles.watermarkContainer,
                          width: this.state.orig_comp_detail_width,
                          height: this.state.orig_comp_detail_height,
                          marginTop: originIsPortrait ? -mainHeight : -mainHeight + (mainHeight - this.state.orig_comp_detail_height) / 2,
                        }}>
                          <Image style={styles.watermark} source={watermark == "emptyWatermark" ? watermarkSample : { uri: amazon + watermark }} resizeMode="stretch" />
                        </View>
                      }

                    </View>
                    <View style={styles.flatlist}>
                      <TextComponent medium heavy>Choose Overlay</TextComponent>
                      <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        data={mainOverlay}
                        renderItem={this.renderOverlay}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    </View>
                    <View style={styles.flatlist}>
                      <TextComponent medium heavy>Choose Frame</TextComponent>
                      <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        data={mainFrame}
                        renderItem={this.renderFrame}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginVertical: 30 }}>
                      <TouchableOpacity style={{ ...styles.mainBtn, backgroundColor: Colors.authButton }} onPress={() => { this._onProcessReady() }}>
                        {/* <TouchableOpacity style={{ ...styles.mainBtn, backgroundColor: Colors.authButton }} onPress={() => alert(this.state.isActivated)}> */}
                        <TextComponent heavy white>Process</TextComponent>
                        <MaterialCommunityIcons style={{ margin: 5 }} name="telegram" size={24} color={Colors.white} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          ...styles.mainBtn,
                          backgroundColor: (isActivated || isPaid) ? (this.state.restCount == 'unlimited' || this.state.restCount > 1 || this.state.isPaid) ? Colors.borderColor : Colors.authButton : Colors.authButton,
                        }}
                        onPress={() => { this._onPayReady() }}
                        disabled={(isActivated || isPaid) ? (this.state.restCount == 'unlimited' || this.state.restCount > 1 || this.state.isPaid) ? true : false : false}>
                        <TextComponent heavy white>Purchase</TextComponent>
                        <MaterialCommunityIcons style={{ margin: 5 }} name="cash" size={24} color={Colors.white} />
                      </TouchableOpacity>

                    </View>
                  </View>


                </View>
              </ScrollView>
            </>
            :
            <View style={{ flex: 1, paddingTop: 20 }}>
              <WebView
                style={{ height: height, width: width, marginTop: 40 }}
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
    backgroundColor: 'white',
  },
  main: {
    flex: 1,
    width: '100%',
    paddingTop: Platform.OS == 'android' ? 50 : 70,
    paddingHorizontal: 20,
  },
  title: {
    flexDirection: 'row',
    marginBottom: 20
  },
  imgContainer: {
    width: mainWidth,
    height: mainHeight,
    alignSelf: "center",
    marginBottom: 10,
    overflow: 'hidden',
    // borderColor: 'red',
    // borderWidth: 1
  },
  photo: {
    width: mainWidth,
    height: mainHeight,
    alignSelf: "center",
  },
  photo1: {
    width: mainWidth,
    height: mainHeight,
    alignSelf: "center",
    marginTop: -mainHeight
  },
  watermark: {
    width: mainWidth,
    height: mainHeight,
    alignSelf: "center",
  },
  watermarkContainer: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  photoChange: {
    // marginTop: -width * 0.7,
    position: 'absolute',
    width: mainWidth * 0.6,
    height: mainHeight * 0.6,
    left: mainWidth * 0.4,
    bottom: mainHeight * 0.35,
    transform: [{ rotate: '10deg' }]
  },
  flatlist: {
    width: '94%',
    alignSelf: "center",
    paddingTop: 5,
  },
  mainBtn: {
    flexDirection: 'row',
    height: 42,
    justifyContent: 'center',
    alignItems: "center",
    borderRadius: 21,
    paddingHorizontal: 10,
    width: '40%'
  },
  board: {
    width: mainWidth,
    borderRadius: 5,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginTop: 3,
    elevation: 3,
    marginBottom: 50,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.2,
    shadowRadius: 1
  },
  shareIcon: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'white',
    elevation: 10,
    top: 10,
    right: 10,
    justifyContent: 'center',
    alignItems: "center"
  },
  overlayImage: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 5,
    borderWidth: 3,
  },
  overlay: {
    width: width * 0.25,
    height: width * 0.35,
    alignItems: "center",
    justifyContent: 'center',
    elevation: 2,
    marginHorizontal: 7,
  }
})

const mapStateToProps = (state) => {
  return {
    overlayInfo: state.galleryDetail.overlayInfo,
    frameInfo: state.galleryDetail.frameInfo,
  };
};

export default connect(mapStateToProps, {
  FetchOverlay,
  FetchFrame,
  FetchGalleryInfo
})(GalleryDetail);
