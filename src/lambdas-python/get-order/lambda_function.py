"""
Lambda function to get order details
INTENTIONAL BUG: Rate limiting after 10 requests
"""

import json
import os
import time
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('ORDERS_TABLE_NAME', 'orders')
table = dynamodb.Table(table_name)

# Global counter for rate limiting (persists across warm starts)
request_count = 0
reset_time = time.time() + 60  # Reset after 1 minute


def lambda_handler(event, context):
    """
    Get order details
    INTENTIONAL BUG: Rate limiting after 10 requests
    """
    global request_count, reset_time
    
    print(f"Received event: {json.dumps(event)}")
    
    try:
        # Reset counter if time window has passed
        if time.time() > reset_time:
            print("🔄 Resetting rate limit counter")
            request_count = 0
            reset_time = time.time() + 60
        
        request_count += 1
        print(f"📊 Request count: {request_count}/10")
        
        # INTENTIONAL BUG: Rate limiting - reject after 10 requests
        if request_count > 10:
            print(f"❌ Rate limit exceeded! Request #{request_count}")
            
            return {
                'statusCode': 429,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Retry-After': '60'
                },
                'body': json.dumps({
                    'error': 'Rate limit exceeded',
                    'message': 'Too many requests. Please try again later.',
                    'retryAfter': 60,
                    'requestCount': request_count
                })
            }
        
        # Get orderId from path parameters
        order_id = event.get('pathParameters', {}).get('orderId')
        
        if not order_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Missing orderId parameter'
                })
            }
        
        # Get order from DynamoDB
        response = table.get_item(Key={'orderId': order_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Order not found',
                    'orderId': order_id
                })
            }
        
        print(f"✅ Order retrieved successfully: {order_id}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'order': response['Item'],
                'debug': {
                    'requestCount': request_count,
                    'remainingRequests': max(0, 10 - request_count)
                }
            }, default=str)  # default=str to handle Decimal types
        }
        
    except Exception as error:
        print(f"❌ Error retrieving order: {str(error)}")
        
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
