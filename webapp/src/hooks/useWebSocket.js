import { useEffect, useRef, useState } from "react";

import { createDashboardSocket } from "../services/socket";

export default function useWebSocket({ onPayload }) {
  const [isConnected, setIsConnected] = useState(false);
  const retryRef = useRef(null);

  useEffect(() => {
    let active = true;
    let socket;

    function connect() {
      if (!active) return;

      socket = createDashboardSocket(
        (payload) => onPayload?.(payload),
        () => setIsConnected(true),
        () => {
          setIsConnected(false);
          retryRef.current = window.setTimeout(connect, 2500);
        }
      );
    }

    connect();

    return () => {
      active = false;
      if (retryRef.current) {
        window.clearTimeout(retryRef.current);
      }
      if (socket && socket.readyState <= 1) {
        socket.close();
      }
    };
  }, [onPayload]);

  return { isConnected };
}
