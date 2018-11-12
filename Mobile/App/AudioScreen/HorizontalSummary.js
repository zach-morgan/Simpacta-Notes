import React, {Component} from 'react';

import {Text, View, TouchableOpacity, Image} from 'react-native';


import { NativeModules } from 'react-native'
import PropTypes from 'prop-types';
import Moment from 'moment';
import Orientation from 'react-native-orientation-locker';
import WaveForm from 'react-native-audiowaveform';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import {AudioUtils} from 'react-native-audio';
import {Storage} from 'aws-amplify';


const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

const h = GLOBAL.height;
const w = GLOBAL.width;

const playButton = require('../assets/playbutton.png');
const pauseButton = require('../assets/pause.png');
const forwardFifteen = require('../assets/15forward.png');
const backFifteen = require('../assets/15back.png');
const backArrow = require('../assets/backArrow.png');

var Sound = require('react-native-sound');

export default class PostRecordSession extends Component {

    constructor(props) {
        super(props);
        console.log(NativeModules.ProcessAudio)
        NativeModules.ProcessAudio.processMasterClip(this.props.masterFileName, (result) => {
            console.log(result)
            NativeModules.ProcessAudio.processClip((clipResult) => {
                console.log(clipResult)
            })
        });
    }

    state = {
        currentTime: 0.0,
        isPlaying: false,
        player: undefined,
        isLoaded: false
    }

    componentDidMount() {

        this.loadAudio();
        this.calculateTimes();
    }

    calculateTimes = () => {
        let startDate = this.props.start;
        let endDate = this.props.end;
        let durationDate = endDate - startDate
        let startEnd = this.formatStartEnd(startDate, endDate);
        this.setState({duration: durationDate, startEnd: startEnd})
    }

    loadAudio = async() => {
        let player = new Player(this.props.audioURI);
        this.setState({isLoaded: true, player: player});
        // player.prepare(function(result){
        //     this.setState({isLoaded: true, player: player})
        // });
    }

    formatDuration(time) {
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

    formatStartEnd(start, end) {
        const momentStart = Moment.unix(start);
        const momentEnd = Moment.unix(end);
        let formattedStart = momentStart.format('MM/DD/YYYY hh:MM A');
        let formattedEnd = momentEnd.format('hh:MM A');
        return formattedStart + " - " + formattedEnd;
    }

    play = async () => {
        if (this.state.isLoaded){
            this.setState({isPlaying: true});
            this.state.player.play((success) => {
                if (success) {
                    //console.log('successfully finished playing');
                } else {
                    //console.log('playback failed due to audio decoding errors');
                }
            })
        } else {
            GLOBAL.showToast("Audio Still Loading");
        }
    }

    pause = async () => {
        //this.setState({isPlaying: false});
        this.state.player.pause();
    }

    renderControlButton = () => {
        if (this.state.isPlaying){
            return (
            <TouchableOpacity style={{marginRight: w / 7}} onPress={this.pause.bind(this)} >
                <Image source={pauseButton} resizeMode='contain' />
            </TouchableOpacity>)
        } else{
            return (
            <TouchableOpacity style={{marginRight: w / 7}} onPress={this.play.bind(this)} >
                <Image source={playButton} resizeMode='contain' />
            </TouchableOpacity>)
        }

    }

    saveRecordingS3 = async () => {
        let metadata = {
            fullDuration: this.state.duration,
            startTime: this.props.start,
            title: this.props.title,
            markers: this.props.markers,
            directory: this.props.directoryName,
            source: this.props.audioURI
        }

        let metadataString = JSON.stringify(metadata);
        Storage.put("audio/" + this.props.directoryName + "/metadata.txt", metadataString, {level: 'private'})
            .then(result => {
                this.navigateAway();

            }) //console.log('succesfull updated note in s3'))
            .catch(err => {
                //console.log( err + " error updating note");
            });
    }

    cancelRecording = () => {
        this.navigateAway()
    }

    navigateAway(){
        Orientation.lockToPortrait();
        Actions.AudioNotes();
    }

    onLayout = (e) => {
        this.setState({
            waveWidth: e.nativeEvent.layout.width,
        })
    }

    renderTimeMarkers = () => {
        let width = this.state.waveWidth;
        let duration = this.state.duration;

        let indicators = this.props.markers.map(marker => {
            let markDuration = marker.end - marker.start;
            let startPercent = marker.start / duration;
            let relativePosition = startPercent * width;
            let relativeWidth = (markDuration / duration) * width
            let formattedDuration = this.formatDuration(markDuration)
            return (
                <TouchableOpacity key={marker.start.toString()}
                    style={{
                        position: 'absolute',
                        left: relativePosition,
                        width: relativeWidth, height: h / 2,
                        borderColor: darkBlue,
                        borderRadius: h / 50,
                        borderWidth: 2,
                        alignItems: 'center'

                    }}>
                    <Text style={{
                        color: lightBlue,
                        fontFamily: 'System',
                        fontSize: h / 30
                    }}>
                        {markDuration}
                    </Text>
                </TouchableOpacity>
            )
        })
        return(
            <View style={{
                flex: 1,
                flexDirection: 'row',
                marginTop: h / 50
            }}>
                {indicators}
            </View>
        )
    }

    render() {
        //let buffer = this.readFile(AudioUtils.DocumentDirectoryPath + '/' + this.props.audioURI);
        let controlButton = this.renderControlButton();
        let timeMarkers = this.renderTimeMarkers()
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
                                {this.state.duration}
                            </Text>
                        </View>
                        <Text style={{
                            flex: 1,
                            color: 'black',
                            fontFamily: 'System',
                            fontWeight: 'bold',
                            fontSize: h / 50
                        }}>
                            {this.state.startEnd}
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
                            <TouchableOpacity onPress={this.saveRecordingS3}>
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
                            <TouchableOpacity onPress={this.saveRecordingS3}>
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

                <View style={{flex: 2.5, marginLeft: 10}} onLayout={this.onLayout}>

                    {timeMarkers}

                    <WaveForm
                        style={{flex: 2.5 }}
                        source={{uri: AudioUtils.DocumentDirectoryPath + "/" + this.props.masterFileName}}
                        waveFormStyle={{waveColor:'red', scrubColor:'white'}}
                    />
                </View>


                <View style={{flex: 1, flexDirection: 'row', marginBottom: h / 70}}>
                        <TouchableOpacity onPress={this.cancelRecording}
                        style={{
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

                            {controlButton}

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
    masterFileName: PropTypes.string.isRequired,
    markers: PropTypes.array.isRequired,
    directoryName: PropTypes.string.isRequired
}
