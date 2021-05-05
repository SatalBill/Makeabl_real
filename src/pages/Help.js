import React, {Component} from 'react';
import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import Card from '../components/Card';
import Colors from '../constants/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextComponent from '../components/TextComponent';
import {connect} from 'react-redux';
import {FetchFAQ} from '../actions/Help/Help';
import config from '../api/config';
import AsyncStorage from '@react-native-community/async-storage';

const {height, width} = Dimensions.get('window');

class Help extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myHeaders: {}
    };
  }

  componentDidMount = async () => {
    let userID = await AsyncStorage.getItem('userID');
    let userToken = await AsyncStorage.getItem('userToken');
    await this.setState({ userID: userID, userToken: userToken });
    const myHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Auth-Key': 'simplerestapi',
      'User-Authorization': this.state.userToken.replace(/['"]+/g, ''),
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
        } else this.props.FetchFAQ();
      })
      .catch((error) => {
        console.log('token_error=>', error)
      })
  }

  renderFAQ = ({item}) => {
    return (
      <View style={{flexDirection: 'row', marginBottom: 40}}>
        <View style={{marginRight: 15}}>
          <Ionicons
            style={{margin: 5}}
            name="md-help-circle-outline"
            size={24}
            color="green"
          />
        </View>
        <View style={{flexDirection: 'column', flex: 1}}>
          <View style={{marginVertical: 5}}>
            <TextComponent large text heavy>
              {item.subject}
            </TextComponent>
          </View>
          <View style={{marginVertical: 5}}>
            <TextComponent xmedium grey>
              {item.description}
            </TextComponent>
          </View>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={{width: '90%', alignSelf: 'center', height: height - 165}}>
          <View style={{marginVertical: 20, backgroundColor: 'red'}}></View>

          <Card>
            <View
              style={{width: '85%', alignSelf: 'center', paddingVertical: 20}}>
              {this.props.faqs != '' ? (
                <FlatList
                  data={this.props.faqs ? this.props.faqs : []}
                  renderItem={this.renderFAQ}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                />
              ) : (
                <TextComponent center>There is no FAQS yet.</TextComponent>
              )}
            </View>
          </Card>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:17
  },
});

const mapStateToProps = (state) => {
  return {
    faqs: state.help.faqs,
  };
};

export default connect(mapStateToProps, {FetchFAQ})(Help);
