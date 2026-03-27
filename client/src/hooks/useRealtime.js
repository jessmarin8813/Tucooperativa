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
        let socket;
        let reconnectTimeout;

        const connect = () => {
            console.log('🔌 Conectando a Realtime Hub...');
            socket = new WebSocket(socketUrl);

            socket.onopen = () => {
                console.log('✅ Conectado a Realtime Hub');
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📩 Evento Realtime recibido:', data);
                    
                    // Trigger the latest refresh callback via ref
                    if (callbackRef.current) {
                        callbackRef.current(data);
                    }
                } catch (err) {
                    console.error('❌ Error parseando evento realtime:', err);
                }
            };

            socket.onclose = () => {
                console.log('🔌 Desconectado de Realtime Hub. Reintentando en 5s...');
                reconnectTimeout = setTimeout(connect, 5000);
            };

            socket.onerror = (err) => {
                console.error('❌ Error en WebSocket:', err);
                socket.close();
            };
        };

        connect();

        return () => {
            if (socket) socket.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, []); // Only once on mount
};
