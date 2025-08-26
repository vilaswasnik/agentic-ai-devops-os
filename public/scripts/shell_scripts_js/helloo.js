let isCancelled = false;

function executehellooscript(addMessage) {
    if (isCancelled) {
        addMessage("Operation cancelled.", 'bot');
        isCancelled = false;
        return;
    }
    addMessage("Executing helloo.sh script...", 'bot');
    fetch('/run-shellscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptPath: 'helloo.sh' })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            addMessage(`Error executing script: ${data.error}`, 'bot');
        } else {
            addMessage(`Script executed successfully: ${data.output}`, 'bot');
        }
    })
    .catch(error => {
        console.error('Error executing script:', error);
        addMessage(`Error: ${error.message}`, 'bot');
    });
}
export { executehellooscript };
