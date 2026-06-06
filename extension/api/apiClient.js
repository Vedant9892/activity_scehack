const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

async function getBaseUrl() {
  const stored = await chrome.storage.sync.get(["backendBaseUrl"]);
  return stored.backendBaseUrl?.trim() || DEFAULT_BASE_URL;
}

export async function postActivity(payload) {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/activity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send activity payload");
  }

  return response.json();
}

export async function fetchState() {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/state`);
  if (!response.ok) {
    throw new Error("Failed to fetch state");
  }
  return response.json();
}

export async function fetchNotifications() {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/notifications`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}
