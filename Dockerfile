# 🏗️ Base image
FROM alpine:3.20

# 🧩 Install core languages & tools
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
    npm \
    tini

# 🏠 Set working directory (creates /app automatically)
WORKDIR /app

# ⚡ Speed up Go compilation and runtime using RAM
RUN mkdir -p /dev/shm/tmp && ln -s /dev/shm/tmp /app/tmp

# 🧠 Set environment variables
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk
ENV PATH=$PATH:$JAVA_HOME/bin:/usr/local/go/bin

# 📦 Install Node dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# 📂 Copy app files
COPY . .

# 🧰 Pre-warm Go build cache
RUN echo 'package main; func main(){}' > /tmp/dummy.go && go build /tmp/dummy.go

# ⚙️ Optimize Go runtime
ENV GODEBUG=madvdontneed=1 \
    GOMAXPROCS=2 \
    GOCACHE=/dev/shm/.cache/go-build

# 🔥 Use tmpfs for Go build cache & tmp dir
VOLUME ["/dev/shm"]

# 🌍 Expose app port
EXPOSE 8080

# 🧹 Proper init handling
ENTRYPOINT ["/sbin/tini", "--"]

# 🚀 Start Node.js app
CMD ["node", "main.js"]
