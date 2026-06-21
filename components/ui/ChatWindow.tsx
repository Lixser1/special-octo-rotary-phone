"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "./Button";

export function ChatWindow({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack?: () => void;
}) {
  const activeUserId = useAppStore((state) => state.activeUserId);
  const users = useAppStore((state) => state.users);
  const chats = useAppStore((state) => state.chats);
  const sendChatMessage = useAppStore((state) => state.sendChatMessage);

  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === chatId);
  const currentUser = users.find((u) => u.id === activeUserId);

  useEffect(() => {
    // Scroll to bottom on load or new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length]);

  if (!chat || !currentUser) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500">
        Чат не найден
      </div>
    );
  }

  // Find the other user
  const otherUserId =
    chat.customerId === currentUser.id ? chat.teacherId : chat.customerId;
  const otherUser = users.find((u) => u.id === otherUserId);
  const otherUserName = otherUser?.name ?? "Собеседник";

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendChatMessage(chat.id, currentUser.id, currentUser.name, text.trim());
    setText("");
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-[550px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            ← Назад
          </button>
        )}
        {otherUser && (
          <img
            src={otherUser.avatar}
            alt={otherUserName}
            className="h-8 w-8 rounded-full border border-slate-200 object-cover"
          />
        )}
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            {otherUserName}
          </h3>
          <p className="text-[10px] text-slate-400">Обсуждение заказа</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 space-y-3">
        {chat.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-400 py-12">
            <svg
              className="mx-auto h-12 w-12 text-slate-300 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm">Нет сообщений</p>
            <p className="text-xs text-slate-400">Начните обсуждение деталей проекта!</p>
          </div>
        ) : (
          chat.messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-bold text-blue-500 mb-0.5">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  <span
                    className={`block text-[9px] text-right mt-1 ${
                      isMe ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-slate-100 bg-white p-3"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите сообщение..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <Button type="submit" disabled={!text.trim()}>
          Отправить
        </Button>
      </form>
    </div>
  );
}
