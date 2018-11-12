import React, {Component} from 'react';

import {
  View,
  ActivityIndicator,
  FlatList
} from 'react-native';

import ArchiveUnit from './ArchiveUnit';
import {Storage} from 'aws-amplify';

export default class ArchiveTab extends Component {

    state = {
        isDownloading: true,
        clips: []
    }

    componentDidMount() {
        this.downloadClips();
    }

    downloadClips = () => {
        Storage.list("audio/", {level : 'private'})
            .then(directories => {
                let masterMetadataKeys = directories.filter(dir => {
                    return dir.key.endsWith("masterMetadata.txt")
                })
                let masterMetadataFetches = masterMetadataKeys.map(key => {
                    return Storage.get(key.key, {level: 'private', download: true} );
                })
                Promise.all(masterMetadataFetches)
                    .then(metadatas => {
                        console.log(metadatas);
                        this.setState({clips: metadatas, isDownloading: false});
                    })
                    .catch(err => {
                        console.log("metadata promise all")
                        console.log(err)
                    })
            })
            .catch(err => {
                console.log("directories list")
                console.log(err)
            })
    }

    displayRightThing = () => {
        if (this.state.isDownloading) {
            return <ActivityIndicator size="large" color="#0000ff" />
        } else {

            return (<FlatList
                style={{
                    flex: 1,
                    width: GLOBAL.width
                }}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'flex-start'
                }}
                data={this.state.clips}
                keyExtractor={this._keyExtractor}
                renderItem={this.renderClip}
            />)
        }
    }

    renderClip = ({item, index}) => {
        return (
            <ArchiveUnit metadata={item.Body.toString()} />
        );
    };

    _keyExtractor = (item, index) => {
        return index.toString();
    };
    
      render() {
        return (
          <View style={{alignItems:'center', flex: 1, justifyContent: 'center'}}>
            {this.displayRightThing()}
          </View>
        );
      }
}