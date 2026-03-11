'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    error: string | null;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    error: null,
});

export const useSocket = () => useContext(SocketContext);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Only attempt connection if we have a token
        const token = localStorage.getItem('token');
        if (!token) return;

        const socket = io(API_BASE, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            setError(null);
            console.log('[Socket] Connected to backend');
        });

        socket.on('disconnect', () => {
            setConnected(false);
            console.log('[Socket] Disconnected');
        });

        socket.on('connect_error', (err) => {
            setConnected(false);
            setError(err.message);
            console.error('[Socket] Connection error:', err.message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected, error }}>
            {children}
        </SocketContext.Provider>
    );
};
