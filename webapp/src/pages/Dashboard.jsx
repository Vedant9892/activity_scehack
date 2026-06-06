import { useCallback, useEffect, useState } from "react";

import ActivityPanel from "../components/ActivityPanel";
import Navbar from "../components/Navbar";
import NotificationPanel from "../components/NotificationPanel";
import StateIndicator from "../components/StateIndicator";
import SummaryCard from "../components/SummaryCard";
import useWebSocket from "../hooks/useWebSocket";
import {
  getNotifications,
  getState,
  getSummary,
  simulateNotification,
  snoozeNotification,
} from "../services/api";

const INITIAL_STATE = {
  user_id: "demo-user",
  focus_state: "focused",
  active_url: "",
  tab_switch_count: 0,
  tab_switches_last_5s: 0,
  idle_seconds: 0,
  activity_frequency: 0,
  updated_at: "",
};

const INITIAL_NOTIFICATIONS = {
  delayed: [],
  delivered: [],
  pending_count: 0,
};

export default function Dashboard() {
  const [state, setState] = useState(INITIAL_STATE);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [snoozingId, setSnoozingId] = useState(null);

  const onSocketPayload = useCallback((payload) => {
    if (payload.type === "state_update" && payload.state) {
      setState(payload.state);
      return;
    }

    if (payload.type === "notifications_update") {
      setNotifications({
        delayed: payload.delayed || [],
        delivered: payload.delivered || [],
        pending_count: payload.pending_count || 0,
      });
      if (payload.summary) {
        setSummary(payload.summary);
      }
    }
  }, []);

  const { isConnected } = useWebSocket({ onPayload: onSocketPayload });

  async function handleSimulate() {
    try {
      setIsSimulating(true);
      await simulateNotification();

      const [notificationsData, summaryData] = await Promise.all([
        getNotifications(),
        getSummary(),
      ]);

      setNotifications(notificationsData);
      setSummary(summaryData.summary || "");
      setError("");
    } catch (_error) {
      setError("Could not simulate notification. Check backend and Redis.");
    } finally {
      setIsSimulating(false);
    }
  }

  async function handleSnooze(notificationId, minutes) {
    try {
      setSnoozingId(notificationId);
      await snoozeNotification(notificationId, minutes, "demo-user");

      const [notificationsData, summaryData] = await Promise.all([
        getNotifications(),
        getSummary(),
      ]);
      setNotifications(notificationsData);
      setSummary(summaryData.summary || "");
      setError("");
    } catch (_error) {
      setError("Could not snooze notification. Check backend connectivity.");
    } finally {
      setSnoozingId(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [stateData, notificationsData, summaryData] = await Promise.all([
          getState(),
          getNotifications(),
          getSummary(),
        ]);

        if (!active) return;
        setState(stateData);
        setNotifications(notificationsData);
        setSummary(summaryData.summary || "");
        setError("");
      } catch (_err) {
        if (!active) return;
        setError("Cannot reach backend. Verify FastAPI, MongoDB, and Redis are running.");
      }
    }

    loadData();
    const timer = window.setInterval(loadData, 4000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Navbar isConnected={isConnected} />
      {error ? (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <StateIndicator state={state} />
        </div>
        <SummaryCard summary={summary} />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={handleSimulate}
          disabled={isSimulating}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isSimulating ? "Generating..." : "Generate Test Notification"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ActivityPanel state={state} />
        <NotificationPanel
          notifications={notifications}
          onSnooze={handleSnooze}
          snoozingId={snoozingId}
        />
      </div>
    </div>
  );
}
