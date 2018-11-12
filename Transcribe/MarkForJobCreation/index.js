var AWS = require('aws-sdk')
var docClient = new AWS.DynamoDB.DocumentClient();

let tableName = "TranscriptionJobs";

exports.handler = function(event, context, callback) {
    let clipKey = event.Records[0].s3.object.key.replace("%3A", ":");
    var params = {
        TableName: tableName,
        Item:{
            "id" : clipKey,
            "transStatus": "WAITING"
        }
    };
    return docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });

}