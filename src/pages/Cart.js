import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, StatusBar, Dimensions, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import TextComponent from '../components/TextComponent'
import CustomTextInput from '../components/CustomTextInput'
import Colors from '../constants/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Card from '../components/Card'
import MainButton from '../components/MainButton'
import AsyncStorage from '@react-native-community/async-storage';
import config, { amazon } from '../api/config';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image'
import Spinner from 'react-native-loading-spinner-overlay';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import OneSignal from 'react-native-onesignal';

const { width, height } = Dimensions.get('window')

class Cart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartData: [],
      product: {},
      cartURL: '',
      token: '',
      userID: '',
      myHeaders: '',
      modalVisible: false,
      albums: [],
      totalPrice: 0,
      isLoading: false,
      value: 1,
      currency_rate: 1,
      currentIndex: 0,
      currentAmount: 1,
      site_id: 0
    };
    OneSignal.addEventListener('received', this.onReceived);

  }

  componentDidMount = async () => {
    let token = await AsyncStorage.getItem('userToken')
    let userID = await AsyncStorage.getItem('userID')
    this.setState({
      token: token,
      userID: userID,
    })
    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': this.state.token.replace(/['"]+/g, ''),
      'User-ID': this.state.userID.replace(/['"]+/g, '')
    }
    await this.setState({
      myHeaders: myHeaders,
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

    const { navigation } = this.props;
    this.focusListener = navigation.addListener("didFocus", () => {
      setTimeout(() => {
        this.setState({ cartData: [] })
        this.start();
      }, 500);
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

  start = () => {
    this.setState({ isLoading: true, totalPrice: 0 })
    fetch(config.api.getCart, {
      method: 'GET',
      headers: this.state.myHeaders
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        // console.log('responseJSON', responseJSON);
        this.setState({ isLoading: false })
        if (responseJSON['cart_list'] != "") {
          let res = responseJSON['cart_list']
          await this.setState({
            cartData: res,
            symbol: res[0]['symbol'],
            site_id: res[0]['site_id'],
          })
          this.state.cartData.forEach((element, index) => {
            // element['amount'] = element['amount']
            element['index'] = index
            this.setState({ totalPrice: this.state.totalPrice + (element.discount != 0 ? element.price - element.price * element.discount / 100 : element.price) * element.amount })
          });
          // console.log('cartData =>', responseJSON['cart_list'][0]['price']);
        }
      })
      .catch(err => {
        // console.log('cartGetErr=>', err)
        this.setState({ isLoading: false })
      })
  }

  removeItemPressed = (item) => {
    Alert.alert(
      'Confirm Remove',
      `Are you sure you want to remove "${item.title}" item from your cart ?`,
      [
        { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
        { text: 'Yes', onPress: () => this.removeItem(item) },
      ]
    )
  }

  removeItem = (item) => {
    fetch(config.api.delCart + '/' + item.id, {
      method: 'DELETE',
      headers: this.state.myHeaders
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        await this.setState({
          cartData: responseJSON['cart_list'],
          // totalPrice: this.state.totalPrice - parseInt(item.price)
        })
        var totalPrice = 0
        this.state.cartData.forEach(element => {
          var subPrice = element.discount != 0 ? element.price - element.price * element.discount / 100 : element.price
          totalPrice += element.amount * subPrice
        });
        this.setState({
          totalPrice: totalPrice
        })
      })
      .catch(err => console.log('cartDelErr=>', err))
  }

  // sumTotal = (e, item) => {
  //   var cartData = this.state.cartData
  //   var index = item['index']
  //   cartData[index]['amount'] = e
  //   this.setState({
  //     cartData: cartData
  //   })

  //   var totalPrice = 0
  //   this.state.cartData.forEach(element => {
  //     var subPrice = element.discount != 0 ? element.price - element.price * element.discount / 100 : element.price
  //     totalPrice += element.amount * subPrice
  //   });
  //   this.setState({ totalPrice: totalPrice })
  // }

  modifyAmountOpen = (item) => {
    this.setState({
      amountModalVisible: true,
      currentIndex: item.id,
      currentAmount: item.amount
    })
  }

  modifyAmount = (currentIndex, currentAmount) => {
    // console.log(currentIndex);
    let details = {
      'cart_id': currentIndex,
      'amount': currentAmount
    }
    this.setState({ isLoading: true })
    var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 25000)
    let formBody = []
    for (let property in details) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    // console.log(formBody);

    fetch(config.api.amountCart, {
      method: 'POST',
      headers: this.state.myHeaders,
      body: formBody
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        clearTimeout(myTimer)
        // console.log('------------resposneJSON------------', responseJSON);
        this.setState({
          cartData: responseJSON['cart_list'],
          amountModalVisible: false,
          currentIndex: 0
        })
        this.start()
      })
      .catch((err) => {
        this.setState({
          isLoading: false,
          amountModalVisible: false
        })
        // console.log('JSON.stringify(err)=>', err);
      })
  }

  NetworkSensor = async () => {
    await this.setState({
      timeFlag: true,
      isLoading: false
    })
    // alert('network error')
  }

  onChangeHandle = (type, text) => {
    this.setState({
      [type]: text
    })
  }

  renderCartItem = ({ item }) => (
    <View style={styles.item}>
      <View style={{ flexDirection: 'row', width: '90%' }}>
        <TouchableOpacity style={styles.img} activeOpacity={0.7} onPress={() => this._onGetAlbum(item)}>
          <Image source={{ uri: amazon + item.comp_photo_url.toString().split("\n")[0] }} resizeMode="cover" style={{ width: '100%', height: '100%', borderRadius: 10 }} />
        </TouchableOpacity>
        <View style={styles.detail}>
          <Text style={{ fontWeight: '700' }} numberOfLines={1}> {item.title}  </Text>
          <Text style={{ color: 'grey', fontWeight: '700', fontSize: 12 }} numberOfLines={1}>  {item.description}  </Text>
          <View style={{ flexDirection: "row", alignItems: 'center', }}>
            <TextComponent> Price:  </TextComponent>
            <TextComponent medium darkred>
              {this.state.symbol}{item.discount != 0 ? item.price - item.price * item.discount / 100 : item.price}
            </TextComponent>
          </View>
          <View style={{ flexDirection: 'row', alignItems: "center", width: 0.8 * width }}>
            <TextComponent> Amount:  </TextComponent>
            <TouchableOpacity style={styles.editBox} onPress={() => this.modifyAmountOpen(item)}>
              <Text>{item.amount}</Text>
            </TouchableOpacity>
          </View>

          {/* <NumericInput
            value={this.state.amount}
            onChange={(value) => { this.sumTotal(value, item) }}
            totalWidth={110}
            totalHeight={30}
            iconSize={25}
            step={1}
            onLimitReached={(isMax, msg) => console.log(isMax, msg)}
            valueType='integer'
            // initValue={item.amount}  // must not assign
            minValue={1}
            maxValue={20}
            rounded
            textColor={Colors.authButton}
            iconStyle={{ color: 'white' }}
            rightButtonBackgroundColor={Colors.authButton}
            leftButtonBackgroundColor={Colors.redBac} /> */}
        </View>
      </View>
      <View style={{ marginTop: -15, width: '10%' }}>
        <TouchableOpacity onPress={() => { this.removeItemPressed(item) }} style={styles.trash}>
          <MaterialCommunityIcons name="trash-can-outline" color={'red'} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );

  _onGetAlbum = (item) => {
    // console.log(item);
    this.setState({ modalVisible: true })
    fetch(config.api.getAlbumOnModal, {
      method: 'POST',
      headers: this.state.myHeaders,
      body: `album_id=${item.album_id}`
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        await this.setState({
          isLoading: false,
          albums: responseJSON['album_list'],
        })
      })
      .catch(err => {
        console.log('getAlbumOnModal=>', err)
        this.setState({ isLoading: false })
      })
  }

  renderAlbums = ({ item }) => (
    <View>
      <FastImage
        style={styles.album}
        source={{
          uri: amazon + item.process_comp_file_url,
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
      >
        <ActivityIndicator size='large' style={StyleSheet.absoluteFill} color={Colors.authButton}
          animating={this.state.albums ? false : true} />
      </FastImage>
    </View>
  )

  _onCancel = () => {
    this.setState({
      modalVisible: false,
      albums: [],
      amountModalVisible: false
    })
  }



  render() {
    const { cartData, modalVisible, albums, amountModalVisible, currentAmount } = this.state

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <FlashMessage position="bottom" duration={5500} animationDuration={700} icon="success" />

        <Spinner
          visible={this.state.isLoading}
          textContent={'Loading...'}
          textStyle={{ color: 'white' }}
        />
        {/* <ScrollView> */}
        <View style={styles.main}>
          <Modal
            isVisible={modalVisible}
            backdropColor="#B4B3DB"
            backdropOpacity={0.8}
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            animationInTiming={1000}
            animationOutTiming={500}
            backdropTransitionInTiming={1000}
            backdropTransitionOutTiming={500}
          >
            <View style={styles.modalBody2}>
              <TouchableOpacity onPress={() => this.setState({ modalVisible: false, albums: [] })} style={styles.closeIcon} activeOpacity={0.8}>
                <FontAwesome name="close" size={24} color={Colors.deactive} />
              </TouchableOpacity>
              {
                albums ?
                  <FlatList
                    horizontal
                    // numColumns={3}
                    showsHorizontalScrollIndicator={true}
                    data={albums}
                    renderItem={this.renderAlbums}
                    keyExtractor={(item, index) => index.toString()}
                  />
                  : <TextComponent>There is no selected album</TextComponent>
              }
              <View style={{ width: '80%', flexDirection: 'row', justifyContent: 'flex-end', margin: 20 }}>
                <MainButton title="OK" onPress={() => this._onCancel()} />
              </View>
            </View>
          </Modal>

          <Modal
            isVisible={amountModalVisible}
            backdropColor="#B4B3DB"
            backdropOpacity={0.8}
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            animationInTiming={1000}
            animationOutTiming={500}
            backdropTransitionInTiming={1000}
            backdropTransitionOutTiming={500}
          >
            <View style={{ ...styles.modalBody2, paddingHorizontal: 30 }}>
              <TouchableOpacity onPress={() => this.setState({ amountModalVisible: false })} style={styles.closeIcon} activeOpacity={0.8}>
                <FontAwesome name="close" size={24} color={Colors.deactive} />
              </TouchableOpacity>
              <TextComponent>Amount</TextComponent>
              <CustomTextInput inputData={{
                value: currentAmount,
                type: 'currentAmount',
                onChangeHandle: this.onChangeHandle,
                placeholder: 'Enter amount',
              }} />
              <MainButton title="OK" onPress={() => this.modifyAmount(this.state.currentIndex, this.state.currentAmount)} />
            </View>
          </Modal>

          <Card>
            <View style={{ width: '100%', padding: 10, height: height * 0.6 }}>
              {
                (cartData == undefined || cartData == "" || cartData == []) ?
                  <View style={{ marginTop: height / 3 }}><TextComponent center>There are no itmes in the cart to display</TextComponent></View>
                  :
                  <FlatList
                    vertical
                    showsVerticalScrollIndicator={false}
                    data={this.state.cartData ? this.state.cartData : []}
                    renderItem={this.renderCartItem}
                    keyExtractor={item => item.id.toString()}
                  />
              }
            </View>
            <View style={{ height: 50, width: '70%', alignSelf: "center", alignItems: "flex-start", justifyContent: 'flex-end', flexDirection: "row" }}>
              <TextComponent xmedium>Total: </TextComponent>
              <TextComponent darkred large heavy>{this.state.symbol}{this.state.totalPrice.toFixed(2)}</TextComponent>
            </View>
            <TouchableOpacity style={styles.checkout}
              onPress={() => {
                this.props.navigation.navigate('Checkout', {
                  symbol: this.state.symbol,
                  totalPrice: this.state.totalPrice,
                  currency_rate: this.state.currency_rate,
                  site_id: this.state.site_id
                })
              }}>
              <TextComponent white heavy large>Checkout </TextComponent>
              <FontAwesome name="shopping-cart" color="white" size={20} />
            </TouchableOpacity>
          </Card>

        </View>
        {/* </ScrollView> */}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0fa',
    marginTop: 7
  },
  main: {
    flex: 1,
    width: '100%',
    marginVertical: 50,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    elevation: 10,
    justifyContent: 'center',
    alignItems: "center",
    marginTop: -55,
    marginBottom: 20
  },
  chkbox: {
    flex: 1,
    padding: 10,
    width: '100%'
  },
  rows: {
    height: 80,
    alignItems: "center",
    justifyContent: 'center',
  },
  checkout: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgb(34,192,60)',
    width: '50%',
    alignItems: "center",
    height: 42,
    borderRadius: 21,
    marginBottom: 20,
    marginHorizontal: 20,
    alignSelf: 'center',
    // elevation: 5,
    // shadowColor: 'rgb(34,192,60)',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.9,
    // shadowRadius: 8,
  },
  header: {
    backgroundColor: '#ddd',
    justifyContent: 'center'
  },
  item: {
    width: '100%',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: "center",
    marginVertical: 5,
    justifyContent: 'space-between',
  },
  img: {
    width: width / 5,
    height: width / 5,
    backgroundColor: 'white',
    elevation: 8,
    borderRadius: 20
  },
  detail: {
    marginHorizontal: 10,
    width: '60%',
    justifyContent: 'space-between'
  },
  plus: {
    flexDirection: 'row',
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'red'
  },
  trash: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: 'white',
    elevation: 5,
    borderRadius: 18
  },
  modalBody2: {
    backgroundColor: '#fff9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5
  },
  closeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    elevation: 10,
    justifyContent: 'center',
    alignItems: "center",
    position: 'absolute',
    zIndex: 100,
    top: -10,
    right: -10
  },
  album: {
    width: width * 0.7,
    height: width * 0.5,
    borderRadius: 5,
    margin: 10,
  },
  editBox: {
    width: 40,
    height: 30,
    borderColor: Colors.authButton,
    borderWidth: 1,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
export default Cart;
