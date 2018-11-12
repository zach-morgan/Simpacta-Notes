import React, {Component} from 'react';

import {
  Text,
  View,
  FlatList
} from 'react-native';

import PlayBackUnit from './PlayBackUnit';
import SessionHeader from './SessionHeader';

import {Storage} from 'aws-amplify';
import Moment from 'moment';
import PropTypes from 'prop-types';

const h = GLOBAL.height;
const w = GLOBAL.width;

const blueText = '#2F80ED'
const lightBlue = "#249BDF";


export default class ArchiveUnit extends Component {

    constructor(props){
        super(props);
        this.state = {
            startTime: 0,
            endTime: 0,
            title: ""
        }
    }

    componentDidMount() {
        let metadata = JSON.parse(this.props.metadata);
        this.createClipsArray(metadata);
    }

    async createClipsArray(masterMetadata) {
        console.log(masterMetadata);
        this.setState({startTime: masterMetadata.startTime, endTime: masterMetadata.endTime, title: masterMetadata.title});
        let s3Directory = "audio/" + masterMetadata.directory + "/";
        Storage.list(s3Directory, {level: 'private'})
            .then(keys => {
                let clipLinkKeys = keys.filter(key => {
                    console.log(key.key);
                    return (key.key.endsWith('.m4a'))
                });
                let clipFetches = clipLinkKeys.map(key => {
                    return Storage.get(key.key, {level: 'private'});
                })

                let metadataKeys = keys.filter(key => {
                    return (key.key.endsWith('metadata.txt'))
                })
                let metadataFetches = metadataKeys.map(key => {
                    return Storage.get(key.key, {level: 'private', download: true});
                })

                let transcriptionKeys = keys.filter(key => {
                    return (key.key.endsWith('transcription.txt'))
                })
                let transcriptionFetches = transcriptionKeys.map(key => {
                    return Storage.get(key.key, {level: 'private', download: true});
                })
                Promise.all(metadataFetches)
                    .then(metadataPayloads => {
                        Promise.all(clipFetches)
                            .then(audioLinks => {
                                Promise.all(transcriptionFetches)
                                    .then(transcriptions => {
                                        var clips = [];
                                        for (var i = 0; i < audioLinks.length; i++) {
                                            let clipMetadata = JSON.parse(metadataPayloads[i].Body.toString());
                                            let clipTranscription = ""
                                            try {
                                                clipTranscription = transcriptions[i].Body.toString();
                                            } catch(error) {}
                                            let newClip = {
                                                start: clipMetadata.start,
                                                end: clipMetadata.end,
                                                source: audioLinks[i],
                                                transcription: clipTranscription
                                            }
                                            clips.push(newClip);
                                        }
                                        this.setState({clips: clips});
                                    })
                            })

                    })
            })
            .catch(err => console.log(err));
    }

    renderBody = () => {
        return (
            <FlatList
                style={{marginTop: 0,
                    flex: 2,
                    borderTopColor: lightBlue, borderTopWidth: 1
                }}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'flex-start'
                }}
                data={this.state.clips}
                keyExtractor={this._keyExtractor}
                renderItem={this.renderClip}
            />
        )
    }

    renderClip = ({item, index}) => {
        return (
            <PlayBackUnit
                start={item.start}
                end={item.end}
                source={item.source}
                transcription={item.transcription}
            />
        );
    };

    _keyExtractor = (item, index) => {
        return item.end.toString()
    };

    render() {
        let body = this.renderBody();
        return (
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                width: GLOBAL.width / 1.1,
                marginTop: h / 50,
                marginLeft: w / 25,
                borderRadius: h / 50,
                borderWidth: 1,
                borderColor: "#FFF",
                shadowColor: "#373737",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 3
            }}>
                <SessionHeader
                    start={this.state.startTime}
                    end={this.state.endTime}
                    title={this.state.title}
                />
                {body}
            </View>
        );
    }

}

ArchiveUnit.props = {
    metadata: PropTypes.string.isRequired,
}