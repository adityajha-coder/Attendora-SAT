# Use official lightweight Node.js runtime
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose backend server port
EXPOSE 3010

# Define start command
CMD ["npm", "start"]
