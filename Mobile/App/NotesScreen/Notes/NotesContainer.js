import React, { Component } from 'react';
import { AppState, FlatList, View, Image, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, StyleSheet, StatusBar, Platform} from 'react-native';
import Note from './Note.js';
import PropTypes from 'prop-types';
import {Storage} from 'aws-amplify';
import NoteEntry from './NoteEntry.js';
import Modal from 'react-native-modal';
import Voice from 'react-native-voice';
import Fuse from 'fuse.js';
import nextFrame from 'next-frame';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Actions } from 'react-native-router-flux';

const srmLogo = require('../../assets/srmlogo.png');
const routineLogo = require('../../assets/routine.png');
const plus = require('../../assets/plus.png');
const searchIcon = require('../../assets/search.png');
const micIcon = require('../../assets/microphone.png');
const emptImg = require('../../assets/empty-note-container.png');

const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
  );

export default class NotesContainer extends Component {

    constructor(props){
        super(props);
        this.state = {
            notes: this.props.notes,
            searchPhrase: "",
            modalVisible: false,
            appState: 'active',
            canScroll: true
        }
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
    }



    onSpeechResults(results) {
        //console.log("speech results");
        //console.log(results);
        this.setState({searchPhrase: results.value[0]});
    }

    startVoice = async () => {
        Actions.push('AudioScreen');
        try {
            await Voice.start('en-US');
        } catch (e) {
            //console.error(e);
        }
    }

    endVoice = async () => {
        try {
            await Voice.stop();
        } catch (e) {
            //console.error(e);
        }
    }

    setModalVisible = () => {
        this.setState({modalVisible: true});
    }

