import React from 'react';
import { ActivityIndicator, AsyncStorage, StatusBar, View, StyleSheet } from 'react-native'
import User from './User'
import firebase from 'firebase'
import { firebaseConfig } from './FirebaseConfig';
firebase.initializeApp(firebaseConfig)

export default class AuthLoadingScreen extends React.Component {
    constructor(props) {
        super(props);
        // AsyncStorage.removeItem('userToken')
        // AsyncStorage.clear()
    }

    componentDidMount() {
        this._bootstrapAsync();
        // this.checkIfLoggedIn();
    }

    _bootstrapAsync = async () => {

        User.data = await AsyncStorage.getItem('userToken');
        console.log('********************', User.data)
        // await this.props.navigation.navigate(User.data == null ? 'App' : 'Auth');
        await this.props.navigation.navigate(User.data == null ? 'Auth' : 'App');
    };

    render() {
        return (
            <View>
                <ActivityIndicator/>
                <StatusBar barStyle="default" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center"
    },
})
