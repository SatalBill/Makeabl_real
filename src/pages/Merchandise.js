import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import TextComponent from '../components/TextComponent';
import Colors from '../constants/Colors';
import RNPickerSelect from 'react-native-picker-select';
import config, { amazon } from '../api/config';
import FastImage from 'react-native-fast-image';
import LoadingItem from '../components/LoadingItem';
import AsyncStorage from '@react-native-community/async-storage';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import OneSignal from 'react-native-onesignal';

const { width, height } = Dimensions.get('window');
const initialFeaturedURL = require('../assets/images/merchandise/download.jpg');

class Merchandise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        { id: 1, empty: ' ' },
        { id: 2, empty: ' ' },
        { id: 3, empty: ' ' },
        { id: 4, empty: ' ' },
        { id: 5, empty: ' ' },
        { id: 6, empty: ' ' },
      ],
      searchTxt: '',
      featured: [],
      merchandiseData: [],
      merchandiseCountry: [],
      merchandiseSite: [],
      merchandiseSite_id: 0,
      temp: [],
      isLoading: true,
      myHeaders: {},
      country_id_temp: '',
      featuredURL: '',
      featuredTitle: '',
      featuredDescription: '',
      featuredPrice: '',
      featuredSymbol: '',
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
        } else this._onFetchData();
      })
      .catch((error) => {
        // console.log('token_error=>', error)
      })

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
  _onFetchData = () => {
    this._onFetchMerchandiseInfo(0);
    this._onFetchMerchandiseSite();
  };
  _onFetchMerchandiseInfo = (e) => {
    // FetchMerchandiseInfo
    this.setState({ featured: [] });
    fetch(config.api.getMerchandiseInfo + '/' + e, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then(async (responseJSON) => {
        await this.setState({
          merchandiseData: responseJSON['merchandise_list'],
          isLoading: false,
        });
        if (e != 0) {
          responseJSON['merchandise_list'].map((item) => {
            if (
              (item != '' || item != null || item != undefined) &&
              item.featured_id == '1'
            ) {
              this.setState({
                featuredURL: item.comp_photo_url.toString().split('\n')[0],
                featuredTitle: item.title,
                featuredDescription: item.description,
                featuredPrice: item.price,
                featuredSymbol: item.symbol,
              });
            }
          });
        } else {
          this.setState({
            featuredURL: '',
            featuredTitle: '',
            featuredDescription: '',
            featuredPrice: '',
          });
        }
      })
      .catch((err) => {
        // console.log('merchandiseErr=>', err);
        this.setState({ isLoading: false });
      });
  };
  _onFetchMerchandiseSite = () => {
    // FetchSite
    fetch(config.api.getMerchandiseSite, {
      method: 'GET',
      headers: this.state.myHeaders,
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        // console.log('====>>>>>>>>>>>',responseJSON);
        responseJSON['site_list'].map((item, i) => {
          if (item != '') {
            let obj = {};
            obj.label = item.title;
            obj.value = item.id;
            this.state.temp.push(obj);
          }
        });
        this.setState({ merchandiseSite: this.state.temp });
      })
      .catch((err) => console.log('siteErr=>', err));
  };

  _onChangeSite = async (e) => {
    this.setState({ merchandiseSite_id: e, isLoading: true, featuredURL: '' });
    this._onFetchMerchandiseInfo(e);
  };

  onPressPhoto = (item) => {
    // console.log('------item-------', item);
    this.props.navigation.navigate('MerchandiseDetail', {
      merchandiseInfo: item,
    });
  };

  sliceText = (text, len = 12) => {
    var returnTxt = text.length > len ? text.slice(0, len) + '...' : text;
    return returnTxt;
  };

  renderPhotos = ({ item }) => (
    <View style={styles.itemStyle}>
      <TouchableOpacity
        style={styles.photoArea}
        onPress={() => this.onPressPhoto(item)}
        activeOpacity={0.7}>
        {/* <Image style={styles.photo} source={item.comp_photo_url} resizeMode="cover" /> */}
        <FastImage
          style={styles.photo}
          source={{
            uri: amazon + item.comp_photo_url.toString().split('\n')[0],
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.contain}>
          <ActivityIndicator
            size="large"
            style={StyleSheet.absoluteFill}
            color={Colors.authButton}
            animating={this.state.merchandiseData ? false : true}
          />
        </FastImage>
        {item.featured_id == 1 && (
          <View style={styles.featuredItem}>
            <TextComponent white small>
              Featured
          </TextComponent>
          </View>
        )}
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.heart}>
        <FontAwesome name="heart" color="red" size={20} />
      </TouchableOpacity> */}
      <View style={styles.priceArea}>
        <View
          style={{
            flexDirection: 'row',
            width: '93%',
            justifyContent: 'space-between',
          }}>
          <TextComponent small heavy>
            {this.sliceText(item.title, 12)}
          </TextComponent>
          <TextComponent># {item.id}</TextComponent>
        </View>
        {item.discount == 0 ? (
          <TextComponent medium heavy darkred>
            {' '}
            {item.symbol}
            {item.price}
          </TextComponent>
        ) : (
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{ textDecorationLine: 'line-through', color: '#B2242A' }}>
                {' '}
                {item.symbol}
                {item.price}{' '}
              </Text>
              <Text style={{ fontWeight: '700', fontSize: 15 }}>
                {' '}
                {item.symbol}
                {item.price - (item.price * item.discount) / 100}
              </Text>
            </View>
          )}
      </View>
    </View>
  );

  renderTemp = (item) => {
    return (
      <LoadingItem index={item.index}>
        <View
          style={{
            backgroundColor: '#0002',
            padding: 5,
            borderRadius: 10,
            width: width * 0.3,
          }}>
          {/* <View style={styles.short}></View>
          <View style={styles.long}></View> */}
          <View style={styles.short}></View>
          <View style={styles.long}></View>
        </View>
        <View
          style={{
            width: 80,
            height: 32,
            backgroundColor: '#bbb',
            borderRadius: 16,
            position: 'absolute',
            top: 20,
            right: 20,
          }}></View>
      </LoadingItem>
    );
  };
  // searchByName = async (text) => {
  //   await this.setState({ searchTxt: text })
  //   const newData = this.state.merchandise.filter(function (item) {
  //     const itemData = item ? item['title'].toUpperCase() : ''.toUpperCase();
  //     const textData = text.toUpperCase();
  //     return itemData.indexOf(textData) > -1;
  //   });
  //   if (newData.length > 0) {
  //     this.setState({
  //       merchandiseData: newData,
  //     });
  //   } else {
  //     this.setState({
  //       merchandiseData: this.state.featured,
  //     });
  //   }
  // }

  render() {
    const { isLoading, searchTxt, merchandiseData } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <FlashMessage position="bottom" duration={5500} animationDuration={700} icon="success" />
        <StatusBar hidden />
        <View style={styles.main}>
          {this.state.merchandiseSite_id != 0 && this.state.featuredURL != '' && (
            <View style={styles.featuredArea}>
              {this.state.featuredURL != '' ? (
                <>
                  <Image
                    source={{ uri: amazon + this.state.featuredURL }}
                    style={styles.featured}
                    resizeMode="contain"
                  />
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      paddingTop: 25,
                    }}>
                    <TextComponent medium heavy center>
                      {this.state.featuredTitle}
                    </TextComponent>
                    <Text
                      numberOfLines={1}
                      color="grey"
                      style={{ alignSelf: 'center' }}>
                      {this.state.featuredDescription}
                    </Text>
                    <TextComponent darkred xlarge>
                      {this.state.featuredSymbol}
                      {this.state.featuredPrice}
                    </TextComponent>
                    <View style={styles.tab}>
                      <TextComponent white>Featured</TextComponent>
                    </View>
                  </View>
                </>
              ) : (
                  <Image
                    source={initialFeaturedURL}
                    style={styles.initialFeatured}
                    resizeMode="cover"
                  />
                )}
            </View>
          )}

          <View style={{ flexDirection: 'row', marginVertical: 10 }}>
            <View style={styles.pickerContainer2}>
              <RNPickerSelect
                placeholder={{ label: 'Venue...', value: 0 }}
                items={
                  this.state.merchandiseSite ? this.state.merchandiseSite : []
                }
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
                value={this.state.merchandiseSite_id}
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

          <View style={{ flex: 1, width: '100%', marginBottom: 20 }}>
            {isLoading ? (
              <FlatList
                numColumns={2}
                data={this.state.data}
                renderItem={this.renderTemp}
                keyExtractor={(item) => item.id.toString()}
              />
            ) : merchandiseData != '' ? (
              <FlatList
                numColumns={2}
                data={merchandiseData ? merchandiseData : []}
                renderItem={this.renderPhotos}
                keyExtractor={(item) => item.id.toString()}
              />
            ) : (
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TextComponent center>
                      There is no merchandise to display
                </TextComponent>
                  </View>
                )}
          </View>
        </View>
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
    width: '92%',
    paddingTop: 30,
    marginLeft: '4%',
  },
  featured: {
    width: width * 0.5,
    height: width * 0.4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
  },
  initialFeatured: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  featuredArea: {
    backgroundColor: 'white',
    width: width * 0.86,
    alignSelf: 'center',
    height: width * 0.4,
    flexDirection: 'row',
    borderRadius: 20,
    elevation: 10,
    marginTop: 20,
  },
  itemStyle: {
    width: width * 0.4,
    backgroundColor: 'white',
    // overflow: 'hidden',
    marginHorizontal: width * 0.03,
    borderRadius: 20,
    marginVertical: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
    elevation: 5,
    shadowColor: 'grey',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  photo: {
    width: '100%',
    height: width * 0.3,
  },
  photoArea: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    flex: 1,
  },
  priceArea: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 5,
  },
  tab: {
    backgroundColor: Colors.authButton,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderTopRightRadius: 15,
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
  },
  heart: {
    backgroundColor: 'white',
    elevation: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  pickerContainer2: {
    width: '90%',
    borderWidth: 1,
    borderColor: Colors.authButton,
    borderRadius: 25,
    backgroundColor: 'white',
    marginHorizontal: '5%',
    marginTop: 10,
  },
  short: {
    width: width * 0.2,
    height: 12,
    backgroundColor: '#72777B',
    borderRadius: 6,
    marginTop: 12,
  },
  long: {
    width: width * 0.25,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginTop: 12,
  },
  featuredItem: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: Colors.authButton,
    top: -40,
    right: -40,
    transform: [{ rotate: `45deg` }],
    justifyContent: 'flex-end',
    alignItems: 'center',
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

// const mapStateToProps = (state) => {
//   return {
//     merchandiseInfo: state.merchandise.merchandiseInfo,
//     merchandiseCountry: state.merchandise.merchandiseCountry,
//     merchandiseSite: state.merchandise.merchandiseSite,
//   };
// };

// export default connect(mapStateToProps, { FetchMerchandiseInfo, FetchMerchandiseCountry, FetchMerchandiseSite })(Merchandise);

export default Merchandise;
