import React, { Component } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Amplify, {API, Auth, Storage} from 'aws-amplify';
import NotesContainer from './Notes/NotesContainer.js';


export default class NotesScreen extends Component {

  constructor() {
    super()
    this.state = {
      notes: global.localNotes || [],
      isDownloadingS3: true,
    };
  }

  componentDidMount() {
      this.documentUser();
      this.downloadNotesS3();
  }

  documentUser = async() => {
    Auth.currentAuthenticatedUser()
      .then(user => {
        let sub = user.attributes.sub;
        Storage.get(sub + ".txt", {download: true})
          .then(userIsEntered => {

          })
          .catch(userIsNotEntered => {
            Auth.currentCredentials()
              .then(credentials => {
                let fedID = credentials.identityId;
                let userDoc = {id: fedID}
                Storage.put(sub + ".txt", JSON.stringify(userDoc))
                  .then(accepted => {} //console.log("succesfully documented user"))
                  )
                  .catch(notAccepted => {
                    //console.log("error documenting the user");
                    //console.log(notAccepted);
                  });
              })
              .catch(err => {
                //console.log(err);
                //console.log("error getting user credentials");
              })
          });
      })
      .catch(err => {
        //console.log(err);
        //console.log("error getting user info");
        return false;
      })
  }

  moveToLogSignScreen = () => {
    Actions.pop();
  };



  downloadNotesS3 = async () => {
    Auth.currentCredentials()
      .then(user => {
        Storage.list("notes/", {level : 'private'})
          .then( keys => {
            let notePromises = [];
            let noteKeys = keys.filter(function(key){
                return key.key !== 'notes/';
            })
            noteKeys.forEach( noteKey => {
              let key = noteKey.key;
              notePromises.push(Storage.get(key, {level: 'private', download: true}));
            })
            Promise.all(notePromises)
              .then( data => {
                let JSONdata = [];
                data.forEach( note => {
                  let noteJSON = JSON.parse(note.Body.toString());
                  noteJSON.s3Key = keys[data.indexOf(note)].key;
                  JSONdata.push(noteJSON);
                })
                JSONdata = JSONdata.concat(this.state.notes);
                
                this.setState({isDownloadingS3: false, notes: JSONdata});
              })
              .catch( err => {
                //console.log("error getting notes");
                //console.log(err);
              })
          })
          .catch(err => {
            //console.log("error getting notes keys");
            //console.log(err);
          })
      })
      .catch(err =>{}) //console.log(err));


  }

  displayRightThing = () => {
    if (this.state.isDownloadingS3) {
      return <ActivityIndicator size="large" color="#0000ff" />
    } else {
      return <NotesContainer notes={this.state.notes} />
    }
  }

  render() {
    return (
      <View style={{alignItems:'center', flex: 1, justifyContent: 'center'}}>
        {this.displayRightThing()}
      </View>
    );
  }
}
