# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the client code
COPY . .

# Expose the Vite port
EXPOSE 5173

# Start the dev server with --host to allow external connections
CMD ["npm", "run", "dev", "--", "--host"]
