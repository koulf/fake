const express = require('express');
const app = express();
port = process.env.PORT || 80;
const AWS = require("aws-sdk");
var dynamodb = new AWS.DynamoDB();
let s3 = new AWS.S3();


app.use(express.json());
app.use(express.static(__dirname + '/public'));


app.put('/user/register', (req, res) => {
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

    console.log(req.body);

    res.send(200);

});

app.post('/s3/post', async (req, res) => {
    let result;
    
	const params = {
		Body: req.body.base64,
		Bucket: 'image-analyzer-4-cloud',
		Key: req.body.key
	};

	try {
		result = await s3.putObject(params).promise();
	} catch (err) {
        result = err;
        res.send(501).json({err});
	}
    
    res.json({
		statusCode: 200,
		body: result
    });

    res.sendStatus(200);
});

app.listen(port, ()=>console.log("Running in  http://localhost"))
