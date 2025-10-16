# 🏗️ Base image
FROM alpine:3.20

# 🧩 Install core languages & tools
RUN apk add --no-cache \
    bash \
    curl \
    git \
    wget \
    build-base \        # gcc, g++, make
    python3 \
    py3-pip \
    openjdk17 \
    go \
    nodejs \
    npm \
    tini

# 🧠 Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH=$PATH:$JAVA_HOME/bin:/usr/local/go/bin

# ⚡ Speed up Go compilation and runtime
# Use tmpfs (shared memory) for temp folders
RUN mkdir -p /dev/shm/tmp && ln -s /dev/shm/tmp /app/tmp

# 🏠 Set working directory
WORKDIR /app

# 📦 Install Node dependencies (cached separately)
COPY package*.json ./
RUN npm ci --omit=dev

# 📂 Copy rest of the application
COPY . .

# 🧰 Pre-warm Go build cache for faster go run
# (build a tiny dummy Go program once)
RUN echo 'package main; func main(){}' > /tmp/dummy.go && go build /tmp/dummy.go

# ⚙️ Optimize Go runtime behavior
ENV GODEBUG=madvdontneed=1 \
    GOMAXPROCS=2 \
    GOCACHE=/dev/shm/.cache/go-build

# 🔥 Optional: preload cache dir in RAM for faster build execution
VOLUME ["/dev/shm"]

# 🌍 Expose your Node app port
EXPOSE 8080

# 🧹 Use tini as init for proper cleanup of child processes
ENTRYPOINT ["/sbin/tini", "--"]

# 🚀 Start the Node app
CMD ["node", "main.js"]
