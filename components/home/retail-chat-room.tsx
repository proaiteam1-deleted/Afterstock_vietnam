"use client";

import { MessageCircle, Send } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  initialChatMessages,
  randomNicknames,
  type ChatMessageSeed,
} from "@/lib/mock/market-community";
import {
  getChatNickname,
  getOrSeedChatMessages,
  setChatNickname,
  updateChatMessages,
} from "@/lib/storage";

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function createRandomNickname() {
  const baseName = randomNicknames[Math.floor(Math.random() * randomNicknames.length)];
  const suffix = Math.floor(100 + Math.random() * 900);

  return `${baseName}${suffix}`;
}

function readOrCreateNickname() {
  const storedNickname = getChatNickname();

  if (storedNickname) {
    return storedNickname;
  }

  const nextNickname = createRandomNickname();
  setChatNickname(nextNickname);

  return nextNickname;
}

export function RetailChatRoom() {
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("랜덤투자자000");
  const [messages, setMessages] = useState<ChatMessageSeed[]>(initialChatMessages);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setNickname(readOrCreateNickname());
      setMessages(getOrSeedChatMessages());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    // TODO: Add a profanity and spam filter before messages are persisted.
    const nextMessages = updateChatMessages((currentMessages) => [
      {
        id: `local-${Date.now()}`,
        nickname,
        message: trimmedMessage,
        timeLabel: getCurrentTimeLabel(),
      },
      ...currentMessages,
    ]);

    setMessages(nextMessages);
    setMessage("");
  }

  return (
    <Card className="lg:sticky lg:top-24">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>실시간 투자자 수다방</CardTitle>
            <CardDescription>지금 투자자들이 제일 많이 이야기하는 중</CardDescription>
          </div>
          <MessageCircle className="h-5 w-5 text-cyan-200" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300">
          내 닉네임: <span className="font-semibold text-white">{nickname}</span>
        </div>

        <div className="max-h-[390px] space-y-3 overflow-y-auto pr-1">
          {messages.map((item) => (
            <div key={item.id} className="rounded-lg bg-white/[0.055] p-3">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-cyan-100">{item.nickname}</span>
                <span className="text-slate-500">{item.timeLabel}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-200">{item.message}</p>
            </div>
          ))}
        </div>

        <form className="flex gap-2" onSubmit={handleSubmit}>
          <input
            className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/50"
            value={message}
            placeholder="메시지를 남겨보세요"
            maxLength={120}
            onChange={(event) => setMessage(event.target.value)}
          />
          <Button type="submit" size="icon" aria-label="메시지 보내기">
            <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
