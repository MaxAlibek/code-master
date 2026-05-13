# Deployment Guide

## 1. Prepare local environment

1. Copy `.env.example` to `.env` for local development.
2. Fill in real values for `AI_API_KEY`, `DATABASE_URL`, and `CORS_ORIGINS`.
3. Do not commit `.env`; it is ignored by Git.

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Prepare project for production deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## 3. Deploy frontend to Vercel

1. Import the GitHub repository in Vercel.
2. Set the frontend project root to the repository root.
3. Use these settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_API_BASE_URL=https://your-backend-service.onrender.com`
5. Deploy.

## 4. Deploy backend to Render

1. Create a new Render Web Service from the same GitHub repository.
2. Set the root directory to `backend`.
3. Use these settings:
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000,http://localhost:5173`
   - `DATABASE_URL=postgresql://user:password@host:5432/codemaster`
   - `AI_API_KEY=your-ai-provider-api-key`
   - `AI_MODEL=gpt-4o-mini`
   - `ENVIRONMENT=production`
5. Deploy and copy the Render service URL into Vercel as `VITE_API_BASE_URL`.

## 5. Production checks

Run these before every release:

```bash
npm run build
python -m py_compile backend/app/models.py backend/app/main.py
```

If the backend is running locally, verify the API at:

```text
http://localhost:8000/docs
```
