# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -g nodemon

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3002

# Define the command to run the app
CMD ["nodemon", "src/server.js"]