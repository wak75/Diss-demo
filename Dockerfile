FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "src/server.js"]