    setModalInvisible = () => {
        this.setState({modalVisible: false});
    }
    componentDidMount() {
        this.downloadLocal();
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            this.downloadLocal();
        }
        this.setState({appState: nextAppState});
        console.log('state cahnge')
    }

    downloadLocal = async () => {
        var localSync = require('NativeModules').localNotesSync;
        localSync.sync('dsfa', (error, localNotes) => {
          if (error) {
              //console.log(error);
          } else if (localNotes){
            let newNotes = []
            for (var i = 0; i < localNotes.length; i++){
                let localNote = JSON.parse(localNotes[i])
                newNotes.push(localNote);
                Storage.put(localNote.s3Key, JSON.stringify(localNote), {level: 'private'})
                    .then(result => {}) //console.log('succesfull updated note in s3'))
                    .catch(err => {
                        //console.log( err + " error updating note");
                    });
            }
            let newNotesArray = this.state.notes.concat(newNotes);
            this.setState({notes: newNotesArray});
          }
        })
      }

    removeNote = async (key) => {
        Alert.alert(
            'Deleting Note',
            'Are you sure you want to delete this note?',
            [
                {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                {text: 'Yes', onPress: async () => {
                        //console.log("deleted key: " + key);
                        let newNotesArray = this.state.notes.filter(function( note ) {
                            return note.s3Key !== key;
                        });
                        this.setState({notes: newNotesArray});
                        await nextFrame();
                        Storage.remove(key, {level: 'private'})
                            .then(result => {
                                //console.log('deleted in aws')
                                //console.log(result);
                            })
                            .catch(err => {
                                for (key in err){
                                    //console.log(key);
                                }
                                //console.log(key.Body);
                                //console.log( " error deleting in aws")
                            });
                    }
                },
            ],
            { cancelable: false }
        )
    }

    updateNote = async (noteJSON) => {
        //console.log('updating container');
        let newNotesArray = this.state.notes.filter(function( note ) {
            return noteJSON.s3Key !== note.s3Key;
        });
        newNotesArray.splice(0, 0, noteJSON);
        this.setState({notes: newNotesArray});
        await nextFrame();
        Storage.put(noteJSON.s3Key, JSON.stringify(noteJSON), {level: 'private'})
            .then(result => {}) //console.log('succesfull updated note in s3'))
            .catch(err => {
                //console.log( err + " error updating note");
            });
    }

    createNote = async (noteJSON) => {
        let newNotesArray = this.state.notes.slice(0);
        newNotesArray.push(noteJSON);
        this.setState({notes: newNotesArray, modalVisible: false});
        await nextFrame();
        Storage.put(noteJSON.s3Key, JSON.stringify(noteJSON), {level: 'private'})
            .then(result => {})//console.log('succesfull updated note in s3'))
            .catch(err => {
                //console.log( err + " error updating note");
            });
    }

    dateSorter = (n1, n2) => {
        if (n1.dateCreated > n2.dateCreated)
            return -1;
        if (n1.dateCreated < n2.dateCreated)
            return 1;
        return 0;
    }

    renderNotes = () => {
        let pinnedNotes = [];
        let nonPinnedNotes = [];
        this.state.notes.forEach(note => {
            note.isPinned ?
                pinnedNotes.push(note) : nonPinnedNotes.push(note)
        });
        pinnedNotes.sort(this.dateSorter);
        nonPinnedNotes.sort(this.dateSorter);
        var notesToDisplay = pinnedNotes.concat(nonPinnedNotes);
        if (this.state.searchPhrase){
            var options = {
                keys: ['text'],
                id: 's3Key',
                threshold: 0.3,
                sort: true
            }
            var fuse = new Fuse(notesToDisplay, options);
            let searchResults = fuse.search(this.state.searchPhrase);
            notesToDisplay = notesToDisplay.filter(note => {
                return searchResults.includes(note.s3Key);
            })
        }

        if (notesToDisplay.length === 0) {
            return
        }

        return(
            <FlatList
                scrollEnabled={this.state.scrollEnabled}
                style={{marginTop: 5,
                    height: this.state.notes.length !== 0 || this.state.searchPhrase ?  (4 * (GLOBAL.height / 5) ) - 30 : 0,
                    width: GLOBAL.width, position:"absolute",
                    left: 5,
                    top: (GLOBAL.height/5)}}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'flex-start'
                }}
                data={notesToDisplay.slice(0)}
                keyExtractor={this._keyExtractor}
                renderItem={this.renderANote}
            />
        );
    }

    renderANote = ({item, index}) => {
        return (<Note
            s3Key={item.s3Key}
            isPinned={item.isPinned}
            dateCreated= {item.dateCreated}
            text={item.text}
            image={item.image}
            priority={item.priority}
            sourceURL={item.url}
            modalVisible={false}
            onRef={ref => (this.parentReference = ref)}
            delete={this.removeNote.bind(this)}
            update={this.updateNote.bind(this)}
            toggleScroll={this.toggleScroll}
        />);
    };

    _keyExtractor = (item, index) => {
        return item.s3Key
    };

    toggleScroll = () => {
        this.setState({canScroll: !this.state.canScroll})
    }

    render() {
        //console.log("should be empty");
        //console.log(this.state.notes.length === 0 && !this.state.searchPhrase)
        let notes = this.renderNotes();
        //return (<Text>TEst</Text>)
        return (
            <View style = {{flex: 1}}>
                <MyStatusBar backgroundColor="white" barStyle="default" />
                <SafeAreaView style={{flex: 1}}>
                    <View style={{flex: 1}}>

                        <View
                        style={styles.HeaderContainer}>

                            <View style={{flexDirection: 'row', alignItems:'center', justifyContent: 'space-between',flex: 1, marginTop: 20}}>
                                <View style={{flex: 4, alignItems: 'center', flexDirection:'row', marginRight: 50, marginLeft:-30}}>
                                    <Image source={srmLogo} resizeMode="contain" style={{flex:1}} />

                                    <Image source={routineLogo} resizeMode="contain" style={{flex:1, marginLeft: -35}} />
                                </View>
                                <TouchableOpacity onPress={this.setModalVisible} style={{flex: 1, alignContent: 'center', justifyContent: 'center'}} >
                                    <Image source={plus} resizeMode="contain" style={{flex:0.3, width: undefined, height: undefined}}/>
                                </TouchableOpacity>

                            </View>

                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems:'center',
                                borderTopColor: 'rgba(55,55,55,0.1)',
                                borderTopWidth: 1,
                                borderRadius: 10
                                }}>
                                <View style={{flex:1, alignItems: 'center'}}>
                                    <Image resizeMode='contain' source={searchIcon} style={{flex: 0.5}}/>
                                </View>
                                <TextInput style={{
                                    flex: 4,
                                    fontSize: GLOBAL.height / 35,
                                    fontFamily: 'System'
                                }}
                                    returnKeyType="search"
                                    onChangeText={text => {this.setState({searchPhrase: text})}}
                                    value={this.state.searchPhrase}
                                    placeholder="Search"/>

                                <TouchableOpacity style={{flex:1, alignItems: 'center'}}
                                    onPressIn={this.startVoice}
                                    onPressOut={this.endVoice}>
                                    <Image resizeMode='contain' source={micIcon} style={{flex: 0.5}}/>
                                </TouchableOpacity>

                            </View>

                        </View>

                        {notes}

                        <View style={{marginTop: 40,
                            height: this.state.notes.length === 0 && !this.state.searchPhrase
                                ?  4 * (GLOBAL.height / 5) : 0,
                            width: GLOBAL.width,
                            position:"absolute",
                            top: (GLOBAL.height/5)}}>
                                <TouchableOpacity onPress={this.setModalVisible} style={{flex: 1, alignItems: "center"}}>
                                <Text style={{
                                    fontFamily: 'System',
                                    fontWeight: 'bold',
                                    fontSize: GLOBAL.height / 40,
                                    flex: 1
                                }}>
                                    Add your first idea, note, task
                                </Text>
                                <Text style={{
                                    fontFamily: 'System',
                                    fontWeight: 'bold',
                                    fontSize: GLOBAL.height / 35,
                                    color: darkBlue,
                                    flex: 1
                                }}>
                                    Everything
                                </Text>
                                <Image source={emptImg} style={{
                                    marginBottom: GLOBAL.height / 4,
                                    flex: 10
                                }} resizeMode="contain"/>
                                </TouchableOpacity>
                        </View>

                        <Modal
                            animationType="slide"
                            isVisible={this.state.modalVisible}
                            backdropOpacity={0.25}
                        >
                                <NoteEntry
                                    isPinned={false}
                                    onRef={ref => (this.parentReference = ref)}
                                    saveNewData = {this.createNote.bind(this)}
                                    cancelEdit = {this.setModalInvisible.bind(this)}
                                />
                            </Modal>
                    </View>
                </SafeAreaView>
            </View>
        )
    }

}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : StatusBar.currentHeight;

styles = StyleSheet.create({
    HeaderContainer: {
        height: GLOBAL.height / 5,
        width: GLOBAL.width,
        backgroundColor: 'white',
        marginTop: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        shadowColor: "#373737",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
    },
    statusBar: {
        height: STATUSBAR_HEIGHT,
        marginBottom: 0
    },
})

NotesContainer.propTypes = {
    notes: PropTypes.array
}