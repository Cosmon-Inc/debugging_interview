# Use an official Node runtime as a parent image (slim version for faster downloads)
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies (using npm ci for faster, deterministic builds)
RUN npm ci --silent

# Copy the rest of the application code
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable for polling (helps with Docker volume mounts in some cases)
ENV WATCHPACK_POLLING=true

# Run the app when the container launches
CMD ["npm", "start"] 