/**
 * Firebase Functions that wrap the Daily.co REST API.
 *
 * Endpoints
 *  - POST /createDailyRoom         { name, properties? } -> creates/updates a Daily room
 *  - POST /createDailyMeetingToken { room, identity, isOwner } -> ephemeral meeting token
 *
 * DAILY_API_KEY must be configured via:
 *   firebase functions:config:set daily.api_key="YOUR_KEY"
 * or provided as an env var when running the emulator.
 */

const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

// node-fetch v3 is ESM-only; lazy import to keep this file CommonJS-friendly.
const fetchFn = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const DAILY_API_BASE = 'https://api.daily.co/v1';

function getDailyApiKey() {
  const key = process.env.DAILY_API_KEY || functions.config().daily?.api_key;
  if (!key) {
    throw new Error('DAILY_API_KEY is not set. Configure functions:config or env vars.');
  }
  return key;
}

async function dailyRequest(path, { method = 'GET', body = null } = {}) {
  const headers = {
    Authorization: `Bearer ${getDailyApiKey()}`,
    'Content-Type': 'application/json',
  };
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetchFn(`${DAILY_API_BASE}${path}`, options);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new Error(data?.error || data?.message || text || 'Unknown Daily API error');
  }
  return data;
}

exports.createDailyRoom = functions.https.onRequest((req, res) =>
  cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST supported' });
    }

    try {
      const { name, properties = {} } = req.body || {};
      if (!name) {
        return res.status(400).json({ error: 'Missing room name' });
      }

      const body = {
        name,
        properties: {
          enable_prejoin_ui: true,
          eject_on_expiration: false,
          ...(properties || {}),
        },
      };

      const data = await dailyRequest('/rooms', { method: 'POST', body });
      return res.json(data);
    } catch (err) {
      console.error('[createDailyRoom] error', err);
      return res.status(500).json({ error: err.message });
    }
  }),
);

exports.createDailyMeetingToken = functions.https.onRequest((req, res) =>
  cors(req, res, async () => {
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Only POST supported' });
    }

    try {
      const { room, identity, isOwner = false, userData = {} } = req.body || {};
      if (!room || !identity) {
        return res.status(400).json({ error: 'Missing room or identity' });
      }

      const body = {
        properties: {
          room_name: room,
          is_owner: Boolean(isOwner),
          user_name: identity,
          ...userData,
        },
      };

      const data = await dailyRequest('/meeting-tokens', { method: 'POST', body });
      return res.json(data);
    } catch (err) {
      console.error('[createDailyMeetingToken] error', err);
      return res.status(500).json({ error: err.message });
    }
  }),
);

/**
 * ISAC AI Chatbot Function (Placeholder)
 * 
 * To enable this:
 * 1. Install OpenAI: npm install openai
 * 2. Set API Key: firebase functions:config:set openai.api_key="YOUR_KEY"
 */
/*
const OpenAI = require('openai');

exports.chatWithISAC = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  const openai = new OpenAI({
    apiKey: functions.config().openai.api_key,
  });

  const { message, history } = data;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are ISAC, a helpful LMS assistant." },
        ...history,
        { role: "user", content: message }
      ],
      model: "gpt-4-turbo",
    });

    return {
      text: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error('OpenAI Error:', error);
    throw new functions.https.HttpsError('internal', 'AI is currently offline.');
  }
});
*/
