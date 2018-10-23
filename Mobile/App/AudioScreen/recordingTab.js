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
  Button,
  TextInput
} from 'react-native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';

//import RNFetchBlob from 'react-native-fetch-blob';

import Modal from 'react-native-modal';

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
);

import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';

const srmLogo = require('../assets/srmlogo.png');
const routineLogo = require('../assets/routine.png');
const microphone = require('../assets/microphone.png');
const audioButton = require('../assets/audioButton.png');

const darkBlue = "#2F80ED";
const h = GLOBAL.height;
const w = GLOBAL.width;

export default class RecorderTab extends Component {

    state = {
        currentTime: 0.0,
        recording: false,
        paused: false,
        stoppedRecording: false,
        finished: false,
        audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
        hasPermission: undefined,
        recordingPage: true,
        startTime: 0,
        endTime: 0,
        titleModalVisible: false
    };

    prepareRecordingPath(audioPath){
      AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "Low",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000
      });
    }

    componentDidMount() {
      AudioRecorder.requestAuthorization().then((isAuthorised) => {
        this.setState({ hasPermission: isAuthorised });

        if (!isAuthorised) return;
        let path = AudioUtils.DocumentDirectoryPath + (new Date()).toString() + '.aac';
        this.prepareRecordingPath(path);

        AudioRecorder.onProgress = (data) => {
          this.setState({currentTime: Math.floor(data.currentTime)});
        };

        AudioRecorder.onFinished = (data) => {
          // Android callback comes in the form of a promise instead.
          if (Platform.OS === 'ios') {
            this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
          }
        };
      });
    }

    async _stop() {
      if (!this.state.recording) {
        console.warn('Can\'t stop, not recording!');
        return;
      }

      this.setState({stoppedRecording: true, recording: false, paused: false});

      try {
        const filePath = await AudioRecorder.stopRecording();

        if (Platform.OS === 'android') {
          this._finishRecording(true, filePath);
        }
        return filePath;
      } catch (error) {
        console.error(error);
      }
    }

    async _record() {
      if (this.state.recording) {
        console.warn('Already recording!');
        return;
      }

      if (!this.state.hasPermission) {
        console.warn('Can\'t record, no permission granted!');
        return;
      }

      if(this.state.stoppedRecording){
        this.prepareRecordingPath(this.state.audioPath);
      }

      this.setState({recording: true, paused: false});

      try {
        const filePath = await AudioRecorder.startRecording();
      } catch (error) {
        console.error(error);
      }
    }

    _finishRecording(didSucceed, filePath, fileSize) {
        this.setState({ finished: didSucceed });
        console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath} and size of ${fileSize || 0} bytes`);
        let endTime = new Date();
        let startTime = endTime - this.state.currentTime;

        this.setState({startTime: startTime, endTime: endTime, filePath: filePath, titleModalVisible: true})

    }


    renderSaveButtons = () => {
        var btns = [];
        for (var i = 15; i <= 120; i *= 2) {
            btns.push(
                <TouchableOpacity onPress={this.saveLastXSecond.bind(this, i)}
                    key={i.toString()}
                    style={{ flex: 1}}>

                    <View  style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                        <Image source={audioButton} style={{position: 'absolute'}} resizeMode="contain"/>
                        <Text style={{marginLeft: 10 ,textAlign: 'center', fontSize: h / 35, color: darkBlue}}>{i.toString()}</Text>
                    </View>

                </TouchableOpacity>
            )
        }
        return(
            <View style={{flexDirection: 'row', flex: 1,  width: w, marginBottom: h / 10}}>
                {btns}
            </View>
        )
    }

    saveLastXSecond(seconds) {
        if (this.state.recording) {
            let markersRef = this.state.markers || [];
            let markers = markersRef.slice(0)
            let startTime  = this.state.currentTime - seconds;
            let endTime = this.state.currentTime;
            let newMarker = {
                start: startTime > 0 ? startTime : 0,
                end: endTime
            }
            markers.push(newMarker);
            this.setState({markers: markers});
            console.log(this.state.markers);
            GLOBAL.showToast("Last " + seconds.toString() + " Seconds Saved!");
        }
    }

    readFile(filePath) {
        return RNFetchBlob.fs.readFile(filePath, 'base64').then(data => new Buffer(data, 'base64'));
    }

    saveRecording = (title) => {
        this.setState({titleModalVisible: false});

        // readFile(imagePath).then(buffer => {
        //     Storage.put(key, buffer, {
        //         contentType: imageType
        //     })
        // }).catch(e => {
        //     console.log(e);
        // });
        Actions.PostRecord({start: this.state.startTime, end: this.state.endTime, title: title, filePath: this.state.filePath})
    }

    restart = () => {
        this.setState({titleModalVisible: false})
    }

    render() {
        let saveButtons = this.renderSaveButtons();
        return (
            <View style={styles.container}>
                <View style={styles.controls}>

                <Image source={microphone} resizeMode="contain" style={{flex: 1, marginBottom: h / 10}} />

                {saveButtons}

                <TouchableOpacity onPress={() => {
                    this.state.recording ? this._stop() : this._record()
                }}
                    style={{ backgroundColor: this.state.recording ? "black" : "#FF2D55",
                        borderRadius: 5, flex: 1, width: w / 7, height: w / 7}}
                >
                    <View/>
                </TouchableOpacity>
                {/* {this._renderButton("STOP", () => {this._stop()} )} */}
                <Text style={styles.progressText}>{this.state.currentTime}s</Text>
                </View>

                <Modal
                    animationType="slide"
                    isVisible={this.state.titleModalVisible}
                    backdropOpacity={0.1}
                    >
                    <TitleEntry save={this.saveRecording.bind(this)} cancel={this.restart} />

                </Modal>


            </View>

        );
    }
}

class TitleEntry extends Component {

    state = {
        text: ""
    }

    render() {
        return (
            <View style={{
                flex: 0.4,
                backgroundColor: 'white',
                borderRadius: h / 35,
                borderColor: "white",
                borderWidth: 1,
                shadowColor: "#373737",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 5,}}>
                <Text
                    style={{flex: 1,
                        color: "rgba(55, 55, 55, 0.7)",
                        fontFamily: 'System',
                        fontSize: h / 35,

                        marginLeft: w / 15,
                        marginTop: h / 30
                    }}
                >
                    Session Name
                </Text>
                <TextInput
                    multiline={true}
                    style={{
                        fontSize: GLOBAL.height / 35,
                        flex: 5,
                        marginLeft: w / 15,
                        marginRight: w / 15
                    }}
                    placeholder="Enter your session name"
                    value={this.state.text}
                    returnKeyType="done"
                    onChangeText={(text) => this.setState({text: text})}
                />
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginLeft: w / 15,
                    marginRight: w / 15,
                    marginBottom: h / 40
                }} >
                    <Button title="Cancel" onPress={this.props.cancel} />
                    <Button title="Save" onPress={() => this.props.save(this.state.text)} />
                </View>
            </View>
        )
    }
}

TitleEntry.props = {
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : StatusBar.currentHeight;


var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        marginTop: -100
    },
    controls: {
        justifyContent: 'center',
        alignItems: 'center',
        width: GLOBAL.width,
        position:"absolute",
        top: h / 3.5
    },
    progressText: {
        paddingTop: 50,
        fontSize: 50,
        color: "#fff"
    },
    disabledButtonText: {
        color: '#eee'
    },
    buttonText: {
        fontSize: 20,
        color: "#fff"
    },
    activeButtonText: {
        fontSize: 20,
        color: "#B81F00"
    },
    statusBar: {
        height: STATUSBAR_HEIGHT,
        marginBottom: 0
    },
})