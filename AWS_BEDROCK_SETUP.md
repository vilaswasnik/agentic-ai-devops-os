# AWS Bedrock Setup Instructions

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI** (optional but recommended): Install from [here](https://aws.amazon.com/cli/)

## Step 1: Create AWS IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Add user"
3. Choose "Programmatic access"
4. Attach policy: `BedrockFullAccess` (or create custom policy)

### Custom Policy (Recommended):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:ListFoundationModels"
            ],
            "Resource": "*"
        }
    ]
}
```

## Step 2: Get Your Credentials

After creating the user, AWS will provide:
- **Access Key ID**
- **Secret Access Key**

## Step 3: Enable Bedrock Models

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" 
3. Request access to **Claude 3 Haiku** model
4. Wait for approval (usually instant for Haiku)

## Step 4: Configure Environment

Update your `.env` file:
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...your-key...
AWS_SECRET_ACCESS_KEY=your-secret-key-here
LLM_PROVIDER=aws
```

## Step 5: Test the Setup

1. Start your server: `npm start`
2. Check status: `GET http://localhost:3000/api/llm/status`
3. Test chat functionality in your application

## Regional Availability

Claude 3 Haiku is available in these regions:
- `us-east-1` (N. Virginia) - **Recommended**
- `us-west-2` (Oregon)
- `eu-central-1` (Frankfurt)

## Cost Information

Claude 3 Haiku pricing (as of 2024):
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens

Very cost-effective for your use case!

## Troubleshooting

### Common Issues:

1. **"Credentials not configured"**
   - Check `.env` file has correct AWS keys
   - Restart server after updating `.env`

2. **"Access Denied"**
   - Verify IAM permissions include Bedrock access
   - Check if user has the correct policy attached

3. **"Model not found"**
   - Ensure Claude 3 Haiku access is enabled in Bedrock console
   - Try different AWS region

4. **"Region not supported"**
   - Change `AWS_REGION` to `us-east-1` in `.env`

### Test Commands:

```bash
# Check if credentials work
aws bedrock list-foundation-models --region us-east-1

# Test API endpoint
curl http://localhost:3000/api/llm/status
```

## Security Best Practices

1. **Never commit `.env` to git**
2. **Use least privilege IAM policies**
3. **Rotate access keys regularly**
4. **Consider using IAM roles instead of keys in production**

Your system is now ready to use AWS Bedrock with Claude 3 Haiku!
