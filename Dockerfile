# Start with Alpine base
FROM alpine:3.20

# Install common tools and dependencies
RUN apk add --no-cache \
    bash \
    curl \
    git \
    wget \
    build-base \   # gcc, g++
    python3 \
    py3-pip \
    openjdk17 \
    go \
    nodejs \
    npm

# Set environment variables (optional)
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH=$PATH:$JAVA_HOME/bin

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

# Copy application files and install Node.js dependencies
COPY package*.json ./
RUN npm install
# Copy the rest of the app
COPY . .
EXPOSE 8080

CMD ["npm", "start"]