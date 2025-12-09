/**
 * Lambda function to process payment
 * INTENTIONAL BUG: Memory leak to simulate resource exhaustion
 */

// Global variable that will cause memory leak
let leakyArray = [];
let invocationCount = 0;

exports.handler = async (event) => {
    invocationCount++;
    console.log(`Processing payment - Invocation #${invocationCount}`);
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        // INTENTIONAL BUG: Memory leak - array grows with each invocation
        // This simulates a common bug where objects are not properly garbage collected
        console.warn(`⚠️ Current leaky array size: ${leakyArray.length} items`);

        for (let i = 0; i < 10000; i++) {
            leakyArray.push({
                data: new Array(1000).fill(`leak-${invocationCount}-${i}`),
                timestamp: Date.now(),
                invocation: invocationCount
            });
        }

        console.warn(`⚠️ After leak: ${leakyArray.length} items in memory`);

        // Parse request body
        const body = JSON.parse(event.body || '{}');

        // Validate required fields
        if (!body.orderId || !body.amount || !body.paymentMethod) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing required fields: orderId, amount, paymentMethod'
                })
            };
        }

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate payment processing
        const payment = {
            paymentId: `pay_${Date.now()}`,
            orderId: body.orderId,
            amount: body.amount,
            paymentMethod: body.paymentMethod,
            status: 'completed',
            processedAt: new Date().toISOString()
        };

        console.log('✅ Payment processed successfully:', payment.paymentId);
        console.log(`📊 Memory usage - Leaky array size: ${leakyArray.length}`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Payment processed successfully',
                payment: payment,
                debug: {
                    invocationCount: invocationCount,
                    leakyArraySize: leakyArray.length
                }
            })
        };

    } catch (error) {
        console.error('❌ Error processing payment:', error);

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
