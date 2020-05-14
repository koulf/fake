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
	let request = req;

	const base64data = new Buffer(
		request.body.base64.replace(/^data:image\/\w+;base64,/, ''),
		'base64'
	);

	const params = {
		Body: base64data,
		Bucket: 'image-analyzer-4-cloud',
		Key: request.body.key
	};

	s3.putObject(params, function (err, data) {
		if (err) console.log(err);
		else {
			console.log('Successfully uploaded photo from bucket');
			res.sendStatus(200);
		}
	});
});

app.post('/s3/images', async (req, res) => {
	var params = {
		Bucket: 'image-analyzer-4-cloud',
		Key: req.key
	};
	s3.getObject(params, function (err, data) {
		if (err) console.log(err, err.stack);
		else {
			res.json({
				name: req.key,
				base64:
					'data:image/jpeg;base64,' + Buffer.from(data.Body).toString('base64')
			});
		}
	});
});

app.get('/s3/keys', async (req, res) => {
	res.json(await allBucketKeys(s3, 'image-analyzer-4-cloud'));
});

app.post('/rek/analysis', async (req, res) => {
	console.log(req.body.key);
	let image = await detectFaces('image-analyzer-4-cloud', req.body.key);
	res.json(image[0]);
});

const detectFaces = async (bucket, key) => {
	const params = {
		Image: {
			S3Object: {
				Bucket: bucket,
				Name: key
			}
		},
		Attributes: ['ALL']
	};

	try {
		return (await rekognition.detectFaces(params).promise()).FaceDetails;
	} catch (err) {
		return err;
	}
};

app.listen(port, () => console.log('Running in  http://localhost'));

async function allBucketKeys(s3, bucket) {
	const params = {
		Bucket: bucket
	};

	var keys = [];
	for (;;) {
		var data = await s3.listObjects(params).promise();

		data.Contents.forEach(elem => {
			keys = keys.concat(elem.Key);
		});

		if (!data.IsTruncated) {
			break;
		}
		params.Marker = data.NextMarker;
	}

	return keys;
}
