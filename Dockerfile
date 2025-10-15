# Start with Alpine base
FROM alpine:3.20

# Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH=$PATH:$JAVA_HOME/bin

# Install common tools and dependencies
RUN apk add --no-cache \
    bash \
    curl \
    git \
    wget \
    build-base \
    python3 \
    py3-pip \
    openjdk17 \
    go \
    nodejs \
    npm

# Verify installations
RUN python3 --version && \
    java -version && \
    go version && \
    gcc --version && \
    g++ --version && \
    node --version && \
    npm --version

# Set working directory
WORKDIR /app

# Copy Node.js package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app uses
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
