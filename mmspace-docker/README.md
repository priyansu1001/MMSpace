### Step 1: Create Dockerfile for the Server

Create a file named `Dockerfile` in the `server` directory:

```dockerfile
# server/Dockerfile
FROM node:24.9.0

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"]
```

### Step 2: Create Dockerfile for the Client

Create a file named `Dockerfile` in the `client` directory:

```dockerfile
# client/Dockerfile
FROM node:24.9.0

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Install a simple server to serve the static files
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build"]
```

### Step 3: Create docker-compose.yml

Create a file named `docker-compose.yml` in the root of your project:

```yaml
version: '3.8'

services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    volumes:
      - ./server:/usr/src/app
    environment:
      - MONGODB_URI=mongodb://mongo:27017/mmspace
      - JWT_SECRET=your_jwt_secret_key
      - NODE_ENV=development
    ports:
      - "5000:5000"
    depends_on:
      - mongo

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    volumes:
      - ./client:/usr/src/app
    ports:
      - "3000:3000"
    depends_on:
      - server

  mongo:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

### Step 4: Update Environment Variables

Make sure to update your `.env` files in both the `client` and `server` directories to use the correct MongoDB URI:

**Server `.env` file:**
```properties
PORT=5000
MONGODB_URI=mongodb://mongo:27017/mmspace
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

**Client `.env` file:**
```properties
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 5: Build and Run the Docker Containers

Navigate to the root of your project in the terminal and run the following command:

```bash
docker-compose up --build
```

This command will build the Docker images for both the server and client, start the MongoDB service, and run your application.

### Step 6: Access the Application

- The server will be accessible at `http://localhost:5000`
- The client will be accessible at `http://localhost:3000`

### Additional Notes

- Make sure Docker is installed and running on your machine.
- You can stop the containers by pressing `CTRL+C` in the terminal where you ran `docker-compose up`.
- To remove the containers and volumes, you can run `docker-compose down -v`.

This setup provides a basic Docker configuration for your Node.js application, allowing you to run both the server and client in isolated environments. Adjust the configurations as necessary based on your specific requirements.