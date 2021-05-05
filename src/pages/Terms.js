import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Dimensions } from 'react-native';
import TextComponent from '../components/TextComponent';
import Colors from '../constants/Colors'
import AuthButton from '../components/AuthButton'
import config from '../api/config';
import Spinner from 'react-native-loading-spinner-overlay';

const { width, height } = Dimensions.get('window')

export default class Terms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      terms: ''
    };
  }

  componentDidMount() {
    this._getTerms()
  }

  NetworkSensor = async () => {
    console.log('This is NetworkSensor.');
    await this.setState({
      isLoading: false
    })
    alert('network error')
  }

  _getTerms = () => {
    var myTimer = setTimeout(function () { this.NetworkSensor() }.bind(this), 10000)
    this.setState({ isLoading: true })
    fetch(config.auth.getTerms, {
      method: 'GET',
      header: {
        'Auth-Key': 'simplerestapi'
      }
    })
      .then(response => response.json())
      .then(responseJSON => {
        clearTimeout(myTimer)
        this.setState({ isLoading: false })
        this.setState({ terms: responseJSON[0] })
      })
      .catch(error => {
        clearTimeout(myTimer)
        throw error
      })
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
          <View style={styles.piece}></View>
          <View style={{ flex: 1 }}>
            <View style={styles.headerBlue}>
              <View style={styles.textArea}>
                <TextComponent xlarge heavy white center railBold>Terms & Conditions</TextComponent>
              </View>
            </View>
            <View style={styles.termsArea}>
              <TextComponent heavy xlarge darkred center>{this.state.terms.subject}</TextComponent>
              <TextComponent></TextComponent>
              <ScrollView>
                <TextComponent medium>{this.state.terms.description}</TextComponent>
              </ScrollView>
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
  piece: { position: 'absolute', width: '50%', height: 200, right: 0, backgroundColor: Colors.authButton, zIndex: -1, },
  headerBlue: { backgroundColor: Colors.authButton, width: '100%', height: 120, borderBottomLeftRadius: 60, justifyContent: 'flex-end' },
  termsArea: { height: height - 200, padding: 20, backgroundColor: 'white', width: '100%', borderTopRightRadius: 60, paddingBottom: 20 },
  textArea: { margin: 15 }
})