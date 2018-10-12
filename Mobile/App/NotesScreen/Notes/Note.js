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
        this.state = {
            dateCreated: props.dateCreated,
            image: props.image,
            text: props.text,
            priority: props.priority,
            isPinned: props.isPinned,
            modalVisible: false,
            isEditingPriority: false,
            position: 0
        }
    }

    onLayout = (e) => {
        console.log('layout')
        this.setState({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }

    setModalVisible = () => {
        this.setState({modalVisible: true});
    }

    setModalInvisible = () => {
        this.setState({modalVisible: false});
    }

    togglePin = () => {
        //console.log(this.state.isPinned);
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

    renderPin = () => {
        if (this.state.isPinned){
            return (<TouchableOpacity onPress={this.togglePin}
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
            </TouchableOpacity>)
        }
    }

    renderImage = () => {
        if (this.state.image) {
            return <Image
                source={{uri: this.state.image}}
                style={{ resizeMode:'contain',
                    flex: 1,
                    margin:5,
                    height:undefined,
                    width:undefined}}
            />
        }
    }

    updatePriority = (priority) => {
        this.setState({priority: priority, isEditingPriority: false});
        noteJSON = {
            s3Key: this.props.s3Key,
            dateCreated: this.state.dateCreated,
            text: this.state.text,
            image: this.state.image,
            priority: this.state.priority,
            isPinned: this.state.isPinned
        }
        this.props.update(noteJSON);
    }

    renderPrioritySelectors = () => {
        var buttons = [];
        const parentWidth = this.state.width - 20;
        const parentHeight = this.state.height - 15;
        const width = 3 * (parentWidth / 4);
        const height = parentHeight;
        const leftPosition = (parentWidth / 4) - 10
        for (var i = 5; i > 0; i--) {
            index = i;
            buttons.push(
                <TouchableOpacity style={{
                    flex: 1,
                    backgroundColor: this.state.priority === i ? darkBlue : 'rgba(0,0,0,0)',
                    borderRadius: h / 25,
                    height: height,
                    justifyContent: 'center'
                }}
                 onPress={
                     this.updatePriority.bind(this, index)}
                 key={index}>
                    <Text style={styles.priorityText}>
                        {index.toString()}
                    </Text>
                </TouchableOpacity>
            )
        }
        return (
            <LinearGradient
            style={{
                borderRadius: h / 25,
                justifyContent: 'space-evenly',
                position: 'absolute',
                flexDirection: 'row',
                left: leftPosition,
                height: height,
                width: width,
                alignItems: 'center'
            }}
            start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={[darkBlue, lightBlue]}>
                {buttons}
            </LinearGradient>
        )

    }

    renderPriority = () => {
        console.log(this.state.priority)
        if (this.state.isEditingPriority){
            return this.renderPrioritySelectors();
        } else if (this.state.priority){
            return (
            <TouchableOpacity style={{flex:1}} onPress={() => this.setState({isEditingPriority: true})}>
                <LinearGradient
                    style={{borderRadius: h / 25,
                        flex: 1,
                        marginRight: -6,
                        justifyContent:'center',
                        alignItems: 'center'}}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={[darkBlue, lightBlue]}>
                    <Text style={styles.priorityText}>
                        {this.state.priority}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>)
        } else {
            const plus = require('../../assets/plus.png');
            return (
                <TouchableOpacity onPress={() => this.setState({isEditingPriority: true})}
                style={{
                    flex: 1,
                    justifyContent:'center',
                    alignItems: 'center',
                }}>
                    <Image source={plus} resizeMode='contain'
                    style={{
                        width: h/ 30,
                        height: h / 30,
                        marginRight: -7
                    }}/>
                </TouchableOpacity>
            )
        }
    }

    render() {
        let leftPin = this.renderPin();
        let img = this.renderImage();
        let priority = this.renderPriority();
        return(
            <View onLayout={this.onLayout}>
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
                                marginLeft:10,
                                marginTop:13,
                                marginBottom:13,
                                marginRight: 5,
                                color: 'black',
                                fontSize: h / 42,
                                fontFamily: 'System',
                                alignItems: 'center'}}>
                                {this.state.text}
                            </Text>

                            {img}

                            {priority}

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
                    backdropOpacity={0.25}
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
        borderRadius: h / 40,
        borderWidth: 1,
        borderColor: "#FFF",
        shadowColor: "#373737",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
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