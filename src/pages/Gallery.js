import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  ProgressBarAndroid,
  ProgressViewIOS,
  PermissionsAndroid,
  Platform,
  RefreshControl,
  BackHandler,
} from 'react-native';
import TextComponent from '../components/TextComponent';
import Colors from '../constants/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-picker';
import Modal from 'react-native-modal';
import AuthButton from '../components/AuthButton';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import RNPickerSelect from 'react-native-picker-select';
import {
  FetchGalleryInfo,
  FetchCountry,
  FetchSite,
  FetchAlbum,
} from '../actions/Gallery/Gallery';
// import { FetchPackageInfo, FetchPackageCountry, FetchPackageSite } from "../actions/PackagePass/PackagePass"
import { connect } from 'react-redux';
import OneSignal from 'react-native-onesignal';
import AsyncStorage from '@react-native-community/async-storage';
import config, {
  amazon,
  BASE_PATH,
  GALLERY_PATH,
  MERCHANDISE_PATH,
} from '../api/config';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import CameraRoll from '@react-native-community/cameraroll';
import { Switch } from 'react-native-switch';
import Video from 'react-native-video';
import ProgressBar from 'react-native-progress/Bar';
import { BarIndicator } from 'react-native-indicators'

const { width, height } = Dimensions.get('window');
const PhotosTabImage = require('../assets/images/icon/photo.png');
const VideosTabImage = require('../assets/images/icon/video.png');
const AlbumsTabImage = require('../assets/images/icon/album.png');
const thumbnail = require('../assets/images/icon/thumbnail.jpg');
const newImage = require('../assets/images/newimage.png');
const emptyPhoto = require('../assets/images/icon/empty_avatar.png');
let backPressed = 0;


class Gallery extends Component {
  constructor(props) {
    global.gNumOfPhoto = 0;
    global.gNumOfVideo = 0;
    super(props);
    this.state = {
      isMounted: true,
      photos: [],
      uploadType: [
        { value: 0, label: 'Self Upload' },
        { value: 1, label: 'Venue Upload' },
      ],
      ContentType: [
        { value: 0, label: 'Image' },
        { value: 1, label: 'Video' },
      ],
      uploadType_id: 2,
      isImageID: 2,
      modalVisible: false,
      filePath: '',
      subscribe_amount: 10,
      tabID: 1,
      albumCount: 0,
      country: [],
      site: [],
      temp: [],
      country_id: 0,
      site_id: 0,
      avatar: '',
      avatarQR: '',
      avatarURI: '',
      QR_avatarURI: '',
      email: '',
      favorite: false,
      favorValue: 2,
      numOfPhoto: '',
      numOfVideo: '',
      numOfAlbum: '',
      galleryData: [],
      videoData: [],
      albumData: [],
      country_id_upload: 0,
      site_id_upload: 0,
      siteTemp: [],
      userID: '',
      token: '',
      progress: 0,
      downProgress: 0,
      indeterminate: true,
      isLoading: false,
      albumModalVisible: false,
      processedURL: '',
      processedURLForShare: '',
      refreshing: false,
      albumRefreshing: false,
      myHeaders: {},
      timeFlag: false,
      country_id_temp: '',
      btnToggle: false,
      avatarModalVisible: false,
      modalAvatarURI: '',
      isImage: 0,
      videoModalURL: '',
      paused: false,
      progress: 0,
      duration: 0,
      cnt: 0,
      isUploading: false
    };
    OneSignal.addEventListener('received', this.onReceived);
  }

  componentDidMount = async () => {
    const avatar = (await AsyncStorage.getItem('photoURL')).toString();
    const avatarQR = (await AsyncStorage.getItem('qrURL')).toString();
    const email = (await AsyncStorage.getItem('email'))
      .toString()
      .replace(/['"]+/g, '');
    let token = await AsyncStorage.getItem('userToken');
    let userID = await AsyncStorage.getItem('userID');
    const avatarURI = `${amazon}${avatar.replace(/['"]+/g, '')}`;
    const QR_avatarURI = `${avatarQR.replace(/['"]+/g, '')}`;
    // console.log('avatar', avatar);
    // console.log('avatarQR', avatarQR);

    await this.setState({
      token: token,
      userID: userID,
      avatarURI: avatarURI,
      QR_avatarURI: QR_avatarURI,
      email: email,
      avatar: avatar,
      avatarQR: avatarQR,
    });
    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': this.state.token.replace(/['"]+/g, ''),
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
        }
      })
      .catch((error) => {
        // console.log('token_error=>', error)
      })

