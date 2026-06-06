const DEFAULT_API_BASE_URL = `http://${window.location.hostname}:8000`;
const BASE_URL = import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_BASE_URL;

export async function getState() {
  const response = await fetch(`${BASE_URL}/state`);
  if (!response.ok) {
    throw new Error("Failed to fetch state");
  }
  return response.json();
}

export async function getNotifications() {
  const response = await fetch(`${BASE_URL}/notifications`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  return response.json();
}

export async function getSummary() {
  const response = await fetch(`${BASE_URL}/notifications/summary`);
  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }
  return response.json();
}

export async function simulateNotification() {
  const response = await fetch(`${BASE_URL}/notifications/simulate`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("Failed to simulate notification");
  }
  return response.json();
}

export async function snoozeNotification(notificationId, minutes = 10, userId = "demo-user") {
  const response = await fetch(`${BASE_URL}/notifications/snooze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      notification_id: notificationId,
      minutes,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to snooze notification");
  }

  return response.json();
}
