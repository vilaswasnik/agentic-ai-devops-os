let isCancelled = false;

function executeAnsibleTestPlaybook(addMessage) {
    if (isCancelled) {
        addMessage("Operation cancelled.", 'bot');
        isCancelled = false;
        return;
    }
    addMessage("Executing Ansible test playbook...", 'bot');
    const playbookPath = 'ansiblehelloworld.yml'; // Playbook name
    const inventoryPath = 'inventory'; // Inventory file name

    fetch('/run-playbook', { // Backend endpoint to execute the playbook
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playbookPath, inventoryPath }) // Send playbook and inventory names
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Expect JSON response from the backend
    })
    .then(data => {
        if (data.error) {
            addMessage(`Error: ${data.error}`, 'bot');
        } else {
            addMessage(`Playbook executed successfully: ${data.output}`, 'bot');
        }
    })
    .catch(error => {
        console.error(`Error executing playbook: ${error}`);
        addMessage(`Error: ${error.message}`, 'bot');
    });
}

export { executeAnsibleTestPlaybook };