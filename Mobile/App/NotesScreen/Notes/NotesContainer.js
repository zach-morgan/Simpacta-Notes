import React, { Component } from 'react';
import { ScrollView, View, Image, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, StyleSheet } from 'react-native';
import Note from './Note.js';
import PropTypes from 'prop-types';
import {Storage} from 'aws-amplify';
import NoteEntry from './NoteEntry.js';
import Modal from 'react-native-modal';
import Voice from 'react-native-voice';


const srmLogo = require('../../assets/srmlogo.png');
const routineLogo = require('../../assets/routine.png');
const plus = require('../../assets/plus.png');
const searchIcon = require('../../assets/search.png');
const micIcon = require('../../assets/microphone.png')

export default class NotesContainer extends Component {

    constructor(props){
        super(props);
        Voice.onSpeechResults = this.onSpeechResultsHandler.bind(this);
    }

    state = {
        notes: [],
        modalVisible: false,
    }


    onSpeechResultsHandler = (result) => {
        console.log(result);
    }

    startVoice = () => {
        Voice.start('en-US');
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

    updateNote = (oldKey, newNote) => {
        let newNotesArray = this.state.notes.filter(function( key ) {
            return oldKey !== key;
        });
        newNotesArray.insert(0, newNote);
        this.setState({notes: newNotesArray});
    }

    createNote = (newNote) => {
        let newNotesArray = this.state.notes.slice(0);
        let composeKey = "notes/" + newNote.dateCreated.toString() + ".txt";
        newNotesArray.push(newNote);
        Storage.put(composeKey, JSON.stringify(newNote), {level: 'private'})
            .then(result => console.log('succesfull updated note in s3'))
            .catch(err => {
                console.log( err + " error updating note");
            });
        newNote.s3Key = composeKey;
        this.setState({notes: newNotesArray, modalVisible: false});
    }

    // sortForSearch = () => {

    // }

    // clearSearch = () => {

    // }

    render() {
        let notes = this.state.notes.map(note =>
           <Note
                s3Key={note.s3Key}
                key={note.s3Key}
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
        console.log("note length: " + notes.length);
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
                            <TextInput style={{flex: 4}} placeholder="search"/>

                            <TouchableOpacity style={{flex:1, alignItems: 'center'}} onPress={this.startVoice}>
                                <Image resizeMode='contain' source={micIcon} style={{flex: 0.5}}/>
                            </TouchableOpacity>

                        </View>

                    </View>

                    <ScrollView
                        style={{height: 4 * (GLOBAL.height / 5), width: GLOBAL.width, position:"absolute", top: (GLOBAL.height/5)}}
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'flex-start'}}>

                        {notes}

                    </ScrollView>

                    <Modal
                            animationType="slide"
                            avoidKeyboard={true}
                            isVisible={this.state.modalVisible}
                            backdropOpacity={0.5}
                        >
                            <NoteEntry
                                image={this.state.image}
                                text={this.state.text}
                                priority={this.state.priority}
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