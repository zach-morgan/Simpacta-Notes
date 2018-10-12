import React, { Component } from 'react';
import { View, StatusBar, Platform, BackHandler, AsyncStorage, Image } from 'react-native';
import { Router, Scene, Actions } from 'react-native-router-flux';
import Toast, { DURATION } from 'react-native-easy-toast';
import SplashScreen from 'react-native-splash-screen';
import AppGlobalConfig from './Config/Main';
import LoginScreen from './LoginScreen/Main';
import NotesScreen from './NotesScreen/Main';
import Onboard from './Onboarding';
import Amplify, { Auth } from 'aws-amplify'
import AWSCONFIG from '../aws-exports.js';

let context;

const srmLogo= require('./assets/srmlogo.png');
const routineLogo = require('./assets/routine.png');

GLOBAL.showToast = (message) => {
  context.toast.show(message, DURATION.LENGTH_LONG);
};

const App = class App extends Component {
  constructor() {
    super();
    context = this;
    GLOBAL.AppGlobalConfig = AppGlobalConfig;
    AppGlobalConfig.init();
    this.state = {
      startingScene: "Loading"
    }
  }

  setAppLaunched = () => {
    AsyncStorage.setItem("hasLaunched", 'true');
  }
  
  isFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      //console.log(hasLaunched + " result from haslaunched")
      if (hasLaunched === null) {
        //console.log("is first launch");
        this.setAppLaunched();
        return true;
      }
      return false;
    } catch (error) {
      //console.log(error + " error from isfirstlaunch")
      return false;
    }
  }

  isLoggedIn = async () => {
      try {
          let user = await Auth.currentAuthenticatedUser();
          //console.log("after get auth details");
          //console.log(user);
          if (user === null) {
              return false;
          }
          return true;
      } catch( error ) {
          //console.log(error + "error from current auth")
          return false;
      }
  }

  pickCorrectScene = async () => {
      if (await this.isLoggedIn()){
          this.setState({startingScene: "NotesScreen"})
      } else if (await this.isFirstLaunch()) {
          this.setState({startingScene: "OnboardScreen"})
      } else {
          this.setState({startingScene: "LoginScreen"})
      }
  }

  componentDidMount() {
    this.pickCorrectScene();
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
      let scene = this.state.startingScene;
      if (scene === "Loading"){
        return (
        <View style={{flex: 1, backgroundColor: "white", flexDirection: 'row', alignItems: 'center', margin : 20}}>
            <Image source={srmLogo} resizeMode="contain" style={{flex: 1}}/>
            <Image source={routineLogo} resizeMode="contain" style={{flex: 1}}/>
        </View>
        )
      } else{
        var logScreen =
          <Scene
              key="LoginScreen"
              component={LoginScreen}
              hideNavBar
            />
        var noteScreen =
          <Scene
            key="NotesScreen"
            component={NotesScreen}
            hideNavBar
          />
        var onBoardScreen =
          <Scene
            key="OnboardScreen"
            component={Onboard}
            hideNavBar
          />
        //console.log("scene choice: ");
        //console.log(scene)
        switch (scene) {
          case "NotesScreen":
              //console.log("notes switch")
              noteScreen =
                <Scene
                  key="NotesScreen"
                  component={NotesScreen}
                  hideNavBar
                  initial
                />
            break;
          case "OnboardScreen":
            //console.log("on switch")
              onBoardScreen =
                <Scene
                  key="OnboardScreen"
                  component={Onboard}
                  hideNavBar
                  initial
                />
            break;
          case "LoginScreen":
              //console.log("log switch")
              logScreen =
                <Scene
                  key="LoginScreen"
                  component={LoginScreen}
                  hideNavBar
                  initial
                />
            break;
        }
        //console.log(onBoardScreen);
        //console.log(noteScreen);
        //console.log(logScreen)

        return (
          <View style={{ flex: 1, backgroundColor: appMainColor }}>
            <Router backAndroidHandler={this.onBackPressed} style={{ backgroundColor: appMainColor }}>
              <Scene key="root">
                {logScreen}
                {noteScreen}
                {onBoardScreen}
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
}

Amplify.configure(AWSCONFIG);
Amplify.Logger.LOG_LEVEL = 'VERBOSE';

export default App;