#!/usr/bin/env node

/**
 * Script to trigger timeout scenario
 * Repeatedly calls Create Order API to trigger random timeouts
 */

const axios = require('axios');

// Get API endpoint from environment or command line
const API_ENDPOINT = process.env.API_ENDPOINT || process.argv[2];

if (!API_ENDPOINT) {
    console.error('❌ Error: API_ENDPOINT not set');
    console.log('Usage: API_ENDPOINT=<your-endpoint> node trigger-timeout.js');
    console.log('   or: node trigger-timeout.js <your-endpoint>');
    process.exit(1);
}

const createOrder = async (attempt) => {
    try {
        console.log(`\n🔄 Attempt ${attempt}: Creating order...`);

        const response = await axios.post(`${API_ENDPOINT}/orders`, {
            customerId: `cust-${Date.now()}`,
            items: [
                { productId: 'prod-1', quantity: 2, price: 29.99 },
                { productId: 'prod-2', quantity: 1, price: 49.99 }
            ]
        }, {
            timeout: 40000 // 40 second timeout
        });

        console.log(`✅ Success: Order created - ${response.data.order.orderId}`);
        return { success: true, orderId: response.data.order.orderId };

    } catch (error) {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.error(`⏱️  TIMEOUT: Request exceeded 40 seconds`);
            return { success: false, error: 'timeout' };
        } else if (error.response) {
            console.error(`❌ Error ${error.response.status}: ${error.response.data.error}`);
            return { success: false, error: error.response.status };
        } else {
            console.error(`❌ Error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
};

const runScenario = async () => {
    console.log('🚀 Starting Timeout Scenario');
    console.log(`📍 API Endpoint: ${API_ENDPOINT}`);
    console.log('⚠️  Expected: ~30% of requests will timeout\n');

    const results = {
        total: 0,
        success: 0,
        timeout: 0,
        error: 0
    };

    // Make 10 requests to trigger timeouts
    for (let i = 1; i <= 10; i++) {
        const result = await createOrder(i);
        results.total++;

        if (result.success) {
            results.success++;
        } else if (result.error === 'timeout') {
            results.timeout++;
        } else {
            results.error++;
        }

        // Wait 2 seconds between requests
        if (i < 10) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log('\n📊 Results Summary:');
    console.log(`   Total Requests: ${results.total}`);
    console.log(`   ✅ Successful: ${results.success}`);
    console.log(`   ⏱️  Timeouts: ${results.timeout}`);
    console.log(`   ❌ Other Errors: ${results.error}`);
    console.log(`   Timeout Rate: ${((results.timeout / results.total) * 100).toFixed(1)}%`);

    if (results.timeout > 0) {
        console.log('\n🎯 SUCCESS: Timeout scenario triggered!');
        console.log('📋 Next Steps:');
        console.log('   1. Check CloudWatch Alarms in AWS Console');
        console.log('   2. Open AWS DevOps Agent web app');
        console.log('   3. Review investigation findings');
    } else {
        console.log('\n⚠️  No timeouts occurred. Try running again.');
    }
};

runScenario().catch(console.error);
