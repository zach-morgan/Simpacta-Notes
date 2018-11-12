import React, {Component} from 'react';
import {Text, View, TouchableOpacity, Image} from 'react-native';
import PropTypes from 'prop-types';
import Moment from 'moment';

const h = GLOBAL.height;
const w = GLOBAL.width;
const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

export default class SessionHeader extends Component {


    constructor(props) {
        super(props);
    }

    formatDuration(time) {
        // Hours, minutes and seconds
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";
        ret += (hrs < 10 ? "0" : "");
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");

        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }

    formatStartEnd(start, end) {
        const momentStart = Moment.unix(start);
        const momentEnd = Moment.unix(end);
        let formattedStart = momentStart.format('hh:MM A');
        let formattedEnd = momentEnd.format('hh:MM A');
        return formattedStart + " - " + formattedEnd;
    }

    formatDateOfRecording(start) {
        const momentStart = Moment.unix(start);
        return momentStart.format('M/DD/YYYY');
    }


    render() {

        let startDate = this.props.start;
        let endDate = this.props.end;
        let durationDate = endDate - startDate
        let startEnd = this.formatStartEnd(startDate, endDate);
        let date = this.formatDateOfRecording(startDate);
        let duration = this.formatDuration(durationDate);
        let title = this.props.title;

        return (
        <View style={{flex: 1,
            flexDirection: 'row', justifyContent: 'space-between',
            alignItems: 'space-between',
            marginLeft: w / 25, marginRight: w / 25,
            marginTop: h / 50, marginBottom: h / 50
           }}>
            <View style={{
                flex: 0.5,
                justifyContent: 'center',
            }}>
                <Text
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.5}
                style={{
                    flex: 1,
                    textAlign: 'left',
                    color: 'black',
                    fontWeight: 'bold',
                    fontSize: h / 40,
                    fontFamily: 'System',
                    marginBottom: h / 70
                }}>
                    {title}
                </Text>
                <Text
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                style={{
                    flex: 1,
                    textAlign: 'left',
                    color: 'black',
                    fontSize: h / 40,
                    fontFamily: 'System'
                }}>
                    {startEnd}
                </Text>
            </View>

            <View style={{
                flex: 0.5,
                justifyContent: 'center',

            }}>

                <Text style={{
                    flex: 1,
                    color: 'black',
                    fontFamily: 'System',
                    fontSize: h / 50,
                    textAlign: 'right',
                    marginBottom: h / 70
                }}
                numberOfLines={1}
                adjustsFontSizeToFit={true}>
                    {date}
                </Text>

                <Text style={{
                    flex: 1,
                    color: darkBlue,
                    fontFamily: 'System',
                    textAlign: 'right',
                    fontSize: h / 50}}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                >
                    {duration}
                </Text>
            </View>

        </View>);
    }
}

SessionHeader.props = {
    title: PropTypes.string,
    start: PropTypes.number,
    end: PropTypes.number
}