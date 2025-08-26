# AWS Access Key Setup Guide

This guide explains how to configure AWS access keys for your application.

## Security Best Practices

**IMPORTANT**: Never commit real AWS credentials to version control!

## Environment Variables Setup

Create a `.env` file in your project root (add `.env` to `.gitignore`):

```bash
# Before (these should be in .env file, not committed):
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# After (example - use your actual values):
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY_HERE
```

## How to Get AWS Credentials

1. Log in to AWS Console
2. Go to IAM → Users
3. Select your user
4. Go to Security Credentials tab
5. Create Access Key
6. Download and save securely

## Usage in Code

```javascript
// Use environment variables
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
```

Remember to add `.env` to your `.gitignore` file!
