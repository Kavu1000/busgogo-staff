'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle, X, ChevronLeft } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';

interface ChatMsg {
    _id: string;
    senderId: string;
    senderName: string;
    senderRole: 'admin' | 'driver';
    message: string;
    createdAt: string;
}

interface TripChatProps {
    tripId: string;
    tripName: string;
    onClose?: () => void;
}

export default function TripChat({ tripId, tripName, onClose }: TripChatProps) {
    const { socket, connected } = useSocket();
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!socket || !connected || !tripId) return;

        console.log(`[Chat] Joining trip: ${tripId}`);
        socket.emit('join_trip', { tripId });

        socket.on('chat_history', (history: ChatMsg[]) => {
            setMessages(history);
        });

        socket.on('new_message', (msg: ChatMsg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('error', ({ message }: { message: string }) => {
            setError(message);
        });

        return () => {
            socket.emit('leave_trip');
            socket.off('chat_history');
            socket.off('new_message');
            socket.off('error');
        };
    }, [socket, connected, tripId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text || !socket || !connected) return;

        socket.emit('send_message', { message: text });
        setInput('');
    };

    const formatTime = (iso: string) => {
        const date = new Date(iso);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full bg-bg-primary border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg lg:hidden"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm truncate max-w-[150px]">{tripName}</h3>
                        <p className="text-[10px] opacity-80">
                            {connected ? '🟢 ອອນລາຍ (Online)' : '🔴 ກຳລັງເຊື່ອມຕໍ່ (Connecting...)'}
                        </p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors hidden lg:block"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-error-light text-error text-[10px] px-4 py-2 border-b border-error/10">
                    ⚠️ {error}
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-tertiary/30">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-tertiary space-y-2">
                        <div className="p-4 bg-bg-secondary rounded-full">
                            <MessageCircle className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-xs">ຍັງບໍ່ມີຂໍ້ຄວາມ (No messages yet)</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderRole === 'admin';
                        const showName = index === 0 || messages[index - 1].senderId !== msg.senderId;

                        return (
                            <div key={msg._id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {showName && (
                                    <span className="text-[10px] text-text-tertiary mb-1 px-1">
                                        {isMe ? 'ຂ້ອຍ (Me)' : msg.senderName} • {formatTime(msg.createdAt)}
                                    </span>
                                )}
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-bg-secondary text-text-primary border border-border rounded-tl-none'
                                    }`}>
                                    {msg.message}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-bg-secondary border-t border-border">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="ພິມຂໍ້ຄວາມ... (Type a message)"
                        className="flex-1 bg-bg-primary border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
                        disabled={!connected}
                    />
                    <button
                        type="submit"
                        disabled={!connected || !input.trim()}
                        className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
