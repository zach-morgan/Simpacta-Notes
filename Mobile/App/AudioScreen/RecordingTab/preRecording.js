import React, {Component} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Image,
  StatusBar,
  Button,
  TextInput
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';


const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

const recordingStand = require('../../assets/standRecordingArt.png')
const fullS = require('../../assets/full.png')
const h = GLOBAL.height;
const w = GLOBAL.width;

export default class PreRecording extends Component {
    render() {
        return(
            <View style={{flex: 1, alignItems: 'center', marginBottom: h / 15}}>
                <View style={{flex: 7, alignItems: 'center'}}>
                    <Image source={fullS} resizeMode="contain" style={{position: 'absolute', top: h / 8}} />
                    <Image source={recordingStand} resizeMode="contain" style={{position: 'absolute', top: h / 2.5}} />
                </View>
                <LinearGradient
                    style={{
                        flex: 1,
                        borderRadius: h / 30,
                        width: w / 1.25,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={[darkBlue, lightBlue]}>
                <TouchableOpacity
                onPress={this.props.start}
                style={{
                    flex:1,
                    width: w / 1.25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    }}>
                    <Text style={{
                        fontFamily: 'System',
                        fontSize: h / 35,
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        Start Recording Audio
                    </Text>
                </TouchableOpacity>
            </LinearGradient>

            </View>
        )
    }
}

PreRecording.props = {
    start: PropTypes.func.isRequired
}