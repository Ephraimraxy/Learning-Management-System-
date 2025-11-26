# Daily Cloud Functions

These Firebase Functions proxy the Daily REST API so the frontend never exposes the Daily API key.

## Endpoints

- `POST /createDailyRoom` – creates a Daily room. Body: `{ "name": "batch-123-class-1", "properties": { ...optionalDailyProps } }`
- `POST /createDailyMeetingToken` – creates an ephemeral token. Body: `{ "room": "batch-123-class-1", "identity": "student-jane", "isOwner": false }`

## Setup

1. Install deps: `cd functions && npm install`
2. Set your Daily API key (once per Firebase project):

```bash
firebase functions:config:set daily.api_key="YOUR_DAILY_KEY"
```

For local emulators you can also create a `.env` file with `DAILY_API_KEY=...`.

3. Deploy or emulate:

```bash
firebase deploy --only functions
# or
firebase emulators:start --only functions
```

The React app expects an environment variable `VITE_DAILY_FUNCTIONS_BASE_URL`
pointing at your functions origin (e.g. `https://us-central1-YOUR_PROJECT.cloudfunctions.net`).

