# CI Notification Server

This is a simple server for CI notifications. It is used to send notifications to registered devices.

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

## Environment Variables

_Convert the service account key to a base64 string and set it to the environment variable._

```
cat serviceAccountKey.json | base64
```

```
VAPID_PUBLIC_FIREBASE_KEY
VAPID_PRIVATE_FIREBASE_KEY

FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID

SERVICE_ACCOUNT_KEY_BASE64
```
