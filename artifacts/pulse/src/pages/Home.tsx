import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useAppContext } from "@/contexts/AppContext";

const SWIPE_THRESHOLD = 90;   // px needed to trigger close
const SWIPE_VELOCITY = 0.4;   // px/ms — fast flick counts even if short

export default function Home() {
  const { selectedChatId, setSelectedChatId } = useAppContext();

  // ── swipe state ──────────────────────────────────────────────────────────
  const touchStartX = useRef(0);
  const touchStartTime = useRef(0);
  const [dragX, setDragX] = useState(0);        // current drag offset
  const [closing, setClosing] = useState(false); // animate-out in progress
  const dragging = useRef(false);

  const closeChat = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setSelectedChatId(null);
      setClosing(false);
      setDragX(0);
    }, 220);
  }, [setSelectedChatId]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start tracking when touch begins near the left edge (first 40px)
    // or anywhere — we allow full-width swipe
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    dragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    if (dx > 0) {
      setDragX(dx);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    dragging.current = false;

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dt = Date.now() - touchStartTime.current;
    const velocity = dx / dt;

    if (dx > SWIPE_THRESHOLD || (dx > 30 && velocity > SWIPE_VELOCITY)) {
      closeChat();
    } else {
      setDragX(0); // snap back
    }
  };

  // ── open-chat event ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const chatId = (e as CustomEvent).detail;
      if (chatId) setSelectedChatId(Number(chatId));
    };
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, [setSelectedChatId]);

  // ── hardware / browser back button ───────────────────────────────────────
  useEffect(() => {
    if (!selectedChatId) return;
    const onPopState = (e: PopStateEvent) => {
      e.preventDefault();
      closeChat();
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selectedChatId, closeChat]);

  // ── resolve swipe transform ──────────────────────────────────────────────
  const screenW = typeof window !== "undefined" ? window.innerWidth : 400;
  const overlayX = closing ? screenW : dragX;
  const isAnimating = closing || dragX === 0;

  return (
    <div className="flex w-full h-full">
      <ChatList />
      <div className="flex-1 hidden md:flex">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <div className="w-8 h-8 bg-primary rounded-full" />
              </div>
              <h2 className="text-xl font-bold mb-2">Pulse</h2>
              <p className="text-muted-foreground max-w-sm">
                Выберите чат слева или найдите пользователя чтобы начать переписку.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile chat overlay with swipe-to-close ─────────────────────── */}
      {selectedChatId && (
        <>
          {/* Dim the chat list behind while dragging */}
          {dragX > 0 && (
            <div
              className="absolute inset-0 z-[9] md:hidden pointer-events-none"
              style={{ background: `rgba(0,0,0,${0.25 * (1 - dragX / screenW)})` }}
            />
          )}

          <div
            className="absolute inset-0 z-10 md:hidden bg-background"
            style={{
              transform: `translateX(${overlayX}px)`,
              transition: isAnimating ? "transform 0.22s cubic-bezier(0.32,0,0.67,0)" : "none",
              willChange: "transform",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Swipe hint edge — a subtle left shadow that appears while dragging */}
            {dragX > 0 && (
              <div
                className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none"
                style={{
                  background: "linear-gradient(to right, rgba(var(--primary),0.6), transparent)",
                  opacity: Math.min(dragX / 60, 1),
                }}
              />
            )}
            <ChatWindow chatId={selectedChatId} />
          </div>
        </>
      )}
    </div>
  );
}
