# Agentic AI DevOps OS

Agentic AI DevOps OS is an open-source platform for building, managing, and expanding your own AI-powered DevOps knowledge base. It features:

- Knowledge Base AI agent with RAG (Retrieval-Augmented Generation)
- Document upload and embedding generation (PDF, DOC, TXT, HTML, XML, etc.)
- Multi-agent chat interface
- Ansible, shell, and automation integrations
- Modern web UI for desktop and browser

## Features
- Upload documents and generate embeddings for RAG
- Search and retrieve knowledge from your own documents
- Integrate with AWS Bedrock, OpenAI, and other LLMs
- Modular architecture for DevOps, cloud, security, and automation

## Getting Started
1. Clone the repo
2. Install dependencies: `npm install`
3. Set up your `.env` file (see `.env.example`)
4. Start the server: `node server.js`
5. Open `http://localhost:3000/knowledge-neural.html` in your browser

## Document Upload & RAG
- Use the Document Manager (`/document-manager.html`) to upload and process documents
- Supported formats: PDF, DOC, DOCX, TXT, HTML, XML, MD
- Generate embeddings and expand your knowledge base

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License
MIT

## Maintainer
Vilas Wasnik

---

For more details, see the documentation in the repo.

# ucdai
1. integrate openai api.  - DONE
2. create web site domain in codespace pages , its free for pro users for private repo. - need to understadnd as it jsut support index.html not node js
3. craete docker contatiner  - create - need to check ansible scripts execution - 

4. push to kubernetes cluster and try hosting  - pending 
5. further adjustments in the code for removing unwanted code , creating shell script for autoamtion of these these things  - pending 
6. code for Ansible api use ( host ansible awxenvironment and test) ---pending 
7. 
 what are teh other things you can do ?  - list the things 
 
8.devlop knowledgebase and call documents -pending 
--


1. Create our own LLM model for NLP - natural language processing 
2. vector embedding for common documentation
3. vector embedding through URL 
4. add a logic to retrive data from website 
5. add a logic to call ansible API and with pdf and logic , means it should ask to enter server name, path etc what ever required for that playbook to run - 
6. understand agentic and generative
7. login /log off



