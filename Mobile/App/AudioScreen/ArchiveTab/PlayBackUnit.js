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

import {Storage} from 'aws-amplify';
import Moment from 'moment';
import PropTypes from 'prop-types';

import {
    Player,
    Recorder,
    MediaStates
} from 'react-native-audio-toolkit';
import LinearGradient from 'react-native-linear-gradient';

const playIcon = require('../../assets/playbutton.png');
const pauseIcon = require('../../assets/pause.png');

const h = GLOBAL.height;
const w = GLOBAL.width;
const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";
const blueText = '#2F80ED'

export default class PlayBackUnit extends Component {

    state = {
        player: undefined,
        isPlaying: false,
        showingFullTrans: false,
    }

    componentDidMount(){
        let player = new Player(this.props.source);
        player.prepare((err) => {
            if (!err){
                this.setState({ player: player});
            }
        })

        //player.prepare();
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

    toggleAudio = () => {
        if (this.state.player){
            if (!this.state.isPlaying) {
                this.state.player.play()//result => console.log(result));
                this.setState({isPlaying: true})
            } else {
                this.state.player.pause();
                this.setState({isPlaying: false});
            }
        }
    }

    render() {
        let formattedStart = this.formatTime(this.props.start);
        let formattedEnd = this.formatTime(this.props.end);
        let startEnd = formattedStart + " - " + formattedEnd;

        let buttonText = this.state.showingFullTrans ? "Hide" : "Show Full Transcript";
        let transcriptText = this.props.transcription || "Transcript Processing"
        return (
            <View style={{
                marginLeft: w / 25, marginRight: w / 25,
                marginTop : h / 35, marginBottom : h / 80,
                flex: 1
            }}>
                <View style={{
                    marginBottom: h / 70,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>

                    <TouchableOpacity
                    onPress={this.toggleAudio}
                    style={{
                        height: h / 20,
                        width: h / 20,
                        borderRadius: h / 80,
                        backgroundColor: 'rgba(28, 121, 229, 0.1)',
                        alignItems: 'center',
                        justifyContent:'center'}}>
                        <Image
                            style={{
                                height: h / 40,
                                width: h / 40,
                            }}
                            source={this.state.isPlaying ? pauseIcon : playIcon }
                            resizeMode="contain" />
                    </TouchableOpacity>
                    <Text style={{
                        textAlign: 'left',
                        flex: 2, marginLeft: w / 20,
                        fontWeight: 'bold',
                        color: 'black'
                    }}>
                        {startEnd}
                    </Text>

                </View>

                <View style={{
                    marginBottom: h / 70,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Text
                    style={{marginBottom: h / 70, fontFamily: 'System', textAlign:'left'}}
                    numberOfLines={this.state.showingFullTrans ? undefined : 2 }>
                        {transcriptText}
                    </Text>

                    <TouchableOpacity
                        onPress={() => this.setState({showingFullTrans: !this.state.showingFullTrans})}
                        style={{
                            height: h / 20,
                            width: w / 1.25,
                        }}>

                        <LinearGradient
                        style={{flex: 1, width: w / 1.25,
                            alignItems: 'center', justifyContent: 'center',
                            borderRadius: h / 100
                        }}
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={[darkBlue, lightBlue]}>
                            <Text style={{
                                color: 'white',
                                fontWeight: 'bold',
                                fontFamily: 'System'
                            }}>
                                {buttonText}
                            </Text>
                        </LinearGradient>

                    </TouchableOpacity>
                </View>

            </View>
        )
    }

}

PlayBackUnit.props = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    source: PropTypes.string.isRequired,
    transcription: PropTypes.string
}