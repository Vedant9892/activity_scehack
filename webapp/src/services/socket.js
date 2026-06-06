const fallbackApi = `http://${window.location.hostname}:8000`;
const apiBase = import.meta.env.VITE_API_URL?.trim() || fallbackApi;
const fallbackWs = apiBase.replace(/^http/i, "ws") + "/ws/dashboard";

export const WS_URL = import.meta.env.VITE_WS_URL?.trim() || fallbackWs;

export function createDashboardSocket(onMessage, onOpen, onClose) {
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    onOpen?.();
    // Keepalive ping every 20 seconds to hold some proxies open.
    const pingTimer = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping");
      }
    }, 20000);

    socket.addEventListener("close", () => clearInterval(pingTimer), { once: true });
  };

  socket.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      onMessage?.(payload);
    } catch (_error) {
      // Ignore malformed events to keep dashboard stable.
    }
  };

  socket.onclose = () => onClose?.();
  return socket;
}
