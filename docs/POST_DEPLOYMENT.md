# AWS DevOps Agent - Post-Deployment Setup Guide

## ✅ Deployment Complete!

Your infrastructure is now live in AWS! Let's configure everything and start testing.

---

## Step 1: Get Your API Endpoint

### Option A: From AWS Console

1. Go to https://console.aws.amazon.com/
2. Navigate to **CloudFormation**
3. Click on stack: `devops-agent-poc`
4. Click the **Outputs** tab
5. Find `OrderProcessingAPIEndpoint`
6. **Copy the URL** (looks like: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod`)

### Option B: From Terminal

```bash
aws cloudformation describe-stacks \
  --stack-name devops-agent-poc \
  --query 'Stacks[0].Outputs[?OutputKey==`OrderProcessingAPIEndpoint`].OutputValue' \
  --output text
```

**Save this URL** - you'll need it for the web UI!

---

## Step 2: Configure Web UI

1. **Open the web UI:**
   ```bash
   open ~/aws-devops-agent-poc/frontend/index.html
   ```

2. **Paste your API endpoint** in the configuration field

3. The endpoint will be saved automatically

---

## Step 3: Test Your Deployment (Quick Smoke Test)

Let's verify everything works before setting up DevOps Agent:

### Test 1: Create an Order

In the web UI, click **"Trigger Timeout Scenario"**

You should see:
- ✅ Some requests succeed
- ⏱️ Some requests timeout (this is expected!)
- 📊 Statistics updating in real-time

---

## Step 4: Set Up AWS DevOps Agent

### 4.1 Navigate to DevOps Agent Console

1. Go to AWS Console: https://console.aws.amazon.com/
2. **Search for:** `DevOps Agent` in the top search bar
3. Click **AWS DevOps Agent**

> ⚠️ **Important**: Make sure you're in the **us-east-1** region (top right corner)

### 4.2 Create Agent Space

1. Click **Create Agent Space**

2. **Fill in details:**
   - **Name**: `order-processing-poc`
   - **Description**: `POC for incident response demo with intentional bugs`

3. **Enable web app access**: ✅ Check this box

4. Click **Create**

### 4.3 Configure IAM Roles

The console will auto-generate IAM roles:

1. Accept the default role names
2. Click **Create roles**
3. Wait for role creation (~30 seconds)

### 4.4 Configure Resource Discovery

AWS DevOps Agent will automatically discover your resources:

**Expected Resources:**
- ✅ 3 Lambda functions:
  - `devops-poc-create-order`
  - `devops-poc-process-payment`
  - `devops-poc-get-order`
- ✅ 4 CloudWatch alarms
- ✅ DynamoDB table: `orders`
- ✅ API Gateway: `devops-poc-order-api`

**If resources don't appear:**
1. Click **Refresh topology**
2. Wait 1-2 minutes
3. Resources should auto-populate

### 4.5 Configure Investigation Triggers

1. Go to **Settings** → **Investigation Triggers**

2. **Enable auto-start on CloudWatch alarms**: ✅

3. **Select alarms:**
   - ✅ `devops-poc-create-order-timeout`
   - ✅ `devops-poc-create-order-errors`
   - ✅ `devops-poc-process-payment-memory`
   - ✅ `devops-poc-api-4xx-errors`

4. Click **Save**

### 4.6 Configure Integrations (Optional)

**CloudWatch** (Auto-configured):
- ✅ Already integrated

**X-Ray** (Auto-configured):
- ✅ Already integrated

**Slack** (Optional):
1. Add Slack webhook URL
2. Test the integration
3. Save

**GitHub** (Optional):
1. Add repository URL
2. Configure webhook
3. Save

---

## Step 5: Trigger Your First Incident

### Using the Web UI:

1. **Open** `frontend/index.html` (if not already open)

2. **Click** "Trigger Timeout Scenario"

3. **Watch the logs** - you should see:
   - ✅ Some successful requests
   - ⏱️ Some timeout errors (30% chance)
   - 📊 Statistics updating

4. **Wait 1-2 minutes** for CloudWatch alarm to fire

### Monitor in AWS Console:

**CloudWatch Alarms:**
1. Go to CloudWatch → Alarms
2. Watch for `devops-poc-create-order-timeout` to change to **ALARM** state

**Lambda Logs:**
1. Go to CloudWatch → Log groups
2. Click `/aws/lambda/devops-poc-create-order`
3. View recent log streams

---

## Step 6: View Investigation in DevOps Agent

### Access DevOps Agent Web App:

1. Go to AWS Console → DevOps Agent
2. Click on your Agent Space: `order-processing-poc`
3. Click **Open web app** (top right)

### What You'll See:

**Investigation Dashboard:**
- 🔍 Active investigations
- 📊 Timeline of events
- 🎯 Root cause analysis
- 💡 Recommendations

**Investigation Details:**
- Which alarm triggered
- Affected Lambda function
- Log analysis
- Metric correlation
- Code changes (if GitHub connected)
- Suggested fixes

---

## Step 7: Test All Scenarios

### Scenario 1: Timeout Bug ✅ (Already tested)

**What it demonstrates:**
- Random 35-second delays
- Lambda timeout detection
- Log pattern analysis

### Scenario 2: Memory Leak

1. Click **"Trigger Memory Leak"** in web UI
2. Watch memory grow with each invocation
3. Check DevOps Agent for memory analysis

**What it demonstrates:**
- Memory pressure detection
- Performance degradation
- Resource usage patterns

### Scenario 3: Rate Limiting

1. Click **"Trigger Rate Limit"** in web UI
2. Watch 429 errors after 10 requests
3. Check DevOps Agent for rate limit analysis

**What it demonstrates:**
- API error pattern detection
- 429 error correlation
- Rate limiting recommendations

---

## Step 8: Review Findings

### In DevOps Agent Web App:

**For Each Investigation:**

1. **Root Cause:**
   - What triggered the incident
   - Which component failed
   - Timeline of events

2. **Analysis:**
   - Log excerpts
   - Metric graphs
   - Code references

3. **Recommendations:**
   - Immediate mitigations
   - Long-term fixes
   - Infrastructure improvements

---

## 📊 Quick Reference

### Web UI URL:
```
file://~/aws-devops-agent-poc/frontend/index.html
```

### AWS Console Links:
- **CloudFormation Stack**: https://console.aws.amazon.com/cloudformation/
- **Lambda Functions**: https://console.aws.amazon.com/lambda/
- **CloudWatch Alarms**: https://console.aws.amazon.com/cloudwatch/
- **DevOps Agent**: https://console.aws.amazon.com/devops-agent/

### Stack Name:
```
devops-agent-poc
```

---

## 🐛 Troubleshooting

### Issue: "Can't find DevOps Agent in console"
- Ensure you're in **us-east-1** region
- DevOps Agent is preview - may not be available in all accounts
- Check AWS service health dashboard

### Issue: "No resources showing in Agent Space"
- Click **Refresh topology**
- Wait 1-2 minutes for discovery
- Check IAM role permissions

### Issue: "Alarms not firing"
- Trigger more requests (timeouts are random 30%)
- Check CloudWatch alarm configuration
- Verify alarm thresholds

### Issue: "API returns errors"
- Verify API endpoint URL is correct
- Check Lambda function logs in CloudWatch
- Ensure DynamoDB table exists

---

## 🧹 Cleanup (When Done)

### Delete All Resources:

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name devops-agent-poc

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name devops-agent-poc
```

### Delete DevOps Agent Space:

1. Go to AWS Console → DevOps Agent
2. Select `order-processing-poc`
3. Click **Delete**
4. Confirm deletion

---

## ✅ Success Checklist

- [ ] Got API endpoint from CloudFormation outputs
- [ ] Configured web UI with API endpoint
- [ ] Tested API with timeout scenario
- [ ] Created DevOps Agent Space
- [ ] Configured IAM roles
- [ ] Resources auto-discovered
- [ ] Investigation triggers configured
- [ ] First incident triggered
- [ ] CloudWatch alarm fired
- [ ] Investigation visible in DevOps Agent
- [ ] Reviewed root cause analysis
- [ ] Tested all 3 scenarios
- [ ] Documented findings

---

## 🎯 Next Steps

1. **Run all 3 scenarios** from web UI
2. **Review each investigation** in DevOps Agent
3. **Document findings** for your demo
4. **Create presentation** slides
5. **Record demo video** (optional)
6. **Clean up resources** when done

---

**Congratulations! Your AWS DevOps Agent POC is fully operational!** 🎉
