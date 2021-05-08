import React, { Component } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import TextComponent from '../components/TextComponent';
import Colors from '../constants/Colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MainButton from '../components/MainButton';
import config, { amazon } from '../api/config';
import FastImage from 'react-native-fast-image';
import ReadMore from 'react-native-read-more-text';
import Modal from 'react-native-modal';
import { FetchAlbumBySite } from '../actions/MerchandiseDetail/MerchandiseDetail';
import { connect } from 'react-redux';
import Toast from 'react-native-simple-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import { BarIndicator } from 'react-native-indicators'
import AsyncStorage from '@react-native-community/async-storage';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import OneSignal from 'react-native-onesignal';

const { width, height } = Dimensions.get('window');
const newImage = require('../assets/images/newimage.png');
const chk = require('../assets/images/chk1.png');

class MerchandiseDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemDetail: '',
      clicked: 1,
      pixelData: [],
      albumModalVisible: false,
      country_id: 0,
      site_id: '',
      albums: [],
      checkArr: [],
      newIndex: '',
      bannerURL: '',
      albumImageArr: [],
      isLoading: false,
      token: '',
      userID: '',
      myHeaders: '',
      clickedPrice: '',
      albumsTemp: [],
      isAdding: false
    };
    OneSignal.addEventListener('received', this.onReceived);
  }

  componentDidMount = async () => {
    let token = await AsyncStorage.getItem('userToken');
    let userID = await AsyncStorage.getItem('userID');
    this.setState({
      token: token,
      userID: userID,
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

    const itemDetail = this.props.navigation.getParam('merchandiseInfo');
    // console.log('itemDetail=>', itemDetail);
    await this.setState({
      itemDetail: itemDetail,
      clickedPrice:
        itemDetail.discount == 0
          ? itemDetail.price
          : itemDetail.price - (itemDetail.price * itemDetail.discount) / 100,
      symbol: itemDetail.symbol,
    });
    let bannerURL = this.state.itemDetail.photo_url;
    this.setState({ bannerURL: bannerURL.toString().split('\n')[0] });
    this.start(itemDetail);
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      setTimeout(() => {
        if (token == "") {
          this.props.navigation.navigate('Auth')
        }
      }, 5000);
    });
  };

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
  start = async (itemDetail) => {
    this.setState({ isLoading: true });
    this._onFetchAlbumBySite(itemDetail.site_id);
    this._onFetchMerchandiseSize(itemDetail.id);
  };

  _onFetchAlbumBySite = (site_id) => {
    fetch(config.api.getAlbumBySite + '/' + site_id, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        // console.log('----------', responseJSON);
        if (responseJSON['status'] == 200) {
          responseJSON.album_list.map((element) => {
            if (element.isImage == 0) {
              let isImageList = {};
              isImageList.id = element.id;
              isImageList.process_file_url = element.process_file_url;
              isImageList.process_comp_file_url = element.process_comp_file_url;
              isImageList.gallery_id = element.gallery_id;
              isImageList.favourite_id = element.favourite_id;
              isImageList.upload_type_id = element.upload_type_id;
              isImageList.isImage = element.isImage;
              isImageList.user_id = element.user_id;
              isImageList.site_id = element.site_id;
              isImageList.isDeleted = element.isDeleted;
              isImageList.created_at = element.created_at;
              this.state.albumsTemp.push(isImageList);
            }
          });
          this.setState({ albums: this.state.albumsTemp });
        } else {
          // console.log(responseJSON);
        }
      })
      .catch((err) => {
        // console.log('add to cart error', err);
      });
  };
  _onFetchMerchandiseSize = (merchandise_id) => {
    fetch(config.api.getMerchandiseSize + '/' + merchandise_id, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON['status'] == 200) {
          // console.log('====>>>>', responseJSON['size_list']);
          this.setState({
            pixelData: responseJSON['size_list'],
            clicked: responseJSON['size_list'][0].id,
            isLoading: false,
          });
        } else {
          Alert.alert('Warning', responseJSON);
          // console.log(responseJSON);
        }
      })
      .catch((err) => {
        // console.log('add to cart error', err);
      });
  };

  _renderTruncatedFooter = (handlePress) => {
    return (
      <Text
        style={{ color: 'red', marginTop: 5 }}
        onPress={handlePress}>
        Read more
      </Text>
    );
  };

  _renderRevealedFooter = (handlePress) => {
    return (
      <Text
        style={{ color: 'red', marginTop: 5 }}
        onPress={handlePress}>
        Show less
      </Text>
    );
  };

  _onModal = () => {
    this.setState({ albumModalVisible: true, checkArr: [], albumImageArr: [] });
  };

  _isChecked = (item) => {
    const index = this.state.checkArr.indexOf(item.id);
    this.setState({ newIndex: index });
    if (
      this.state.checkArr.includes(item.id) &&
      this.state.albumImageArr.includes(item.process_comp_file_url)
    ) {
      this.state.checkArr.splice(index, 1);
      this.state.albumImageArr.splice(index, 1);
    } else {
      this.state.checkArr.push(item.id);
      this.state.albumImageArr.push(item.process_comp_file_url);
    }
    // console.log(this.state.checkArr);
    // console.log(this.state.checkArr.indexOf(item.id));
  };

  _onCancel = () => {
    this.setState({
      albumModalVisible: false,
      checkArr: [],
      albumImageArr: [],
    });
  };

  _onAddToCart = (num) => {
    if (this.state.checkArr.length != num) {
      // console.log(this.state.itemDetail.site_id);
      Toast.showWithGravity(
        `Please select only ${num} ${num > 1 ? `photos` : `photo`}`,
        Toast.LONG,
        Toast.TOP,
      );
    } else {
      this.setState({ isAdding: true });
      fetch(config.api.getCart, {
        method: 'GET',
        headers: this.state.myHeaders,
      })
        .then((response) => response.json())
        .then(async (responseJSON) => {
          // console.log('Cart list check whether there is other site or not',responseJSON,);

          if (
            responseJSON['cart_list'] == '' ||
            responseJSON['cart_list'][0]['site_id'] ==
            this.state.itemDetail.site_id
          ) {
            let newString = this.state.checkArr.toString();
            // console.log(newString);
            let details = {
              merchandise_id: this.state.itemDetail.id,
              size: this.state.clicked,
              album_id: newString,
              site_id: this.state.itemDetail.site_id,
            };
            let formBody = [];
            for (let property in details) {
              let encodedKey = encodeURIComponent(property);
              let encodedValue = encodeURIComponent(details[property]);
              formBody.push(encodedKey + '=' + encodedValue);
            }
            formBody = formBody.join('&');
            // console.log('formBody=>', formBody);
            fetch(config.api.addCart, {
              method: 'POST',
              headers: this.state.myHeaders,
              body: formBody,
            })
              .then((response) => response.json())
              .then(async (responseJSON) => {
                this.setState({ isAdding: false });
                // console.log('=>>>', responseJSON);
                if (responseJSON['status'] == 200) {
                  this.setState({ albumModalVisible: false });
                  // await AsyncStorage.setItem('price', JSON.stringify(responseJson['id']))
                  // await AsyncStorage.setItem('currency_rate', JSON.stringify(this.sttacurrency_rate))
                  // await AsyncStorage.setItem('clickedPrice', JSON.stringify(responseJson['id']))
                  this.props.navigation.push('Cart');
                  // this.props.navigation.navigate('Cart', {
                  //   'merchandiseInfo': this.state.itemDetail,
                  //   'merchandiseSize': this.state.clicked,
                  //   'albumArr': this.state.checkArr.toString(),
                  //   'imageArr': this.state.albumImageArr,
                  //   'price': this.state.clickedPrice,
                  //   'currency_rate': this.state.itemDetail.currency_rate,
                  //   'siteName': this.state.itemDetail.site
                  // })
                } else {
                  Alert.alert('Warning', 'Please checkout the items in the cart page.');
                  // console.log(responseJSON);
                }
              })
              .catch((err) => {
                this.setState({ isAdding: false });
                // console.log('add to cart error', err);
              });
          } else {
            this.setState({ isAdding: false });
            Alert.alert('Warning', 'Please checkout the items in the cart page first.');
          }
        })
        .catch((err) => {
          // console.log('cartGetErr=>', err);
          this.setState({ isAdding: false });
        });
    }
  };

  renderAlbums = ({ item }) => (
    <View>
      <TouchableOpacity
        style={{ zIndex: 9, borderColor: 'red' }}
        onPress={() => this._isChecked(item)}
        activeOpacity={0.7} disabled={this.state.isAdding} >
        <View
          style={{
            ...styles.imgItem,
            backgroundColor:
              this.state.checkArr.indexOf(item.id) > -1
                ? Colors.authButton
                : 'white',
          }}>
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
              animating={item.process_comp_file_url ? false : true}
            />
          </FastImage>
        </View>
      </TouchableOpacity>
      <View
        style={{
          ...styles.count,
          backgroundColor:
            this.state.checkArr.indexOf(item.id) > -1
              ? Colors.authButton
              : 'transparent',
        }}>
        {this.state.checkArr.indexOf(item.id) > -1 && (
          <Text style={{ color: 'white' }}>
            {this.state.checkArr.indexOf(item.id) + 1}
          </Text>
        )}
      </View>
      {/* {
        this.state.checkArr.indexOf(item.id) > -1 &&
        <Image source={chk} style={{ width: 20, height: 20, position: 'absolute', right: 10, top: 10, resizeMode: 'contain', zIndex: 10, }} />
      } */}
      {/* {
        Math.floor((new Date().getTime() - new Date(`${(item.created_at).slice(0, 10)}`).getTime()) / (1000 * 60 * 60 * 24)) < 2 &&
        <Image source={newImage} style={styles.newImage} />
      } */}
    </View>
  );

  render() {
    const {
      itemDetail,
      clicked,
      pixelData,
      albumModalVisible,
      albums,
      isAdding
    } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <FlashMessage position="bottom" duration={3500} animationDuration={500} icon="success" />
        <StatusBar hidden />
        <Modal
          isVisible={albumModalVisible}
          backdropColor="#B4B3DB"
          backdropOpacity={0.8}
          animationIn="zoomInDown"
          animationOut="zoomOutUp"
          animationInTiming={1000}
          animationOutTiming={1000}
          backdropTransitionInTiming={1000}
          backdropTransitionOutTiming={500}>
          <View style={styles.modalBody2}>
            {/* <TouchableOpacity onPress={() => this.setState({ albumModalVisible: false })} style={styles.closeIcon} activeOpacity={0.8}>
              <FontAwesome name="close" size={24} color={Colors.deactive} />
            </TouchableOpacity> */}
            {albums != '' ? (
              <FlatList
                vertical
                numColumns={3}
                showsVerticalScrollIndicator={false}
                data={albums}
                renderItem={this.renderAlbums}
                keyExtractor={(item, index) => index.toString()}
              />
            ) : (
                <View style={{ marginVertical: 10 }}><TextComponent>There is no album to display</TextComponent></View>
              )}
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-around',
                margin: 20,
              }}>
              <MainButton
                title="Cancel"
                onPress={() => this._onCancel()}
                width={'45%'}
                disabled={isAdding}
              />
              {/* <MainButton
                title="Add To Cart"
                onPress={() => this._onAddToCart(itemDetail.photo_num)}
                width={'45%'}
              /> */}
              <TouchableOpacity style={styles.mainBtn} onPress={() => this._onAddToCart(itemDetail.photo_num)} activeOpacity={0.7} disabled={isAdding}>
                {
                  isAdding ?
                    <BarIndicator color='white' count={3} size={17} />
                    :
                    <TextComponent heavy white medium>Add To Cart</TextComponent>
                }

              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Spinner
          visible={this.state.isLoading}
          textContent={'Loading...'}
          textStyle={{ color: 'white' }}
        />
        <View style={styles.main}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.back}
              onPress={() => this.props.navigation.goBack()}
              activeOpacity={0.7}>
              <FontAwesome
                style={{ marginHorizontal: 10 }}
                name="chevron-left"
                size={24}
                color={Colors.authButton}
              />
            </TouchableOpacity>
          </View>
          <FastImage
            style={styles.banner}
            source={{
              uri: amazon + this.state.bannerURL,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}>
            <ActivityIndicator
              size="large"
              style={StyleSheet.absoluteFill}
              color={Colors.authButton}
              animating={itemDetail.comp_photo_url ? false : true}
            />
          </FastImage>
          <View style={styles.description}>
            <TextComponent medium heavy white>
              Print Size
            </TextComponent>
            <View
              style={{
                marginVertical: 10,
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <FlatList
                data={pixelData}
                horizontal
                showsHorizontalScrollIndicator={true}
                keyExtractor={(item, index) => {
                  item.id.toString();
                }}
                renderItem={(item) => (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        clicked: item.item.id,
                        clickedPrice:
                          itemDetail.discount == 0
                            ? item.item.price
                            : item.item.price -
                            (item.item.price * itemDetail.discount) / 100,
                      }),
                        console.log(item.item.id);
                    }}
                    style={{
                      ...styles.size,
                      backgroundColor:
                        clicked != item.item.id ? Colors.borderColor : 'white',
                    }}>
                    {clicked == item.item.id ? (
                      <TextComponent main xmedium heavy>
                        {' '}
                        {item.item.title}{' '}
                      </TextComponent>
                    ) : (
                        <TextComponent medium white heavy>
                          {' '}
                          {item.item.title}{' '}
                        </TextComponent>
                      )}
                  </TouchableOpacity>
                )}
              />
            </View>

            <TextComponent medium heavy white>
              Description
            </TextComponent>

            <ScrollView style={{ maxHeight: height-width-300 }}>
              {/* <ReadMore
                numberOfLines={2}
                renderTruncatedFooter={this._renderTruncatedFooter}
                renderRevealedFooter={this._renderRevealedFooter}
              >
              </ReadMore> */}
                <TextComponent white>{itemDetail.description}</TextComponent>
            </ScrollView>
            <TextComponent small></TextComponent>
            <TextComponent large heavy darkred right>{this.state.symbol}{this.state.clickedPrice}</TextComponent>
            <View style={{ marginTop: 20, width: '45%', alignSelf: 'flex-end', marginRight: -10 }}>
              <TouchableOpacity onPress={() => this._onModal()} style={styles.look} activeOpacity={0.7}>
                <TextComponent heavy main medium>Select {itemDetail.photo_num} {itemDetail.photo_num > 1 ? 'Photos' : 'Photo'}</TextComponent>
              </TouchableOpacity>
            </View>
          </View>

        </View>
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
    width: width,
    height: height,
  },
  header: {
    position: 'absolute',
    width: width,
    // height: 50,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  description: {
    width: width,
    height: height - width,
    backgroundColor: Colors.authButton,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    padding: 20,
    elevation: 5,
    marginTop: -50,
  },
  size: {
    width: 80,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 3,
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  banner: {
    width: width,
    height: width + 50,
    top: 0,
  },
  back: {
    left: 10,
    top: 10,
    justifyContent: 'center',
    width: 36,
    height: 36,
    alignItems: 'center',
  },
  modalBody2: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
  },
  closeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 100,
    top: -10,
    right: -10,
  },
  imgItem: {
    width: width * 0.28,
    height: width * 0.28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoList: {
    width: width * 0.27,
    height: width * 0.27,
  },
  newImage: {
    width: width * 0.15,
    height: width * 0.15,
    position: 'absolute',
    top: -2,
    right: 0,
  },
  look: {
    alignSelf: 'center',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    // elevation: 5,
    // shadowColor: 'grey',
    // shadowOffset: {
    //   width: 0,
    //   height: 0,
    // },
    // shadowOpacity: 0.5,
    // shadowRadius: 5,
    marginBottom: 20,
  },
  count: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainBtn: {
    width: '45%',
    height: 42,
    justifyContent: 'center',
    alignItems: "center",
    backgroundColor: Colors.authButton,
    borderRadius: 21,
    paddingHorizontal: 20,
    // elevation: 3,
    // shadowColor: Colors.authButton,
    // shadowOffset: {
    //   height: 0,
    //   width: 0
    // },
    // shadowOpacity: 0.8,
    // shadowRadius: 10
  },
});

const mapStateToProps = (state) => {
  return {
    albumBySite: state.merchandiseDetail.albumBySite,
  };
};

export default connect(mapStateToProps, {
  FetchAlbumBySite,
})(MerchandiseDetail);
