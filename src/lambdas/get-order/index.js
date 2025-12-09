const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda function to get order details
 * INTENTIONAL BUG: Rate limiting after 10 requests
 */

// Global counter for rate limiting (persists across warm starts)
let requestCount = 0;
let resetTime = Date.now() + 60000; // Reset after 1 minute

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        // Reset counter if time window has passed
        if (Date.now() > resetTime) {
            console.log('🔄 Resetting rate limit counter');
            requestCount = 0;
            resetTime = Date.now() + 60000;
        }

        requestCount++;
        console.log(`📊 Request count: ${requestCount}/10`);

        // INTENTIONAL BUG: Rate limiting - reject after 10 requests
        if (requestCount > 10) {
            console.error(`❌ Rate limit exceeded! Request #${requestCount}`);

            return {
                statusCode: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Retry-After': '60'
                },
                body: JSON.stringify({
                    error: 'Rate limit exceeded',
                    message: 'Too many requests. Please try again later.',
                    retryAfter: 60,
                    requestCount: requestCount
                })
            };
        }

        // Get orderId from path parameters
        const orderId = event.pathParameters?.orderId;

        if (!orderId) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing orderId parameter'
                })
            };
        }

        // Get order from DynamoDB
        const command = new GetCommand({
            TableName: process.env.ORDERS_TABLE_NAME || 'orders',
            Key: {
                orderId: orderId
            }
        });

        const result = await docClient.send(command);

        if (!result.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Order not found',
                    orderId: orderId
                })
            };
        }

        console.log('✅ Order retrieved successfully:', orderId);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                order: result.Item,
                debug: {
                    requestCount: requestCount,
                    remainingRequests: Math.max(0, 10 - requestCount)
                }
            })
        };

    } catch (error) {
        console.error('❌ Error retrieving order:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
