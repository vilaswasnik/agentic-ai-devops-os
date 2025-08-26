// Natural Language Variation Testing
// Test how well your system handles different ways of saying the same thing

const testVariations = [
    // Different ways to say "hello"
    {
        variations: [
            "hello",
            "hi",
            "hey",
            "hey there",
            "hi there",
            "hello there",
            "good morning",
            "good afternoon"
        ],
        expectedCommand: "hello"
    },
    
    // Different ways to execute hello.sh
    {
        variations: [
            "execute hello.sh",
            "run hello.sh",
            "please run hello.sh",
            "can you execute hello.sh",
            "would you run hello.sh",
            "hey, run hello.sh please",
            "execute the hello script",
            "run hello script"
        ],
        expectedCommand: "execute hello.sh"
    },
    
    // Different ways to install ansible
    {
        variations: [
            "install ansible",
            "please install ansible",
            "can you install ansible",
            "would you install ansible for me",
            "hey, install ansible please",
            "I need ansible installed",
            "install ansible package",
            "setup ansible"
        ],
        expectedCommand: "install ansible"
    },
    
    // Different ways to ask for help
    {
        variations: [
            "help",
            "help me",
            "what can you do",
            "show me commands",
            "what commands do you have",
            "list commands",
            "what can I ask you",
            "what are your capabilities"
        ],
        expectedCommand: "help" // or "what can you do"
    },
    
    // Different ways to run playbooks
    {
        variations: [
            "run ansible test playbook",
            "execute ansible test playbook",
            "please run the ansible test playbook",
            "can you run ansible test playbook",
            "start ansible test playbook",
            "run the test playbook",
            "execute test playbook"
        ],
        expectedCommand: "run ansible test playbook"
    },
    
    // Polite variations
    {
        variations: [
            "thank you",
            "thanks",
            "thank you so much",
            "thanks a lot",
            "much appreciated",
            "cheers",
            "thanks mate"
        ],
        expectedCommand: "thank you"
    }
];

// Test function to check how well the system handles variations
async function testNaturalLanguageVariations() {
    console.log("🧪 Testing Natural Language Variations...\n");
    
    for (const testCase of testVariations) {
        console.log(`📝 Testing variations for: "${testCase.expectedCommand}"`);
        
        for (const variation of testCase.variations) {
            try {
                // Simulate the API call
                const response = await fetch('http://localhost:3000/chatbot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: variation })
                });
                
                const result = await response.json();
                const matched = result.matchedKey === testCase.expectedCommand;
                
                console.log(`  ${matched ? '✅' : '❌'} "${variation}" → ${result.matchedKey || 'none'}`);
            } catch (error) {
                console.log(`  ❌ "${variation}" → Error: ${error.message}`);
            }
        }
        console.log();
    }
}

// Export for testing
module.exports = { testVariations, testNaturalLanguageVariations };

// Example usage:
// testNaturalLanguageVariations();
