var AWS = require('aws-sdk')
var s3 = new AWS.S3();
var transcribe = new AWS.TranscribeService({apiVersion: '2017-10-26'});
var docClient = new AWS.DynamoDB.DocumentClient();

const BUCKET_NAME = "mobilec7de17004aee4497a47c743a6b56f3f6";
let tableName = "TranscriptionJobs";

STATE = {
    waiting: "WAITING",
    markedForStart: "WAITING_TO_START",
    processing: "IN_PROGRESS",
    completed: "COMPLETED",
    markedForDeletion: "WAITING_TO_BE_DELETED",
    deleted: "DELETED"
}

let allowedRunningTime = 10;

exports.handler = async function(event, context, callback) {
    let allJobs = await Utils.getAllJobs();
    console.log(allJobs);
    let timeKeeper = new Utils();
    let hasJobsLeft = allJobs.length > 0;
    while ( hasJobsLeft && timeKeeper.hasTimeLeft() ) {
        let waiting = allJobs.filter(job => job.status === STATE.waiting);
        let inProgress = allJobs.filter(job => job.status === STATE.processing);
        let completed = allJobs.filter(job => job.status === STATE.completed);
        let deleted = allJobs.filter(job => job.status === STATE.deleted);
        console.log("Total Jobs: " + allJobs.length.toString());
        console.log("Total Waiting Jobs: " + waiting.length.toString());
        console.log("Total In Progress Jobs: " + inProgress.length.toString());
        console.log("Total Completed Jobs: " + completed.length.toString());

        if (inProgress.length < 10 && waiting.length > 0) {
            let newJob = waiting.pop();
            newJob.status = STATE.markedForStart;
            await newJob.startTranscription();
        }
        inProgress.slice(0, 3).forEach( job => {
            job.checkStatus();
        });
        completed.forEach( completedJob => {
            completedJob.status = STATE.markedForDeletion;
            completedJob.deleteFromWaitingList();
            completedJob.moveJob();
        })
        await Utils.sleep(1500);
        timeKeeper.updateTime();
        hasJobsLeft = deleted.length !== allJobs.length;
    }

    let remainingJobs = allJobs.filter( job => {
        return job.status !== STATE.markedForDeletion && job.status !==  STATE.deleted && job.status  !== STATE.waiting;
    })
    console.log("remaining jobs");
    console.log(remainingJobs);
    let remainingUpdates = remainingJobs.map( job => {
        return job.putBackInQueue();
    })
    await Promise.all(remainingUpdates)
        .then(result => console.log("finished"))
        .catch(err => console.log(err));
}

class Job {

    constructor(data) {
        this.key = data.id;
        this.status = data.transStatus;
        this.transcriptionName = data.transName;

    }

    async startTranscription() {
        let clipURL = 'https://s3.amazonaws.com/mobilec7de17004aee4497a47c743a6b56f3f6/' + this.key;
        this.transcriptionName = Math.floor(Date.now() * 10).toString();
        let transcriptionLocation = BUCKET_NAME;
        var params = {
            LanguageCode: 'en-US',
            Media: {
                MediaFileUri: clipURL
            },
            MediaFormat: 'mp4',
            TranscriptionJobName: this.transcriptionName,
            OutputBucketName: transcriptionLocation,
            MediaSampleRateHertz: 44100
        };
        console.log("Creating job");
        let that = this;
        await transcribe.startTranscriptionJob(params, function(err, data) {
            if (err) {
                console.log(err);
                that.status = STATE.waiting
            } else {
                that.status = STATE.processing;
            }
        });
    }

    async checkStatus() {
        var params = {
            TranscriptionJobName: this.transcriptionName
        };
        let that = this;
        await transcribe.getTranscriptionJob(params, function(err, data) {
            if (err) {
                console.log("get trans errror");
                console.log(err);
            } else {
                that.status = data.TranscriptionJob.TranscriptionJobStatus;
            }
        });
    }

    async moveJob() {
        var tempHome = {
            Bucket: BUCKET_NAME,
            Key: this.transcriptionName + ".json"
        };
        let transcriptionFileKey = this.key.slice(0, this.key.length - 9 ) + "transcription.txt";
        var that = this
        await s3.getObject(tempHome, async function(err, data) {
            if (err) {
                console.log(err, err.stack);
            } else {
                let transcriptionJSON = JSON.parse(data.Body.toString());
                let transcriptionText = transcriptionJSON.results.transcripts[0].transcript;
                var permHome = {
                    Body: transcriptionText,
                    Bucket: BUCKET_NAME,
                    Key: transcriptionFileKey
                };
                await s3.putObject(permHome, async function(err, data) {
                    if (err) {
                        console.log("error put");
                        console.log(err, err.stack);
                    } else {
                        console.log("suc put")
                        await s3.deleteObject(tempHome, function(err, data) {
                            if (err) {
                                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                            } else {
                                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                                that.status = STATE.deleted;
                            }
                        });
                    }
                });
            }
        })
    }

    async deleteFromWaitingList() {
        var params = {
            TableName: tableName,
            Key:{
                "id" : this.key
            }
        };

        await docClient.delete(params, function(err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            }
        })
    }

    putBackInQueue() {
        var params = {
            TableName: tableName,
            Item:{
                "id": this.key,
                "transStatus": this.status,
                "transName": this.transcriptionName
            }
        };
        return docClient.put(params).promise();
    }
}

class Utils {

    constructor() {
        let initialTime = Math.floor(Date.now() / 1000)
        this.startTime = initialTime;
        this.currentTime = initialTime;
    }

    updateTime() {
        this.currentTime = Math.floor(Date.now() / 1000);
    }

    hasTimeLeft() {
        let runningTime = this.currentTime - this.startTime;
        return runningTime < allowedRunningTime;
    }

    static async getAllJobs() {
        let params = {
            TableName: tableName
        };
        let waitingJobs = [];
        try {
            let jobScan = await docClient.scan(params).promise();
            waitingJobs = jobScan.Items.map(doc => new Job(doc) );
        } catch (err) {
            console.log(err)
        }
        return waitingJobs;
    }

    static sleep(ms){
        return new Promise(resolve=>{
            setTimeout(resolve,ms)
        })
    }
}