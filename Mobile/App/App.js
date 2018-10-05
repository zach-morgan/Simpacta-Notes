import React, { Component } from 'react';
import { View, StatusBar, Platform, BackHandler } from 'react-native';
import { Router, Scene, Actions } from 'react-native-router-flux';
import Toast, { DURATION } from 'react-native-easy-toast';
import SplashScreen from 'react-native-splash-screen';
import AppGlobalConfig from './Config/Main';
import LoginScreen from './LoginScreen/Main';
import NotesScreen from './NotesScreen/Main';
import Amplify, { Auth, withAuthenticator } from 'aws-amplify'
import AWSCONFIG from '../aws-exports.js';

let context;

GLOBAL.showToast = (message) => {
  context.toast.show(message, DURATION.LENGTH_LONG);
};

const App = class App extends Component {
  constructor() {
    super();
    context = this;
    GLOBAL.AppGlobalConfig = AppGlobalConfig;
    AppGlobalConfig.init();
  }

  componentDidMount() {
    this.setState({
      initLoaded: true,
    });
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }
  onBackPressed = () => {
    if (Actions.currentScene === 'LoginScreen') {
      BackHandler.exitApp();
      return false;
    }
    Actions.pop();
    return true;
  };

  render() {
      return (
        <View style={{ flex: 1, backgroundColor: appMainColor }}>
          <Router backAndroidHandler={this.onBackPressed} style={{ backgroundColor: appMainColor }}>
            <Scene key="root">
              <Scene
                key="LoginScreen"
                component={LoginScreen}
                hideNavBar
                initial
              />
              <Scene
                key="NotesScreen"
                component={NotesScreen}
                hideNavBar
              />
            </Scene>
          </Router>
          <Toast
            positionValue={height / 8}
            style={{ backgroundColor: mainReverseThemeColor }}
            textStyle={{ fontSize: GLOBAL.totalSize(2.34), color: mainThemeColor, fontWeight: '400' }}
            ref={(ref) => { context.toast = ref; }}
          />
        </View>
      );
  }
}

Amplify.configure(AWSCONFIG);
Amplify.Logger.LOG_LEVEL = 'VERBOSE';

export default App;