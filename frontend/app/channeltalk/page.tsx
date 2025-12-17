"use client";

import { useRouter } from "next/navigation";
import { X, Smile, Paperclip, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAtom } from "jotai";
import {
  messagesAtom,
  currentInputAtom,
  type Message,
} from "@/components/inquiry/inquiry-atom";
import { getMockAIResponse } from "@/lib/mock-ai-service";
import { useState, useRef, useEffect } from "react";

export default function ChannelTalkPage() {
  const router = useRouter();
  const [messages, setMessages] = useAtom(messagesAtom);
  const [currentInput, setCurrentInput] = useAtom(currentInputAtom);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 뒤로 가기
  const handleClose = () => {
    router.back();
  };

  // 메시지 전송
  const handleSendMessage = async (content: string, category?: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      const aiResponse = await getMockAIResponse(content, category);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI 응답 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키로 전송
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentInput);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      {/* 백그라운드 클릭 시 닫기 */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* 중앙 모달 카드 */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[680px] flex flex-col overflow-hidden relative z-10">
        {/* 상단 헤더 영역 - Learn, Share, and Grow */}
        <div className="relative bg-gradient-to-br from-green-50 to-green-100 p-6 pb-8 flex-shrink-0">
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Learn, Share, and Grow 텍스트 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#00c875] leading-tight">
              Learn,
              <br />
              Share,
              <br />
              and Grow.
            </h1>
          </div>

          {/* 인프런 로고/타이틀 */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">인프런</h2>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              운영시간 보기 &gt;
            </button>
          </div>
        </div>

        {/* 메시지 영역 - 스크롤 가능 */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50"
        >
          {/* 환영 메시지 - 초기 화면 */}
          {messages.length === 0 ? (
            <div className="space-y-4">
              {/* 인프런 봇 메시지 */}
              <div className="flex gap-3 items-start">
                <Avatar className="w-10 h-10 bg-[#00c875] flex-shrink-0">
                  <AvatarFallback className="text-white font-bold text-sm">
                    인
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">인프런</span>
                    <span className="text-xs text-gray-400">13시간 전</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <p className="text-sm text-gray-700">
                      문의사항을 입력해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 채팅 메시지들 */
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-10 h-10 bg-[#00c875] flex-shrink-0 mr-3">
                      <AvatarFallback className="text-white font-bold text-sm">
                        인
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-[#00c875] text-white rounded-br-none"
                        : "bg-white text-gray-900 rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-white/70"
                          : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* 로딩 인디케이터 */}
              {isLoading && (
                <div className="flex justify-start">
                  <Avatar className="w-10 h-10 bg-[#00c875] flex-shrink-0 mr-3">
                    <AvatarFallback className="text-white font-bold text-sm">
                      인
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="bg-gray-100 rounded-2xl p-3">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="AI에게 질문해 주세요."
              className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
              rows={2}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="text-green-500">⚡</span>
                  AI가 바로 답변해 드려요
                </span>
              </div>
            </div>
          </div>
          <div className="text-center mt-2">
            <button className="text-xs text-gray-400 hover:text-gray-600">
              채널톡 이용중
            </button>
          </div>
        </div>

        {/* 하단 네비게이션 */}
        <div className="flex border-t border-gray-200 bg-white flex-shrink-0">
          <button className="flex-1 py-4 flex flex-col items-center gap-1 text-[#00c875]">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs font-medium">홈</span>
          </button>
          <button className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-400">
            <svg
              className="w-6 h-6"
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
            <span className="text-xs font-medium">대화</span>
          </button>
          <button className="flex-1 py-4 flex flex-col items-center gap-1 text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs font-medium">설정</span>
          </button>
        </div>
      </div>
    </div>
  );
}
