# GanitGuru 🧮

**AI-powered NCERT Mathematics Tutor for Classes 6–12**

GanitGuru uses Gemini 2.0 Flash to deliver step-by-step LaTeX-formatted maths solutions, auto-detecting Hindi/English, tagged by topic, and calibrated to NCERT class level.

---

## Features

| Feature | Details |
|---------|---------|
| **AI Model** | Gemini 2.0 Flash (via `@google/generative-ai`) |
| **Streaming** | Server-Sent Events (SSE) for real-time token streaming |
| **LaTeX** | Full KaTeX rendering — inline `$...$` and block `$$...$$` |
| **Language** | Auto-detects Hindi / English; respond in same language |
| **Class Selector** | NCERT Classes 6–12, adjusts difficulty + chapter references |
| **Topic Tags** | Every reply tagged `TOPIC: ...` (rendered as a pill) |
| **Chat History** | Sidebar with per-chat titles, class badge, delete |
| **Dark Mode** | System-preference aware, toggle in header |
| **Responsive** | Mobile sidebar drawer + desktop split layout |

---

## Project Structure

```
ganitguru/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express + SSE streaming routes
│   │   ├── systemPrompt.js    # Gemini system prompt builder
│   │   └── chatStore.js       # In-memory chat store (swap for DB)
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js      # Root Next.js layout
│   │   │   ├── page.js        # Main page (state, streaming logic)
│   │   │   └── globals.css    # Tailwind + KaTeX + custom styles
│   │   ├── components/
│   │   │   ├── Logo.js        # π+AI SVG logo
│   │   │   ├── Header.js      # App bar + class selector + theme toggle
│   │   │   ├── Sidebar.js     # Chat history drawer
│   │   │   ├── ChatMessage.js # LaTeX + topic pill + key concept box
│   │   │   └── ChatInput.js   # Auto-grow textarea + send button
│   │   └── lib/
│   │       └── api.js         # fetch helpers + SSE stream reader
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── .env.example
│
├── render.yaml                # Render deploy config for backend
└── README.md
```

---

## Local Development

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm run dev        # starts on http://localhost:4000
```

**Get a Gemini API key:** https://aistudio.google.com/app/apikey

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local
# .env.local already points to http://localhost:4000
npm install
npm run dev        # starts on http://localhost:3000
```

Open http://localhost:3000 — the app is ready.

---

## Deployment

### Backend → Render

1. Push the repo to GitHub.
2. Go to https://render.com → **New Web Service** → connect your repo.
3. Set **Root Directory** to `backend`.
4. Set environment variables in the Render dashboard:
   - `GEMINI_API_KEY` = your key
   - `ALLOWED_ORIGINS` = `https://your-frontend.vercel.app`
5. Deploy. Note the URL (e.g. `https://ganitguru-backend.onrender.com`).

Alternatively, `render.yaml` at the root handles this automatically if you use Render's **Blueprint** feature.

### Frontend → Vercel

1. Go to https://vercel.com → **Add Project** → import your repo.
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (no trailing slash)
4. Deploy.

### Linking CORS

Once both are live, update `ALLOWED_ORIGINS` on Render to include your Vercel URL, then redeploy the backend.

---

## Upgrading the Chat Store to a Database

The current `chatStore.js` uses a simple in-memory `Map`. All data is lost on restart.

To persist chats, replace the Map operations with your preferred DB:

**MongoDB (Mongoose)**
```js
// chats collection: { _id, title, classLevel, createdAt }
// messages embedded array or separate collection
```

**PostgreSQL (pg / Prisma)**
```sql
CREATE TABLE chats (id UUID PRIMARY KEY, title TEXT, class_level INT, created_at TIMESTAMPTZ);
CREATE TABLE messages (id SERIAL PRIMARY KEY, chat_id UUID REFERENCES chats, role TEXT, content TEXT, created_at TIMESTAMPTZ);
```

**Redis**
```
HSET chat:{id} title "..." classLevel 10 createdAt "..."
RPUSH messages:{id} '{"role":"user","parts":[{"text":"..."}]}'
```

All five functions (`createChat`, `getChat`, `getAllChats`, `addMessage`, `getHistory`) map directly to DB queries — swap them out without touching `server.js`.

---

## API Reference

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/api/chats` | — | List all chats |
| POST | `/api/chats` | `{ classLevel }` | Create new chat |
| GET | `/api/chats/:id` | — | Get chat with messages |
| DELETE | `/api/chats/:id` | — | Delete chat |
| POST | `/api/chat/:id/stream` | `{ message, classLevel, language }` | **Stream reply (SSE)** |

SSE events:
```
data: {"token":"..."}        ← incremental text
data: {"done":true,"topic":"Quadratic Equations","chatId":"..."}  ← end
data: {"error":"..."}        ← error
```

---

## Tech Stack

- **Backend:** Node.js, Express, `@google/generative-ai`, SSE
- **Frontend:** Next.js 14 (App Router), Tailwind CSS v3, KaTeX (`react-katex`)
- **Deploy:** Render (backend) + Vercel (frontend)
