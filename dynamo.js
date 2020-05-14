'use strict';

const AWS = require("aws-sdk");

exports.create = function (event, context, callback) {
    var dynamodb = new AWS.DynamoDB();

    console.log("event pet: \n\n" + JSON.stringify(event));

    var params = {
        Item: {
            "AlbumTitle": {
                S: "Somewhat Famous"
            },
            "Artist": {
                S: "No One You Know"
            },
            "SongTitle": {
                S: "Call Me Today"
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: "ImageAnalyzer"
    };

    // dynamodb.putItem(params, function (err, data) {
    //     if (err)
    //         console.log(err, err.stack);
    //     else
    //         console.log(data);
    // });

    callback(null, result);
}
