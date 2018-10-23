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
import Moment from 'moment';
import Orientation from 'react-native-orientation';
import WaveForm from 'react-native-audiowaveform';
import LinearGradient from 'react-native-linear-gradient';

const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

const h = GLOBAL.height;
const w = GLOBAL.width;

const playButton = require('../assets/playbutton.png');
const forwardFifteen = require('../assets/15forward.png');
const backFifteen = require('../assets/15back.png');
const backArrow = require('../assets/backArrow.png');


export default class PostRecordSession extends Component {

    state = {
        currentTime: 0.0,
        isPlaying: false
    }

    componentDidMount() {
        Orientation.lockToLandscape();
    }

    formatDuration(time) {
        const durationMoment = Moment(time);
        return durationMoment.format('hh:MM:SS');
    }

    formatStartEnd(start, end) {
        const momentStart = Moment(start);
        const momentEnd = Moment(end);
        let formattedStart = momentStart.format('MM/DD/YYYY hh:MM A');
        let formattedEnd = momentEnd.format('hh:MM A');
        return formattedStart + " - " + formattedEnd;
    }

    render() {
        let startDate = new Date(this.props.start);
        let endDate = new Date(this.props.end);
        let durationDate = new Date(this.props.end - this.props.start);
        let duration = this.formatDuration(durationDate);
        let startEnd = this.formatStartEnd(startDate, endDate);
        return (
            <View style={{flex: 1}}>
                <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{
                        flex: 0.5,
                        marginLeft: w / 20,
                        marginTop: h / 40,
                        justifyContent: 'space-evenly'
                    }}>
                        <Text style={{
                            flex: 1,
                            color: "rgba(55, 55, 55, 0.7)",
                            fontFamily: 'System',
                            fontSize: h / 65
                        }}>
                            Session
                        </Text>
                        <View style={{flex: 1.5, flexDirection: 'row'}}>
                            <Text style={{
                                color: 'black',
                                fontWeight: 'bold',
                                fontSize: h / 40,
                                fontFamily: 'System',
                                marginRight: 10
                            }}>
                                {this.props.title}
                            </Text>
                            <Text style={{
                                color: darkBlue,
                                fontWeight: 'bold',
                                fontSize: h / 40,
                                fontFamily: 'System'
                            }}>
                                {duration}
                            </Text>
                        </View>
                        <Text style={{
                            flex: 1,
                            color: 'black',
                            fontFamily: 'System',
                            fontWeight: 'bold',
                            fontSize: h / 50
                        }}>
                            {startEnd}
                        </Text>
                    </View>

                    <View style={{
                        flex: 0.75  ,
                        flexDirection: 'row',
                        marginRight: w / 15,
                        justifyContent: 'space-evenly',
                        alignItems: 'center'}}>
                        <LinearGradient
                            style={{
                                borderRadius: h / 75,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                                height: h / 20
                            }}
                            start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={[darkBlue, lightBlue]}>
                            <TouchableOpacity>
                                <Text style={{
                                    color: 'white',
                                    fontSize: h / 50
                                }}>
                                    Save Selected to Note
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                        <View style={{flex: 0.2}}/>
                        <LinearGradient
                            style={{
                                borderRadius: h / 75,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: 1,
                                height: h / 20
                            }}
                            start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={[darkBlue, lightBlue]}>
                            <TouchableOpacity>
                                <Text style={{
                                    color: 'white',
                                    fontSize: h / 50
                                }}>
                                    Save All to Note
                                </Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                </View>

                <View style={{flex: 2.5}}>
                    
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Text>60 sec</Text>
                    </View>

                    <WaveForm
                        style={{flex: 2}}
                        source={{uri: 'http://www.largesound.com/ashborytour/sound/brobob.mp3'}}
                        waveFormStyle={{waveColor:'red', scrubColor:'white'}}
                    />
                </View>


                <View style={{flex: 1, flexDirection: 'row', marginBottom: h / 70}}>
                        <TouchableOpacity style={{
                            flexDirection: 'row',
                            flex: 2,
                            alignItems: 'center',
                            justifyContent: 'flex-start',

                        }}>
                            <Image resizeMode='contain' source={backArrow} style={{flex: 1}} />
                            <Text style={{
                                flex: 3,
                                color: '#007AFF',
                                fontSize: h / 45,
                                fontFamily: 'System'
                            }} >
                                Back
                            </Text>
                        </TouchableOpacity>
                        <View style={{
                            flex: 5,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <TouchableOpacity style={{marginRight: w / 7}} >
                                <Image source={backFifteen} resizeMode='contain' />
                            </TouchableOpacity>

                            <TouchableOpacity style={{marginRight: w / 7}} >
                                <Image source={playButton} resizeMode='contain' />
                            </TouchableOpacity>

                            <TouchableOpacity >
                                <Image source={forwardFifteen} resizeMode='contain' />
                            </TouchableOpacity>
                        </View>

                        <View style={{flex: 2}} />

                </View>

            </View>
        )
    }

}

PostRecordSession.props = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    filePath: PropTypes.string.isRequired
}
