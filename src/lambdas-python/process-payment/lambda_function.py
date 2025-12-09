"""
Lambda function to process payment
INTENTIONAL BUG: Memory leak to simulate resource exhaustion
"""

import json
import time
from datetime import datetime

# Global variable that will cause memory leak
leaky_array = []
invocation_count = 0


def lambda_handler(event, context):
    """
    Process a payment
    INTENTIONAL BUG: Memory leak - array grows with each invocation
    """
    global leaky_array, invocation_count
    
    invocation_count += 1
    print(f"Processing payment - Invocation #{invocation_count}")
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # INTENTIONAL BUG: Memory leak
        print(f"⚠️ Current leaky array size: {len(leaky_array)} items")
        
        for i in range(10000):
            leaky_array.append({
                'data': ['leak'] * 1000,
                'timestamp': time.time(),
                'invocation': invocation_count,
                'index': i
            })
        
        print(f"⚠️ After leak: {len(leaky_array)} items in memory")
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        if not all(k in body for k in ['orderId', 'amount', 'paymentMethod']):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Missing required fields: orderId, amount, paymentMethod'
                })
            }
        
        # Simulate payment processing delay
        time.sleep(1)
        
        # Simulate payment processing
        payment = {
            'paymentId': f"pay_{int(time.time() * 1000)}",
            'orderId': body['orderId'],
            'amount': body['amount'],
            'paymentMethod': body['paymentMethod'],
            'status': 'completed',
            'processedAt': datetime.utcnow().isoformat()
        }
        
        print(f"✅ Payment processed successfully: {payment['paymentId']}")
        print(f"📊 Memory usage - Leaky array size: {len(leaky_array)}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Payment processed successfully',
                'payment': payment,
                'debug': {
                    'invocationCount': invocation_count,
                    'leakyArraySize': len(leaky_array)
                }
            })
        }
        
    except Exception as error:
        print(f"❌ Error processing payment: {str(error)}")
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(error)
            })
        }
