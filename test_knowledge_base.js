#!/usr/bin/env node
/**
 * Knowledge Base Test Script
 * Tests the /rag-knowledgebase endpoint to verify it's working properly
 */

const http = require('http');

const testQuestions = [
    "What are your DevOps skills?",
    "Tell me about your experience with Azure DevOps",
    "What certifications do you have?",
    "What is your educational background?",
    "Tell me about your experience at MetLife"
];

function makeRequest(question) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ question });
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/rag-knowledgebase',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ question, response, status: res.statusCode });
                } catch (error) {
                    reject({ question, error: 'Invalid JSON response', body });
                }
            });
        });

        req.on('error', (error) => {
            reject({ question, error: error.message });
        });

        req.write(data);
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing Knowledge Base AI Agent...\n');
    
    for (const question of testQuestions) {
        try {
            console.log(`📋 Question: "${question}"`);
            const result = await makeRequest(question);
            
            if (result.status === 200 && result.response.answer) {
                console.log(`✅ Status: ${result.status}`);
                console.log(`📝 Answer Preview: ${result.response.answer.substring(0, 100)}...`);
                console.log(`📊 Answer Length: ${result.response.answer.length} characters`);
            } else {
                console.log(`❌ Status: ${result.status}`);
                console.log(`❌ Response: ${JSON.stringify(result.response)}`);
            }
        } catch (error) {
            console.log(`❌ Error: ${error.error || error.message}`);
        }
        
        console.log('─'.repeat(80) + '\n');
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎉 Knowledge Base testing complete!');
}

runTests().catch(console.error);
