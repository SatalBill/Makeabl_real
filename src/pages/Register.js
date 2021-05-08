import React, { Component } from 'react';
import { View, ScrollView, StatusBar, SafeAreaView, StyleSheet, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import TextComponent from '../components/TextComponent'
import WhiteBoard from '../components/WhiteBoard'
import AuthButton from '../components/AuthButton'
import Colors from '../constants/Colors'
import ImagePicker from 'react-native-image-picker'
import AsyncStorage from '@react-native-community/async-storage'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import config from "../api/config";
import Spinner from 'react-native-loading-spinner-overlay';
import LinearGradient from 'react-native-linear-gradient'

const logo = require('../assets/images/logo.png')
const faceCenter = require('../assets/images/faceCenter.png')
const { width, height } = Dimensions.get('window')

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filePath: '',
      userID: '',
      isLoading: false,
      timeFlag: false,
    };
  }

  componentDidMount = async () => {
    const userID = (await AsyncStorage.getItem('userID')).toString()
    this.setState({
      filePath: '',
      userID: userID,
    })
    // console.log('Register_userID=>', this.state.userID);
    this._pickImageFront(1)
  }

  _pickImageFront = (e) => {
    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.5
    };
    if (e == 1) {
      // ImagePicker.showImagePicker(options, response => {
      ImagePicker.launchCamera(options, response => {
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
    } else {
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
    }
  };

  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false
    })
    Alert.alert('Warning', 'Network error')
  }

  _upload = async () => {
    console.log('upload');
    const { email, password, timeFlag } = this.state
    if (this.state.filePath == "") {
      Alert.alert('Warning', 'Please take your face photo')
    } else {
      this.setState({ isLoading: true })
      // var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 58000)
      var formdata = new FormData();
      formdata.append("id", this.state.userID.replace(/['"]+/g, ''));
      formdata.append("photo", "data:image/jpeg;base64," + this.state.filePath)

      var requestOptions = {
        method: 'POST',
        body: formdata,
        redirect: 'follow'
      }
      fetch(config.auth.faceregister, requestOptions)
        // fetch('http://54.254.114.43:8001/api/faceregister', requestOptions)
        .then(response => response.json())
        .then(async (result) => {
          // clearTimeout(myTimer)
          this.setState({ isLoading: false })
          if (result["result"] == "success") {
            await AsyncStorage.setItem('photoURL', JSON.stringify(result['face_url']))
            this.props.navigation.navigate('App')
          } else {
            Alert.alert('Warning', result['result'])
            setTimeout(() => {
              this._pickImageFront(2)
            }, 500);
          }
        })
        .catch((err) => {
          // console.log('catchError=>', err);
          Alert.alert('Warning', "Network Error!")
          if (!this.state.timeFlag) {
            this.setState({ isLoading: false })
            // clearTimeout(myTimer);
          } else {
            this.setState({ timeFlag: false, isLoading: false })
          }
        })
    }

  }
  gotoLogin = () => {
    this.props.navigation.push('Login')
  }

  render() {
    const { filePath } = this.state
    return (
      <SafeAreaView style={styles.bgImage}>
        <LinearGradient colors={[Colors.authButton, Colors.authButtonTr]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <Spinner
          visible={this.state.isLoading}
          textContent={'Loading...'}
          textStyle={{ color: 'white' }}
        />
        <StatusBar hidden />
        <View style={styles.title}>
          <TextComponent white title>makeabl</TextComponent>
          <Image source={logo} style={styles.logo} />
        </View>
        {/* <View style={{ width: '100%', alignItems: "center", marginTop: -20 }}> */}
        <View style={styles.whiteboard2}>
          <ScrollView style={{ width: '100%', height: height-275 }}>
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
              <TouchableOpacity onPress={() => this._pickImageFront(2)}>
                {filePath == '' ?
                  <Image source={faceCenter} style={styles.uploadedImage1} resizeMode="contain" />
                  :
                  <Image source={{ uri: 'data:image/jpeg;base64,' + this.state.filePath }} style={styles.uploadedImage} resizeMode="contain" />
                }
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ width: '40%', alignSelf: "center", marginTop: 20 }}>
                <AuthButton title="Upload" onPress={() => { this._upload() }} />
              </View>
              <View style={styles.forgot}>
                <TextComponent>Already uploaded?</TextComponent>
                <TouchableOpacity onPress={() => this.gotoLogin()}>
                  <TextComponent main heavy medium> Sign In here </TextComponent>
                </TouchableOpacity>
              </View>
              <View style={styles.forgot2}>
                <TextComponent> © 2020 makeabl </TextComponent>
                <Image source={logo} style={styles.logo2} />
              </View>
            </View>
          </ScrollView>
        </View>
        {/* </View> */}

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  bgImage: {
    width: '100%',
    height: '100%',
    alignItems: "center",
    backgroundColor: Colors.authButtonTr,
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
  forgot: {
    flexDirection: 'column',
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
  whiteboard2: {
    width: '92%',
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 20,
    marginBottom: 50,
    height: height - 275,
    flex: 1
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
  }
})