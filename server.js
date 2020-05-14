const express = require('express');
const app = express();
port = process.env.PORT || 80;

const AWS = require("aws-sdk");
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();


app.use(express.json());
app.use(express.static(__dirname + '/public'));


app.put('/user/register', (req, res) => {
    let item = {};

    Object.keys(req.body).forEach((key) => {
        if (key == 'correo')
            item.id = {
                S: req.body[key]
            };
        else
            item[key] = {
                S: req.body[key]
            };
    })

    let params = {
        Item: item,
        ReturnConsumedCapacity: "TOTAL",
        TableName: "ImageAnalyzer"
    };

    dynamodb.putItem(params, (err, data) => {
        if (err)
            res.status(401).send(err.message);
        else {
            console.log(data);
            res.send(201);
        }
    });
});

app.put('/login/user', (req, res) => {
    let params = {
        ExpressionAttributeValues: {
            ":v1": {
                S: req.body.usuario
            }
        },
        KeyConditionExpression: "id = :v1",
        TableName: "ImageAnalyzer"
    };

    dynamodb.query(params, function (err, data) {
        if (err)
            res.status(401).send(err); // an error occurred
        else {
            if (data.Items[0].password.S == req.body.password)
                res.status(201).send();
            else
                res.status(400).send("Invalid username or password");
        }
    });
})

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
        res.send(501).json({ err });
    }

    res.json({
        statusCode: 200,
        body: result
    });

    res.sendStatus(200);
});

app.listen(port, () => console.log("Running in  http://localhost"))
