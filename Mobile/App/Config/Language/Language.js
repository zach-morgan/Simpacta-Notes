class Language {
    loadLanguage = () => {
      GLOBAL.appLanguages = {
        english: {
          logOut: 'Logout',
          login: 'Login',
          loginTab: 'Login',
          newAccount: 'Register',
          create: 'Create Account',
          accountCreated: 'New account created.',
          email: 'Email',
          name: 'Name',
          password: 'Password',
          repeat: 'Repeat Password',
          checkFields: 'Fill in all fields.',
          loginSuccess: 'Login successful.',
          dontRemember: 'Forgot your password?',
          google: 'Login With Google',
          facebook: 'Login With Facebook',
          guest: 'Use Without Login',
          settings: 'Settings',
          mainColor: 'Main Color',
          change: 'Change',
          mainTheme: 'Main Theme',
          white: 'White',
          black: 'Dark',
          text: 'Text',
          lan: 'Language',
          language: 'English',
          hello: 'Hello',
        }
      };
    }
}

export default new Language();
