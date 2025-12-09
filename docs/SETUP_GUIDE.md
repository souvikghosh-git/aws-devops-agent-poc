# AWS DevOps Agent POC - Complete Setup Guide

## 📋 Prerequisites Checklist

Before we begin, make sure you have:
- [ ] AWS Account (free tier eligible)
- [ ] Terminal/Command Line access
- [ ] Internet connection
- [ ] Admin/sudo access on your Mac

---

## Step 1: Install AWS CLI

### Check if AWS CLI is already installed

```bash
aws --version
```

If you see a version number, skip to Step 2. Otherwise, install it:

### Install AWS CLI on Mac

```bash
# Using Homebrew (recommended)
brew install awscli

# Or download the installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### Verify installation

```bash
aws --version
# Should show: aws-cli/2.x.x Python/3.x.x Darwin/x.x.x
```

---

## Step 2: Configure AWS Credentials

### 2.1 Create IAM User (if you don't have one)

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **IAM** → **Users** → **Create user**
3. Username: `devops-poc-user`
4. Enable **Programmatic access**
5. Attach policies:
   - `AdministratorAccess` (for POC only - use restricted permissions in production)
6. Click **Create user**
7. **IMPORTANT**: Save the Access Key ID and Secret Access Key

### 2.2 Configure AWS CLI

```bash
aws configure
```

You'll be prompted for:

```
AWS Access Key ID [None]: <paste your access key>
AWS Secret Access Key [None]: <paste your secret key>
Default region name [None]: us-east-1
Default output format [None]: json
```

### 2.3 Verify Configuration

```bash
# Test AWS credentials
aws sts get-caller-identity

# Should return your account details
```

---

## Step 3: Install AWS SAM CLI

### Check if SAM CLI is installed

```bash
sam --version
```

### Install SAM CLI on Mac

```bash
# Using Homebrew (recommended)
brew tap aws/tap
brew install aws-sam-cli

# Verify installation
sam --version
# Should show: SAM CLI, version 1.x.x
```

---

## Step 4: Navigate to Project Directory

```bash
cd ~/aws-devops-agent-poc
```

---

## Step 5: Build the Application

```bash
# Build all Lambda functions
sam build

# You should see:
# Build Succeeded
# Built Artifacts  : .aws-sam/build
```

**What this does:**
- Packages Python Lambda functions
- Resolves dependencies from requirements.txt
- Prepares deployment artifacts

---

## Step 6: Deploy to AWS (Guided)

```bash
sam deploy --guided
```

### You'll be prompted with these questions:

```
Stack Name [sam-app]: devops-agent-poc
AWS Region [us-east-1]: us-east-1
#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
Confirm changes before deploy [y/N]: y
#SAM needs permission to be able to create roles to connect to the resources in your template
Allow SAM CLI IAM role creation [Y/n]: Y
#Preserves the state of previously provisioned resources when an operation fails
Disable rollback [y/N]: N
CreateOrderFunction has no authentication. Is this okay? [y/N]: y
ProcessPaymentFunction has no authentication. Is this okay? [y/N]: y
GetOrderFunction has no authentication. Is this okay? [y/N]: y
Save arguments to configuration file [Y/n]: Y
SAM configuration file [samconfig.toml]: samconfig.toml
SAM configuration environment [default]: default
```

**Answer 'Y' to all prompts** (this is a POC, so we're okay with public APIs)

### Deployment Process

The deployment will:
1. Create CloudFormation changeset
2. Show you all resources to be created
3. Ask for final confirmation
4. Deploy all resources (~5-10 minutes)

**Resources Created:**
- ✅ 3 Lambda functions
- ✅ DynamoDB table
- ✅ API Gateway
- ✅ CloudWatch alarms
- ✅ CloudWatch log groups
- ✅ IAM roles

---

## Step 7: Get Your API Endpoint

After successful deployment, you'll see outputs:

```bash
# View stack outputs
sam list stack-outputs --stack-name devops-agent-poc
```

**Copy the `OrderProcessingAPIEndpoint` value** - you'll need this for the web UI!

Example:
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

---

## Step 8: Open the Web UI

```bash
# Open the dashboard in your browser
open frontend/index.html
```

Or manually:
1. Navigate to `aws-devops-agent-poc/frontend/`
2. Double-click `index.html`

---

## Step 9: Configure Web UI

1. In the web UI, find the **Configuration** section
2. Paste your API endpoint into the input field
3. The endpoint will be saved automatically

---

## Step 10: Test the Deployment

### Quick Test - Create an Order

```bash
# Replace with your actual API endpoint
export API_ENDPOINT="https://your-api-id.execute-api.us-east-1.amazonaws.com/prod"

# Test create order
curl -X POST $API_ENDPOINT/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test-123",
    "items": [
      {"productId": "prod-1", "quantity": 1, "price": 29.99}
    ]
  }'
```

**Expected Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "orderId": "uuid-here",
    "customerId": "test-123",
    ...
  }
}
```

---

## Step 11: Set Up AWS DevOps Agent

### 11.1 Navigate to DevOps Agent Console

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Search for "DevOps Agent" in the services search
3. Click on **AWS DevOps Agent**

