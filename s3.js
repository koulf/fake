const AWS = require('aws-sdk');
let s3 = new AWS.S3();

exports.uploadBlob = async function (event, context, callback) {
	let result;
	const body = JSON.parse(event);

	const params = {
		Body: body.base64,
		Bucket: 'image-analyzer-4-cloud',
		Key: body.key
	};

	try {
		result = await s3.putObject(params).promise();
	} catch (err) {
		result = err;
	}

	var res = {
		statusCode: 200,
		body: result,
		headers: { 'content-type': 'application/json' }
	};

	callback(null, res);
};