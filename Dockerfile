# Use the official Node.js image as the base image
FROM node:20

# Install Python3, pip, Ansible and other useful tools
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    ansible \
    openssh-client \
    sshpass \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Make the startup script executable
RUN chmod +x start.sh

# Set up Ansible environment variables
ENV ANSIBLE_HOST_KEY_CHECKING=False
ENV ANSIBLE_STDOUT_CALLBACK=yaml
ENV ANSIBLE_INVENTORY=/app/ansible/inventory

# Expose the port your app runs on
EXPOSE 3000

# Start the application using our custom startup script
CMD ["./start.sh"]