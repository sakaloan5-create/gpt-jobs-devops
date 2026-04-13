# GPTJobs Backend API Test

## Quick Start (new developer)

```bash
cd gpt-jobs-backend
npm install
npm start &
npm run seed
```

> The backend auto-falls back to an in-memory Mock Firestore when no `GOOGLE_APPLICATION_CREDENTIALS` or `FIRESTORE_EMULATOR_HOST` is set. It serves data on `localhost:3000` in under 30 seconds.

---

## Curl Examples

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected:
```json
{
  "code": 200,
  "message": "ok",
  "data": { "ts": 1712937600000 }
}
```

### 2. List Jobs

```bash
curl "http://localhost:3000/api/jobs?country=BR&page=1&page_size=3"
```

### 3. App Config

```bash
curl http://localhost:3000/api/app/config
```

### 4. Admin Create Job

```bash
curl -X POST http://localhost:3000/api/admin/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job",
    "company_name": "TestCorp",
    "country": "BR",
    "city": "Sao Paulo",
    "salary": "BRL 150/day",
    "job_type": "Part-time",
    "description": "A test job.",
    "requirements": ["Age 18+"],
    "responsibilities": ["Show up on time"],
    "contact_platform": "whatsapp",
    "contact_label": "Contact Now",
    "contact_link": "https://wa.me/5511999999000",
    "tags": ["parttime"],
    "status": "active",
    "report_enabled": true
  }'
```
