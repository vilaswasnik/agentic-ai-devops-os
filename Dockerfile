# Use the official Node.js image as the base image
FROM node:20

# Install Python3, pip, and Ansible using apt
RUN apt-get update && \
    apt-get install -y python3 python3-pip ansible

WORKDIR /app

# ...rest of your Dockerfile...


# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]