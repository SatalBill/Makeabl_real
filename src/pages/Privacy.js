import React, { Component } from 'react';
import { View, FlatList, StyleSheet, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import TextComponent from '../components/TextComponent';
import Colors from '../constants/Colors'
import AuthButton from '../components/AuthButton'
import { connect } from 'react-redux'
import { FetchPrivacy } from '../actions/Privacy/Privacy'
import config from '../api/config';
import Ionicons from 'react-native-vector-icons/Ionicons'
import Spinner from 'react-native-loading-spinner-overlay';

const { width, height } = Dimensions.get('window')

class Privacy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  componentDidMount() {
    // this.props.FetchPrivacy()
    this._getPrivacy()
  }

  _getPrivacy = () => {
    this.setState({ isLoading: true })
    fetch(config.auth.getPrivacy, {
      method: 'GET',
      header: {
        'Auth-Key': 'simplerestapi'
      }
    })
      .then(response => response.json())
      .then(responseJSON => {
        this.setState({ isLoading: false })
        this.setState({ privacy: responseJSON })
      })
  }
  renderPrivacy = ({ item }) => {
    return (
      <View style={{ flexDirection: 'row', marginBottom: 40 }}>
        <View style={{ marginRight: 15 }}>
          <Ionicons style={{ margin: 5 }} name="md-help-circle-outline" size={24} color="green" />
        </View>
        <View style={{ flexDirection: 'column', flex: 1 }}>
          <View style={{ marginVertical: 5 }}>
            <TextComponent large text heavy>{item.subject}</TextComponent>
          </View>
          <View style={{ marginVertical: 5, marginLeft: -25 }}>
            <TextComponent medium grey>{item.description}</TextComponent>
          </View>
        </View>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Spinner
          visible={this.state.isLoading}
          textContent={'Loading...'}
          textStyle={{ color: 'white' }}
        />
        <View style={styles.header}>
          <View style={{ position: 'absolute', width: '50%', height: 200, right: 0, backgroundColor: Colors.authButton, zIndex: -1, }}></View>
          <View>
            <View style={{ backgroundColor: Colors.authButton, width: '100%', height: 120, borderBottomLeftRadius: 60, justifyContent: 'flex-end' }}>
              <View style={{ marginLeft: 80, marginBottom: 15 }}>
                <TextComponent xlarge heavy white>Privacy</TextComponent>
              </View>
            </View>
            <View style={{ height: height - 200, backgroundColor: 'white', padding: 20, width: '100%', borderTopRightRadius: 60 }}>
              <TextComponent heavy xlarge darkred center>Privacy Policy</TextComponent>
              <TextComponent></TextComponent>
              {
                this.state.privacy != "" ?
                  <FlatList
                    data={this.state.privacy ? this.state.privacy : []}
                    renderItem={this.renderPrivacy}
                    keyExtractor={(item, index) => index.toString()}
                  /> : <TextComponent center>There is no privacy yet.</TextComponent>
              }
            </View>
          </View>
          <View style={{ marginBottom: 30 }}>
            <AuthButton title={"Agree"} onPress={() => { this.props.navigation.navigate('Permissions') }} />
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
    justifyContent: 'space-between'
  },
  switch: {
    alignItems: "center",
    justifyContent: 'center',
    width: '15%'
  },
  chkbox: {
    padding: 10,
    width: '10%',
  },
})

const mapStateToProps = (state) => {
  return {
    privacy: state.privacy.privacy
  }
}

export default connect(mapStateToProps, { FetchPrivacy })(Privacy)