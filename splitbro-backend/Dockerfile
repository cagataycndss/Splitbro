# splitbro-backend/Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port (Backend typically runs on 5000)
EXPOSE 5000

# Start command
CMD ["npm", "start"]
