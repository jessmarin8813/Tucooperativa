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

            console.log('🔌 Conectando a Realtime Hub...');
            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                console.log('✅ Conectado a Realtime Hub');
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
                } catch (err) {
                    console.warn('⚠️ Realtime: Mensaje malformado ignorado.');
                }
            };

            socket.onclose = (event) => {
                // Activar Polling de respaldo si no hay WebSocket
                if (!pollingInterval) {
                   console.info('ℹ️ Usando modo Polling (Respaldo Silencioso)...');
                   pollingInterval = setInterval(() => {
                      if (callbackRef.current) callbackRef.current({ type: 'POLLING_REFRESH' });
                   }, 30000);
                }

                // Reconexión con backoff para no estresar al servidor
                reconnectTimeout = setTimeout(connect, retryDelay);
                retryDelay = Math.min(retryDelay * 1.5, 30000); 
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
