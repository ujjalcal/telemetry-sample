const AWS = require('aws-sdk');

const { AwsSdkInstrumentation } = require('@opentelemetry/instrumentation-aws-sdk');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { AwsLambdaInstrumentation } = require('@opentelemetry/instrumentation-aws-lambda');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

registerInstrumentations({
  instrumentations: [
    new AwsLambdaInstrumentation(),
    new HttpInstrumentation(),
    new AwsSdkInstrumentation(),
  ],
});


const dynamodb = new AWS.DynamoDB.DocumentClient();
new AwsSdkInstrumentation().enableModule(AWS, [ 'DynamoDB' ]);


const { context } = require('@opentelemetry/api');
exports.handler = async (event) => {
  const span = context.active().startSpan('put-dynamodb-item');
  span.setAttribute('aws.region', process.env.AWS_REGION);
  span.setAttribute('aws.accountId', context.invokedFunctionArn.split(':')[4]);
  span.setAttribute('aws.lambda.arn', context.invokedFunctionArn);
  span.setAttribute('aws.lambda.name', context.functionName);

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
    span.setStatus({ code: 200 });
    span.end();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.log(err);
    span.setStatus({ code: 500, message: err.message });
    span.end();
    return { statusCode: 500, body: err };
  }
};
