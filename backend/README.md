# GigStream Backend

Global Part-Time Jobs App - Cloud Run Backend API (Node.js + Express + Firestore)

## Quick Start

### 1. Install dependencies

```bash
cd ~/workspace/gpt-jobs-backend
npm install
```

### 2. Environment configuration

```bash
cp .env.example .env
# Edit .env and set your FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS
```

### 3. Run locally

```bash
npm run dev
```

Server will start on `http://localhost:3000` (or the port set in `.env`).

### 4. Seed mock data

> Make sure Firestore is accessible (either real project or emulator).

```bash
npm run seed
```

This will insert:
- 5 jobs for **Brazil (BR)**
- 5 jobs for **Philippines (PH)**
- 5 jobs for **Indonesia (ID)**
- Default `app_configs/default` document
- `country_configs` documents

## API Endpoints

All responses follow `{ code, message, data }`.

### Health Check
```
GET /health
```

### List Jobs
```
GET /api/jobs?country=BR&page=1&page_size=20
```

### Job Detail
```
GET /api/job/detail?id=<job_id>
```

### Report a Job
```
POST /api/report
Content-Type: application/json

{
  "job_id": "<job_id>",
  "type": "fake_job",
  "reason": "This looks like a scam",
  "reporter_contact": "user@example.com"
}
```

### App Config
```
GET /api/app/config
```

## Firestore Data Model

| Collection / Doc | Description |
|------------------|-------------|
| `jobs` | Job postings |
| `reports` | User submitted reports |
| `app_configs/default` | Frontend feature toggles |
| `country_configs/{country}` | Country-specific fallback strategies |

## Local Development with Firestore Emulator

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Start emulator
```bash
firebase emulators:start --only firestore
```

### Run backend against emulator
```bash
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_PROJECT_ID=gpt-jobs-dev
npm run dev
```

## Deploy to Cloud Run

### Build & push image
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/gpt-jobs-backend
```

### Deploy service
```bash
gcloud run deploy gpt-jobs-backend \
  --image gcr.io/PROJECT_ID/gpt-jobs-backend \
  --region asia-east1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_PROJECT_ID=PROJECT_ID,NODE_ENV=production
```

## Content Safety

Jobs are automatically filtered against a keyword blacklist:
- 押金, 保证金, 刷单, 返利, 博彩, 陪聊, 裸聊, 代孕, 毒品, 枪支

Blocked jobs will not appear in listings. Accessing a blocked job by ID returns `403`.
