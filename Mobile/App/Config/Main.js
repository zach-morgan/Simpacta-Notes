import { AsyncStorage, Dimensions } from 'react-native';
import Colors from './Colors/Colors';
import Language from './Language/Language';
import AppStyles from './Styles/Styles';

const { height, width } = Dimensions.get('window');
GLOBAL.height = height;
GLOBAL.width = width;
GLOBAL.totalSize = num => (Math.sqrt((height * height) + (width * width)) * num) / 100;
// login style of application
// 0 - google only, 1 - facebook only, 2 - both
GLOBAL.appLoginStyle = 2;
// measures of some elements
companyBannerHeight = (height / 5) + (height / 19);
companyIconWidth = (width * 52) / 90;
topTabButtonHeight = height / 12;
GLOBAL.bodyHeight = height - companyBannerHeight - topTabButtonHeight;
GLOBAL.loginStatus = "unauthenticated";

class AppGlobalConfig {
    init() {
      appTheme = 'white';
      appMainColor = '#42A5F5';
      currentLanguage = 'english';
      Language.loadLanguage();
      language = appLanguages[currentLanguage];
      Colors.defineAppColors(appMainColor);
      Colors.defineAppTheme(appTheme);
      AppStyles.loadStyles();
    }
}

export default new AppGlobalConfig();