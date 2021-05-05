import React from 'react';
import {
  TouchableOpacity,
  Text,
  Dimensions,
  View,
  Image,
  Platform,
} from 'react-native';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createDrawerNavigator} from 'react-navigation-drawer';
import DrawerContainer from '../pages/DrawerContainer/DrawerContainer';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../constants/Colors';

import AuthLoadingScreen from './AuthLoading';
import PermissionsScreen from '../pages/Permissions';
import PrivacyScreen from '../pages/Privacy';
import TermsScreen from '../pages/Terms';
import LoginScreen from '../pages/Login';
import VerifyScreen from '../pages/Verify';
import RegisterScreen from '../pages/Register';
import ForgotScreen from '../pages/Forgot';
import GalleryScreen from '../pages/Gallery';
import GalleryDetailScreen from '../pages/GalleryDetail';
import VideoDetailScreen from '../pages/VideoDetail';
import PurchasePassScreen from '../pages/PurchasePass';
import QRscanScreen from '../pages/QRscan';
import MerchandiseScreen from '../pages/Merchandise';
import MerchandiseDetailScreen from '../pages/MerchandiseDetail';
import AccountScreen from '../pages/Account';
import HelpScreen from '../pages/Help';
import CartScreen from '../pages/Cart';
import CheckoutScreen from '../pages/Checkout';
import PaypalScreen from '../pages/Paypal';
import ProfileImage from '../constants/ProfileImage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// import WavyHeader from '../components/WavyHeader';
import HeaderBackground from '../components/CustomHeader';
import TextComponent from '../components/TextComponent';

const {width, height} = Dimensions.get('window');
const galleryURL = require('../assets/images/icon/gallery.png');
const digitalURL = require('../assets/images/icon/purchase.png');
const merchandiseURL = require('../assets/images/icon/merchandise.png');
const cartURL = require('../assets/images/icon/cart.png');
const checkoutURL = require('../assets/images/icon/checkout.png');
const logoutURL = require('../assets/images/icon/logout.png');
const albumsURL = require('../assets/images/icon/album.png');

class NavigationDrawerStructure extends React.Component {
  toggleDrawer = () => {
    this.props.navigationProps.toggleDrawer();
  };
  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
          <Icon
            name="menu"
            size={28}
            style={{marginLeft: 15, marginTop: 20}}
            color="white"
          />
        </TouchableOpacity>
      </View>
    );
  }
}

const AppStack = createStackNavigator(
  {
    Gallery: {
      screen: GalleryScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: 'my gallery',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          color: 'white',
          fontSize: 26,
          paddingTop: '5.6%',
        },
        headerRight: () => <ProfileImage imageURL={galleryURL} />,
        headerBackground: () => <HeaderBackground />,
      }),
    },
    GalleryDetail: {
      screen: GalleryDetailScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: () => (
          <View style={{flexDirection: 'column', marginTop: 20}}>
            <TextComponent large white heavy>
              {navigation.state.params.imgInfo.site_name}
            </TextComponent>
            {/* <TextComponent white>Location Name</TextComponent> */}
          </View>
        ),
        headerTitleAlign: 'center',
        // headerRight: () => <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: 'red',marginRight: 15}}></View>,
        headerRight: () => (
          <ProfileImage
            imageURL={require('../assets/images/icon/purchase.png')}
          />
        ),
        headerBackground: () => <HeaderBackground />,
      }),
    },
    VideoDetail: {
      screen: VideoDetailScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: () => (
          <View style={{flexDirection: 'column', marginTop: 20}}>
            <TextComponent large white heavy>
              {navigation.state.params.videoInfo.site_name}
            </TextComponent>
            {/* <TextComponent white>Location Name</TextComponent> */}
          </View>
        ),
        headerTitleAlign: 'center',
        // headerRight: () => <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: 'red',marginRight: 15}}></View>,
        headerRight: () => (
          <ProfileImage
            imageURL={require('../assets/images/icon/purchase.png')}
          />
        ),
        headerBackground: () => <HeaderBackground />,
      }),
    },
    PurchasePass: {
      screen: PurchasePassScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: 'digital pass',
        headerTitleAlign: 'center',
        headerTitleStyle: {color: 'white', fontSize: 26, paddingTop: '5.6%'},
        // headerRight: () => <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: 'red',marginRight: 15}}></View>,
        headerRight: () => <ProfileImage navigationProps={navigation} imageURL={digitalURL} QRbutton />,
        headerBackground: () => <HeaderBackground />,
      }),
    },
    QRscan: {
      screen: QRscanScreen,
      navigationOptions: {
        headerShown: false
      }
    },
    Merchandise: {
      screen: MerchandiseScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: 'merchandise',
        headerTitleAlign: 'center',
        headerTitleStyle: {color: 'white', fontSize: 26, paddingTop: '6%'},
        // headerRight: () => <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: 'red',marginRight: 15}}></View>,
        headerRight: () => <ProfileImage imageURL={merchandiseURL} />,
        headerBackground: () => <HeaderBackground />,
      }),
    },
    MerchandiseDetail: {
      screen: MerchandiseDetailScreen,
      navigationOptions: ({navigation}) => ({
        headerShown: false,
      }),
    },
    Account: {
      screen: AccountScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: 'my account',
        headerTitleAlign: 'center',
        headerTitleStyle: {color: 'white', fontSize: 26, paddingTop: '5.6%'},
        headerRight: () => (
          <ProfileImage
            imageURL={require('../assets/images/icon/account.png')}
          />
        ),
        headerBackground: () => <HeaderBackground />,
      }),
    },
    Help: {
      screen: HelpScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: 'FAQS',
        headerTitleAlign: 'center',
        headerTitleStyle: {color: 'white', fontSize: 24, paddingTop: '8%'},
        headerRight: () => (
          <ProfileImage imageURL={require('../assets/images/icon/help.png')} />
        ),
        headerBackground: () => <HeaderBackground />,
      }),
    },
    Cart: {
      screen: CartScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: 'my cart',
        headerTitleAlign: 'center',
        headerTitleStyle: {color: 'white', fontSize: 24, paddingTop: '6%'},
        // headerRight: () => <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: 'red',marginRight: 15}}></View>,
        headerRight: () => <ProfileImage imageURL={cartURL} />,
        headerBackground: () => <HeaderBackground />,
      }),
    },
    Checkout: {
      screen: CheckoutScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: 'checkout',
        headerTitleAlign: 'center',
        headerTitleStyle: {color: 'white', fontSize: 26, marginTop: 20},
        // headerRight: () => <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: 'red',marginRight: 15}}></View>,
        headerRight: () => <ProfileImage imageURL={checkoutURL} />,
        headerBackground: () => <HeaderBackground />,
      }),
    },
    Paypal: {
      screen: PaypalScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <NavigationDrawerStructure navigationProps={navigation} />
        ),
        headerTitle: '',
        // headerRight: () => <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: 'red',marginRight: 15}}></View>,
        headerRight: () => (
          <ProfileImage
            imageURL={require('../assets/images/icon/purchase.png')}
          />
        ),
        headerBackground: () => <HeaderBackground />,
      }),
    },
  },
  {
    initialRouteName: 'Gallery',
  },
);

