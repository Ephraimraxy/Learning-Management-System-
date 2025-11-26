## Environment Setup

Create a `.env` (or `.env.local`) alongside `package.json` with:

```
VITE_USE_EMAIL_BACKEND=true
VITE_API_URL=http://localhost:3001
VITE_PENDING_SECRET=<generate-32-char-random-string>
```

Restart `npm run dev` whenever you change these values. Rotate `VITE_PENDING_SECRET` periodically; for higher security, move the pending-password encryption to your backend and keep the secret entirely server-side.

## Email Service Health

The signup screen now surfaces a banner if the email backend health check fails so users know to retry later. Keep the backend running (`npm start` inside `backend/`) or update `VITE_API_URL` to your deployed mailer.


