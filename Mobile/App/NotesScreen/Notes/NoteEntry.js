import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput , TouchableOpacity, Text, Button, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const attachIcon = require("../../assets/image-attach.png");

const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";
const w = GLOBAL.width;
const h = GLOBAL.height;


export default class NoteEntry extends Component {

    constructor(props) {
        super(props);
        this.state = props;
    }

    state = {
        s3Key: null,
        dateCreated: null,
        image: null,
        text: null,
        priority: null,
        isPinned: false
    }

    renderPriorityButtons = () => {
        let buttons = [];
        for (var i = 1; i <= 5; i++){
            let index = i;
            let newBtn =
            <LinearGradient
                    key={index}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    colors={ this.state.priority === index ? [darkBlue, lightBlue] : ["#FFFFFF", "#FFFFFF"]}
                    style={{width: GLOBAL.width / 8,
                        height: GLOBAL.width / 8,
                        borderRadius: (GLOBAL.width / 8) / 2,
                        borderColor: this.state.priority === index ? 'white' : 'black',
                        borderWidth: 1,
                        justifyContent:'center',}}>
                <TouchableOpacity
                    onPress={() => this.setState({priority: index})}
                >
                        <Text
                            style={{
                                fontSize: GLOBAL.height / 25,
                                textAlign: 'center',
                                color:
                                    this.state.priority !== index ?
                                        "#007aff" : "#ffffff",
                            }}
                        >{i.toString()}</Text>
                </TouchableOpacity>
            </LinearGradient>
            buttons.push(newBtn);
        }
        return buttons;
    }


    imagePicker = () => {
        var ImagePicker = require('react-native-image-picker');

        var options = {
            title: 'Select Avatar',
            storageOptions: {
                skipBackup: true,
                path: 'images'
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
            console.log('User cancelled image picker');
        }
        else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
        }
        else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
        }
        else {
            let source = { uri: response.uri };

            console.log(source);
            this.setState({
                image: response.uri
            });
        }
        });
    }

    render() {
        let img;
        if (this.state.image) {
            img =
            <TouchableOpacity style={{
                flex: 1.25,
                justifyContent: 'center',
                }}
                onPress={this.imagePicker}
            >
                <Image
                    source={{uri: this.state.image}}
                    style={{
                        resizeMode:'contain',
                        flex: 1,
                        height:undefined,
                        width:undefined }}
                />
            </TouchableOpacity>
        } else {
            img =
            <TouchableOpacity style={{
                flex: 0.3,
                borderColor: 'black',
                borderWidth: 1,
                justifyContent: 'center',
                borderStyle: 'dashed',
                backgroundColor: "rgba(28, 121, 229, 0.3)",
                borderColor: "rgba(28, 121, 229, 0.7)"
                }}
                onPress={this.imagePicker}
            >
                <Image
                    source={attachIcon}
                    style={{
                        resizeMode:'contain',
                        flex: 0.5,
                        height:undefined,
                        width:undefined }}
                />
            </TouchableOpacity>
        }
        return(
                <View style={{
                    flex: 0.75,
                    backgroundColor: 'white',
                    borderRadius: GLOBAL.height / 25,
                    borderColor: "black",
                    borderWidth: 1
                }}>
                    <View style={{flex:0.3, flexDirection: "row", justifyContent:"space-between", marginRight:20, marginLeft:15, marginTop: 20}}>
                        <Button title="Cancel"
                            onPress={() => this.props.cancelEdit()}/>
                        <Button title="Save"
                            onPress={() => {
                                console.log(this.state);
                                let newJSON = {
                                    s3Key: this.props.s3Key || "notes/" + Math.floor(Date.now() / 1000).toString() + ".txt",
                                    dateCreated: Math.floor(Date.now() / 1000),
                                    text: this.state.text,
                                    image: this.state.image,
                                    priority: this.state.priority,
                                    isPinned: this.state.isPinned}
                                this.props.saveNewData(newJSON)}
                            }
                        />
                    </View>
                    <View
                         style={{flex: 2, alignContent:'flex-start', marginLeft: 20, marginRight:20}}
                    >
                        <TextInput
                            multiline={true}
                            style={{fontSize: GLOBAL.height / 35, marginBottom: 10}}
                            placeholder="Enter your note"
                            value={this.state.text}
                            returnKeyType="done"
                            onChangeText={(text) => this.setState({text: text})}
                        />
                    </View>

                    {img}

                    <View style={{flex: 1, marginLeft: 20, marginRight: 20, justifyContent:'space-around'}}>
                        <Text style={{ textAlign:'left', fontSize: GLOBAL.height / 30, marginTop: 10}}>Priority</Text>
                        <View style={{flexDirection: "row", justifyContent:"space-between", marginBottom: 20}}>
                            {this.renderPriorityButtons()}
                        </View>
                    </View>
                </View>
        )
    }
}

NoteEntry.propTypes = {
    isPinned: PropTypes.bool,
    image: PropTypes.string,
    text: PropTypes.string,
    priority: PropTypes.number,
    s3Key: PropTypes.string,
    dateCreated: PropTypes.number,
    saveNewData: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired
}

