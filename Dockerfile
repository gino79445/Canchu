

# Use the official Node.js image from Docker Hub (latest LTS version)
FROM node:alpine

# Install necessary packages
RUN apk add --no-cache redis mysql-client

# Set the working directory inside the container
WORKDIR /app

COPY . .
# Install Node.js dependencies
RUN npm install

# Expose port 3000 to the outside world (this is the default port for your app)
EXPOSE 3000



# Command to run your Node.js application
CMD ["node", "app.js"]
