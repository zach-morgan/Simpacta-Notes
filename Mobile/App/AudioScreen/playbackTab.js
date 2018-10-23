import React, {Component} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Image,
  ImageBackground,
  StatusBar,
  Button
} from 'react-native';

import PropTypes from 'prop-types';

export default class ArchiveTab extends Component {

    state = {
        currentTime: 0.0
    }

    formatTime(time){
        // Hours, minutes and seconds
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";

        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }

        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }

    render() {
        let startEnd = this.formatTime(this.props.start) + " - " + this.formatTime(this.props.end);
        let currentTime = this.formatTime(this.state.currentTime);
        return (
            <View>
                <Text>startEnd</Text>

            </View>
        )
    }

}


ArchiveTab.propTypes = {
    start: PropTypes.number,
    end: PropTypes.number,
    play: PropTypes.func
}