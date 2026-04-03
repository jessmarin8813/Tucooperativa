import { useEffect, useRef } from 'react';

/**
 * useRealtime Hook
 * Connects to the Python Realtime Hub (port 8000)
 * listening for broadcast events to trigger UI refreshes.
 */
export const useRealtime = (onUpdate) => {
    const callbackRef = useRef(onUpdate);

    // Keep the ref updated with the latest callback
    useEffect(() => {
        callbackRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        const host = window.location.hostname;
        const socketUrl = `ws://${host}:8000/ws`;
        let socket = null;
        let reconnectTimeout = null;
        let pollingInterval = null;
        let retryDelay = 2000;

        const connect = () => {
            if (socket) {
                try { socket.close(); } catch(e) {}
            }

            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                retryDelay = 2000;
                if (pollingInterval) {
                   clearInterval(pollingInterval);
                   pollingInterval = null;
                }
            };

            socket.onmessage = (event) => {
                try {
                    if (!event.data) return;
                    const data = JSON.parse(event.data);
                    
                    if (callbackRef.current && typeof callbackRef.current === 'function') {
                        callbackRef.current(data);
                    }
                } catch (err) {}
            };

            socket.onclose = (event) => {
                // Polling de respaldo (REGLA #49: Resilencia Híbrida Silenciosa)
                if (!pollingInterval) {
                   pollingInterval = setInterval(() => {
                      if (callbackRef.current) callbackRef.current({ type: 'POLLING_REFRESH' });
                   }, 12000); 
                }

                reconnectTimeout = setTimeout(connect, retryDelay);
                retryDelay = Math.min(retryDelay * 1.5, 15000); 
            };

            socket.onerror = () => {
                if (socket.readyState === WebSocket.OPEN) socket.close();
            };
        };

        connect();

        return () => {
            if (socket) {
                socket.onclose = null;
                socket.close();
            }
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, []);
};
