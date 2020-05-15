const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const AWS = require("aws-sdk");
const bodyParser = require('body-parser');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();
const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

port = process.env.PORT || 80;



app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
app.use(bodyParser.text({ limit: '200mb' }));


app.use(express.static(__dirname + '/public'));


// Routes

app.put('/user/register', (req, res) => {
	let item = {};

	Object.keys(req.body).forEach((key) => {
		if (key == 'correo')
			item.id = {
				S: req.body[key]
			};
		else if (key == 'password')
			item.password = {
				S: bcrypt.hashSync(req.body[key], 8)
			};
		else
			item[key] = {
				S: req.body[key]
			}
	})

	let params = {
		Item: item,
		ReturnConsumedCapacity: "TOTAL",
		TableName: "ImageAnalyzer",
		ConditionExpression: "attribute_not_exists(id)"
	};

	dynamodb.putItem(params, (err, data) => {
		if (err) {
			res.status(401).send();
			console.log(err);
		}
		else
			res.status(201).send();
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
			if (data.Items.length > 0)
				if (bcrypt.compare(req.body.password, data.Items[0].password.S))
					res.status(201).send(req.body.usuario);
				else
					res.status(401).send();
			else
				res.status(400).send();
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
	for (; ;) {
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
