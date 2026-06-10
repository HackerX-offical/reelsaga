const FIS_URL =
  "https://firebaseinstallations.googleapis.com/v1/projects/reel-saga-app/installations";
const API_KEY = "AIzaSyBwKRNfSG-VXWiWVkD0pFG7PW6dcY8MMzM";
const APP_ID = "1:544458187694:android:d8ae8c1fbdcf21fc571e3f";

const TOKEN_KEY = "reelsaga_token";
const TOKEN_EXP_KEY = "reelsaga_token_exp";

let inflightToken: Promise<string> | null = null;

function appHeaders(): Record<string, string> {
  return {
    Platform: "android",
    "Version-Code": "80501",
    "Version-Name": "8.5.1",
    "Content-Type": "application/json",
  };
}

function readCached(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const exp = sessionStorage.getItem(TOKEN_EXP_KEY);
  if (!token || !exp) return null;
  if (Date.now() > Number(exp) - 60_000) return null;
  return token;
}

function writeCache(token: string, expiresInSec: number) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(TOKEN_EXP_KEY, String(Date.now() + expiresInSec * 1000));
}

export function clearAuthCache() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXP_KEY);
  inflightToken = null;
}

async function registerFirebase(): Promise<string> {
  const fid = `web${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
  const res = await fetch(FIS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify({
      fid,
      authVersion: "FIS_v2",
      appId: APP_ID,
      sdkVersion: "o:android security-assessment",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firebase registration failed (${res.status}): ${err.slice(0, 120)}`);
  }
  const data = (await res.json()) as { fid: string };
  return data.fid;
}

async function fetchNewToken(): Promise<string> {
  const fId = await registerFirebase();
  const res = await fetch("/rs/auth/token", {
    method: "POST",
    headers: appHeaders(),
    body: JSON.stringify({
      fId,
      aId: "00000000-0000-0000-0000-000000000000",
      deviceId: "reelsaga-web-viewer",
      model: "Pixel 7",
      manufacturer: "Google",
      device: "panther",
      brand: "google",
      shortVersion: "8.5.1",
      longVersion: "80501",
      osVersion: "14",
      locale: "en_IN",
    }),
  });

  const raw = await res.text();
  let json: {
    success?: boolean;
    data?: { accessToken?: string; expiresIn?: number };
    message?: string;
  };
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(
      `Auth proxy returned non-JSON (${res.status}). Check Vercel /rs rewrite and redeploy.`,
    );
  }

  if (!res.ok || !json.data?.accessToken) {
    throw new Error(json.message ?? `Auth failed (${res.status})`);
  }

  const expiresIn = json.data.expiresIn ?? 3600;
  writeCache(json.data.accessToken, expiresIn);
  return json.data.accessToken;
}

export async function getAccessToken(): Promise<string> {
  const cached = readCached();
  if (cached) return cached;

  if (!inflightToken) {
    inflightToken = fetchNewToken().finally(() => {
      inflightToken = null;
    });
  }
  return inflightToken;
}

export async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return { ...appHeaders(), Authorization: `Bearer ${token}` };
}
