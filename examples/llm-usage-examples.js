// Example: How to use the AWS LLM service in your project

// 1. Import the unified LLM service
const { askLLM, getProviderInfo } = require('./public/scripts/llmService');

// 2. Basic usage (uses AWS Bedrock)
async function simpleChatExample() {
    try {
        const response = await askLLM("What is JavaScript?");
        console.log("AI Response:", response);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// 3. Provider information
async function providerInfoExample() {
    try {
        const info = getProviderInfo();
        console.log("Current provider:", info);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// 4. Advanced usage with options
async function advancedExample() {
    try {
        const response = await askLLM("Write a Python function to sort a list", {
            temperature: 0.3,  // Lower for more focused code
            max_tokens: 300
        });
        
        console.log("Code response:", response);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// 5. Check current provider info
async function checkProviderInfo() {
    const info = getProviderInfo();
    console.log("Current provider:", info);
    // Output: { provider: 'aws', model: 'aws-bedrock', isLocal: false }
}

// 6. Integration in Express routes (example)
const express = require('express');
const app = express();

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const response = await askLLM(message);
        
        res.json({ 
            success: true, 
            response,
            provider: getProviderInfo()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// 7. Frontend integration (example)
/*
// In your frontend JavaScript:
async function sendMessage(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('AI Response:', data.response);
            console.log('Used provider:', data.provider.provider);
        } else {
            console.error('Error:', data.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

// Usage:
sendMessage("Hello, AI!");  // Use AWS Bedrock
*/

// Run examples (uncomment to test)
// simpleChatExample();
// providerInfoExample();
// advancedExample();
// checkProviderInfo();

module.exports = {
    simpleChatExample,
    providerInfoExample,
    advancedExample,
    checkProviderInfo
};
