import React, { Component } from 'react';
import { TouchableOpacity, View } from 'react-native';
import PropTypes from 'prop-types';
import * as Animatable from 'react-native-animatable';
import { Form, Text, Spinner, Button } from 'native-base';
import Email from '../InputComponents/Email';
import Password from '../InputComponents/Password';
import LoginButtons from './LoginButtons/index';
import { Actions } from 'react-native-router-flux';
import GoogleButton from './LoginButtons/Google';
import FacebookButton from './LoginButtons/Facebook';
import { Auth } from 'aws-amplify';
import Onboarding from 'react-native-onboarding-swiper';


export default class LoginTab extends Component {
  constructor() {
    super();
    this.state = {
      inputs: [],
      isLogin: false,
      canLogin: false,
      isForgot: false,
    };
  }

  changeInputFocus = index => () => {
    if (index === 0) {
      this.state.inputs[index+1].state.inputRef._root.focus(); // eslint-disable-line
    }
  };

  updateCanLogin(can) {
    this.setState({ canLogin: can });
  }

  updateCanLoginState = () => {
    let canLogin = true;
    this.state.inputs.forEach((child) => {
      if (child.state.isCorrect !== 1) {
        canLogin = false;
      }
    });
    this.updateCanLogin(
      canLogin, this.state.inputs[0].state.value,
      this.state.inputs[1].state.value,
    );
  };

  moveToMainAppScreen = () => {
    Actions.push('NotesScreen');
  };

  loginUser = () => {
    if (!this.state.isLogin) {
        if (!this.state.canLogin) {
            GLOBAL.showToast(language.checkFields);
        } else {
            let email = this.state.inputs[0].state.value;
            let pass = this.state.inputs[1].state.value;
            Auth.signIn(email, pass)
              .then( user => {
                //console.log(user)
                GLOBAL.showToast(language.loginSuccess);
                this.moveToMainAppScreen();
                this.setState({ isLogin: false, canLogin: false });
                this.clearAllInputs();
              })
              .catch( error => {
                  if (error.code === "UserNotFoundException" ){
                      alert("Email not registered!");
                  } else if (error.code === "NotAuthorizedException"){
                      alert("Incorrect password!");
                  }
              });
        }
    }
  };

  forgotPass = () => {
    // Auth.forgotPassword("zachmorgan987221@gmail.com")
    //   .then(data => console.log(data))
    //   .catch(err => console.log(err));
    }

  clearAllInputs = () => {
    this.state.inputs.forEach((child) => {
      child.clearInput();
    });
  };


  render() {
    
    let animationType;
    let loginColor;

    if (this.state.canLogin) {
      animationType = 'pulse';
      loginColor = mainThemeColor;
    } else {
      loginColor = mainThemeColor;
      animationType = null;
    }

    let indicator = (<Text uppercase={false} style={{ color: loginColor, fontWeight: '500', fontSize: GLOBAL.totalSize(2.22) }}>{language.login}</Text>);
    if (this.state.isLogin) {
      indicator = (<Spinner color={loginColor} size="large" />);
    }
    return (
      <Animatable.View
        animation="fadeInRight"
        delay={1200}
        duration={700}
        ref={(ref) => { this.animationView = ref; }}
        style={GLOBAL.loginScreenStyle.mainView}
      >
        <Form style={GLOBAL.loginScreenStyle.form}>
          <Email
            changeFocus={this.changeInputFocus(0)}
            update={this.updateCanLoginState}
            ref={(ref) => { this.state.inputs[0] = ref; }}
          />
          <Password
            changeFocus={this.changeInputFocus(1)}
            update={this.updateCanLoginState}
            ref={(ref) => { this.state.inputs[1] = ref; }}
          />
        </Form>
        <TouchableOpacity onPress={this.forgotPass} activeOpacity={0.5} style={{ marginTop: height / 10, alignItems: 'center' }}>
          <Text style={GLOBAL.loginScreenStyle.remember}>{language.dontRemember}</Text>
        </TouchableOpacity>
        <View style={{ marginTop: height / 15 }}>
          <Animatable.View animation={animationType} iterationCount="infinite" duration={500}>
            <Button
              bordered
              rounded
              activeOpacity={0.5}
              onPress={this.loginUser}
              style={{
                borderColor: loginColor, alignSelf: 'center', justifyContent: 'center', width: (width * 13) / 20, height: height / 14,
              }}
            >
              {indicator}
            </Button>
          </Animatable.View>
          {/* <View style={{ flexDirection: 'row', marginTop: height / 25 }}>
            <FacebookButton special />
            <GoogleButton special />
          </View> */}
        </View>
      </Animatable.View>
    );
  }

}

LoginTab.propTypes = {
  move: PropTypes.func.isRequired,
};
