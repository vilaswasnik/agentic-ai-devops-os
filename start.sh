#!/bin/bash

echo "=== Starting Agentic AI DevOps OS Container ==="
echo "Timestamp: $(date)"

# Set up Ansible environment
echo "=== Setting up Ansible Environment ==="
export ANSIBLE_HOST_KEY_CHECKING=False
export ANSIBLE_STDOUT_CALLBACK=yaml

# Check if ansible directory exists and set up inventory
if [ -d "/app/ansible" ]; then
    echo "✓ Ansible directory found"
    cd /app/ansible
    
    # Make sure ansible.sh is executable
    if [ -f "ansible.sh" ]; then
        chmod +x ansible.sh
        echo "✓ Made ansible.sh executable"
    fi
    
    # Check if inventory file exists
    if [ -f "inventory" ]; then
        echo "✓ Ansible inventory found"
    else
        echo "⚠ Creating default inventory file"
        echo "localhost ansible_connection=local" > inventory
    fi
    
    echo "✓ Ansible environment ready"
else
    echo "⚠ Ansible directory not found, creating basic setup"
    mkdir -p /app/ansible
    echo "localhost ansible_connection=local" > /app/ansible/inventory
fi

# Go back to app directory
cd /app

# Start background services if needed
echo "=== Starting Background Services ==="

# Start Node.js application
echo "=== Starting Node.js Application ==="
echo "Starting server on port 3000..."

# Use exec to replace the shell process with node, so signals are properly handled
exec node server.js
