import React from 'react';
import { StyleSheet } from 'react-native';
import { Icon } from 'native-base';

class LogSignScreenStyles {
    loadStyles = () => {
      GLOBAL.checkMarksArray = [
        (null),
        (<Icon style={{ color: mainThemeColor }} name="ios-checkmark-circle" />),
        (<Icon style={{ color: mainThemeColor }} name="ios-close-circle" />),
      ];

      GLOBAL.inputTextStyle = {
        autoCorrect: false,
        maxLength: 100,
        selectionColor: mainThemeColor,
        placeholderTextColor: placeHolderColor,
        style: {
          paddingBottom: height / 400,
          fontWeight: '400',
          fontSize: GLOBAL.totalSize(2.34),
          height: height / 13,
          paddingLeft: width / 40,
          color: mainThemeColor,
        },
      };

      GLOBAL.companyBannerStyle = StyleSheet.create({
        background: {
          width, height: companyBannerHeight, alignItems: 'center', justifyContent: 'center',
        },
        icon: {
          position: 'absolute', flex:1,  tintColor: mainThemeColor,
        },
      });

      GLOBAL.topTabsStyle = StyleSheet.create({
        topTabButtonOn: {
          height: topTabButtonHeight, width: width / 2, backgroundColor: topTabColorOn,
        },
        topTabButtonOff: {
          height: topTabButtonHeight, width: width / 2, backgroundColor: topTabColorOff,
        },
        view: {
          flexDirection: 'row',
        },
        text: {
          fontSize: GLOBAL.totalSize(2.24), fontWeight: '500', color: mainThemeColor,
        },
      });


      GLOBAL.keyboardAvoidView = {
        style: { flex: 1 },
        resetScrollToCoords: { x: 0, y: 0 },
        contentContainerStyle: { backgroundColor: appMainColor },
        extraHeight: height / 10,
        keyboardOpeningTime: 0,
        enableOnAndroid: true,
        scrollEnabled: false,
      };

      GLOBAL.loginScreenStyle = StyleSheet.create({
        mainView: {
          zIndex: 1, position: 'absolute', flex: 1, backgroundColor: 'transparent',
        },
        form: {
          marginRight: width / 40, alignSelf: 'center',
        },
        remember: {
          color: `${mainThemeColor}DC`, fontSize: GLOBAL.totalSize(2.2), backgroundColor: 'transparent',
        },
      });
    }
}

export default new LogSignScreenStyles();
