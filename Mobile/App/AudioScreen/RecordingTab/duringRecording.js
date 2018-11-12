import React, {Component} from 'react';

import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import PropTypes from 'prop-types';

const saveTimePlus = require('../../assets/plusRecorder.png')
const saveTimeMinus = require('../../assets/minus.png')
const pauseIcon = require('../../assets/pause.png')

const noValueBackground = require('../../assets/noValueRecorder.png');
const saveBackground = require('../../assets/valueBackground.png');
const mainBackground = require('../../assets/mainBackground.png');

const h = GLOBAL.height;
const w = GLOBAL.width;
const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

export default class DuringRecording extends Component {

    constructor(props){
        super(props);

    }

    renderSaveButtons = () => {
        var btns = [];
        for (var i = 15; i <= 60; i *= 2) {
            let stringUnderBtn = "Save last " + i.toString() + " seconds";
            btns.push(
                <TouchableOpacity onPress={this.props.saveDuration.bind(this, i)}
                    key={i.toString()}
                    style={{ flex: 1}}>

                    <ImageBackground source={saveBackground}
                        imageStyle={{resizeMode: 'contain'}}
                        style={{
                            flex: 1, alignItems: 'center',
                            justifyContent: 'center', marginBottom: h / 50
                        }}>
                        <View style={{
                            flex: 1, alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Text style={{
                                textAlign: 'center', fontWeight: 'bold',
                                fontSize: h / 35, color: darkBlue}}>
                                {i.toString()}
                            </Text>
                        </View>
                    </ImageBackground>

                    <Text style={{
                        flex: 1, textAlign: 'center',
                        color: "rgba(55, 55, 55, 0.3)"
                    }}>
                        {stringUnderBtn}
                    </Text>

                </TouchableOpacity>
            )
        }
        return(
            <View style={{flexDirection: 'row', flex: 6}}>
                {btns}
            </View>
        )
    }

    formatTimer(time) {
        // Hours, minutes and seconds
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";

        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }

    render() {
        let timerString = this.formatTimer(this.props.recordingTime);
        let staticSaveButtons = this.renderSaveButtons();
        return(
        <View style={{
            flex: 1, marginTop: h / 20,
            justifyContent: 'space-between'
        }}>

            <View style={{
                flexDirection: 'row',
                flex: 1, justifyContent: 'space-between',
                marginLeft: w / 15,
                marginRight: w / 15,
                alignItems: 'center'
            }}>
                <View style={{flex: 1}}>
                    <Text style={{
                        flex: 1, color: "rgba(55, 55, 55, 0.3)",
                        fontFamily: 'System', fontSize: h / 50,
                        marginBottom: h / 150
                    }}>
                        Session Time
                    </Text>

                    <Text style={{
                        flex: 1, color: lightBlue,
                        fontFamily: 'System', fontSize: h / 50
                    }}>
                        {timerString}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={this.props.stop}
                    style={{flexDirection: 'row', flex: 1}}>
                    <Text style={{
                        flex: 2,
                        textAlign: 'right'
                    }}>
                        Stop
                    </Text>
                    <Image source={pauseIcon} style={{flex: 1}} resizeMode='contain'/>
                </TouchableOpacity>
            </View>

            <View style={{flex: 9}}>
                <CustomSaveTime save={this.props.saveDuration}/>
            </View>

            {staticSaveButtons}

        </View>
        )
    }
}

DuringRecording.props = {
    recordingTime: PropTypes.number,
    saveDuration: PropTypes.func.isRequired,
    stop: PropTypes.func.isRequired
}

class CustomSaveTime extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentTime: 0
        }
    }

    formatSaveTime(time) {
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

    onLayout = (e) => {
        this.setState({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
        })
    }

    addToTime =()=> {
        this.setState({currentTime: this.state.currentTime + 5})
    }

    subtractFromTime =()=> {
        if (this.state.currentTime > 0){
            this.setState({currentTime: this.state.currentTime - 5})
        }
    }

    render() {
        let hasTime = this.state.currentTime !== 0
        let textDisplayed = hasTime ?
            this.formatSaveTime(this.state.currentTime) : "Custom Value\n Press on +"
        let background = hasTime ?
            mainBackground : noValueBackground
        let fontSize = hasTime ? h / 25 : h / 75
        let fontColor = hasTime ? darkBlue : "rgba(55, 55, 55, 0.3)";
        return (
            <View style={{flex: 1, flexDirection: 'row',
                alignItems: 'center', justifyContent: 'center'
            }}>
                <TouchableOpacity
                    style={{flex: 1}}
                    onPress={this.subtractFromTime}>
                   <Image source={saveTimeMinus}  style={{flex: 1}} resizeMode="contain"/>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={this.props.save.bind(this, this.state.currentTime)}
                    style={{flex: 2}}>
                    <ImageBackground
                        onLayout={this.onLayout}
                        source={background}
                        imageStyle={{resizeMode: 'contain'}}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{
                                textAlign:'center',
                                color: fontColor,
                                fontWeight: 'bold', fontSize: fontSize
                            }}>
                                {textDisplayed}
                            </Text>
                    </ImageBackground>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{flex: 1}}
                    onPress={this.addToTime}>
                   <Image source={saveTimePlus} style={{flex: 1}} resizeMode="contain"/>
               </TouchableOpacity>
            </View>
        )
    }
}

CustomSaveTime.props = {
    save: PropTypes.func.isRequired
}