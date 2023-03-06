//const AWS = require('aws-sdk');
//const dynamodb = AWSXRay.captureAWSClient(new AWS.DynamoDB.DocumentClient());
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const dynamodb = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
  AWSXRay.captureAWSClient(dynamodb);
  //const { id, name, key1, key2, key3 } = event;

  const params = {
    TableName: 'test-table',
    Item: {
      'key1': event.key1,
      'key2': event.key2,
      'key3': event.key3,
      'id': event.id,
      'name': event.name
    }
  };

  try {
    
    const data = await dynamodb.put(params).promise();
    console.log('Successfully wrote data to DynamoDB table.');
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: err };
  }
};
