import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, Dimensions, Image, TouchableOpacity, TouchableWithoutFeedback, FlatList, BackHandler, Alert, ActivityIndicator } from 'react-native';
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
import Video from 'react-native-video';
import FontAwesome from "react-native-vector-icons/FontAwesome"
import ProgressBar from "react-native-progress/Bar";
import AsyncStorage from "@react-native-community/async-storage";
import FlashMessage, { showMessage } from 'react-native-flash-message';
import OneSignal from 'react-native-onesignal';
import PriceList from '../constants/PriceList'
import Credendials from '../constants/Credentials'
import dayjs from 'dayjs'
import { WebView } from 'react-native-webview'
import axios from 'axios';
import qs from 'qs';
import { decode, encode } from 'base-64';

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
const tempWidth = width * 0.45
const empty = require('../assets/images/c_empty.png')

class GalleryDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActivated: false,
      isPaid: false,
      isNone: true,
      isLoading: true,
      galleryData: [],
      mainGalleryData: [
        {
          bg_comp_url: '',
          bg_url: '',
          country_id: 0,
          created_at: '',
          favourite_id: 0,
          id: 0,
          isDeleted: 0,
          orig_comp_detail_url: '',
          orig_comp_file_url: empty,
          orig_file_url: '',
          site_id: 0,
          upload_type_id: 0,
          user_id: 0
        }
      ],
      videoInfo: [],
      paused: false,
      progress: 0,
      duration: 0,
      videoURL: '',
      gallery_id: 0,
      bgRemovedImage: '',
      positionX: 0,
      imgHeight: 0,
      watermark: '',
      package_history_id: 0,
      resVideoCount: 0,
      restCount: 0,
      process_type: ''
    };
    OneSignal.addEventListener('received', this.onReceived);
  }

  componentDidMount = async () => {
    let token = await AsyncStorage.getItem('userToken')
    let userID = await AsyncStorage.getItem('userID')
    const videoInfo = this.props.navigation.getParam('videoInfo')
    await this.setState({
      videoInfo: videoInfo,
      token: token,
      userID: userID,
    })
    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': this.state.token.replace(/['"]+/g, ''),
      'User-ID': this.state.userID.replace(/['"]+/g, '')
    }

    let videoURL = this.state.videoInfo.attachment
    this.setState({ videoURL: videoURL.toString().split("\n")[0], myHeaders: myHeaders })

    fetch(config.auth.token, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then(response => response.json())
      .then((res) => {
        if (res['status'] == 201) {
          this.props.navigation.navigate('Login')
        } else this.start(this.state.videoInfo.site_id, this.state.videoInfo.id)
      })
      .catch((error) => {
        console.log('token_error=>', error)
      })

    // console.log('videoInfo =>', this.state.videoURL);
    console.log('this.state.videoInfo.site_id=>', this.state.videoInfo.site_id);
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      setTimeout(() => {
        if (token == "") {
          this.props.navigation.navigate('Auth')
        }
      }, 5000);
    });
  }

  componentWillUnmount() {
    this.focusListener.remove();
    OneSignal.removeEventListener('received', this.onReceived);
  }

  onReceived(notification) {
    showMessage({
      message: `${notification.payload.body}`,
      type: "success",
    });
  }
  start = (site_id, background_id) => {
    this._onFetchGalleryBySite(site_id)
    this._onFetchPosition(background_id)
    this.activeState()
  }

  activeState = () => {
    var today = new Date().getTime()
    var srch_date = dayjs(today).format('YYYY-MM-DD HH:mm:ss')

    let details = {
      'srch_date': srch_date,
      'siteID': this.state.videoInfo.site_id,
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
        // console.log('********************', res);
        if (res['status'] == 200) {
          let result = res['result'][0]
          // let from_date = new Date(`${result['from_date'].slice(0, 10)}T${result['from_date'].slice(11, 19)}`).getTime()
          // let to_date = new Date(`${result['to_date'].slice(0, 10)}T${result['to_date'].slice(11, 19)}`).getTime()

          this.setState({
            // isActivated: (dayjs(today).format('YYYY-MM-DD HH:mm:ss') > result['from_date'] && dayjs(today).format('YYYY-MM-DD hh:mm:ss') < result['to_date']) ? true : false,
            isActivated: true,
            package_history_id: result['id'],
            restCount: result['video_count'] != "Unlimited" ? result['video_count'] - result['waste_video_count'] : "unlimited",
            process_type: res['process_type']
          })
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
  // activeState = () => {
  //   let today = new Date().getTime()
  //   let currentDate = dayjs(today).format('YYYY-MM-DD')
  //   let currentHour = new Date().getHours()

  //   var formdata = new FormData();
  //   formdata.append("currentDate", currentDate);
  //   formdata.append("currentHour", currentHour);
  //   formdata.append("siteID", this.state.videoInfo.site_id);

  //   var requestOptions = {
  //     method: 'POST',
  //     body: formdata,
  //     redirect: 'follow'
  //   }

  //   fetch(config.api.getActiveState, requestOptions)
  //     .then(response => response.json())
  //     .then(async (res) => {
  //       this.setState({
  //         isActivated: res['active'] == 1 ? true : false,
  //         package_history_id: res['package_history_id'],
  //         restCount: res['res_count']
  //       })
  //     })
  //     .catch((error) => { console.log('checkActive=>', error); })
  // }

  _onFetchGalleryBySite = (e) => {
    console.log('e=>', e);
    fetch(config.api.getGalleryInfo + '/' + e, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {

        await this.setState({
          galleryData: responseJSON['gallery_list'],
          isLoading: false,
        })
        console.log('====================', responseJSON['gallery_list'][0]);
        responseJSON['gallery_list'].map(item => {
          if (item != "") {
            let obj = {}
            obj.bg_comp_url = item.bg_comp_url
            obj.bg_url = item.bg_url
            obj.country_id = item.country_id
            obj.created_at = item.created_at
            obj.favourite_id = item.favourite_id
            obj.id = item.id
            obj.isDeleted = item.isDeleted
            obj.orig_comp_detail_url = item.orig_comp_detail_url
            obj.orig_comp_file_url = item.orig_comp_file_url
            obj.orig_file_url = item.orig_file_url
            obj.site_id = item.site_id
            obj.upload_type_id = item.upload_type_id
            obj.user_id = item.user_id
            this.state.mainGalleryData.push(obj)
          }
        })
      })
      .catch(err => console.log('_onFetchGalleryInfoErr=>', err))
  }
  _onFetchPosition = (e) => {
    fetch(config.api.getPositionInfo + '/' + e, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        console.log('position=>', responseJSON.height);
        this.setState({
          positionX: responseJSON.width * mainWidth - tempWidth / 2,
          imgHeight: responseJSON.rate * mainHeight,
          positionY: responseJSON.height * mainHeight,
          watermark: responseJSON.watermarkfile
        })

      })
      .catch(err => console.log('_onFetchGalleryInfoErr=>', err))
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = () => {
    if (this.state.isPaid) {
      Alert.alert(
        'Warning!',
        "If you go back without process video now, you are not able to process until you pay again. Are you sure want to go back?",
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

  _onProcessReady = () => {
    if (this.state.isActivated || this.state.isPaid) {
      Alert.alert(
        'Confirm Process',
        '',
        [
          { text: 'CANCEL', style: 'cancel' },
          { text: 'OK', onPress: () => { this._onProcess() } }
        ]
      )
    } else {
      Alert.alert('Warning', 'Please purchase digital pass for this venue or purchase single video.')
    }
  }

  _onProcess = () => {
    // console.log(this.state.videoInfo.id, this.state.overlayID, this.state.frameID);
    this.setState({ isLoading: true })
    var formdata = new FormData();
    formdata.append("gallery_id", this.state.gallery_id);
    formdata.append("background_id", this.state.videoInfo.id)
    formdata.append("package_history_id", this.state.package_history_id)
    formdata.append("process_type", this.state.process_type)

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    }

    fetch(config.api.guestVideoProcess, requestOptions)
    // fetch('http://54.254.114.43:8000/api/zoomvideo_process', requestOptions)
    setTimeout(() => {
      this.setState({ isLoading: false })
      if (!this.state.isActivated && this.state.isPaid) {
        this.setState({ isPaid: false })
      }
    }, 2000);
    setTimeout(() => {
      Alert.alert('Request was received!', 'You will get processed content about 20min later')
    }, 2100);

    // fetch(config.api.guestVideoProcess, requestOptions)

    // .then(response => response.json())
    // .then(async (responseJSON) => {
    //   console.log('responseJSON=>', responseJSON)
    //   this.setState({ isLoading: false })
    //   if (responseJSON["result"] == "success") {

    //     await this.props.FetchGalleryInfo(0, 0);
    //     alert("Successfully Processed!")
    //     if (!this.state.isActivated && this.state.isPaid) {
    //       this.setState({ isPaid: false })
    //     }
    //   } else if (responseJSON["result"] != "success") {
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
    Alert.alert(
      'Confirm Payment',
      'This purchase will allow you to purchase a single piece of content.',
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'OK', onPress: () => { this._onPayYouGo() } }
      ]
    )
  }

  // _onPayYouGo = async () => {
  // const options = {
  //   merchantName: "sss",
  //   merchantPrivacyPolicyUri: "https://example.com/privacy",
  //   merchantUserAgreementUri: "https://example.com/useragreement",
  // }
  // PayPal.initialize(PayPal.NO_NETWORK, PAY_PAL_CLIENT_ID);
  // // PayPal.obtainConsent().then(authorization => console.log('User-Authorization', authorization))
  // //   .catch(error => console.log('error', error));
  // const metadataID = await PayPal.getClientMetadataId();
  // PayPal.pay({
  //   price: '0.1',
  //   currency: "USD",
  //   description: "You can process this video after pay 0.1 USD",
  // })
  //   .then((confirm) => {
  //     console.log('confirm', confirm);
  //     this.setState({ isPaid: true, package_history_id: 0 })
  //     alert('You can now proceed to process the video')
  //     // this.paymentHandler(confirm.response, subscription_id, days, userID);
  //   })
  //   .catch((error) => {
  //     if (error.message !== "User cancelled") {
  //       Alert.alert(error.message);
  //     }
  //     // console.log(error);
  //   });
  // }

  handleMainButtonTouch = () => {
    if (this.state.progress >= 0.99) {
      this.VideoPlayer.seek(0);
    }
    this.setState(state => {
      return {
        paused: !state.paused,
      };
    });
  };

  handleProgressPress = e => {
    const position = e.nativeEvent.locationX;
    const progress = (position / 250) * this.state.duration;
    const isPlaying = !this.state.paused;
    this.VideoPlayer.seek(progress);
  };

  handleProgress = progress => {
    this.setState({
      progress: progress.currentTime / this.state.duration,
    });
  };

  handleEnd = () => {
    this.setState({ paused: true });
  };

  handleLoad = meta => {
    this.setState({
      duration: meta.duration,
    });
  };

  secondsToTime(time) {
    return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60;
  }

  galleryFunc = (item) => {
    console.log(item);
    this.setState({
      gallery_id: item.id,
      isNone: item.id == 0 ? true : false,
      bgRemovedImage: item.bg_comp_url,
      paused: item.id == 0 ? false : true,
    })
  }

  renderGallery = (item) => (
    <TouchableOpacity onPress={() => this.galleryFunc(item.item)} style={styles.overlay}>
      <FastImage
        style={{ ...styles.overlayImage, borderColor: this.state.gallery_id == item.item.id ? Colors.authButton : 'white' }}
        source={item.item.id != 0 ? {
          uri: amazon + item.item.orig_comp_file_url,
          priority: FastImage.priority.normal,
        } : empty}
        resizeMode={FastImage.resizeMode.cover}
      >
        <ActivityIndicator size='small' style={StyleSheet.absoluteFill} color={Colors.authButton}
          animating={this.state.galleryData ? false : true} />
      </FastImage>
    </TouchableOpacity>
  )

  _onPayYouGo = () => {
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
          // "total": this.state.buyPrice * this.state.currency_rate,
          "total": PriceList.gDetailPrice,
          "currency": "USD",
          "details": {
            "subtotal": PriceList.gDetailPrice,
            // "subtotal": this.state.buyPrice * this.state.currency_rate,
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
        console.log('-----response-----', response.data.access_token);
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
            this.setState({ isChecking: false })
            const { id, links } = response.data;
            const approvalUrl = links.find(
              (data) => data.rel == 'approval_url',
            );

            console.log('---------id------------', id, response.data);
            console.log('---------approve---------', approvalUrl);

            this.setState({
              paymentId: id,
              approvalUrl: approvalUrl.href
            })

          })
          .catch((err) => {
            console.log('------error2222------', { ...err });
            Alert.alert('Warning', 'Something went wrong.')
            this.setState({ isChecking: false })
          });
      })
      .catch((err) => {
        console.log('------error111------', err);
        Alert.alert('Warning', 'Something went wrong.')
        this.setState({ isChecking: false })
      });
  };

  _onNavigationStateChange = (webViewState) => {
    console.log('-----------webViewState------------', webViewState);
    if (webViewState.url.includes('https://example.com/')) {
      this.setState({
        approvalUrl: null
      })
      // const { PayerID, paymentId } = webViewState.url
      const paymentId = webViewState.url.substring(37, webViewState.url.indexOf('&token'))
      const PayerID = webViewState.url.substring(webViewState.url.indexOf('&PayerID=') + 9)
      console.log('--------PayerID--------', PayerID);
      console.log('--------paymentId--------', paymentId);
      axios.post(`https://api-m.paypal.com/v1/payments/payment/${paymentId}/execute`, { payer_id: PayerID },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      )
        .then((response) => {
          console.log('response', response);
          this.setState({ isPaid: true, package_history_id: 0 })
          Alert.alert('Notice', 'You can now proceed to process the content')
        })
        .catch(err => {
          console.log('=======Start========')
          // console.log({ ...err })
          console.log(err)
          console.log('=======End========')
        })
    }
  }

  render() {
    const { mainGalleryData, isNone, isActivated, isPaid, watermark, approvalUrl } = this.state
    return (
      <SafeAreaView style={styles.container}>
        {
          !approvalUrl ?
            <>
              <FlashMessage position="bottom" duration={5500} animationDuration={700} icon="success" />
              <StatusBar hidden />
              <ScrollView>
                <Spinner
                  visible={this.state.isLoading}
                  textContent={'Loading...'}
                  textStyle={{ color: 'white' }}
                />
                <View style={styles.main}>

                  <View style={styles.board}>
                    <View style={styles.videoContainer}>
                      {
                        isNone ?
                          <>
                            <Video
                              paused={this.state.paused}
                              // source={{ uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' }}
                              // source={{ uri: 'http://d1z6a3vjnfowyr.cloudfront.net/Country/Hong_Kong/Disneyland/locations/Aladdin_Ride/aladin.mp4' }}
                              source={{ uri: amazon + this.state.videoURL }}
                              onLoad={this.handleLoad}
                              onProgress={this.handleProgress}
                              onEnd={this.handleEnd}
                              playInBackground={false}
                              resizeMode={'contain'}
                              ref={ref => this.VideoPlayer = ref}
                              style={{
                                width: mainWidth,
                                height: mainWidth * 2 / 3,
                              }}
                            />
                            <View style={styles.controls}>
                              <TouchableWithoutFeedback onPress={this.handleMainButtonTouch}>
                                <FontAwesome name={!this.state.paused ? "pause" : "play"} size={15} color="#FFF" style={{ marginRight: 15 }} />
                              </TouchableWithoutFeedback>
                              <TouchableWithoutFeedback onPress={this.handleProgressPress}>
                                <View>
                                  <ProgressBar
                                    progress={this.state.progress}
                                    color="#FFF"
                                    unfilledColor="rgba(255,255,255,.5)"
                                    borderColor="#FFF"
                                    width={250}
                                    height={10}
                                  />
                                </View>
                              </TouchableWithoutFeedback>

                              <Text style={styles.duration}>
                                {this.secondsToTime(Math.floor(this.state.progress * this.state.duration))}
                              </Text>
                            </View>
                          </>
                          :
                          <>
                            <Image style={styles.photo} source={{ uri: amazon + this.state.videoInfo.comp_attachment }} resizeMode="contain" />
                            <View style={{ ...styles.photoContainer, left: this.state.positionX }}>
                              <Image style={{ ...styles.photo1, height: this.state.imgHeight, bottom: -mainHeight + this.state.imgHeight + this.state.positionY }} source={{ uri: amazon + this.state.bgRemovedImage }} resizeMode="contain" />
                            </View>
                            {
                              !(isActivated || isPaid) &&
                              <Image style={styles.watermark} source={{ uri: amazon + watermark }} resizeMode="stretch" />
                            }
                          </>
                      }

                    </View>
                    <View style={styles.flatlist}>
                      <TextComponent medium heavy>Choose Gallery</TextComponent>
                      <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        data={mainGalleryData}
                        renderItem={this.renderGallery}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    </View>

                    <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginVertical: 30 }}>
                      <TouchableOpacity style={{ ...styles.mainBtn, backgroundColor: Colors.authButton }} onPress={() => { this._onProcessReady() }} >
                        <TextComponent heavy white>Process</TextComponent>
                        <MaterialCommunityIcons style={{ marginLeft: 5 }} name="telegram" size={24} color={Colors.white} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          ...styles.mainBtn,
                          backgroundColor: (this.state.restCount > 0 ||
                            this.state.restCount == "unlimited" ||
                            this.state.isActivated ||
                            this.state.isPaid) ? Colors.borderColor : Colors.authButton,
                        }}
                        onPress={() => { this._onPayReady() }}
                        disabled={(this.state.restCount > 0 ||
                          this.state.restCount == "unlimited" ||
                          this.state.isActivated ||
                          this.state.isPaid) ? true : false}>
                        <TextComponent heavy white>Purchase</TextComponent>
                        <MaterialCommunityIcons style={{ margin: 5 }} name="cash" size={24} color={Colors.white} />
                      </TouchableOpacity>

                    </View>
                  </View>


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
  controls: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: 48,
    left: 0,
    bottom: 0,
    right: 0,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  main: {
    flex: 1,
    width: '100%',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    flexDirection: 'row',
    marginBottom: 20
  },
  videoContainer: {
    width: mainWidth,
    height: mainHeight,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 10,
    overflow: 'hidden',
  },
  photo: {
    width: mainWidth,
    height: mainHeight,
    alignSelf: "center",
  },
  photo1: {
    width: mainWidth / 3,
    alignSelf: "center",
  },
  photoContainer: {
    position: 'absolute',
    width: tempWidth,
    height: mainHeight,
  },
  watermark: {
    width: mainWidth,
    height: mainHeight,
    alignSelf: "center",
    position: 'absolute'
  },
  watermarkContainer: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
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
    backgroundColor: Colors.authButton,
    borderRadius: 21,
    paddingHorizontal: 10,
    width: '40%'
  },
  board: {
    width: '100%',
    borderRadius: 5,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginTop: 3,
    elevation: 5,
    marginBottom: 50,
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
  },
  duration: {
    color: "#FFF",
    marginLeft: 15,
  },
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
