let isCancelled = false;

function executehelloscript(addMessage) {
    if (isCancelled) {
        addMessage("Operation cancelled.", 'bot');
        isCancelled = false;
        return;
    }
    addMessage("Executing hello.sh script...", 'bot');
    fetch('/run-shellscript', { // Use the correct backend endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptPath: 'hello.sh' }) // Pass only the script name
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Expect JSON response from the backend
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
export { executehelloscript };
