import React, { useRef, useEffect } from "react";
import { useGetChatById, useGetMessages, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { useLocation } from "wouter";

interface ChatWindowProps {
  chatId: number;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { setSelectedChatId } = useAppContext();
  const [, setLocation] = useLocation();
  const { data: chat, isLoading: isChatLoading } = useGetChatById(chatId, { query: { enabled: !!chatId } });
  const { data: messages, isLoading: isMessagesLoading } = useGetMessages({ chatId }, { query: { enabled: !!chatId } });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isChatLoading) {
    return <div className="flex-1 flex flex-col items-center justify-center"><Skeleton className="w-32 h-32 rounded-full mb-4" /><Skeleton className="h-6 w-48" /></div>;
  }

  if (!chat) return <div className="flex-1 flex items-center justify-center">Chat not found</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-4 justify-between bg-card/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground" onClick={() => setSelectedChatId(null)}>
            <ArrowLeft size={20} />
          </button>
          
          <button
            onClick={() => {
              if (chat.type === 'direct' && chat.otherUser?.id) {
                setLocation(`/user/${chat.otherUser.id}`);
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${chat.type === 'direct' ? 'cursor-pointer hover:opacity-85 transition-opacity' : 'cursor-default'}`}
            style={{ backgroundColor: chat.type === 'direct' ? (chat.otherUser?.avatarColor || chat.avatarColor || '#333') : (chat.avatarColor || '#333') }}
          >
            {chat.avatarUrl ? (
              <img src={chat.avatarUrl} alt={chat.type === 'direct' ? (chat.otherUser?.displayName || '') : (chat.name || '')} className="w-full h-full object-cover" />
            ) : (
              (chat.type === 'direct' ? (chat.otherUser?.displayName || 'U') : (chat.name || 'G'))[0].toUpperCase()
            )}
          </button>
          
          <button
            onClick={() => {
              if (chat.type === 'direct' && chat.otherUser?.id) {
                setLocation(`/user/${chat.otherUser.id}`);
              }
            }}
            className={chat.type === 'direct' ? 'text-left hover:opacity-80 transition-opacity cursor-pointer' : 'text-left cursor-default'}
          >
            <h2 className="font-semibold text-sm leading-tight">{chat.type === 'direct' ? (chat.otherUser?.displayName || chat.name) : chat.name}</h2>
            <p className="text-xs text-muted-foreground">
              {chat.type === 'direct' && chat.otherUser ? chat.otherUser.status : `${chat.members?.length || 0} members`}
            </p>
          </button>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <button className="p-2 hover:bg-secondary rounded-full transition-colors hover:text-primary"><Phone size={20} /></button>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors hover:text-primary"><Video size={20} /></button>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors hover:text-primary"><MoreVertical size={20} /></button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gradient-to-b from-background to-card/50"
      >
        {isMessagesLoading ? (
          <div className="space-y-4">
            <Skeleton className="w-2/3 h-16 rounded-2xl rounded-tl-sm" />
            <Skeleton className="w-1/2 h-16 rounded-2xl rounded-tr-sm ml-auto" />
            <Skeleton className="w-3/4 h-24 rounded-2xl rounded-tl-sm" />
          </div>
        ) : messages?.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No messages yet. Send a message to start the conversation!
          </div>
        ) : (
          messages?.slice().reverse().map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-card/80 backdrop-blur-md border-t border-border z-10">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
}
