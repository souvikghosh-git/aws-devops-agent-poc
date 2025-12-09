const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda function to create an order
 * INTENTIONAL BUG: Random timeout to simulate performance issues
 */
exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        // INTENTIONAL BUG: 30% chance of timeout (simulates slow external API call)
        if (Math.random() > 0.7) {
            console.warn('⚠️ Simulating slow external API call...');
            await new Promise(resolve => setTimeout(resolve, 35000)); // 35 second delay (exceeds Lambda timeout)
        }

        // Parse request body
        const body = JSON.parse(event.body || '{}');

        // Validate required fields
        if (!body.customerId || !body.items || !Array.isArray(body.items)) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing required fields: customerId, items'
                })
            };
        }

        // Calculate total
        const total = body.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Create order object
        const order = {
            orderId: uuidv4(),
            customerId: body.customerId,
            items: body.items,
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Save to DynamoDB
        const command = new PutCommand({
            TableName: process.env.ORDERS_TABLE_NAME || 'orders',
            Item: order
        });

        await docClient.send(command);

        console.log('✅ Order created successfully:', order.orderId);

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Order created successfully',
                order: order
            })
        };

    } catch (error) {
        console.error('❌ Error creating order:', error);

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
