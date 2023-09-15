# Use the node:18-slim image as the base
FROM node:18-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the built backend application files
COPY ./ ./

# Expose port 8080
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
