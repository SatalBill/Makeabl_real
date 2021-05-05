import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import TextComponent from '../components/TextComponent';
import Colors from '../constants/Colors';
import Card from '../components/Card';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import {Switch} from 'react-native-switch';
import CheckBox from 'react-native-check-box';
import AuthButton from '../components/AuthButton';
import {PERMISSIONS, RESULTS, check, request} from 'react-native-permissions';

const {width, height} = Dimensions.get('window');
const isAndroid = Platform.OS === 'android';

export default class Permissions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      camera: true,
      location: true,
      notification: true,
      isChecked: false,
      cameraGranted: false,
      pressed: false,
    };
  }

  onCameraGrant = async () => {
    await this.setState({camera: !this.state.camera});
    if (this.state.camera) {
      this.handleCameraPermission();
    }
  };

  handleCameraPermission = async () => {
    const res = await check(PERMISSIONS.IOS.CAMERA);
    console.log(res);
    if (res === RESULTS.GRANTED) {
      this.setState({cameraGranted: true});
    } else if (res === RESULTS.DENIED) {
      const res2 = await request(PERMISSIONS.IOS.CAMERA);
      res2 === RESULTS.GRANTED
        ? this.setState({cameraGranted: true})
        : this.setState({cameraGranted: false});
    }
  };

  render() {
    const {camera, location, notification, isChecked, pressed} = this.state;
    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <View style={styles.header}>
              <View
                style={{
                  position: 'absolute',
                  width: '50%',
                  height: 200,
                  right: 0,
                  backgroundColor: Colors.authButton,
                  zIndex: -1,
                }}></View>
              <View>
                <View
                  style={{
                    backgroundColor: Colors.authButton,
                    width: '100%',
                    height: Platform.OS === 'android' ? 120 : 150,
                    borderBottomLeftRadius: 60,
                    justifyContent: 'flex-end',
                  }}>
                  <View style={{marginLeft: 40, marginBottom: 15}}>
                    <TextComponent xlarge heavy white>
                      Permissions
                    </TextComponent>
                  </View>
                </View>
                <View
                  style={{
                    padding: 20,
                    backgroundColor: 'white',
                    width: '100%',
                    borderTopRightRadius: 60,
                  }}>
                  <TextComponent medium heavy grey>
                    Please allow us permission to access the following for fast
                    and wide facial detection.{' '}
                  </TextComponent>
                  <TextComponent medium heavy grey></TextComponent>
                  <View style={styles.boxContainer}>
                    <View style={styles.box}>
                      <View style={{width: '15%'}}>
                        <FontAwesome
                          style={{marginHorizontal: 10}}
                          name="camera"
                          size={24}
                          color={Colors.authButton}
                        />
                      </View>
                      <View style={{width: '70%'}}>
                        <TextComponent medium>
                          Allow to access camera and photos
                        </TextComponent>
                      </View>
                      <View style={styles.switch}>
                        <Switch
                          value={camera}
                          onValueChange={() => this.onCameraGrant()}
                          disabled={false}
                          circleSize={20}
                          barHeight={22}
                          switchWidthMultiplier={2.5}
                          // outerCircleStyle={{ width: 30 }}
                          circleBorderWidth={0}
                          activeTextStyle={{alignSelf: 'center'}}
                          inactiveTextStyle={{alignItems: 'center'}}
                          activeText={''}
                          inActiveText={''}
                          backgroundActive={Colors.authButton}
                          backgroundInactive={Colors.borderColor}
                          changeValueImmediately={false}
                          renderInsideCircle={() => (
                            <FontAwesome
                              style={{margin: 5}}
                              name="check"
                              size={12}
                              color={camera ? Colors.authButton : Colors.white}
                            />
                          )}
                          circleActiveColor={'#FFF'}
                          circleInActiveColor={'#FFF'}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.boxContainer}>
                    <View style={styles.box}>
                      <View style={{width: '15%'}}>
                        <Ionicons
                          style={{marginHorizontal: 10}}
                          name="location"
                          size={30}
                          color={Colors.authButton}
                        />
                      </View>
                      <View style={{width: '70%'}}>
                        <TextComponent medium>
                          Allow to access your location services
                        </TextComponent>
                      </View>
                      <View style={styles.switch}>
                        <Switch
                          value={location}
                          onValueChange={() =>
                            this.setState({location: !location})
                          }
                          disabled={false}
                          circleSize={20}
                          barHeight={22}
                          switchWidthMultiplier={2.5}
                          // outerCircleStyle={{ width: 30 }}
                          circleBorderWidth={0}
                          activeTextStyle={{alignSelf: 'center'}}
                          inactiveTextStyle={{alignItems: 'center'}}
                          activeText={''}
                          inActiveText={''}
                          backgroundActive={Colors.authButton}
                          backgroundInactive={Colors.borderColor}
                          changeValueImmediately={false}
                          renderInsideCircle={() => (
                            <FontAwesome
                              style={{margin: 5}}
                              name="check"
                              size={12}
                              color={
                                location ? Colors.authButton : Colors.white
                              }
                            />
                          )}
                          circleActiveColor={'#FFF'}
                          circleInActiveColor={'#FFF'}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.boxContainer}>
                    <View style={styles.box}>
                      <View style={{width: '15%'}}>
                        <Entypo
                          style={{marginHorizontal: 10}}
                          name="notification"
                          size={24}
                          color={Colors.authButton}
                        />
                      </View>
                      <View style={{width: '70%'}}>
                        <TextComponent medium>
                          Allow to send you notification
                        </TextComponent>
                      </View>
                      <View style={styles.switch}>
                        <Switch
                          value={notification}
                          onValueChange={() =>
                            this.setState({notification: !notification})
                          }
                          disabled={false}
                          circleSize={20}
                          barHeight={22}
                          switchWidthMultiplier={2.5}
                          // outerCircleStyle={{ width: 30 }}
                          circleBorderWidth={0}
                          activeTextStyle={{alignSelf: 'center'}}
                          inactiveTextStyle={{alignItems: 'center'}}
                          activeText={''}
                          inActiveText={''}
                          backgroundActive={Colors.authButton}
                          backgroundInactive={Colors.borderColor}
                          changeValueImmediately={false}
                          renderInsideCircle={() => (
                            <FontAwesome
                              style={{margin: 5}}
                              name="check"
                              size={12}
                              color={
                                notification ? Colors.authButton : Colors.white
                              }
                            />
                          )}
                          circleActiveColor={'#FFF'}
                          circleInActiveColor={'#FFF'}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{marginBottom: 30, width: '90%', marginLeft: '5%'}}>
                <View style={styles.privacy}>
                  <CheckBox
                    style={styles.chkbox}
                    onClick={() => {
                      this.setState({
                        isChecked: !isChecked,
                      });
                    }}
                    isChecked={isChecked}
                    rightText=""
                    rightTextStyle={{fontSize: 20}}
                  />
                  <Text
                    style={{
                      alignItems: 'center',
                      fontSize: 18,
                      lineHeight: 30,
                      width: '90%',
                    }}>
                    I read the
                    <TouchableOpacity
                      onPress={() => this.props.navigation.navigate('Privacy')}>
                      <Text
                        style={{
                          color: Colors.authButton,
                          fontSize: 18,
                          marginBottom: Platform.OS == 'android' ? -6 : 1,
                        }}>
                        {' '}
                        Privacy Policy{' '}
                      </Text>
                    </TouchableOpacity>
                    and I accept the
                    <TouchableOpacity
                      onPress={() => this.props.navigation.navigate('Terms')}>
                      <Text
                        style={{
                          color: Colors.authButton,
                          fontSize: 18,
                          marginBottom: -6,
                        }}>
                        {' '}
                        Terms and Conditions.
                      </Text>
                    </TouchableOpacity>
                  </Text>
                </View>
                <View style={{width: '50%', alignSelf: 'center'}}>
                  <AuthButton
                    disabled={!isChecked}
                    title={'Allow'}
                    onPress={() => {
                      this.props.navigation.navigate('Login');
                    }}
                    onPressIn={() => {
                      this.setState({pressed: true});
                    }}
                    pressed={pressed}
                  />
                </View>
              </View>
            </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flex: 1,
    justifyContent: 'space-between',
    height: height
  },
  switch: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '15%',
  },
  chkbox: {
    width: '10%',
  },
  box: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    borderRadius: 35,
  },
  boxContainer: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginVertical: 10,
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.authButton,
  },
});
