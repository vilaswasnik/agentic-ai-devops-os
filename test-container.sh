#!/bin/bash

echo "=== Testing Container Setup ==="

# Test Node.js
echo "Testing Node.js..."
node --version

# Test Ansible
echo "Testing Ansible..."
ansible --version

# Test Ansible with localhost
echo "Testing Ansible localhost connection..."
ansible localhost -m ping -i /app/ansible/inventory

echo "=== Container Test Complete ==="
