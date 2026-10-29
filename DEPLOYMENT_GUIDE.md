# GST SAHAYAK — Deployment & Production Configuration Guide

**Project:** GST Sahayak – A Hybrid Rule-Based and Explainable-AI System for GST Invoice Pre-Validation and Anomaly Detection  
**Frontend Deployment URL:** [https://gst-pro-mu.vercel.app/](https://gst-pro-mu.vercel.app/)  

---

## 1. Deployed Website Diagnosis & Analysis

### The Issue Identified:
The live frontend application is hosted on Vercel at `https://gst-pro-mu.vercel.app/`. When visiting the live website, API requests fail or remain in loading states.

### Root Cause:
In `client/src/services/api.ts`:
```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
```
Because the Vercel project environment variables did not have `VITE_API_URL` set during the deployment build, Vite baked the fallback `"http://localhost:5000/api"` directly into the compiled JavaScript asset (`index-BlHNIFXv.js`).

When external users visit `https://gst-pro-mu.vercel.app/`:
1. The browser attempts to call `http://localhost:5000/api/...` on the user's local machine, not on a cloud server.
2. The browser blocks mixed content (an `https://` site calling an insecure `http://` endpoint).

---

## 2. Local Development Running Instructions

To run the complete system locally with full frontend, backend, database, and Python AI engine:

### Prerequisites:
- **Node.js:** v18, v20, or v24+
- **Python:** Python 3.9+ with `scikit-learn`, `pandas`, `numpy`, `joblib` installed.
- **Git**

### Step 1: Install Dependencies
```bash
# In the root repository
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
cd ..
```

### Step 2: Install Python ML Libraries
```bash
python -m pip install scikit-learn pandas numpy joblib openpyxl
```

### Step 3: Initialize Database & Seed Demo Data
```bash
cd server
npm run prisma:generate
npm run prisma:push
npm run seed
cd ..
```

### Step 4: Train AI Isolation Forest Model
```bash
python ai_engine/anomaly_detector.py --train
```

### Step 5: Start Backend and Frontend
In Terminal 1 (Backend):
```bash
cd server
node src/index.js
# Runs on http://localhost:5000
```

In Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

---

## 3. Production Deployment Architecture

```
  [User Browser]
         │
         ├── HTTPS ──> [Vercel CDN] ──> React SPA (Vite Bundle)
         │                                (VITE_API_URL points to Backend)
         │
         └── HTTPS ──> [Render / Railway / Cloud VPS]
                           ├── Express.js Server (Port 5000)
                           ├── Python 3 Runtime (Isolation Forest Subprocess)
                           └── Prisma ORM ──> PostgreSQL / Persistent SQLite
```

### 3.1 Deploying Backend & AI Engine (Render / Railway / VPS)

#### Option A: Render (Free Web Service)
1. Push repository to GitHub.
2. In Render Dashboard, click **New > Web Service**.
3. Set **Root Directory:** `server`
4. Set **Environment:** `Node`
5. Set **Build Command:**
   ```bash
   npm install && npm run prisma:generate && pip install scikit-learn pandas numpy joblib && python ../ai_engine/anomaly_detector.py --train
   ```
6. Set **Start Command:**
   ```bash
   node src/index.js
   ```
7. Add Environment Variables:
   - `JWT_SECRET`: A secure 32+ character random string.
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
8. Copy the assigned URL (e.g. `https://gst-sahayak-api.onrender.com`).

---

### 3.2 Configuring the Vercel Frontend

1. Go to your **Vercel Dashboard** > Project **gst-pro-mu** (or `client`).
2. Navigate to **Settings > Environment Variables**.
3. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-api-url.com/api` (e.g., `https://gst-sahayak-api.onrender.com/api`)
   - **Environment:** Check *Production*, *Preview*, and *Development*.
4. Navigate to **Deployments** tab and click **Redeploy** on the latest commit.
5. Once rebuilt, the live website will communicate securely over HTTPS with your live backend API.

---

## 4. Production Security Checklist

- [ ] `JWT_SECRET` configured in cloud environment settings, never checked into Git.
- [ ] CORS origin in `server/src/index.js` explicitly restricted to `https://gst-pro-mu.vercel.app`.
- [ ] Backdoor credentials (`demo1234`) disabled on production.
- [ ] Multi-tenant isolation verified: unauthenticated requests strictly return 401.
- [ ] Database backups configured before executing schema changes.