### 11.2 Create Agent Space

1. Click **Create Agent Space**
2. Fill in details:
   - **Name**: `order-processing-poc`
   - **Description**: `POC for incident response demo`
3. **Enable web app access**: ✅ Check this box
4. Click **Create**

### 11.3 Configure IAM Roles

The console will auto-generate IAM roles:
- Accept the default role names
- Click **Create roles**

### 11.4 Configure Integrations

**CloudWatch** (Auto-detected):
- ✅ Should automatically detect your Lambda functions
- ✅ Should detect CloudWatch alarms

**X-Ray** (Auto-detected):
- ✅ Should detect X-Ray traces

**GitHub** (Optional):
- If you want to link your code repository
- Add GitHub URL
- Configure webhook

**Slack** (Optional):
- Add Slack webhook URL for notifications
- Test the integration

### 11.5 Set Investigation Triggers

1. Go to **Settings** → **Investigation Triggers**
2. Enable **Auto-start on CloudWatch alarms**: ✅
3. Select alarms:
   - `devops-poc-create-order-timeout`
   - `devops-poc-create-order-errors`
   - `devops-poc-process-payment-memory`
   - `devops-poc-api-4xx-errors`
4. Save configuration

---

## Step 12: Trigger Your First Incident

### Using the Web UI:

1. Open `frontend/index.html` in your browser
2. Click **"Trigger Timeout Scenario"**
3. Watch the logs in real-time
4. Wait for CloudWatch alarm to fire (~1-2 minutes)

### Monitor in AWS Console:

1. **CloudWatch Alarms**: Watch for alarm state changes
2. **Lambda Logs**: See function execution logs
3. **DevOps Agent**: View investigation progress

---

## Step 13: View Investigation Results

### In AWS DevOps Agent Web App:

1. Go to AWS Console → DevOps Agent
2. Click on your Agent Space: `order-processing-poc`
3. Click **Open web app**
4. You'll see:
   - Active investigations
   - Root cause analysis
   - Recommendations
   - Timeline of events

---

## 🎯 Quick Command Reference

```bash
# Build
sam build

# Deploy (first time)
sam deploy --guided

# Deploy (subsequent times)
sam build && sam deploy

# View logs
sam logs -n CreateOrderFunction --tail
sam logs -n ProcessPaymentFunction --tail
sam logs -n GetOrderFunction --tail

# View stack outputs
sam list stack-outputs --stack-name devops-agent-poc

# Delete everything
sam delete --stack-name devops-agent-poc
```

---

## 🐛 Troubleshooting

### Issue: "AWS credentials not configured"
```bash
aws configure
# Re-enter your credentials
```

### Issue: "SAM CLI not found"
```bash
brew install aws-sam-cli
```

### Issue: "Deployment failed - insufficient permissions"
- Ensure your IAM user has `AdministratorAccess` policy
- Check AWS credentials: `aws sts get-caller-identity`

### Issue: "API returns CORS errors"
- The SAM template includes CORS configuration
- If issues persist, check API Gateway CORS settings in AWS Console

### Issue: "Lambda timeout"
- This is expected! It's an intentional bug
- Check CloudWatch alarms - they should fire
- View DevOps Agent investigation

### Issue: "Can't access DevOps Agent"
- Ensure you're in `us-east-1` region
- DevOps Agent is only available in preview in certain regions

---

## 📊 Cost Monitoring

### View Current Costs:

1. Go to AWS Console → Billing Dashboard
2. Click **Cost Explorer**
3. Filter by:
   - Service: Lambda, DynamoDB, API Gateway
   - Tag: Project = AWS-DevOps-Agent-POC

### Expected Costs (per week):
- Lambda: $0 (free tier)
- API Gateway: $0 (free tier)
- DynamoDB: ~$1-2
- CloudWatch: $0 (free tier)
- **Total**: ~$1-2

---

## 🧹 Cleanup (When Done)

```bash
# Delete the entire stack
sam delete --stack-name devops-agent-poc

# Confirm deletion when prompted
```

This will remove:
- All Lambda functions
- DynamoDB table (and all data)
- API Gateway
- CloudWatch alarms and logs
- IAM roles

**Note**: You'll need to manually delete the DevOps Agent Space from the console.

---

## ✅ Success Checklist

- [ ] AWS CLI installed and configured
- [ ] SAM CLI installed
- [ ] Application built successfully
- [ ] Application deployed to AWS
- [ ] API endpoint obtained
- [ ] Web UI configured with endpoint
- [ ] Test request successful
- [ ] DevOps Agent Space created
- [ ] CloudWatch alarms configured
- [ ] First incident triggered
- [ ] Investigation visible in DevOps Agent

---

## 🎓 Next Steps

1. **Run all 3 scenarios** from the web UI
2. **Review investigations** in DevOps Agent
3. **Document findings** for your demo
4. **Create presentation** slides
5. **Record demo video**

---

## 📞 Need Help?

If you encounter issues:
1. Check CloudWatch Logs for error details
2. Verify IAM permissions
3. Ensure you're in the correct AWS region
4. Review SAM build output for errors

---

**Ready to deploy?** Start with Step 1 and work your way through! 🚀
