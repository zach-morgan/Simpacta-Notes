import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Form, Text, Button, Spinner } from 'native-base';
import Email from '../InputComponents/Email';
import Password from '../InputComponents/Password';
import PasswordRepeat from '../InputComponents/PasswordRepeat';
import { Auth } from 'aws-amplify';

const hide = { from: { opacity: 0 }, to: { opacity: 0 } };

export default class RegisterTab extends Component {
  constructor() {
    super();
    this.state = {
      inputs: [],
      zIndex: 0,
      isRegistering: false,
      canRegister: false,
    };
  }

  changeInputFocus = index => () => {
    if (index < 2) {
      this.state.inputs[index + 1].state.inputRef._root.focus(); // eslint-disable-line
      if (index >= 1) {
        this.props.scroll(index);
      }
    }
  };

  updateCanRegister = (can) => {
    this.setState({ canRegister: can });
  };

  registerUser = () => {
    if (!this.state.isRegistering) {
      if (!this.state.canRegister) {
        GLOBAL.showToast(language.checkFields);
      } else {
        let email = this.state.inputs[0].state.value;
        let pass = this.state.inputs[1].state.value;
        this.setState({ isRegistering: true });
        // console.log("email " + email + " pass " + pass);
        Auth.signUp({
          username: email,
          password: pass,
          attributes:{email : email}
        })
        .then(user => {
          //console..log(user);
          GLOBAL.showToast(language.accountCreated);
          this.props.switch(0);
          this.clearAllInputs();
          this.setState({ isRegistering: false, canRegister: false });
          alert("Please Verify Your Email Before Continuing.");
        })
        .catch(err => {
          //console..log(err);
          alert("There was an error registering you, please try again later.");
        })
      }
    }
  };

  updateCanRegisterState = () => {
    const pass = this.state.inputs[1].state.value;
    const repeat = this.state.inputs[2].state.value;

    if (repeat !== pass) {
      if (repeat !== '') {
        this.state.inputs[2].state.isCorrect = 2;
        this.state.inputs[2].forceUpdate();
      }
    } else if (pass !== '') {
      this.state.inputs[2].state.isCorrect = 1;
      this.state.inputs[2].forceUpdate();
    }

    let canRegister = true;
    this.state.inputs.forEach((child) => {
      if (child.state.isCorrect !== 1) {
        canRegister = false;
      }
    });

    this.updateCanRegister(
      canRegister,
      this.state.inputs[0].state.value,
      this.state.inputs[1].state.value, this.state.inputs[2].state.value,
    );
  };

  changeZindex() {
    if (this.state.zIndex === 0) {
      this.setState({ zIndex: 2 });
    } else {
      this.setState({ zIndex: 0 });
    }
  }

  clearAllInputs = () => {
    this.state.inputs.forEach(child => child.clearInput());
  };

  render() {
    let animationType;
    let registerColor;

    if (this.state.canRegister) {
      animationType = 'pulse';
      registerColor = mainThemeColor;
    } else {
      registerColor = mainThemeColor;
      animationType = null;
    }

    let indicator = (<Text uppercase={false} style={{ color: registerColor, fontWeight: '500', fontSize: GLOBAL.totalSize(2.22) }}>{language.create}</Text>);
    if (this.state.isRegistering) {
      indicator = (<Spinner color={registerColor} size="large" />);
    }
    return (
      <Animatable.View
        animation={hide}
        duration={0}
        ref={(ref) => { this.animationView = ref; }}
        style={{
          zIndex: this.state.zIndex, position: 'absolute', flex: 1, backgroundColor: 'transparent',
        }}
      >
        <Form style={GLOBAL.loginScreenStyle.form}>
          <Email
            changeFocus={this.changeInputFocus(0)}
            update={this.updateCanRegisterState}
            special
            ref={(ref) => { this.state.inputs[0] = ref; }}
          />
          <Password
            changeFocus={this.changeInputFocus(1)}
            update={this.updateCanRegisterState}
            special
            ref={(ref) => { this.state.inputs[1] = ref; }}
          />
          <PasswordRepeat
            changeFocus={this.changeInputFocus(2)}
            update={this.updateCanRegisterState}
            ref={(ref) => { this.state.inputs[2] = ref; }}
          />
        </Form>
        <View style={{ marginTop: height / 15, alignItems: 'center' }}>
          <View animation={animationType} iterationCount="infinite" duration={500}>
            <Button
              bordered
              rounded
              activeOpacity={0.5}
              onPress={this.registerUser}
              style={{
                borderColor: registerColor, alignSelf: 'center', justifyContent: 'center', width: (width * 13) / 20, height: height / 14,
              }}
            >
              {indicator}
            </Button>
          </View>
        </View>
      </Animatable.View>
    );
  }
}

RegisterTab.propTypes = {
  scroll: PropTypes.func.isRequired,
  switch: PropTypes.func.isRequired,
  move: PropTypes.func.isRequired,
};
