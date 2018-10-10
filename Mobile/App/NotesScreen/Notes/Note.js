import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import {Storage, Auth} from 'aws-amplify';
import NoteEntry from './NoteEntry.js';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';

const editIcon = require("../../assets/edit-icon.png");
const pinIcon = require("../../assets/pin-icon.png");
const bluePin = require("../../assets/blue-pin-icon.png");
const deleteIcon = require("../../assets/trash-icon.png");

const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

const iconSize = GLOBAL.height / 20;

const w = GLOBAL.width;
const h = GLOBAL.height;

export default class Note extends Component {

    constructor(props) {
        super(props);
        this.state = props;
    }

    state = {
        dateCreated: null,
        image: null,
        text: null,
        priority: null,
        isPinned: false,
        modalVisible: false,
        position: 10
    }

    setModalVisible = () => {
        this.setState({modalVisible: true});
    }

    setModalInvisible = () => {
        this.setState({modalVisible: false});
    }

    togglePin = () => {
        console.log(this.state.isPinned);
        let newJSON = {
            s3Key: this.props.s3Key,
            dateCreated: this.state.dateCreated,
            text: this.state.text,
            image: this.state.image,
            priority: this.state.priority,
            isPinned: !this.state.isPinned}
        this.props.update(newJSON);
        this.setState({isPinned: !this.state.isPinned, position: 0});
    }


    componentDidMount() {
        this.setState(this.props);
    }

    saveNoteChange = (noteJSON) => {
        this.setModalInvisible();
        this.move();
        this.setState(noteJSON);
        this.props.update(noteJSON);
    }

    setPriority = (priority) => {
        this.state.priority = priority;
    }

    move = () => {
        this.state.position === 0 ?
            this.setState({position: -(GLOBAL.width/2) }) :
            this.setState({position: 0});
    }

    render() {
        let leftPin = undefined;
        if (this.state.isPinned){
            leftPin = <TouchableOpacity onPress={this.togglePin}
                style={{
                    flex: 0.1,
                    backgroundColor: "rgba(47,128,237,0.1)",
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 5,
                    marginRight: -5,
                    borderRadius: 10
                }}>
                <Image source={bluePin}
                    style={{flex: 0.25,  resizeMode: "contain", opacity: 0.75}}/>
            </TouchableOpacity>
        }
        var img;
        if (this.state.image) {
            img = <Image
                source={{uri: this.state.image}}
                style={{ resizeMode:'contain',
                    flex: 1,
                    margin:5,
                    height:undefined,
                    width:undefined}}
            />
        }
        return(
            <View>
                <View style={{flexDirection: "row",
                        width: GLOBAL.width * 1.5,
                        marginTop: 15,
                        marginLeft: this.state.position,
                        marginRight: 10}}>

                    {leftPin}

                    <TouchableOpacity
                        onPress={this.move}
                        style={{ flex: 1}}
                    >
                        <View style={styles.noteInfoContainer}>

                            <Text style={{
                                flex: this.state.image ? 4 : 5,
                                marginLeft:20,
                                marginTop:15,
                                marginBottom:15,
                                color: 'black',
                                fontSize: h / 42,
                                fontFamily: 'System',
                                alignItems: 'center'}}>
                                {this.state.text}
                            </Text>

                            {img}

                            <LinearGradient
                                style={{
                                    flex:1,
                                    backgroundColor: '#007aff',
                                    justifyContent:'center',
                                    borderRadius: h / 25,
                                    marginRight: -3}}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={[darkBlue, lightBlue]}>
                                <Text style={styles.priorityText}>
                                    {this.state.priority}
                                </Text>
                            </LinearGradient>
                        </View>
                    </TouchableOpacity>

                    <View style={{
                        flex:0.5,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        marginRight: 20,
                    }}>

                        <View style={styles.iconContainer}>
                            <TouchableOpacity onPress={this.setModalVisible}>
                                <View style={styles.editIconContainer}>
                                    <Image source={editIcon}
                                        style={styles.icon}/>
                                </View>
                            </TouchableOpacity>
                            <Text
                                style={styles.iconText}>
                                Edit
                            </Text>
                        </View>

                        <View style={styles.iconContainer}>
                            <TouchableOpacity onPress={this.togglePin}>
                                <View style={styles.pinIconContainer}>
                                    <Image source={pinIcon}
                                        style={styles.icon}/>
                                </View>
                            </TouchableOpacity>
                            <Text
                                style={styles.iconText}>
                                Pin
                            </Text>
                        </View>

                        <View style={styles.iconContainer}>
                            <TouchableOpacity onPress={() =>
                                this.props.delete(this.props.s3Key)
                            }>
                                <View style={styles.deleteIconContainer}>
                                    <Image source={deleteIcon}
                                        style={styles.icon} />
                                </View>
                            </TouchableOpacity>
                            <Text
                                style={styles.iconText}>
                                Delete
                            </Text>
                        </View>

                    </View>

                </View>
                <Modal
                    animationType="slide"
                    isVisible={this.state.modalVisible}
                    backdropOpacity={0.5}
                    >
                    <NoteEntry
                        image={this.state.image}
                        text={this.state.text}
                        priority={this.state.priority}
                        s3Key={this.props.s3Key}
                        dateCreated={this.state.dateCreated}
                        onRef={ref => (this.parentReference = ref)}
                        saveNewData = {this.saveNoteChange.bind(this)}
                        cancelEdit = {this.setModalInvisible.bind(this)}
                    />
                </Modal>


            </View>
        )
    }
}


let styles = StyleSheet.create({
    iconText: {
        textAlign: 'center',
        color: "#373737",
        fontFamily: 'System',
        opacity: 0.7,
        fontSize: h / 45
    },
    icon: {
        flex: 0.5,
        height: undefined,
        width: undefined,
        resizeMode: 'contain'
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    pinIconContainer: {
        height: iconSize,
        width: iconSize,
        borderRadius: iconSize / 2,
        backgroundColor: "#2f80ed",
        justifyContent: 'center',
        opacity: 0.5
    },
    editIconContainer: {
        height: iconSize,
        width: iconSize,
        borderRadius: iconSize / 2,
        backgroundColor: "#1c79e5",
        justifyContent: 'center',
        opacity: 0.7
    },
    deleteIconContainer: {
        height: iconSize,
        width: iconSize,
        borderRadius: iconSize / 2,
        backgroundColor: "#373737",
        justifyContent: 'center',
        opacity: 0.5
    },
    noteInfoContainer: {
        flex: 1,
        flexDirection:'row',
        marginLeft: 10,
        marginRight: 10,
        backgroundColor:"white",
        borderRadius: h / 30,
        borderWidth: 1,
        borderColor: "#FFF",
        shadowColor: "#373737",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.25,
		shadowRadius: 5,
    },
    priorityText: {
        textAlign: 'center',
        fontSize: h / 30,
        fontFamily: 'System',
        color: 'white'
    }
})

Note.propTypes = {

    s3Key: PropTypes.string,
    isPinned: PropTypes.bool,
    dateCreated: PropTypes.number,
    image: PropTypes.string,
    text: PropTypes.string,
    priority: PropTypes.number,

    modalVisible: PropTypes.bool,
    delete: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired
}