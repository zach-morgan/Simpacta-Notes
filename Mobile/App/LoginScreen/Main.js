import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import { View } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import CompanyBanner from './Banner/CompanyBanner';
import RegisterTab from './RegisterTab/index';
import LoginTab from './LoginTab/index';
import TopTabs from './TabBar/TopTabs';

export default class LoginScreen extends Component {
  changeZindex = () => {
    this.RegisterTab.changeZindex();
  };

  switchScreens = index => () => {
    if (this.topTabs.state.currentTabIndex !== index) {
      if (index === 0) {
        this.LoginTab.animationView.fadeInLeft(600).then(this.changeZindex);
        this.RegisterTab.animationView.fadeOutRight(400);
      } else {
        this.LoginTab.animationView.fadeOutLeft(400);
        this.RegisterTab.animationView.fadeInRight(600).then(this.changeZindex);
      }
      this.topTabs.state.tabsStyles.reverse();
      this.topTabs.setState({ currentTabIndex: index });
    }
  };

  moveToMainAppScreen = () => {
    Actions.push('testMainAppScreen');
  };

  scrollToTextInput = (index) => {
    this.keyboardAvoidView.scrollToPosition(0, (index * height) / 10, true);
  };

  render() {
    return (
      <KeyboardAwareScrollView
        {...GLOBAL.keyboardAvoidView}
        ref={(ref) => { this.keyboardAvoidView = ref; }}
      >
        <CompanyBanner />
        <TopTabs
          ref={(ref) => { this.topTabs = ref; }}
          switch={this.switchScreens}
        />
        <View
          style={{
            backgroundColor: appMainColor, width, height: GLOBAL.bodyHeight, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Animatable.View
            animation="fadeIn"
            delay={1900}
            duration={1000}
            style={{ position: 'absolute' }}
          >
            <LinearGradient
              colors={[gradient1, gradient2, appMainColor]}
              style={{ width, height: GLOBAL.bodyHeight }}
            />
          </Animatable.View>
          <RegisterTab
            switch={this.switchScreens(0)}
            move={this.moveToMainAppScreen}
            scroll={this.scrollToTextInput}
            ref={(ref) => { this.RegisterTab = ref; }}
          />
          <LoginTab
            move={this.moveToMainAppScreen}
            ref={(ref) => { this.LoginTab = ref; }}
          />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}
