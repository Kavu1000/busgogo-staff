'use client';

// Simple mock for useAdminSocket hook
export const useAdminSocket = () => {
    return {
        socket: null,
        isConnected: false,
        sendMessage: (msg: any) => console.log('Mock send:', msg)
    };
};
