# CI Notification Server

This is a simple server for CI notifications. It is used to send notifications to the CI/CD platform.

## Running the server

1. Install dependencies

```bash
npm install
```

2. Run the server

```bash
npm run dev
```

3. Build the Docker image

```bash
docker build -t ci-notification-server .
```

4. Run the server with Docker

```bash
docker run -d --env-file .env -p 3000:3000 ci-notification-server:1.0
```
