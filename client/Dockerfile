# Use the node:18-slim image as the base
FROM node:18-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the built frontend application files
COPY ./build ./build

# Install the 'serve' package globally
RUN npm install -g serve

# Expose port 3000
EXPOSE 8080

# Command to serve the app
CMD ["serve", "-s", "build", "-l", "8080"]
