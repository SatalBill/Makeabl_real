import React, { Component } from 'react';
import { Image, View, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import TextComponent from '../../components/TextComponent'
import Colors from '../../constants/Colors'
import AsyncStorage from '@react-native-community/async-storage'
import config from '../../api/config'
import { amazon } from '../../api/config'
import FastImage from 'react-native-fast-image'
import Spinner from 'react-native-loading-spinner-overlay';

const gallery = require('../../assets/images/icon/gallery.png')
const account = require('../../assets/images/icon/account.png')
const purchase = require('../../assets/images/icon/purchase.png')
const merchandise = require('../../assets/images/icon/merchandise.png')
const cart = require('../../assets/images/icon/cart.png')
const help = require('../../assets/images/icon/help.png')
const logout = require('../../assets/images/icon/logout.png')
const { width, height } = Dimensions.get('window')

export default class DrawerContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuState: 1,
      avatarURI: '',
      QR_avatarURI: '',
      email: '',
      menuList: [
        { id: 1, navTo: 'Gallery', imgSRC: gallery, title: 'My Gallery' },
        { id: 2, navTo: 'Account', imgSRC: account, title: 'My Account' },
        { id: 3, navTo: 'PurchasePass', imgSRC: purchase, title: 'Digital Pass' },
        { id: 4, navTo: 'Merchandise', imgSRC: merchandise, title: 'Merchandise' },
        { id: 5, navTo: 'Cart', imgSRC: cart, title: 'Cart' },
        { id: 6, navTo: 'Help', imgSRC: help, title: 'Help' },
      ],
      isLoading: false,
    };
  }

  componentDidMount = async () => {
    const avatar = (await AsyncStorage.getItem('photoURL')).toString()
    const avatarQR = (await AsyncStorage.getItem('qrURL')).toString()
    const avatarURI = `${amazon}${avatar.replace(/['"]+/g, '')}`
    const QR_avatarURI = `${avatarQR.replace(/['"]+/g, '')}`
    const email = await AsyncStorage.getItem('email')
    this.setState({ 
      avatarURI: avatarURI,
      QR_avatarURI: QR_avatarURI,
      email: email,
      avatar: avatar,
      avatarQR: avatarQR
    })
    console.log('==Navigator==', this.state.avatarURI);
  }
  _onNavigateTo = async (param, num) => {
    await this.setState({ menuState: num })
    this.props.navigation.closeDrawer()
    this.props.navigation.navigate(param)
  }
  _onSignout = async () => {
    this.setState({ isLoading: true })
    let token = (await AsyncStorage.getItem('userToken')).toString()
    let userID = (await AsyncStorage.getItem('userID')).toString()
    fetch(config.auth.signout, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Auth-Key': 'simplerestapi',
        'User-Authorization': token.replace(/['"]+/g, ''),
        'User-ID': userID.replace(/['"]+/g, '')
      }
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({ isLoading: false })
        console.log(responseJSON);
        if (responseJSON['status'] == 200) {
          AsyncStorage.removeItem('userToken');
          this.props.navigation.navigate('Login')
        } else {
          console.log('Signout failed');
        }
      })
  }

  render() {
    const { menuState, menuList } = this.state
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Spinner
          visible={this.state.isLoading}
          textContent={'Logging out...'}
          textStyle={{ color: 'white' }}
        />
        <ScrollView style={{ backgroundColor: Colors.authButton, borderTopRightRadius: 50, borderBottomRightRadius: 50 }}>
          <View style={styles.container}>

            <View style={{ marginTop: 10, marginBottom: 30, alignItems: "center" }}>
              <FastImage
                style={styles.avatar}
                source={{
                  uri: this.state.avatar != "emptyPhoto" ? this.state.avatarURI : this.state.QR_avatarURI,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
              <TextComponent white center>{this.state.email.replace(/['"]+/g, '')}</TextComponent>
            </View>
            {
              menuList.map((item, i) => (
                <TouchableOpacity key={i} onPress={() => { this._onNavigateTo(item.navTo, item.id) }} style={styles.menuItem}>
                  <Image source={item.imgSRC} style={{ width: 40, height: 40, marginRight: 10 }} resizeMode="contain" />
                  {menuState == item.id ? <TextComponent white heavy railBold xmedium>{item.title}</TextComponent> : <TextComponent white medium>{item.title}</TextComponent>}
                </TouchableOpacity>
              ))
            }

            <TouchableOpacity onPress={() => { this._onSignout() }} style={styles.menuItem}>
              <Image source={logout} style={{ width: 40, height: 40, marginRight: 10 }} resizeMode="contain" />
              {menuState == 8 ? <TextComponent white heavy railBold xmedium>Log Out</TextComponent> : <TextComponent white medium>Logout</TextComponent>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', alignItems: "center", padding: 20, borderTopRightRadius: 50, borderBottomRightRadius: 50, backgroundColor: Colors.authButton, },
  menuItem: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: "center", margin: 10 },
  avatar: { width: 60, height: 60, borderRadius: 30, borderColor: 'white', borderWidth: 3 }
})