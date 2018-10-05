import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput , TouchableHighlight, Text, Button, Image} from 'react-native';

const attachIcon = require("../../assets/image-attach.png");

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
        priority: null
    }

    renderPriorityButtons = () => {
        let buttons = [];
        for (var i = 1; i <= 5; i++){
            let index = i;
            let newBtn = <TouchableHighlight
                key={index}
                onPress={() => this.setState({priority: index})}
                style={{
                    width: GLOBAL.width / 8,
                    height: GLOBAL.width / 8,
                    borderRadius: (GLOBAL.width / 8) /2,
                    borderColor: 'black',
                    borderWidth: 1,
                    justifyContent:'center',
                    backgroundColor:
                        this.state.priority === index ?
                            "#007aff" : "#ffffff"
                }}
            >
                <Text
                    style={{
                        fontSize: GLOBAL.height / 22,
                        textAlign: 'center',
                        color:
                            this.state.priority !== index ?
                                "#007aff" : "#ffffff",
                    }}
                >{i.toString()}</Text>
            </TouchableHighlight>;
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
                image: source
            });
        }
        });
    }

    render() {
        return(
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    borderRadius: GLOBAL.width / 10,
                    borderColor: "black",
                    borderWidth: 2
                }}>
                    <View style={{flex:1, flexDirection: "row", justifyContent:"space-between", marginRight:20, marginLeft:15, marginTop: 20}}>
                        <Button title="Cancel"
                            onPress={() => this.props.cancelEdit()}/>
                        <Button title="Save"
                            onPress={() => {
                                console.log(this.state);
                                this.state.dateCreated = Math.floor(Date.now() / 10000)
                                this.props.saveNewData(this.state)}
                            }
                        />
                    </View>
                    <View
                         style={{flex:3, alignContent:'flex-start', marginLeft: 10, marginRight:10}}
                    >
                        <TextInput
                            multiline={true}
                            style={{fontSize: GLOBAL.height / 25}}
                            placeholder="Enter your note"
                            value={this.state.text}
                            onChangeText={(text) => this.setState({text: text})}
                        />
                    </View>

                    <TouchableHighlight style={{
                        flex: this.state.image ? 1.5 : 0.5,
                        borderColor: 'black',
                        borderWidth: 1,
                        borderStyle: 'dashed',

                        }}
                        onPress={this.imagePicker}
                    >
                        <Image
                            source={this.state.image || attachIcon}
                            style={{
                                resizeMode:'contain',
                                flex: 1,
                                height:undefined,
                                width:undefined }}
                        />
                    </TouchableHighlight>

                    <View style={{flex: 1, marginLeft: 20, marginRight:20, marginBottom: 40, justifyContent:'flex-start'}}>
                        <Text style={{textAlign:'left', fontSize: GLOBAL.height / 25}}>Priority</Text>
                        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                            {this.renderPriorityButtons()}
                        </View>
                    </View>
                </View>
        )
    }
}

NoteEntry.propTypes = {
    image: PropTypes.string,
    text: PropTypes.string,
    priority: PropTypes.number,
    s3Key: PropTypes.string,
    dateCreated: PropTypes.number,
    saveNewData: PropTypes.func,
    cancelEdit: PropTypes.func
}

