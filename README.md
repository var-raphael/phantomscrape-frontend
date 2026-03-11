# PhantomScrape

AI-powered bulk web scraper. Paste URLs, set a throttle, pick a format - PhantomScrape scrapes the pages, cleans the raw HTML into structured data using Groq AI, and exports results in your chosen format.

**Live:** [phantomscrape.vercel.app](https://phantomscrape.vercel.app)

---

## What it does

- Scrape multiple URLs in one job
- Throttle control (1-30s between requests) to avoid getting blocked
- Groq AI (llama-3.3-70b) cleans and structures the raw scraped text
- Export results as JSON, CSV, XML, HTML, or TXT
- Live per-URL status tracking: queued -> scraping -> done / failed
- Keyless auth - generate a UUID key, save it, use it across sessions
- Full job history stored in Supabase

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js + TypeScript + Tailwind CSS |
| Backend | Python + Flask |
| Database | Supabase (PostgreSQL) |
| AI Cleaning | Groq API (llama-3.3-70b-versatile) |
| Frontend Host | Vercel |
| Backend Host | Render |

---

## Repos

| Repo | Description |
|---|---|
| [phantomscrape-frontend](https://github.com/var-raphael/phantomscrape-frontend) | Next.js frontend |
| [scrape-api](https://github.com/var-raphael/scrape-api) | Flask backend |

---

## Running Locally

### Backend (Flask)

```bash
git clone https://github.com/var-raphael/scrape-api
cd scrape-api
pip install -r requirements.txt
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

Start the server:

```bash
python app.py
```

Backend runs on `http://localhost:5000`

---

### Frontend (Next.js)

```bash
git clone https://github.com/var-raphael/phantomscrape-frontend
cd phantomscrape-frontend
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

---

## Supabase Schema

```sql
create table keys (
  key uuid primary key,
  created_at timestamp default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  urls text[],
  throttle int,
  format text,
  status text default 'completed',
  created_at timestamp default now()
);

create table results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  url text,
  title text,
  links text[],
  cleaned text,
  success boolean default true,
  status text default 'queued',
  created_at timestamp default now()
);
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/scrape/bulk` | Scrape a list of URLs |
| GET | `/jobs` | Fetch all jobs |
| GET | `/jobs/:id` | Fetch results for a job |

### POST `/scrape/bulk`

```json
{
  "urls": ["https://example.com", "https://httpbin.org"],
  "throttle": 3,
  "format": "json"
}
```

---

## Auth

No passwords or emails. PhantomScrape uses a UUID key system:

1. Click **Generate Key** on first visit
2. Key is registered in Supabase and downloaded as a `.txt` file
3. Key is saved in a cookie (365 days)
4. On return visits the key is verified against Supabase automatically

---

## Deployment

**Backend on Render:**
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`
- Add env vars: `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`

**Frontend on Vercel:**
- Connect GitHub repo, Vercel auto-detects Next.js
- Add env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Keep-alive:**
- Render free tier spins down after 15 minutes of inactivity
- Use [cron-job.org](https://cron-job.org) to ping `/health` every 14 minutes

---

## License

MIT
