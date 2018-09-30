import React, { Component } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import LoginButton from './Login';
import GoogleButton from './Google';
import FacebookButton from './Facebook';

export default class LoginButtons extends Component {
  render() {
    return (
      <View style={{ marginTop: height / 15 }}>
        <LoginButton clear={this.props.clear} ref={(ref) => { this.loginButton = ref; }} />
        <View style={{ flexDirection: 'row', marginTop: height / 25 }}>
          <FacebookButton special />
          <GoogleButton special />
        </View>
      </View>
    );
  }
}

LoginButtons.propTypes = {
  move: PropTypes.func.isRequired,
  clear: PropTypes.func.isRequired,
};
