FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Command to run the Vite development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
