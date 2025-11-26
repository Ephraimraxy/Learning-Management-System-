/**
 * Firebase Functions for Daily integration
 *
 * Endpoints:
 *  - POST /createRoom   { name }          -> creates a Daily room (calls Daily REST API)
 *  - POST /createMeetingToken { room, identity, is_owner } -> creates an ephemeral meeting token for a room
 *
 * NOTE: Set DAILY_API_KEY in functions environment (or use .env locally).
 * For production, store keys in Firebase project config or Secret Manager.
 */

const functions = require('firebase-functions');
const fetch = require('node-fetch');

const DAILY_API_BASE = 'https://api.daily.co/v1';

const DAILY_API_KEY = process.env.DAILY_API_KEY || functions.config().daily?.api_key;

/**
 * Helper to call Daily REST API
 */
async function dailyRequest(path, method='GET', body=null) {
  const headers = {
    'Authorization': `Bearer ${DAILY_API_KEY}`,
    'Content-Type': 'application/json'
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${DAILY_API_BASE}${path}`, options);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e){ data = { raw: text }; }
  if (!res.ok) {
    throw new Error('Daily API error: ' + JSON.stringify(data));
  }
  return data;
}

/**
 * Create a room on Daily
 * POST body: { name }
 */
exports.createRoom = functions.https.onRequest(async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'missing name' });

    // Example room settings: you can customize via Daily docs
    const body = { name };
    const data = await dailyRequest('/rooms', 'POST', body);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create meeting token for a room
 * POST body: { room, identity, is_owner }
 */
exports.createMeetingToken = functions.https.onRequest(async (req, res) => {
  try {
    const { room, identity, is_owner } = req.body || {};
    if (!room || !identity) return res.status(400).json({ error: 'missing room or identity' });

    const body = {
      properties: {
        roomName: room,
        // If using owner/publisher roles, set is_owner true for teacher
        is_owner: !!is_owner,
        user_name: identity
      }
    };

    // Daily meeting-tokens endpoint
    const data = await dailyRequest('/meeting-tokens', 'POST', body);
    // data will include token string and url to join (room URL)
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
