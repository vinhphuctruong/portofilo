FROM node:18-alpine

WORKDIR /app

# Copy package and lock file first to leverage docker cache
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy the rest of the app code
COPY . .

# Create necessary directories
RUN mkdir -p data public/uploads

# Ensure permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
