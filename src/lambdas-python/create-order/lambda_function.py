"""
Lambda function to create an order
INTENTIONAL BUG: Random timeout to simulate performance issues
"""

import json
import os
import time
import random
from datetime import datetime
from decimal import Decimal
import uuid
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('ORDERS_TABLE_NAME', 'orders')
table = dynamodb.Table(table_name)


def lambda_handler(event, context):
    """
    Create a new order
    INTENTIONAL BUG: 30% chance of timeout (35 second delay)
    """
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # INTENTIONAL BUG: 30% chance of timeout
        if random.random() > 0.7:
            print("⚠️ Simulating slow external API call...")
            time.sleep(35)  # 35 second delay (exceeds Lambda timeout)
        
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Validate required fields
        if not body.get('customerId') or not body.get('items'):
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Missing required fields: customerId, items'
                })
            }
        
        # Calculate total
        total = sum(
            Decimal(str(item['price'])) * item['quantity'] 
            for item in body['items']
        )
        
        # Create order object
        order = {
            'orderId': str(uuid.uuid4()),
            'customerId': body['customerId'],
            'items': body['items'],
            'total': float(total),
            'status': 'pending',
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
        
        # Save to DynamoDB
        table.put_item(Item=order)
        
        print(f"✅ Order created successfully: {order['orderId']}")
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Order created successfully',
                'order': order
            })
        }
        
    except Exception as error:
        print(f"❌ Error creating order: {str(error)}")
        
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
