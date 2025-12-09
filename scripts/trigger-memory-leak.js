#!/usr/bin/env node

/**
 * Script to trigger memory leak scenario
 * Repeatedly calls Process Payment API to cause memory accumulation
 */

const axios = require('axios');

const API_ENDPOINT = process.env.API_ENDPOINT || process.argv[2];

if (!API_ENDPOINT) {
    console.error('❌ Error: API_ENDPOINT not set');
    console.log('Usage: API_ENDPOINT=<your-endpoint> node trigger-memory-leak.js');
    process.exit(1);
}

const processPayment = async (attempt) => {
    try {
        console.log(`\n🔄 Attempt ${attempt}: Processing payment...`);

        const response = await axios.post(`${API_ENDPOINT}/payments`, {
            orderId: `order-${Date.now()}`,
            amount: 109.97,
            paymentMethod: 'credit_card'
        });

        const debug = response.data.debug;
        console.log(`✅ Payment processed`);
        console.log(`   Invocation: ${debug.invocationCount}`);
        console.log(`   Leaky Array Size: ${debug.leakyArraySize.toLocaleString()} items`);

        return { success: true, leakyArraySize: debug.leakyArraySize };

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        return { success: false };
    }
};

const runScenario = async () => {
    console.log('🚀 Starting Memory Leak Scenario');
    console.log(`📍 API Endpoint: ${API_ENDPOINT}`);
    console.log('⚠️  Expected: Memory usage will grow with each invocation\n');

    const results = [];

    // Make 20 requests to accumulate memory
    for (let i = 1; i <= 20; i++) {
        const result = await processPayment(i);
        if (result.success) {
            results.push(result.leakyArraySize);
        }

        // Wait 1 second between requests
        if (i < 20) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n📊 Memory Growth Analysis:');
    console.log(`   Initial Size: ${results[0]?.toLocaleString() || 'N/A'} items`);
    console.log(`   Final Size: ${results[results.length - 1]?.toLocaleString() || 'N/A'} items`);
    console.log(`   Growth: ${((results[results.length - 1] - results[0]) / 1000).toFixed(0)}K items`);

    console.log('\n🎯 SUCCESS: Memory leak scenario triggered!');
    console.log('📋 Next Steps:');
    console.log('   1. Check Lambda memory metrics in CloudWatch');
    console.log('   2. Open AWS DevOps Agent web app');
    console.log('   3. Review memory usage analysis');
};

runScenario().catch(console.error);
