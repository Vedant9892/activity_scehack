import { postActivity } from "./api/apiClient.js";
import {
  getActivityPayload,
  initializeActivityTracker,
  resetIntervalCounters,
} from "./utils/activityTracker.js";

const ACTIVITY_ALARM = "send-activity";

async function sendActivityTick() {
  try {
    const payload = await getActivityPayload();
    const result = await postActivity(payload);

    await chrome.storage.local.set({
      focusState: result.focus_state,
      pendingCount: result.pending_notifications,
      lastPayload: payload,
      lastSyncAt: new Date().toISOString(),
    });
  } catch (error) {
    await chrome.storage.local.set({
      lastError: error.message,
      lastSyncAt: new Date().toISOString(),
    });
  } finally {
    resetIntervalCounters();
  }
}

async function bootstrap() {
  const stored = await chrome.storage.sync.get(["backendBaseUrl"]);
  if (!stored.backendBaseUrl) {
    await chrome.storage.sync.set({ backendBaseUrl: "http://127.0.0.1:8000" });
  }

  await initializeActivityTracker();

  chrome.alarms.create(ACTIVITY_ALARM, { periodInMinutes: 5 / 60 });
  sendActivityTick();
}

chrome.runtime.onInstalled.addListener(bootstrap);
chrome.runtime.onStartup.addListener(bootstrap);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ACTIVITY_ALARM) {
    sendActivityTick();
  }
});
