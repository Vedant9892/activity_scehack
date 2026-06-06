const trackerState = {
  activeUrl: "",
  tabSwitchCount: 0,
  tabSwitchesLast5s: 0,
  idleSeconds: 0,
  lastActiveAt: Date.now(),
  currentIdleState: "active",
};

async function updateActiveTabUrl() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  trackerState.activeUrl = activeTab?.url ?? "";
}

function onTabActivated() {
  trackerState.tabSwitchCount += 1;
  trackerState.tabSwitchesLast5s += 1;
  updateActiveTabUrl();
}

function onTabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    trackerState.activeUrl = tab.url ?? trackerState.activeUrl;
  }
}

function onIdleStateChanged(newState) {
  trackerState.currentIdleState = newState;
  if (newState === "active") {
    trackerState.lastActiveAt = Date.now();
    trackerState.idleSeconds = 0;
  }
}

async function refreshIdleTime() {
  const idleState = await chrome.idle.queryState(15);
  trackerState.currentIdleState = idleState;
  if (idleState === "active") {
    trackerState.idleSeconds = 0;
    trackerState.lastActiveAt = Date.now();
    return;
  }

  const elapsed = Math.floor((Date.now() - trackerState.lastActiveAt) / 1000);
  trackerState.idleSeconds = Math.max(0, elapsed);
}

export async function initializeActivityTracker() {
  await updateActiveTabUrl();

  chrome.tabs.onActivated.addListener(onTabActivated);
  chrome.tabs.onUpdated.addListener(onTabUpdated);
  chrome.idle.onStateChanged.addListener(onIdleStateChanged);
}

export async function getActivityPayload() {
  await refreshIdleTime();

  return {
    user_id: "demo-user",
    active_url: trackerState.activeUrl,
    tab_switch_count: trackerState.tabSwitchCount,
    tab_switches_last_5s: trackerState.tabSwitchesLast5s,
    idle_seconds: trackerState.idleSeconds,
    timestamp: new Date().toISOString(),
  };
}

export function resetIntervalCounters() {
  trackerState.tabSwitchesLast5s = 0;
}
