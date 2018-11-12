import React, {Component} from 'react';

import { StyleSheet, View, Platform, StatusBar} from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Actions } from 'react-native-router-flux';
import TitleEntry from './TitleEntry';

import RNFetchBlob from 'rn-fetch-blob';

import Modal from 'react-native-modal';
import {Storage} from 'aws-amplify';
import { NativeModules } from 'react-native'

var Buffer = require('buffer/').Buffer

import {AudioRecorder, AudioUtils} from 'react-native-audio';

import PreRecording from './preRecording';
import DuringRecording from './duringRecording';

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
);

export default class RecorderTab extends Component {

    state = {
        currentTime: 0.0,
        recording: false,
        stoppedRecording: false,
        finished: false,
        hasPermission: undefined,
        startTime: 0,
        endTime: 0,
        titleModalVisible: false,
        fileName: ""
    };

    markers = [];

    prepareRecordingPath(audioPath){
      AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 44100,
        Channels: 1,
        AudioQuality: "Medium",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000
      });
    }

    componentDidMount() {
        AudioRecorder.requestAuthorization().then((isAuthorised) => {
            this.setState({ hasPermission: isAuthorised });
    
            if (!isAuthorised) return;

            AudioRecorder.onProgress = (data) => {
                this.setState({currentTime: Math.floor(data.currentTime)});
            };

            AudioRecorder.onFinished = (data) => {
                // Android callback comes in the form of a promise instead.
                if (Platform.OS === 'ios') {
                    this.finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
                }
            };
        })
    }

    stopRecording = async () => {
        this.setState({recording: false, titleModalVisible: true});
        try {
            const filePath = await AudioRecorder.stopRecording();
            if (Platform.OS === 'android') {
                this.finishRecording(true, filePath);
            }
            return filePath;
        } catch (error) {
        }
    }

    finishRecording(didSucceed, filePath, fileSize) {
        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
        let endTime = Math.floor(Date.now() / 1000);
        let startTime = endTime - this.state.currentTime;
        this.setState({startTime: startTime, endTime: endTime, finished: didSucceed})
    }

    startRecording = async () => {
        if (!this.state.hasPermission) return;
        let fileName = (Math.floor(Date.now() / 1000)).toString() + '.aac';
        let path = AudioUtils.DocumentDirectoryPath + '/' + fileName;
        this.setState({fileName: fileName, recording: true});
        this.prepareRecordingPath(path);

        try {
            await AudioRecorder.startRecording();
        } catch (error) {

        }
    }

    saveLastXSecond = (seconds) => {
        let markersRef = this.markers || [];
        let markers = markersRef.slice(0)
        let startTime  = this.state.currentTime - seconds;
        let endTime = this.state.currentTime;
        let realStartTime = startTime > 0 ? startTime : 0
        let newMarker = {
            start: realStartTime,
            end: endTime,
            index: (markers.length).toString()
        }
        markers.push(newMarker);
        this.markers = markers;
        let realSaveTime = endTime - realStartTime;
        GLOBAL.showToast("Last " + realSaveTime.toString() + " Seconds Saved!");
    }

    async readFile(filePath) {
        let data;
        try {
            data = await RNFetchBlob.fs.readFile(filePath, 'base64');
        } catch (err) {
            console.log(err);
        }
        return new Buffer(data, 'base64');
    }

    saveRecording = async (title) => {
        this.setState({titleModalVisible: false, processing: true});
        let directoryName =  (Math.floor(Date.now() / 1000)).toString()
        let metadata = {
            startTime: this.state.startTime,
            endTime: this.state.endTime,
            title: title,
            directory: directoryName
        }
        let metadataString = JSON.stringify(metadata);
        Storage.put("audio/" + directoryName + "/masterMetadata.txt", metadataString, {level: 'private'})
        .catch(err => {
            this.setState({errorLog: this.state.errorLog + "\nIn Upload Audio " + err.message})
        });
        NativeModules.ProcessAudio.processMasterClip(this.state.fileName, (result, error) => {
            if (!error) {
                this.markers.forEach(marker => {
                    NativeModules.ProcessAudio.processClip(marker, async ( clipFileName, error) => {
                        let clipMetadata = {
                            start: marker.start,
                            end: marker.end
                        }
                        let s3FilePath = "audio/" + directoryName + "/" + (marker.index).toString();
                        Storage.put(
                            s3FilePath + "/metadata.txt",
                            JSON.stringify(clipMetadata),
                            {level: 'private'}
                        ).catch(err => console.log(err));
                        let buffer = await this.readFile(AudioUtils.DocumentDirectoryPath + "/" + clipFileName);
                        Storage.put(
                            s3FilePath + "/audio.m4a",
                            buffer,
                            {level: 'private'}
                        ).catch(err => console.log(err));
                    })
                })
                this.markers = []
            } else {
                this.setState({errorLog: this.state.errorLog + "\nIn Process Main Clip " + err.message})
            }

        });
    }

    restart = () => {
        this.setState({titleModalVisible: false})
        this.markers = [];
    }

    renderCurrentView = () => {
        if (this.state.recording || this.state.titleModalVisible) {
            return (<DuringRecording
                    recordingTime={this.state.currentTime}
                    saveDuration={this.saveLastXSecond}
                    stop={this.stopRecording}
                    />)
        } else {
            return (<PreRecording start={this.startRecording} />)
        }
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: 'white'}}>
                <View style={{flex: 1}}>

                    {this.renderCurrentView()}

                </View>

                <Modal
                    animationType="slide"
                    isVisible={this.state.titleModalVisible}
                    backdropOpacity={0.1}
                    avoidKeyboard={true}
                    >
                    <TitleEntry save={this.saveRecording.bind(this)} cancel={this.restart} />

                </Modal>

            </View>

        );
    }
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : StatusBar.currentHeight;


var styles = StyleSheet.create({
    statusBar: {
        height: STATUSBAR_HEIGHT,
        marginBottom: 0
    },
})