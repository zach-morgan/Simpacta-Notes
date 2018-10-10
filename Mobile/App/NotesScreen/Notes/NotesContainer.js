import React, { Component } from 'react';
import { ScrollView, View, Image, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, StyleSheet } from 'react-native';
import Note from './Note.js';
import PropTypes from 'prop-types';
import {Storage} from 'aws-amplify';
import NoteEntry from './NoteEntry.js';
import Modal from 'react-native-modal';
import Voice from 'react-native-voice';
import Fuse from 'fuse.js';

const srmLogo = require('../../assets/srmlogo.png');
const routineLogo = require('../../assets/routine.png');
const plus = require('../../assets/plus.png');
const searchIcon = require('../../assets/search.png');
const micIcon = require('../../assets/microphone.png')

export default class NotesContainer extends Component {

    constructor(props){
        super(props);
        this.state = props;
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
    }

    state = {
        notes: [],
        searchPhrase: "",
        modalVisible: false,
    }


    onSpeechResults(results) {
        console.log("speech results");
        console.log(results);
        this.setState({searchPhrase: results.value[0]});
    }

    startVoice = async () => {
        try {
            await Voice.start('en-US');
        } catch (e) {
            console.error(e);
        }
    }

    endVoice = async () => {
        try {
            await Voice.stop();
        } catch (e) {
            console.error(e);
        }
    }

    setModalVisible = () => {
        this.setState({modalVisible: true});
    }

    setModalInvisible = () => {
        this.setState({modalVisible: false});
    }

    componentDidMount() {
        this.setState({notes: this.props.notes});
    }

    removeNote = (key) => {
        Alert.alert(
            'Deleting Note',
            'Are you sure you want to delete this note?',
            [
                {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                {text: 'Yes', onPress: () => {
                        console.log("deleted key: " + key);
                        let newNotesArray = this.state.notes.filter(function( note ) {
                            return note.s3Key !== key;
                        });
                        this.setState({notes: newNotesArray});
                        Storage.remove(key, {level: 'private'})
                            .then(result => {
                                console.log('deleted in aws')
                                console.log(result);
                            })
                            .catch(err => {
                                for (key in err){
                                    console.log(key);
                                }
                                console.log(key.Body);
                                console.log( " error deleting in aws")
                            });
                    }
                },
            ],
            { cancelable: false }
        )
    }

    updateNote = (noteJSON) => {
        console.log('updating container');
        let newNotesArray = this.state.notes.filter(function( note ) {
            return noteJSON.s3Key !== note.s3Key;
        });
        newNotesArray.splice(0, 0, noteJSON);
        this.setState({notes: newNotesArray});

        Storage.put(noteJSON.s3Key, JSON.stringify(noteJSON), {level: 'private'})
            .then(result => console.log('succesfull updated note in s3'))
            .catch(err => {
                console.log( err + " error updating note");
            });
    }

    createNote = (noteJSON) => {
        Storage.put(noteJSON.s3Key, JSON.stringify(noteJSON), {level: 'private'})
            .then(result => console.log('succesfull updated note in s3'))
            .catch(err => {
                console.log( err + " error updating note");
            });

        let newNotesArray = this.state.notes.slice(0);
        newNotesArray.push(noteJSON);
        this.setState({notes: newNotesArray, modalVisible: false});
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


        return notesToDisplay.map(note =>
            <Note
                 s3Key={note.s3Key}
                 key={note.s3Key}
                 isPinned={note.isPinned}
                 dateCreated= {note.dateCreated}
                 text={note.text}
                 image={note.image}
                 priority={note.priority}
                 modalVisible={false}
                 onRef={ref => (this.parentReference = ref)}
                 delete={this.removeNote.bind(this)}
                 update={this.updateNote.bind(this)}
             />
         );
    }

    render() {
        let notes = this.renderNotes();
        console.log(notes);
        for (note in notes){
            console.log(note);
        }
        return (
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

                    <ScrollView
                        style={{marginTop: 5, height: 4 * (GLOBAL.height / 5), width: GLOBAL.width, position:"absolute", top: (GLOBAL.height/5)}}
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'flex-start'}}>

                        {notes}

                    </ScrollView>

                    <Modal
                            animationType="slide"
                            isVisible={this.state.modalVisible}
                            backdropOpacity={0.5}
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
        )
    }

}

styles = StyleSheet.create({
    HeaderContainer: {
        height: GLOBAL.height / 5,
        width: GLOBAL.width - 10,
        backgroundColor: 'white',
        marginTop: 5,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        shadowColor: "#373737",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.5,
		shadowRadius: 10,
    }
})

NotesContainer.propTypes = {
    notes: PropTypes.array
}