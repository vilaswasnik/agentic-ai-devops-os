# System Query Processing Flow

## Overview
Your AI agent system uses a hierarchical approach to handle user queries, prioritizing speed and accuracy by checking multiple data sources in order.

## Processing Flow

### 1. **First Priority: Predefined Answers (`trainingData.json`)**
- **Endpoint**: `/chatbot`
- **Purpose**: Handle common, well-defined queries with instant responses
- **Process**:
  1. Check for exact matches in `predefinedAnswers`
  2. If no exact match, use fuzzy matching with Levenshtein distance
  3. If match found, return immediately (fastest response)

**Example**:
```json
{
  "predefinedAnswers": {
    "execute hello.sh": "Executing hello.sh script...",
    "install ansible": "Installing ansible...",
    "hello": "Hello! How can I assist you today?"
  }
}
```

### 2. **Second Priority: Knowledge Base Embeddings**
- **Endpoint**: `/rag-knowledgebase`
- **Purpose**: Handle complex queries using stored knowledge and context
- **Process**:
  1. Check if embeddings data exists in `knowledgeBase_embeddings.json`
  2. Use similarity search to find relevant content (when AWS is configured)
  3. Fallback to keyword-based matching in predefined knowledge base
  4. Use AWS LLM to generate contextual response

**Knowledge Base Topics**:
- Ansible & Playbooks
- DevOps Certifications
- DevSecOps Practices
- Docker & Containerization
- Kubernetes

### 3. **Third Priority: AWS LLM Fallback**
- **Service**: AWS Bedrock
- **Purpose**: Handle complex queries that don't match predefined content
- **Process**:
  1. Use AWS LLM to suggest best matching predefined command
  2. Generate contextual responses based on knowledge base content
  3. Provide general assistance for unmapped queries

## Current Status

### ✅ **Working Components**:
- Predefined answers processing
- Knowledge base keyword matching
- Hierarchical flow logic
- Fallback mechanisms

### ⚠️ **Pending Implementation**:
- AWS Bedrock integration in `llmService.js`
- Embedding similarity search
- AWS credentials configuration

## Error Handling

The system gracefully degrades when components are unavailable:

1. **AWS LLM Unavailable**: Falls back to direct knowledge base content
2. **Knowledge Base Empty**: Provides general guidance
3. **All Systems Down**: Returns appropriate error messages

## Benefits of This Approach

1. **Speed**: Instant responses for common queries
2. **Accuracy**: Predefined answers ensure consistent responses
3. **Flexibility**: Knowledge base handles complex scenarios
4. **Scalability**: AWS LLM provides unlimited query handling
5. **Reliability**: Multiple fallback layers ensure system availability

## Next Steps

1. Configure AWS credentials in `.env`
2. Install AWS SDK: `npm install @aws-sdk/client-bedrock-runtime`
3. Implement AWS Bedrock in `llmService.js`
4. Test the complete flow with AWS LLM integration
