# AWS DevOps Agent POC

> **Proof of Concept demonstrating AWS DevOps Agent's autonomous incident investigation capabilities**

[![AWS](https://img.shields.io/badge/AWS-DevOps_Agent-FF9900?logo=amazon-aws)](https://aws.amazon.com/)
[![Python](https://img.shields.io/badge/Python-3.9-3776AB?logo=python)](https://www.python.org/)
[![SAM](https://img.shields.io/badge/AWS-SAM-FF9900)](https://aws.amazon.com/serverless/sam/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 Overview

This POC demonstrates AWS DevOps Agent's ability to autonomously investigate and diagnose production incidents across three common failure scenarios:

1. **Lambda Timeout Errors** - Simulated slow external API calls
2. **Memory Leaks** - Growing memory consumption in serverless functions
3. **Rate Limiting** - Application-level request throttling

**Key Achievement:** DevOps Agent discovered **4 bugs** (3 intentional + 1 unintentional DynamoDB type error), demonstrating real-world value beyond planned test scenarios.

---

## 📊 Results Summary

| Metric | Result |
|--------|--------|
| **Scenarios Tested** | 3/3 ✅ |
| **Bugs Found** | 4 (3 intentional + 1 bonus) |
| **Investigation Accuracy** | 100% |
| **Avg Investigation Time** | 10-15 minutes |
| **Total POC Cost** | ~$0.90 |
| **Time Savings vs Manual** | 80-90% |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   API Gateway                        │
│              (REST API - /prod)                      │
└──────────────┬──────────────┬──────────────┬────────┘
               │              │              │
        ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
        │   Lambda    │ │  Lambda  │ │   Lambda   │
        │ create-order│ │ process- │ │ get-order  │
        │             │ │ payment  │ │            │
        │ Bug:Timeout │ │Bug:Memory│ │Bug:RateLimit│
        └──────┬──────┘ └────┬─────┘ └─────┬──────┘
               │              │              │
               └──────────────┼──────────────┘
                              │
                      ┌───────▼────────┐
                      │   DynamoDB     │
                      │  orders table  │
                      └────────────────┘
```

### AWS Services Used

- **AWS Lambda** - 3 Python functions with intentional bugs
- **Amazon DynamoDB** - Order storage (pay-per-request)
- **Amazon API Gateway** - REST API endpoints
- **Amazon CloudWatch** - Logs, metrics, and alarms
- **AWS X-Ray** - Distributed tracing
- **AWS DevOps Agent** - Autonomous incident investigation

---

## 🚀 Quick Start

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- AWS SAM CLI installed
- Python 3.9+ installed

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd aws-devops-agent-poc

# Build the application
sam build

# Deploy to AWS
sam deploy --guided
```

### Configuration

1. **Get API Endpoint** from CloudFormation outputs
2. **Open Web UI**: `frontend/index.html`
3. **Paste API endpoint** in configuration field
4. **Set up DevOps Agent** in AWS Console

### Testing

```bash
# Open the web UI
open frontend/index.html

# Click scenario buttons:
# - "Trigger Timeout Scenario"
# - "Trigger Memory Leak"
# - "Trigger Rate Limit"
```

---

## 📁 Project Structure

```
aws-devops-agent-poc/
├── src/
│   └── lambdas-python/
│       ├── create-order/           # Timeout bug scenario
│       │   ├── lambda_function.py
│       │   └── requirements.txt
│       ├── process-payment/        # Memory leak scenario
│       │   ├── lambda_function.py
│       │   └── requirements.txt
│       └── get-order/              # Rate limiting scenario
│           ├── lambda_function.py
│           └── requirements.txt
├── frontend/
│   └── index.html                  # Web UI dashboard
├── docs/
│   ├── POC_RESULTS.md             # Investigation findings
│   ├── SETUP_GUIDE.md             # Deployment instructions
│   └── POST_DEPLOYMENT.md         # Configuration guide
├── template.yaml                   # SAM infrastructure template
├── samconfig.toml                 # SAM deployment config
├── package.json                   # NPM scripts
└── README.md                      # This file
```

---

## 🔍 Investigation Results

### Scenario 1: Lambda Timeout Errors ⏱️

**Root Causes Found:**
1. **Intentional:** 35-second blocking call simulating slow API
   - 30% of requests timed out (3/10)
   - Exceeded 30-second Lambda timeout
   
2. **Bonus Discovery:** DynamoDB float type error
   - 70% of requests failed (7/10)
   - Float values instead of required Decimal type
   - **Real bug found beyond planned scenarios!**

### Scenario 2: Memory Leak 💾

**Root Cause Found:**
- Global array growing indefinitely with each invocation
- Deployment timing correlated with symptom onset
- Agent explained ~1 hour delay (function was idle initially)

### Scenario 3: Rate Limiting 🚦

**Root Cause Found:**
- Application-level rate limiting (10 requests/minute)
- Requests 1-10 succeeded, 11-15 returned 429 errors
- Agent distinguished from AWS service-level throttling

---

## 💰 Cost Analysis

### Infrastructure Costs (1 Week)

| Service | Cost |
|---------|------|
| Lambda | $0.00 (Free Tier) |
| DynamoDB | $0.50 |
| API Gateway | $0.00 (Free Tier) |
| CloudWatch Logs | $0.00 (Free Tier) |
| CloudWatch Alarms | $0.40 |
| X-Ray | $0.00 (Free Tier) |
| **Total** | **~$0.90** |

**DevOps Agent:** FREE (Preview period)

### ROI Calculation

**Time Savings:**
- Traditional incident response: 75-180 minutes
- With DevOps Agent: 10-15 minutes
- **Reduction: 80-90%**

**Cost Savings (10 incidents/month):**
- Engineer time saved: 10-27 hours
- At $100/hour: **$1,000-$2,700/month**

---

## 🎬 Demo Flow

1. **Introduction** (2 min) - Architecture and intentional bugs
2. **Scenario 1: Timeout** (5 min) - Highlight bonus bug discovery
3. **Scenario 2: Memory Leak** (4 min) - Deployment correlation
4. **Scenario 3: Rate Limiting** (4 min) - Application vs infrastructure
5. **Wrap-up** (2 min) - ROI and next steps

**Total:** 15-20 minutes

---

## 📚 Documentation

- [**POC Results Summary**](docs/POC_RESULTS.md) - Comprehensive findings
- [**Setup Guide**](docs/SETUP_GUIDE.md) - Initial AWS configuration
- [**Post-Deployment Guide**](docs/POST_DEPLOYMENT.md) - DevOps Agent setup
- [**Task Checklist**](docs/TASK_CHECKLIST.md) - Progress tracking

---

## 🧹 Cleanup

When you're done with the POC:

```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name devops-agent-poc

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name devops-agent-poc
```

**Also delete:**
- DevOps Agent Space in AWS Console
- Any CloudWatch log groups (if not auto-deleted)

---

## 🔐 Security Notes

- ⚠️ API Gateway endpoints have no authentication (for demo purposes only)
- ⚠️ Do not use in production without proper security controls
- ⚠️ Never commit AWS credentials to Git
- ⚠️ Review IAM roles and permissions before deployment

---

## 🤝 Contributing

This is a POC project. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- AWS DevOps Agent team for the preview access
- AWS SAM for serverless deployment
- CloudWatch and X-Ray for observability

---

## 📞 Contact

For questions or feedback about this POC:

- **Project:** AWS DevOps Agent POC
- **Status:** Complete ✅
- **Date:** December 2025

---

## 🎯 Key Takeaways

1. ✅ **AWS DevOps Agent works autonomously** - No manual log analysis needed
2. ✅ **Finds unexpected issues** - Discovered real bug beyond planned scenarios
3. ✅ **Cost-effective** - Total POC cost under $1
4. ✅ **Production-ready** - 100% accuracy across all scenarios
5. ✅ **Clear ROI** - 80-90% time savings vs manual investigation

---

**POC Status:** ✅ Complete & Successful  
**Recommendation:** Ready for pilot deployment in production environments
