import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import Photos from '../pages/Photos';
import Albums from '../pages/Albums';
import Videos from '../pages/Videos';

const TabScreen = createMaterialTopTabNavigator(
    {
        Photos: { screen: Photos },
        Albums: { screen: Albums },
        Videos: { screen: Videos },
    },
    {
        tabBarPosition: 'top',
        swipeEnabled: true,
        animationEnabled: true,
        tabBarOptions: {
            activeTintColor: '#000',
            inactiveTintColor: '#999',
            style: {
                backgroundColor: '#ecf0fa',
            },
            labelStyle: {
                textAlign: 'center',
            },
            indicatorStyle: {
                borderBottomColor: '#00f',
                borderBottomWidth: 2,
            },
        },
    }
);

const App = createStackNavigator({
    TabScreen: {
        screen: TabScreen,
        navigationOptions: {
            // headerStyle: {
            //     backgroundColor: '#633689',
            // },
            // headerTintColor: '#FFFFFF',
            // title: 'TabExample',
            headerShown: false
        },
    },
});
export default createAppContainer(App);