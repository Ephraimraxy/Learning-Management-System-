const DEFAULT_REGION = import.meta.env.VITE_DAILY_FUNCTIONS_REGION || 'us-central1';
const DEFAULT_PROJECT =
  import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.VITE_APP_FIREBASE_PROJECT_ID || 'pcmd-8dd21';

function resolveBaseUrl() {
  const explicitBase = import.meta.env.VITE_DAILY_FUNCTIONS_BASE_URL;
  if (explicitBase) {
    return explicitBase.replace(/\/$/, '');
  }

  const emulatorHost = import.meta.env.VITE_DAILY_FUNCTIONS_EMULATOR_HOST;
  if (emulatorHost) {
    return `${emulatorHost.replace(/\/$/, '')}/${DEFAULT_PROJECT}/${DEFAULT_REGION}`;
  }

  return `https://${DEFAULT_REGION}-${DEFAULT_PROJECT}.cloudfunctions.net`;
}

async function request(endpoint, payload) {
  const baseUrl = resolveBaseUrl();
  const response = await fetch(`${baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error || 'Daily function request failed';
    throw new Error(message);
  }
  return data;
}

export function createDailyRoom({ name, properties }) {
  return request('createDailyRoom', { name, properties });
}

export function createDailyMeetingToken({ room, identity, isOwner = false, userData = {} }) {
  return request('createDailyMeetingToken', { room, identity, isOwner, userData });
}

