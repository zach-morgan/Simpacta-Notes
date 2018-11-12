import React, {Component} from 'react';

import {
  StyleSheet,
  View,
  Platform,
  Image,
  StatusBar,
  Dimensions,
  SafeAreaView
} from 'react-native';

import { getStatusBarHeight } from 'react-native-iphone-x-helper'

import { TabView, TabBar, SceneMap } from 'react-native-tab-view';

import RecorderTab from './RecordingTab/Main.js';
import ArchiveTab from './ArchiveTab/Main.js';


const MyStatusBar = ({backgroundColor, ...props}) => (
    <View style={[styles.statusBar, { backgroundColor }]}>
      <StatusBar translucent backgroundColor={backgroundColor} {...props} />
    </View>
);

const srmLogo = require('../assets/srmlogo.png');
const routineLogo = require('../assets/routine.png');

const darkBlue = "#2F80ED";
const h = GLOBAL.height;
const w = GLOBAL.width;

renderPager = props => (
    <PagerPan {...props} />
);

export default class AudioScreen extends Component {

    state = {
        index: 0,
        routes: [
          { key: 'recorder', title: 'Recorder' },
          { key: 'archive', title: 'Archive' },
        ],
    };

    renderScene = ({ route }) => {
        switch (route.key) {
          case 'recorder':
            return <RecorderTab />;
          case 'archive':
            return <ArchiveTab ref={child => {this.archive = child}}/>;
          default:
            return null;
        }
    }

    _renderIcon = ({ route }) => (
        <Image name={route.icon} size={24} color="white" />
    );

    render() {
        return (
            // <View style={styles.container}>
            //     <MyStatusBar backgroundColor="white" barStyle="default" />

            //     <View style={{height: h / 9,
            //             width: w,
            //             justifyContent: 'flex-end',
            //             backgroundColor: 'white',
            //             marginTop: 0,
            //             borderBottomLeftRadius: 10,
            //             borderBottomRightRadius: 10,
            //             shadowColor: "#373737",
            //             shadowOffset: { width: 0, height: 10 },
            //             shadowOpacity: 0.2,
            //             shadowRadius: 4}}>

            //         <View style={{flexDirection: 'row', alignItems:'center', justifyContent: 'flex-start', marginBottom: h / 45}}>
            //                 <Image source={srmLogo} resizeMode="contain" style={{marginRight: w / 20, marginLeft: w / 20}} />

            //                 <Image source={routineLogo} resizeMode="contain"  />
            //         </View>

            //     </View>
                <TabView

                    navigationState={this.state}
                    renderScene={this.renderScene}
                    onIndexChange={index => {
                        if (index===1){
                            this.archive.downloadClips();
                        }
                        this.setState({ index })
                    }}
                    renderPager={this.renderPager}
                    initialLayout={{ width: Dimensions.get('window').width, height: 100 }}
                    renderTabBar={props =>
                        <TabBar
                          {...props}
                          renderIcon={this._renderIcon}
                          indicatorStyle={{ backgroundColor: '#2F80ED' }}
                          style={{
                            backgroundColor: 'white',
                            height: 100,
                            shadowColor: "#373737",
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4
                        }}
                          labelStyle={{color: 'black', marginTop: 50}}
                        />
                      }
                />

            //  </View>

        );
    }
}

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? getStatusBarHeight(true) : StatusBar.currentHeight;


var styles = StyleSheet.create({
    statusBar: {
        height: STATUSBAR_HEIGHT,
        marginBottom: 0
    },
})