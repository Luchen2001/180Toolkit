# Use the node:18-slim image as the base
FROM node:18-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the backend application files
COPY ./server ./server

# Copy the built frontend application files
COPY ./client/build ./client/build

# Install backend dependencies
WORKDIR /usr/src/app/server
RUN npm install

# Install the 'serve' package globally for the frontend
RUN npm install -g serve

# Expose both backend and frontend ports
EXPOSE 3000 8080

# Start both the frontend and backend using a single CMD
CMD npm start --prefix server & serve -s /usr/src/app/client/build -l 8080
