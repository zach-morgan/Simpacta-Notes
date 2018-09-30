'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const {App} = require('jovo-framework');
const request = require('request-promise');
const aws = require('aws-sdk');
var Blob = require('blob');
aws.config.update({region: 'us-east-1'});
var s3Client = new aws.S3({apiVersion: '2006-03-01'});


const config = {
    logging: true,
};

const app = new App(config);


// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
    'LAUNCH': function() {
        let token = this.getAccessToken();
        if (!token){
            if (this.getPlatform() === 'AlexaSkill'){
                this.alexaSkill().showAccountLinkingCard();
            } else {
                this.googleAction().showAccountLinkingCard();
            }
            //this.tell('Please link your account to use the srm app.');
        } else { 
            let response = "Say your note now.";
            this.ask(response, response);
        }
    },

    'SayNote': function(note) {
        let token = this.getAccessToken();
        if (!token){
            if (this.getPlatform() === 'AlexaSkill'){
                this.alexaSkill().showAccountLinkingCard();
            } else {
                this.googleAction().showAccountLinkingCard();
            }
            this.tell('Please link your account to use the srm app.');
        } else {
            let options = {
                method: 'GET',
                url: process.env.COGNITO_DOMAIN,
                headers:{
                    authorization: 'Bearer ' + token,
                }
            };
            // get the Cognito ID
            return request(options)
                .then( (userData) => {
                    let data = JSON.parse(userData);
                    console.log(data);
                    let userSUB = data['sub'];
                    let userInfoFile = "public/" + userSUB + ".txt";
                    let bucketName = process.env.BUCKET_NAME;
                    var userInfo = {
                        Bucket: bucketName,
                        Key: userInfoFile
                    }
                    s3Client.getObject(userInfo).promise()
                        .then(userData => {
                            console.log(userData);
                            let userDoc = JSON.parse(userData.Body.toString());
                            let noteID = "private/" + userDoc.id + "/" + (Math.floor(Date.now() / 1000)).toString() + ".json";
                            let noteText = note.value;
                            let noteJSON = {text: noteText, priority: null, associatedImage: null};
                            // var blob = new Blob([JSON.stringify(noteJSON, null, 2)], {type : 'application/json'});
                            let newNote = {
                                Body: JSON.stringify(noteJSON),
                                Bucket: process.env.BUCKET_NAME,
                                Key: noteID
                            }
                            s3Client.putObject(newNote).promise()
                                .then(response => {
                                    this.tell('Note saved to srm.');
                                })
                                .catch(err => {
                                    console.log(err);
                                    console.log("error putting note document");
                                    this.tell("I had some trouble storing your tip. Please try again later.");
                                })
                        })
                        .catch(err => {
                            console.log("error getting identity pool information");
                            console.log(err);
                            this.tell("I had some trouble communicating with the login servers. Please check your connection, and try again later.");
                        })
                })
                .catch((err) => {
                    console.log("error getting cognito information");
                    console.log(err);
                    this.tell("I had some trouble communicating with the login servers. Please check your connection, and try again later.");
                })
            }
    }
});

module.exports.app = app;
