FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies as root
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
