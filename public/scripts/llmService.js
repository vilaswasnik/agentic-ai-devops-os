// llmService.js - AWS Bedrock LLM service
const { BedrockRuntimeClient, InvokeModelCommand, InvokeModelWithResponseStreamCommand } = require('@aws-sdk/client-bedrock-runtime');
require('dotenv').config();

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'aws';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Initialize AWS Bedrock client
let bedrockClient = null; // cached singleton

function initializeBedrockClient() {
  if (bedrockClient) return bedrockClient;
  // Guard: credentials must exist
  if (!isAwsConfigured()) {
    throw new Error('AWS credentials not configured');
  }
  try {
    bedrockClient = new BedrockRuntimeClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
    console.log('AWS Bedrock client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize AWS Bedrock client:', error.message);
    throw error;
  }
  return bedrockClient;
}

function isAwsConfigured(){
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

// AWS Bedrock LLM integration
async function askLLM(prompt, options = {}) {
  try {
    if (!isAwsConfigured()) {
      throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
    }
    const client = initializeBedrockClient();
    
    // Use Claude 3 Haiku as default model (best for your sentence variations use case)
    const modelId = options.model || 'anthropic.claude-3-haiku-20240307-v1:0';
    
    // Prepare the request payload for Claude 3
    const requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: options.max_tokens || 400,
      temperature: options.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: [ { type: 'text', text: prompt } ]
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });

    console.log(`Calling AWS Bedrock with model: ${modelId}`);
    const response = await client.send(command);
    
    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    if (responseBody.content && responseBody.content.length > 0) {
      return responseBody.content[0].text.trim();
    } else {
      throw new Error('No content in AWS Bedrock response');
    }

  } catch (error) {
    console.error('AWS Bedrock error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('credentials')) {
      throw new Error('AWS credentials not configured properly. Please check your .env file.');
    } else if (error.message.includes('AccessDenied')) {
      throw new Error('AWS access denied. Please check your IAM permissions for Bedrock.');
    } else if (error.message.includes('ModelNotFound')) {
      throw new Error('AWS Bedrock model not found. Please check if the model is available in your region.');
    } else {
      throw new Error(`AWS Bedrock service error: ${error.message}`);
    }
  }
}

// Function to get current provider info
function getProviderInfo() {
  return {
    provider: LLM_PROVIDER,
    model: 'anthropic.claude-3-haiku-20240307-v1:0',
    region: AWS_REGION,
    isLocal: false
  };
}

// Function to switch provider dynamically (for future extensibility)
function switchProvider(newProvider) {
  if (newProvider !== 'aws') {
    throw new Error('Only AWS provider is currently supported');
  }
  process.env.LLM_PROVIDER = newProvider;
  return getProviderInfo();
}

// Health check function
async function checkAWSHealth() {
  try {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return false;
    }
    
    // Try a simple test call
    await askLLM('Hello', { max_tokens: 10 });
    return true;
  } catch (error) {
    console.error('AWS health check failed:', error.message);
    return false;
  }
}

module.exports = { 
  askLLM, 
  getProviderInfo, 
  switchProvider,
  checkAWSHealth,
  askLLMStream,
  isAwsConfigured
};

// Streaming API using AWS Bedrock event stream (Anthropic Claude 3 messages)
async function askLLMStream(prompt, options = {}, onToken) {
  if (!isAwsConfigured()) {
    throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
  }

  const client = initializeBedrockClient();
  const modelId = options.model || 'anthropic.claude-3-haiku-20240307-v1:0';
  const requestBody = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: options.max_tokens || 400,
    temperature: options.temperature || 0.7,
    messages: [ { role: 'user', content: [ { type: 'text', text: prompt } ] } ]
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody)
  });

  const decoder = new TextDecoder();
  const response = await client.send(command);

  // Aggregate (useful if caller wants final reconstruction later)
  for await (const event of response.body) {
    if (!event.chunk) continue;
    let json;
    try { json = JSON.parse(decoder.decode(event.chunk.bytes)); } catch { continue; }
    // content deltas
    if (json.type === 'content_block_delta' && json.delta && json.delta.type === 'text_delta') {
      const text = json.delta.text || '';
      if (text && onToken) onToken(text);
    }
  }
}
