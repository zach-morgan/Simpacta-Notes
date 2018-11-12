import React, {Component} from 'react';
import {Text, View, TouchableOpacity, Image} from 'react-native';
import { NativeModules } from 'react-native'
import PropTypes from 'prop-types';
import Orientation from 'react-native-orientation-locker';
import WaveForm from 'react-native-audiowaveform';
import LinearGradient from 'react-native-linear-gradient';
import { Actions } from 'react-native-router-flux';
import {AudioUtils} from 'react-native-audio';
import {Storage} from 'aws-amplify';
import {Player} from 'react-native-audio-toolkit';

import SessionHeader from './ArchiveTab/SessionHeader';

const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

const h = GLOBAL.height;
const w = GLOBAL.width;

const playButton = require('../assets/playbutton.png');
const pauseButton = require('../assets/pause.png');
const forwardFifteen = require('../assets/15forward.png');
const backFifteen = require('../assets/15back.png');
const backArrow = require('../assets/backArrow.png');


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
        player: undefined
    }

    componentDidMount() {
        this.loadAudio();
    }

    loadAudio = async() => {
        let player = new Player(this.props.audioURI);
        this.setState({player: player});
    }


    play = async () => {
        this.setState({isPlaying: true});
        this.state.player.play((success) => {
            if (success) {
                //console.log('successfully finished playing');
            } else {
                //console.log('playback failed due to audio decoding errors');
            }
        })
    }

    pause = async () => {
        this.setState({isPlaying: false});
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
            <View style={{flex: 1, marginTop: h / 25, marginBottom: h / 25}}>

                <TouchableOpacity onPress={this.cancelRecording}
                    style={{
                        flexDirection: 'row',
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        marginLeft: w / 50
                    }}>
                        <Image resizeMode='contain' source={backArrow} style={{flex: 1}} />
                        <Text style={{
                            flex: 10,
                            color: '#007AFF',
                            fontSize: h / 45,
                            fontFamily: 'System'
                        }} >
                            Back
                        </Text>
                </TouchableOpacity>
                <View style={{
                            flex: 1,
                            marginLeft: w / 25,
                            marginRight: w / 25
                        }}>
                    <SessionHeader
                        title={this.props.title}
                        start={this.props.start}
                        end={this.props.end}

                    />
                </View>

                <View style={{flex: 10}} onLayout={this.onLayout}>

                    {/* {timeMarkers} */}

                    <View style={{flex: 1, transform: [{ rotate: '90deg'}] }}>
                        <WaveForm
                            style={{flex: 1}}
                            source={{uri: AudioUtils.DocumentDirectoryPath + "/" + this.props.masterFileName}}
                            waveFormStyle={{waveColor:'red', scrubColor:'white'}}
                        />
                    </View>
                </View>

                <View style={{
                    flex: 1,
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
