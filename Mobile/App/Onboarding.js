import React, { Component } from 'react';
import {Image, View, Text} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import {Actions} from 'react-native-router-flux';

const page1Img = require('./assets/onboarding-everything.png');
const page2Img = require('./assets/onboarding-quickly.png');
const page3Img = require('./assets/onboarding-priority.png');

const darkBlue = "#2F80ED";
const lightBlue = "#249BDF";

const h = GLOBAL.height;

export default class Onboard extends Component {

    renderAPage = (title, subtitle, image) => {
        let titleComponent =
            <View style={{flexDirection: "row", marginBottom: h / 20}}>
                <Text style={{
                    //marginRight: 10,
                    fontFamily: 'System',
                    fontWeight: 'bold',
                    color: 'black',
                    fontSize: h / 25,
                }}>
                    Capture
                </Text>
                <Text style={{
                    marginLeft: 10,
                    fontFamily: 'System',
                    fontWeight: 'bold',
                    color: darkBlue,
                    fontSize: h / 25,
                    textAlign: 'center',
                }}>
                    {title}
                </Text>
            </View>
        let subtitleComponent =
           <Text style={{
               fontFamily: 'System',
               color: 'black',
               fontSize: h / 40,
               marginLeft: 10,
               marginRight: 10,
               marginBottom: h / 10,
               textAlign: 'center',
           }}>
               {subtitle}
           </Text>
        let imageCompenent =
            <Image source={image}
                style={{
                }}
            />


        let page = {
            backgroundColor: 'white',
            image: imageCompenent,
            title: titleComponent,
            subtitle: subtitleComponent
        }
        return page;
    }

    renderPages = () => {
        let titles = ["Everything", "Quickly", "Priority Scores"];
        let subtitles = [
            "Capture simple text which should be a great primer to later detail all of your potential tasks.",
            "Quickly capture information by telling any of the voice assistants or share images, links, and selected text from any other app",
            "Make it easier to categorize the highest prirotiy tasks when your back on your desktop"
        ]
        let images = [page1Img, page2Img, page3Img];
        let pages = [];
        for (var i = 0; i < 3; i++) {
            pages.push(this.renderAPage(titles[i], subtitles[i], images[i]));
        }
        return pages;
    }

    moveToLoginPage = () => {
        Actions.LoginScreen();
    }

    render() {
        let pages = this.renderPages();
        return (
        <View style={{flex: 1}}>
            <Onboarding
                imageContainerStyles={{paddingBottom: 10}}
                bottomBarHighlight={false}
                pages={pages}
                onDone={this.moveToLoginPage}
                onSkip={this.moveToLoginPage}
            />
          </View>)
    }
}