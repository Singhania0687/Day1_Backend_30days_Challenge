# Use Node 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package.json and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source code (including public folder with frontend)
COPY backend ./backend

# Expose the port your backend uses
EXPOSE 3000

# Start the backend server
CMD ["node", "backend/backend.js"]
