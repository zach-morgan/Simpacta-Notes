import React, {Component} from 'react';

import {
  Text,
  View,
  Button,
  TextInput
} from 'react-native';
import PropTypes from 'prop-types';


const h = GLOBAL.height;
const w = GLOBAL.width;

export default class TitleEntry extends Component {

    state = {
        text: ""
    }

    render() {
        return (
            <View style={{
                flex: 0.7,
                backgroundColor: 'white',
                borderRadius: h / 35,
                borderColor: "white",
                borderWidth: 1,
                shadowColor: "#373737",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 5,}}>
                <Text
                    style={{flex: 1,
                        color: "rgba(55, 55, 55, 0.7)",
                        fontFamily: 'System',
                        fontSize: h / 35,

                        marginLeft: w / 15,
                        marginTop: h / 30
                    }}
                >
                    Session Name
                </Text>
                <TextInput
                    multiline={true}
                    style={{
                        fontSize: GLOBAL.height / 35,
                        flex: 5,
                        marginLeft: w / 15,
                        marginRight: w / 15
                    }}
                    placeholder="Enter your session name"
                    value={this.state.text}
                    returnKeyType={"done"}
                    onChangeText={(text) => this.setState({text: text})}
                />
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginLeft: w / 15,
                    marginRight: w / 15,
                    marginBottom: h / 40
                }} >
                    <Button title="Cancel" onPress={this.props.cancel} />
                    <Button title="Save" onPress={() => this.props.save(this.state.text)} />
                </View>
            </View>
        )
    }
}

TitleEntry.props = {
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
}