    const tabID = this.props.navigation.getParam('tabID');
    tabID != undefined
      ? this.setState({
        tabID: tabID,
      })
      : this.setState({ tabID: 1 });
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      setTimeout(() => {
        this._onFetchData();
        this.setState({ site_id: 0 });
      }, 100);
    });

    setTimeout(() => {
      this._onFetchData();
    }, 500);
  };

  componentWillUnmount() {
    this.focusListener.remove();
    OneSignal.removeEventListener('received', this.onReceived);
    // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton.bind(this));
  }

  onReceived(notification) {
    // console.log("Notification received: ", notification);
    showMessage({
      message: `${notification.payload.body}`,
      type: "success",
    });
  }

  handleBackButton() {
    // if (backPressed > 0) {
    //   BackHandler.exitApp();
    //   backPressed = 0;
    //   console.log(backPressed);
    // } else {
    //   backPressed++;
    //   console.log(backPressed);
    //   Toast.showWithGravity('Press Again To Exit', Toast.SHORT, Toast.BOTTOM);
    //   setTimeout(() => { backPressed = 0 }, 2000);
    //   return true;
    // }
  }

  _onFetchGalleryInfo = (e) => {
    fetch(config.api.getGalleryInfo + '/' + e, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        // console.log(responseJSON);
        await this.setState({
          galleryData: responseJSON['gallery_list'],
          numOfPhoto: responseJSON['gallery_list'].length,
          refreshing: false,
          cnt: this.state.cnt + 1,
        });
        global.gNumOfPhoto = this.state.numOfPhoto;
      })
      .catch((err) => {
        // console.log('_onFetchGalleryInfoErr=>', err);
        this.setState({ cnt: this.state.cnt + 1 });
      });
  };

  _onFetchSite = () => {
    this.setState({ siteTemp: [] });
    fetch(config.api.getSite, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        // console.log('_onFetchSite==>>>>>>>>>>>', responseJSON);
        responseJSON['site_list'].map((item, i) => {
          if (item != '') {
            let obj = {};
            obj.label = item.title;
            obj.value = item.id;
            this.state.siteTemp.push(obj);
          }
        });
        this.setState({
          site: this.state.siteTemp,
          cnt: this.state.cnt + 1,
        });
      })
      .catch((err) => {
        // console.log('fetchsiteErr=>', err);
        this.setState({ cnt: this.state.cnt + 1 });
      });
  };

  _onFetchAlbum = (uploadTypeID, favorID, isImageID) => {
    fetch(config.api.getAlbumInfo + '/' + uploadTypeID + '/' + favorID + '/' + isImageID, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        // console.log('FetchhAlbum=====>>>', responseJSON);
        this.setState({
          albumData: responseJSON['album_list'],
          albumRefreshing: false,
          numOfAlbum: responseJSON['album_list'].length,
          cnt: this.state.cnt + 1,
        });
        global.gNumOfVideo = this.state.numOfVideo;
      })
      .catch((err) => {
        // console.log('_onFetchAlbum=>', err);
        this.setState({ cnt: this.state.cnt + 1 });
      });
  };

  _onFetchVideo = (e) => {
    fetch(config.api.getVideoInfo + '/' + e, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        // console.log('FecthVideo=====>', responseJSON);
        this.setState({
          videoData: responseJSON,
          albumRefreshing: false,
          numOfVideo: responseJSON.length,
          cnt: this.state.cnt + 1,
        });
        global.gNumOfVideo = this.state.numOfVideo;
      })
      .catch((err) => {
        // console.log('_onFetchVideo=>', err);
        this.setState({ cnt: this.state.cnt + 1 });
      });
  };

  _cnt = (e) => {
    let numOfLoading = 0;
    if (e == 'init') {
      numOfLoading = 4;
    } else numOfLoading = 2;

    setTimeout(() => {
      var myInterval = setInterval(() => {
        if (this.state.cnt >= numOfLoading) {
          clearInterval(myInterval);
          this.setState({ isLoading: false });
        }
      }, 500);
    }, 1000);
  };

  _onFetchData = () => {
    this.setState({ isLoading: true });
    this._onFetchGalleryInfo(0);
    this._onFetchAlbum(2, 2, 2);
    this._onFetchSite();
    this._onFetchVideo(0);
    this._cnt('init');
  };

  _onChangeSite = (e) => {
    this.setState({ site_id: e, isLoading: true });
    this._onFetchGalleryInfo(e);
    this._onFetchVideo(e);
    this._cnt('change');
  };

  _onChangeModalSite = async (e) => {
    this.setState({ site_id_upload: e });
  };

  openModal = async () => {
    // console.log('modal');
    this.setState({
      modalVisible: true,
      filePath: '',
    });
  };

  _onPressPhoto = (item) => {
    // console.log('imageID=>', item);
    this.props.navigation.navigate('GalleryDetail', { imgInfo: item });
  };

  _onPressVideo = (item) => {
    // console.log('Video item', item);
    this.props.navigation.navigate('VideoDetail', { videoInfo: item });
  };

  _onPressAlbum = (item) => {
    // console.log(item.length);
    this.setState({
      albumModalVisible: true,
      processedURL: item.process_comp_file_url,
      processedURLForShare: item.process_file_url,
      isImage: item.isImage,
      videoModalURL: item.process_file_url,
    });
  };

  _markAlbumHeart = (album_id, favourite_id, upload_type_id) => {
    try {
      // console.log('album_id=>', album_id);
      // console.log('favourite_id=>', favourite_id);
      // console.log('upload_type_id=>', upload_type_id);
      let details = {
        album_id: album_id,
        favourite_id: favourite_id,
        upload_type_id: upload_type_id,
      };
      let formBody = [];
      for (let property in details) {
        let encodedKey = encodeURIComponent(property);
        let encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + '=' + encodedValue);
      }
      formBody = formBody.join('&');
      fetch(config.api.postMarkHeart, {
        method: 'POST',
        headers: this.state.myHeaders,
        body: formBody,
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          // console.log('res==========>>>>>>>>>>>', responseJSON);
          // console.log('******', responseJSON['gallery_list']);
          this.setState({ albumData: responseJSON['gallery_list'] });
          // this.props.FetchGalleryInfo()
        });
    } catch (error) {
      // console.log('markHeart_error =>', error);
    }
  };

  renderPhotos = ({ item }) => (
    <View style={{ width: width * 0.31, paddingTop: 5 }}>
      <TouchableOpacity
        style={{ marginHorizontal: width * 0.01 }}
        onPress={() => this._onPressPhoto(item)}
        activeOpacity={0.7}>
        <View style={{ ...styles.imgItem, backgroundColor: 'white' }}>
          <FastImage
            style={styles.photoList}
            source={{
              uri: amazon + item.orig_comp_file_url,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}>
            <ActivityIndicator
              size="large"
              style={StyleSheet.absoluteFill}
              color={Colors.authButton}
              animating={this.state.galleryData ? false : true}
            />
          </FastImage>
        </View>
      </TouchableOpacity>

      {Math.floor((new Date().getTime() - new Date(`${item.created_at.slice(0, 10)}`).getTime()) / (1000 * 60 * 60 * 24)) < 3 &&
        <Image source={newImage} style={styles.newImage} />}
    </View>
  );

  renderVideos = ({ item }) => (
    <View style={{ width: width * 0.31, paddingTop: 5 }}>
      <TouchableOpacity
        style={{ marginHorizontal: width * 0.01 }}
        onPress={() => this._onPressVideo(item)}
        activeOpacity={0.7}>
        <View style={{ ...styles.imgItem, backgroundColor: 'white' }}>
          <FastImage
            style={styles.photoList}
            source={{ uri: amazon + item.comp_attachment }}
            resizeMode={FastImage.resizeMode.cover}>
            <ActivityIndicator
              size="large"
              style={StyleSheet.absoluteFill}
              color={Colors.authButton}
              animating={this.state.videoData ? false : true}
            />
          </FastImage>
          <View style={[styles.photoList, styles.videoList]}>
            <FontAwesome name="play-circle-o" color="white" size={40} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  renderAlbums = ({ item }) => (
    <View style={{ width: width * 0.31, paddingTop: 5 }}>
      <TouchableOpacity
        style={{ marginHorizontal: width * 0.01 }}
        onPress={() => this._onPressAlbum(item)}
        activeOpacity={0.7}>
        <View style={styles.imgItem}>
          <FastImage
            style={styles.photoList}
            source={{
              uri: amazon + item.process_comp_file_url,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}>
            <ActivityIndicator
              size="large"
              style={StyleSheet.absoluteFill}
              color={Colors.authButton}
              animating={this.state.albumData ? false : true}
            />
          </FastImage>
          {item.isImage == 1 && (
            <View style={[styles.photoList, styles.videoList]}>
              <FontAwesome name="play-circle-o" color="white" size={40} />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.heartArea}>
        <TouchableOpacity
          style={styles.heart}
          onPress={() => {
            let favouriteAlbum_id = item.favourite_id == 1 ? 0 : 1;
            this._markAlbumHeart(
              item.id,
              favouriteAlbum_id,
              this.state.uploadType_id,
            );
          }}>
          {/* <FontAwesome name={'heart'} color={'red'} size={20} /> */}
          <FontAwesome
            name={item.favourite_id == 1 ? 'heart' : 'heart-o'}
            color={'red'}
            size={20}
          />
        </TouchableOpacity>
      </View>
      {/* {
        Math.floor((new Date().getTime() - new Date(`${item.created_at}`).getTime()) / (1000 * 60 * 60 * 24)) < 4 &&
        <Image source={newImage} style={styles.newImage} />
      } */}
    </View>
  );

  _pickImageFront = () => {
    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, (response) => {
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
        });
      }
    });
  };

  _onModalclose = () => {
    this.setState({
      modalVisible: false,
      albumModalVisible: false,
      btnToggle: false,
      progress: 0,
      paused: false
    });
  };

  NetworkSensor = async () => {
    // console.log('This is NetworkSensor.');
    await this.setState({
      timeFlag: true,
      isLoading: false,
    });
    alert('network error');
  };

  _onUpload = async (site_id_upload) => {
    // console.log('siteID=>', site_id_upload);
    if (this.state.filePath == '') {
      Toast.showWithGravity('Please select photo', Toast.LONG, Toast.TOP);
    } else if (site_id_upload == 0) {
      Toast.showWithGravity('Please select Venue', Toast.LONG, Toast.TOP);
    } else {
      // console.log('image_uploading...');
      this.setState({ isUploading: true });
      // var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 59000)
      var formdata = new FormData();
      formdata.append(
        'guest_id',
        this.state.userID.toString().replace(/['"]+/g, ''),
      );
      formdata.append('image', 'data:image/jpeg;base64,' + this.state.filePath);
      formdata.append('site_id', site_id_upload);
      var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow',
      };
      // console.log('formdata=>', formdata);
      fetch(config.api.guestImageUpload, requestOptions)
        // fetch('http://54.254.114.43:8000/api/guest_upload_image', requestOptions)  // test URL
        // setTimeout(() => {
        //   this.setState({ isLoading: false, modalVisible: false })
        //   Alert.alert('Upload success!', 'You will get processed image in 1 min. Please refresh gallery page a little later.')
        // }, 4000);
        .then((response) => response.json())
        .then((result) => {
          // console.log('result[result]=>', result['result']);
          this.setState({ isUploading: false, modalVisible: false });
          // clearTimeout(myTimer)
          if (result['result'] == 'success') {
            this._onFetchGalleryInfo(0);
            alert('Successfully uploaded!');
          } else if (result['result'] != 'success') {
            // alert(result)
            alert('Photo upload failed');
          }
        })
        .catch((error) => {
          if (!this.state.timeFlag) {
            this.setState({ isUploading: false });
            alert('Image upload failed')
            // console.log(error);
            // clearTimeout(myTimer);
          } else {
            this.setState({ timeFlag: false });
          }
          // console.log('upload_error=>', { ...error });
        });
    }
  };

  _onToggle = () => {
    this.setState({ btnToggle: !this.state.btnToggle });
  };

  _onShareImage = async () => {
    const shareOptions = {
      message: `${amazon}${this.state.processedURLForShare}`,
      // url: 'data:image/png;base64,JVBER.....'
    };
    try {
      const ShareResponse = await Share.open(shareOptions);
      // console.log(JSON.stringify(ShareResponse));
    } catch (error) {
      // console.log('Error =>', error);
    }
  };

  getPermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Image Download Permission',
          message: 'Your permission is required to save images to your device',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
      Alert.alert(
        'Save remote Image',
        'Grant Me Permission to save Image',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    } catch (err) {
      Alert.alert(
        'Save remote Image',
        'Failed to save Image: ' + err.message,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false },
      );
    }
  };

  actualDownload = (isImage) => {
    if (Platform.OS == 'ios') {
      this.actualDownloadIOS(isImage)
    } else {
      this.actualDownloadAndroid(isImage)
    }
  }

  actualDownloadAndroid = async (isImage) => {
    const granted = await this.getPermissionAndroid();
    if (!granted) {
      return;
    }
    this.setState({
      downProgress: 0,
      loading: true,
    });
    var today = new Date();
    var date = today.getFullYear() + '_' + (today.getMonth() + 1) + '_' + today.getDate();
    var time = today.getHours() + '_' + today.getMinutes() + '_' + today.getSeconds();
    var dateTime = date + '_' + time;
    const extension = isImage == 0 ? 'jpg' : 'mp4';

    let dirs = RNFetchBlob.fs.dirs;
    RNFetchBlob.config({
      // add this option that makes response data to be stored as a file,
      // this is much more performant.
      path: dirs.DownloadDir + `/makeabl${dateTime}.${extension}`,
      fileCache: true,
    })
      .fetch('GET', `${amazon}${this.state.processedURLForShare}`, {
        //some headers ..
      })
      .progress((received, total) => {
        // console.log('downProgress=>', received / total);
        this.setState({ downProgress: received / total });
      })
      .then((res) => {
        this.setState({
          downProgress: 100,
          loading: false,
        });
        Toast.showWithGravity(
          'Your file has been downloaded to downloads folder!',
          Toast.LONG,
          Toast.BOTTOM,
        );
      });
  };

  actualDownloadIOS = async (isImage) => {
    this.setState({
      downProgress: 0,
      loading: true,
    });
    
    RNFetchBlob.config({
      // path: dirs.DownloadDir + `/makeabl${dateTime}.${extension}`,
      fileCache: true,
      appendExt: isImage == 0 ? 'jpg' : 'mp4',
    })
      .fetch('GET', `${amazon}${this.state.processedURLForShare}`)
      .progress((received, total) => {
        this.setState({ downProgress: received / total });
      })
      .then((res) => {
        CameraRoll.saveToCameraRoll(res.data, isImage == 0 ? 'photo' : 'video')
          .then(() => {
            this.setState({
              downProgress: 100,
              loading: false,
            });
            Toast.showWithGravity(
              `Your ${isImage == 0 ? 'photo':'video'} has been downloaded to downloads folder!`,
              Toast.LONG,
              Toast.BOTTOM,
            );
          })
          .catch(err => {
            Alert.alert(
              'Save remote Image',
              'Failed to save Image.: ' + err.message,
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
              { cancelable: false },
            );
          })
          .finally(() => this.setState({ saving: false }));
      })
      .catch(error => {
        this.setState({ saving: false });
        Alert.alert(
          'Save remote Image',
          'Failed to save Image..: ' + error.message,
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
          { cancelable: false },
        );
      });
  };

  _onRefresh = () => {
    this.setState({ refreshing: true });
    // this.props.FetchGalleryInfo(0, 0)
    this._onFetchGalleryInfo(0);
    this._onFetchSite();
  };

  _onAlbumRefresh = () => {
    this.setState({ albumRefreshing: true });
    this._onFetchAlbum(2, 2, 2);
  };

  _onChangeType = async (uploadTypeID, favoriteID, isImageID) => {
    await this.setState({
      uploadType_id: uploadTypeID,
      favoriteID: favoriteID,
      isImageID: isImageID,
      isLoading: true,
    });
    fetch(config.api.getAlbumInfo + '/' + uploadTypeID + '/' + favoriteID + '/' + isImageID, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        // console.log('There is responseJSON');
        this.setState({
          albumData: responseJSON['album_list'],
          isLoading: false,
          numOfAlbum: responseJSON['album_list'].length,
        });
      })
      .catch((err) => {
        // console.log('albumErr=>', err);
        this.setState({ isLoading: false });
      });
  };
  _onFavorSwitch = async () => {
    await this.setState({
      favorite: !this.state.favorite,
    });
    this._onChangeType(
      this.state.uploadType_id,
      this.state.favorite ? 1 : 2,
      this.state.isImageID,
    );
  };

  _onOpenAvatar = (e) => {
    this.setState({
      avatarModalVisible: true,
      modalAvatarURI: e,
    });
  };

  handleMainButtonTouch = () => {
    if (this.state.progress >= 0.99) {
      this.VideoPlayer.seek(0);
    }
    this.setState((state) => {
      return {
        paused: !state.paused,
      };
    });
  };

  handleProgressPress = (e) => {
    const position = e.nativeEvent.locationX;
    const progress = (position / 250) * this.state.duration;
    const isPlaying = !this.state.paused;
    this.VideoPlayer.seek(progress);
  };

  handleProgress = (progress) => {
    this.setState({
      progress: progress.currentTime / this.state.duration,
    });
  };

  handleEnd = () => {
    this.setState({ paused: true });
  };

  handleLoad = (meta) => {
    this.setState({
      duration: meta.duration,
    });
  };

  secondsToTime(time) {
    return ~~(time / 60) + ':' + (time % 60 < 10 ? '0' : '') + (time % 60);
  }

  render() {
    const {
      photos,
      albumModalVisible,
      modalVisible,
      filePath,
      tabID,
      country_id,
      site_id,
      processedURL,
      site_id_upload,
      numOfPhoto,
      numOfVideo,
      numOfAlbum,
      favorite,
      uploadType_id,
      btnToggle,
      avatarModalVisible,
      isImageID,
      isUploading
    } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        {/* <WavyHeader customStyles={styles.svgCurve} /> */}
        <FlashMessage position="bottom" duration={5500} animationDuration={700} icon="success" />
        <View style={styles.main}>
          <Spinner
            visible={this.state.isLoading}
            textContent={'Loading...'}
            textStyle={{ color: 'white' }}
          />


          <Modal
            isVisible={modalVisible}
            backdropColor="#B4B3DB"
            backdropOpacity={0.8}
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            animationInTiming={1000}
            animationOutTiming={1000}
            backdropTransitionInTiming={1000}
            backdropTransitionOutTiming={1000}>
            <View style={styles.modalBody}>
              <View style={styles.modalHeader}>
                <TextComponent large heavy text>
                  Upload Content
                </TextComponent>
              </View>
              <TouchableOpacity
                style={{ alignSelf: 'center', marginTop: 20 }}
                onPress={() => this._pickImageFront()}
                disabled={isUploading}>
                {filePath == '' ? (
                  <View style={styles.uploadArea}>
                    <FontAwesome
                      name="cloud-upload"
                      size={40}
                      color={Colors.authButton}
                    />
                    <TextComponent medium main>
                      click to upload
                    </TextComponent>
                  </View>
                ) : (
                    <View>
                      <Image
                        source={{
                          uri: 'data:image/jpeg;base64,' + this.state.filePath,
                        }}
                        style={styles.uploadedImage}
                        resizeMode="contain"
                      />
                      {
                        // isLoading &&
                        // <View style={{ alignSelf: "center", }}>
                        //   <TextComponent main center>{Math.ceil(progress * 100)} %</TextComponent>
                        //   <ProgressBar
                        //     style={styles.progressBar}
                        //     progress={progress}
                        //     indeterminate={indeterminate}
                        //     width={width * 0.5}
                        //   />
                        // </View>
                      }
                    </View>
                  )}
                {/* <Image source={faceCenter} style={styles.uploadedImage1} resizeMode="contain" /> */}
              </TouchableOpacity>

              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                  <View style={styles.pickerContainer}>
                    <RNPickerSelect
                      placeholder={{ label: 'Venue...', value: 0 }}
                      items={this.state.site}
                      onValueChange={(value) => {
                        this._onChangeModalSite(value);
                      }}
                      style={{
                        ...pickerSelectStyles,
                        iconContainer: {
                          top: 10,
                          right: 12,
                        },
                      }}
                      value={this.state.site_id_upload}
                      useNativeAndroidPickerStyle={false}
                      textInputProps={{ underlineColor: 'yellow' }}
                      disabled={isUploading}
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
              </View>

              <View style={styles.btnGroup}>
                <TouchableOpacity
                  style={styles.close}
                  onPress={() => this._onModalclose()}
                  activeOpacity={0.7}
                  disabled={isUploading}>
                  <TextComponent heavy white medium>
                    Close
                  </TextComponent>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => this._onUpload(this.state.site_id_upload)}
                  activeOpacity={0.7}
                  disabled={isUploading}>
                  {
                    isUploading ?
                      <BarIndicator color='white' count={3} size={17} />
                      :
                      <TextComponent heavy white medium>
                        Upload
                      </TextComponent>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            isVisible={albumModalVisible}
            backdropColor="#B4B3DB"
            backdropOpacity={0.8}
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            animationInTiming={1000}
            animationOutTiming={1000}
            backdropTransitionInTiming={1000}
            backdropTransitionOutTiming={1000}>
            <View style={styles.modalBody2}>
              <TouchableOpacity
                onPress={() => this._onModalclose()}
                style={styles.closeIcon}>
                <FontAwesome name="close" size={24} color={Colors.deactive} />
              </TouchableOpacity>
              {this.state.isImage == 0 ? (
                <Image
                  source={{ uri: amazon + processedURL }}
                  style={{
                    width: width * 0.9 - 10,
                    height: (width * 27) / 40 - 30 / 4,
                  }}
                  resizeMode={'contain'}
                />
              ) : (
                  <View>
                    <Video
                      paused={this.state.paused}
                      source={{ uri: amazon + this.state.videoModalURL }}
                      // source={{ uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4' }}
                      style={{
                        width: width * 0.9 - 10,
                        height: (width * 27) / 40 - 30 / 4,
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginTop: -50
                      }}
                      ref={(ref) => (this.VideoPlayer = ref)}
                      onLoad={this.handleLoad}
                      onProgress={this.handleProgress}
                      onEnd={this.handleEnd}
                      playInBackground={false}
                      resizeMode={'contain'}
                    />
                    <View style={styles.controls}>
                      <TouchableWithoutFeedback
                        onPress={this.handleMainButtonTouch}>
                        <FontAwesome
                          name={!this.state.paused ? 'pause' : 'play'}
                          size={15}
                          color="#FFF"
                          style={{ marginRight: 15 }}
                        />
                      </TouchableWithoutFeedback>
                      <TouchableWithoutFeedback
                        onPress={this.handleProgressPress}>
                        <View>
                          <ProgressBar
                            progress={this.state.progress}
                            color="#FFF"
                            unfilledColor="rgba(255,255,255,.5)"
                            borderColor="#FFF"
                            width={width * 0.6}
                            height={10}
                          />
                        </View>
                      </TouchableWithoutFeedback>

                      <Text style={styles.duration}>
                        {this.secondsToTime(
                          Math.floor(this.state.progress * this.state.duration),
                        )}
                      </Text>
                    </View>
                  </View>
                )}

              <TouchableOpacity
                onPress={() => this._onToggle()}
                style={{
                  ...styles.shareIcon,
                  position: 'absolute',
                  bottom: this.state.isImage == 0 ? 15 : 70,
                  left: 15,
                }}>
                <MaterialCommunityIcons
                  name={btnToggle ? 'close' : 'share-variant'}
                  size={18}
                  color="white"
                />
              </TouchableOpacity>
              {btnToggle && (
                <View
                  style={{
                    ...styles.socialBtnGroup,
                    bottom: this.state.isImage == 0 ? 55 : 110,
                  }}>
                  <TouchableOpacity
                    onPress={() => this._onShareImage()}
                    style={styles.shareIcon}>
                    <MaterialCommunityIcons
                      name="share"
                      size={18}
                      color="white"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.actualDownload(this.state.isImage)}
                    // onPress={() => this.actualDownload()}
                    style={styles.shareIcon}>
                    <MaterialCommunityIcons
                      name="download"
                      size={18}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              )}
              {this.state.loading ? (
                Platform.OS === 'android' ? (
                  <ProgressBarAndroid
                    styleAttr="Horizontal"
                    progress={this.state.downProgress}
                    indeterminate={false}
                  />
                ) : (
                    <ProgressViewIOS progress={this.state.downProgress} />
                  )
              ) : null}
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
            backdropTransitionOutTiming={500}>
            <View style={styles.avatarModalBody}>
              <TouchableOpacity
                onPress={() => this.setState({ avatarModalVisible: false })}
                style={styles.closeIcon}
                activeOpacity={0.8}>
                <FontAwesome name="close" size={24} color={Colors.deactive} />
              </TouchableOpacity>
              {this.state.avatarURI != '' && (
                <FastImage
                  style={{ width: width * 0.8, height: width * 0.8 }}
                  source={{
                    uri: this.state.modalAvatarURI,
                    priority: FastImage.priority.high,
                  }}
                  resizeMode={FastImage.resizeMode.contain}>
                  <ActivityIndicator
                    size="large"
                    style={StyleSheet.absoluteFill}
                    color="white"
                    animating={this.state.avatarURI != '' ? false : true}
                  />
                </FastImage>
              )}
            </View>
          </Modal>

          <View style={{ flex: 1, margin: 5, marginTop: 25 }}>
            {((this.state.avatar != 'emptyPhoto' &&
              this.state.avatarQR == 'emptyQR') ||
              (this.state.avatar == 'emptyPhoto' &&
                this.state.avatarQR != 'emptyQR')) && (
                <View style={styles.roundProfile}>
                  <View style={{ ...styles.profileArea, flexDirection: 'row' }}>
                    <View style={styles.photo}>
                      <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity
                          style={styles.avatar}
                          activeOpacity={0.7}
                          onPress={() =>
                            this._onOpenAvatar(
                              this.state.avatar != 'emptyPhoto'
                                ? this.state.avatarURI
                                : this.state.QR_avatarURI,
                            )
                          }>
                          <FastImage
                            style={{ width: 90, height: 90, borderRadius: 45 }}
                            source={{
                              uri:
                                this.state.avatar != 'emptyPhoto'
                                  ? this.state.avatarURI
                                  : this.state.QR_avatarURI,
                              priority: FastImage.priority.high,
                            }}
                            resizeMode={FastImage.resizeMode.contain}>
                            <ActivityIndicator
                              size="large"
                              style={StyleSheet.absoluteFill}
                              color="white"
                              animating={this.state.avatarURI ? false : true}
                            />
                          </FastImage>
                        </TouchableOpacity>
                        <TextComponent xmedium bold center>
                          {this.state.email.replace(/['"]+/g, '')}
                        </TextComponent>
                      </View>
                    </View>
                    <View style={styles.photoAmount}>
                      <View style={styles.count}>
                        <View>
                          <TextComponent grey medium>
                            Photos
                        </TextComponent>
                          <TextComponent large heavy center>
                            {numOfPhoto}
                          </TextComponent>
                        </View>
                        <View>
                          <TextComponent grey medium>
                            Videos
                        </TextComponent>
                          <TextComponent large heavy center>
                            {numOfVideo}
                          </TextComponent>
                        </View>
                      </View>
                      <View style={{ width: '120%', marginTop: 20 }}>
                        <AuthButton
                          title="Upload Content"
                          onPress={() => {
                            this.openModal();
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            {this.state.avatar != 'emptyPhoto' &&
              this.state.avatarQR != 'emptyQR' && (
                <View style={styles.roundProfile}>
                  <View
                    style={{ ...styles.profileArea, flexDirection: 'column' }}>
                    <View style={{ flexDirection: 'row' }}>
                      <View style={styles.photo}>
                        <View style={{ alignItems: 'center' }}>
                          <TouchableOpacity
                            style={styles.avatar}
                            activeOpacity={0.7}
                            onPress={() =>
                              this._onOpenAvatar(this.state.avatarURI)
                            }>
                            {(this.state.avatarURI != '' ||
                              this.state.avatarURI != null ||
                              this.state.avatarURI != undefined) && (
                                <FastImage
                                  style={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: 45,
                                  }}
                                  source={{
                                    uri: this.state.avatarURI,
                                    priority: FastImage.priority.high,
                                  }}
                                  resizeMode={FastImage.resizeMode.contain}>
                                  <ActivityIndicator
                                    size="large"
                                    style={StyleSheet.absoluteFill}
                                    color="white"
                                    animating={
                                      this.state.avatarURI != '' ? false : true
                                    }
                                  />
                                </FastImage>
                              )}
                          </TouchableOpacity>
                          <TextComponent medium bold center>
                            {this.state.email.replace(/['"]+/g, '')}
                          </TextComponent>
                        </View>
                      </View>

                      <View style={styles.photo}>
                        <View style={{ alignItems: 'center' }}>
                          <TouchableOpacity
                            style={styles.avatar}
                            activeOpacity={0.7}
                            onPress={() =>
                              this._onOpenAvatar(this.state.QR_avatarURI)
                            }>
                            {(this.state.avatarURI != '' ||
                              this.state.avatarURI != null ||
                              this.state.avatarURI != undefined) && (
                                <FastImage
                                  style={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: 45,
                                  }}
                                  source={{
                                    uri: this.state.QR_avatarURI,
                                    priority: FastImage.priority.high,
                                  }}
                                  resizeMode={FastImage.resizeMode.contain}>
                                  <ActivityIndicator
                                    size="large"
                                    style={StyleSheet.absoluteFill}
                                    color="white"
                                    animating={
                                      this.state.avatarURI != '' ? false : true
                                    }
                                  />
                                </FastImage>
                              )}
                          </TouchableOpacity>
                          <TextComponent medium bold center>
                            QR
                          </TextComponent>
                        </View>
                      </View>
                    </View>
                    <View style={styles.photoAmount2}>
                      <View
                        style={{
                          width: '50%',
                          marginTop: 20,
                          alignSelf: 'flex-end',
                        }}>
                        <AuthButton
                          title="Upload Content"
                          onPress={() => {
                            this.openModal();
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}

            {tabID != 3 && (
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <View style={styles.pickerContainer}>
                  <RNPickerSelect
                    placeholder={{ label: 'Venue...', value: 0 }}
                    items={this.state.site != '' ? this.state.site : []}
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
              </View>
            )}
            {tabID == 3 && (
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <View style={styles.pickerContainer2}>
                  <RNPickerSelect
                    placeholder={{ label: 'Type...', value: 2 }}
                    items={this.state.uploadType}
                    onValueChange={(value) => {
                      this._onChangeType(
                        value,
                        this.state.favorite ? 1 : 2,
                        this.state.isImageID,
                      );
                    }}
                    style={{
                      ...pickerSelectStyles,
                      iconContainer: {
                        top: 10,
                        right: 12,
                      },
                    }}
                    value={this.state.uploadType_id}
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
                <View style={styles.pickerContainer2}>
                  <RNPickerSelect
                    placeholder={{ label: 'All...', value: 2 }}
                    items={this.state.ContentType}
                    onValueChange={(value) => {
                      this._onChangeType(
                        this.state.uploadType_id,
                        this.state.favorite ? 1 : 2,
                        value,
                      );
                    }}
                    style={{
                      ...pickerSelectStyles,
                      iconContainer: {
                        top: 10,
                        right: 12,
                      },
                    }}
                    value={this.state.isImageID}
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
                <View>
                  <View style={styles.switch}>
                    {/* <TextComponent>Favourites</TextComponent> */}
                    <Switch
                      value={favorite}
                      onValueChange={() => this._onFavorSwitch()}
                      disabled={false}
                      circleSize={26}
                      barHeight={30}
                      switchWidthMultiplier={2.5}
                      switchLeftPx={2}
                      switchRightPx={2}
                      circleBorderWidth={0}
                      activeTextStyle={{ alignSelf: 'center' }}
                      inactiveTextStyle={{ alignItems: 'center' }}
                      activeText={''}
                      inActiveText={''}
                      backgroundActive={Colors.authButton}
                      backgroundInactive={Colors.borderColor}
                      changeValueImmediately={false}
                      renderInsideCircle={() => (
                        <FontAwesome
                          style={{ margin: 5 }}
                          name={favorite ? 'heart' : 'heart-o'}
                          size={16}
                          color="red"
                        />
                      )}
                      circleActiveColor={'#FFF'}
                      circleInActiveColor={'#FFF'}
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.gallery}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  marginBottom: 10,
                  zIndex: 10,
                  alignItems: 'flex-end',
                }}>
                <TouchableOpacity
                  style={{
                    borderBottomWidth: 3,
                    borderBottomColor:
                      tabID == 1 ? Colors.authButton : '#ecf0fa',
                  }}
                  onPress={() => this.setState({ tabID: 1 })}>
                  <Image
                    source={PhotosTabImage}
                    style={{ width: width * 0.1 }}
                    resizeMode="contain"
                  />
                  {this.state.numOfPhoto > 0 && (
                    <View style={{ ...styles.badge, top: 8 }}>
                      <Text
                        style={{
                          ...styles.badgeTxt,
                          fontSize: this.state.numOfPhoto > 100 ? 8 : 13,
                        }}>
                        {numOfPhoto}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    borderBottomWidth: 3,
                    borderBottomColor:
                      tabID == 2 ? Colors.authButton : '#ecf0fa',
                  }}
                  onPress={() => this.setState({ tabID: 2 })}>
                  <Image
                    source={VideosTabImage}
                    style={{ width: width * 0.1 }}
                    resizeMode="contain"
                  />
                  {this.state.numOfVideo > 0 && (
                    <View style={{ ...styles.badge, top: 5 }}>
                      <Text
                        style={{
                          ...styles.badgeTxt,
                          fontSize: this.state.numOfVideo > 100 ? 8 : 13,
                        }}>
                        {numOfVideo}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    borderBottomWidth: 3,
                    borderBottomColor:
                      tabID == 3 ? Colors.authButton : '#ecf0fa',
                  }}
                  onPress={() => this.setState({ tabID: 3 })}>
                  <Image
                    source={AlbumsTabImage}
                    style={{ width: width * 0.1 }}
                    resizeMode="contain"
                  />
                  {this.state.numOfAlbum > 0 && (
                    <View style={{ ...styles.badge, top: 5 }}>
                      <Text
                        style={{
                          ...styles.badgeTxt,
                          fontSize: this.state.numOfAlbum > 100 ? 8 : 13,
                        }}>
                        {this.state.numOfAlbum}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              {/* <TopTabNavigator /> */}
              {tabID == 1 && (
                <View
                  style={{ flex: 1, backgroundColor: '#ecf0fa', paddingTop: 0 }}>
                  {this.state.galleryData != undefined ||
                    this.state.galleryData != '' ? (
                      <FlatList
                        refreshControl={
                          <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={() => this._onRefresh()}
                          />
                        }
                        vertical
                        numColumns={3}
                        showsVerticalScrollIndicator={false}
                        data={this.state.galleryData}
                        renderItem={this.renderPhotos}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    ) : (
                      <TextComponent>
                        There is no photos to be displayed.
                      </TextComponent>
                    )}
                </View>
              )}
              {tabID == 2 && (
                <View
                  style={{ flex: 1, backgroundColor: '#ecf0fa', paddingTop: 0 }}>
                  <FlatList
                    vertical
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    data={this.state.videoData}
                    renderItem={this.renderVideos}
                    keyExtractor={(item, index) => index.toString()}
                  />
                  {/* <Video
                      paused={false}
                      source={{ uri: 'http://d1z6a3vjnfowyr.cloudfront.net/Country/Hong_Kong/Disneyland/locations/Aladdin_Ride/aladin.mp4' }}
                      // source={{ uri: BASE_PATH + '/' + this.props.navigation.getParam('clickedSource') }}
                      // style={this.state.full ? { width, height: height - 130 } : { width, height: normalHeight }}
                      
                      ref={ref => this.VideoPlayer = ref}
                      style={{
                        width: width/2,
                        height: width/2,
                      }}
                    /> */}
                </View>
              )}
              {tabID == 3 && (
                <View
                  style={{ flex: 1, backgroundColor: '#ecf0fa', paddingTop: 0 }}>
                  {this.state.albumData != undefined ||
                    this.state.albumData != '' ? (
                      <FlatList
                        refreshControl={
                          <RefreshControl
                            refreshing={this.state.albumRefreshing}
                            onRefresh={() => this._onAlbumRefresh()}
                          />
                        }
                        vertical
                        numColumns={3}
                        showsVerticalScrollIndicator={false}
                        data={this.state.albumData}
                        renderItem={this.renderAlbums}
                        keyExtractor={(item, index) => index.toString()}
                      />
                    ) : (
                      <TextComponent>
                        There is no albums to be displayed.
                      </TextComponent>
                    )}
                </View>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: 48,
    left: 0,
    bottom: -20,
    right: 0,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#ecf0fa',
  },
  main: {
    flex: 1,
    width: '96%',
    marginLeft: '2%',
    paddingTop: 20,
  },
  pickerContainer: {
    width: '90%',
    borderWidth: 1,
    borderColor: Colors.authButton,
    borderRadius: 25,
    backgroundColor: 'white',
    marginHorizontal: '5%',
  },
  pickerContainer2: {
    width: '35%',
    borderWidth: 1,
    borderColor: Colors.authButton,
    borderRadius: 25,
    backgroundColor: 'white',
    marginHorizontal: '2.5%',
  },
  pickerContainer3: {
    width: '45%',
    borderColor: Colors.authButton,
    borderRadius: 25,
    alignItems: 'flex-end',
  },
  modalHeader: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderColor: Colors.borderColor,
    borderBottomWidth: 1,
    width: '90%',
  },
  switch: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imgContainer: {
    width: '100%',
    height: width * 0.55,
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    width: '90%',
    justifyContent: 'space-between',
  },
  close: {
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.deactive,
    borderRadius: 21,
    paddingHorizontal: 15,
    width: '40%',
  },
  uploadBtn: {
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.authButton,
    borderRadius: 21,
    paddingHorizontal: 15,
    width: '40%',
  },
  svgCurve: {
    position: 'absolute',
    width: width,
  },
  photo: {
    width: '50%',
    flexDirection: 'column',
    marginTop: 15,
  },
  photoList: {
    width: width * 0.3,
    height: width * 0.3,
  },
  videoList: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gallery: {
    width: '100%',
    flex: 1,
  },
  imgTab: { borderBottomWidth: 3, borderBottomColor: 'black' },
  profileArea: {
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  photoAmount: {
    width: '50%',
    flexDirection: 'column',
    paddingRight: 30,
    justifyContent: 'center',
  },
  photoAmount2: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  roundProfile: {
    marginTop: 20,
    width: '100%',
    borderRadius: 25,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 10,
    elevation: 15,
    paddingHorizontal: 10,
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,

  },
  avatar: {
    backgroundColor: Colors.authButton,
    width: 96,
    height: 96,
    borderRadius: 48,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgItem: {
    width: width * 0.3,
    height: width * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginLeft: 10,
  },
  modalBody: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 20,
  },
  modalBody2: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
    width: width * 0.9,
    height: (width * 27) / 40,
  },
  avatarModalBody: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
    width: width * 0.9,
    height: width * 0.9,
  },
  uploadedImage: {
    width: width * 0.7,
    height: width * 0.7,
  },
  uploadedImage1: {
    width: width * 0.4,
    height: width * 0.4,
    alignSelf: 'center',
    marginTop: -10,
  },
  uploadArea: {
    width: '96%',
    // height: width * 0.7,
    borderColor: Colors.authButton,
    borderStyle: 'dashed',
    borderWidth: 4,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  heart: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartArea: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 5,
  },
  newImage: {
    width: width * 0.1,
    height: width * 0.1,
    position: 'absolute',
    top: 5,
    right: 0,
  },
  progressBar: {
    width: width * 0.5,
  },
  closeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 100,
    top: 10,
    right: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.2,
    shadowRadius: 5
  },
  shareIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.authButton,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    marginVertical: 5,
  },
  socialBtnGroup: {
    flexDirection: 'column',
    zIndex: 200,
    position: 'absolute',
    left: 15,
  },
  badge: {
    backgroundColor: 'red',
    position: 'absolute',
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderColor: 'white',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: {
    color: 'white',
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
    galleryInfo: state.gallery.galleryInfo,
    albumInfo: state.albums.albumInfo,
    country: state.gallery.country,
    site: state.gallery.site,
  };
};

export default connect(mapStateToProps, {
  FetchGalleryInfo,
  FetchCountry,
  FetchSite,
  FetchAlbum,
})(Gallery);
