# Use the official Node.js 22.11.0 slim image as the base image
FROM node:22.11.0-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally and install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN pnpm build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main.js"]