const AuthStack = createStackNavigator(
  {
    Permissions: {
      screen: PermissionsScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <TouchableOpacity
            style={{position: 'absolute', top: 20, left: 20}}
            activeOpacity={0.7}
            onPress={() => navigation.push('Login')}>
            <Ionicons
              name={Platform.OS === 'android' ? 'arrow-back' : 'arrow-back'}
              size={28}
              color="white"
            />
          </TouchableOpacity>
        ),
        headerTitle: '',
        headerTransparent: true,
      }),
    },
    Privacy: {
      screen: PrivacyScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <TouchableOpacity
            style={{position: 'absolute', top: 20, left: 20}}
            activeOpacity={0.7}
            onPress={() => navigation.push('Permissions')}>
            <Ionicons
              name={Platform.OS === 'android' ? 'arrow-back' : 'arrow-back'}
              size={28}
              color="white"
            />
          </TouchableOpacity>
        ),
        headerTitle: '',
        headerTransparent: true,
      }),
    },
    Terms: {
      screen: TermsScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <TouchableOpacity
            style={{position: 'absolute', top: 20, left: 20}}
            activeOpacity={0.7}
            onPress={() => navigation.push('Permissions')}>
            <Ionicons
              name={Platform.OS === 'android' ? 'arrow-back' : 'arrow-back'}
              size={28}
              color="white"
            />
          </TouchableOpacity>
        ),
        headerTitle: '',
        headerTransparent: true,
      }),
    },
    Login: {
      screen: LoginScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
    Verify: {
      screen: VerifyScreen,
      navigationOptions: ({navigation}) => ({
        headerLeft: () => (
          <TouchableOpacity
            style={{position: 'absolute', top: 20, left: 20}}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}>
            <Ionicons
              name={Platform.OS === 'android' ? 'arrow-back' : 'arrow-back'}
              size={28}
              color="white"
            />
          </TouchableOpacity>
        ),
        headerTitle: '',
        headerTransparent: true,
      }),
    },
    Register: {
      screen: RegisterScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
    Forgot: {
      screen: ForgotScreen,
      navigationOptions: {
        headerShown: false,
      },
    },
  },
  {
    initialRouteName: 'Permissions',
  },
);

const DrawerStack = createDrawerNavigator(
  {
    Main: AppStack,
  },
  {
    drawerPosition: 'left',
    initialRouteName: 'Main',
    drawerWidth: width * 0.6,
    contentComponent: DrawerContainer,
    drawerBackgroundColor: 'transparent',
  },
);

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: DrawerStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    },
  ),
);
