import { useEffect } from 'react';

/**
 * useRealtime Hook
 * Connects to the Python Realtime Hub (port 8000)
 * listening for broadcast events to trigger UI refreshes.
 */
export const useRealtime = (onUpdate) => {
    useEffect(() => {
        // Use the same host as the web app (supports LAN access)
        const host = window.location.hostname;
        const socketUrl = `ws://${host}:8000/ws`;
        let socket;

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
                    
                    // Trigger the refresh callback
                    if (onUpdate) {
                        onUpdate(data);
                    }
                } catch (err) {
                    console.error('❌ Error parseando evento realtime:', err);
                }
            };

            socket.onclose = () => {
                console.log('🔌 Desconectado de Realtime Hub. Reintentando en 5s...');
                setTimeout(connect, 5000); // Auto-reconnect
            };

            socket.onerror = (err) => {
                console.error('❌ Error en WebSocket:', err);
                socket.close();
            };
        };

        connect();

        return () => {
            if (socket) socket.close();
        };
    }, []); // Only once on mount
};
