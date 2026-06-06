import React from "react";
import { Link, useLocation } from "wouter";
import { MessageCircle, Phone, Users, Rss, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetChats } from "@workspace/api-client-react";
import { useAppContext } from "@/contexts/AppContext";

interface BottomNavProps {
  onOpenPalette?: () => void;
  onOpenSidebar?: () => void;
}

export function BottomNav({ onOpenPalette, onOpenSidebar }: BottomNavProps) {
  const [location] = useLocation();
  const { data: chats } = useGetChats();
  const { selectedChatId } = useAppContext();

  const totalUnread = chats?.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0) ?? 0;

  const NAV_ITEMS = [
    { href: "/",         icon: MessageCircle, label: "Чаты",    badge: totalUnread },
    { href: "/calls",    icon: Phone,         label: "Звонки",  badge: 0 },
    { href: "/contacts", icon: Users,         label: "Контакты",badge: 0 },
    { href: "/feed",     icon: Rss,           label: "Лента",   badge: 0 },
  ];

  if (selectedChatId && location === "/") return null;

  return (
    <nav
      className="flex md:hidden fixed bottom-0 inset-x-0 z-50 pointer-events-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="w-full bg-background/80 backdrop-blur-2xl border-t border-white/10 dark:border-white/5 flex items-stretch justify-around px-2 pointer-events-auto shadow-[0_-8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.2)]">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === "/"
            ? location === "/"
            : location.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 py-2.5 min-h-[56px] landscape:py-1 landscape:min-h-[44px] transition-all duration-300 group rounded-xl my-1",
                isActive ? "text-primary" : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              <div className="relative">
                <item.icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("transition-transform duration-300", isActive ? "scale-110 drop-shadow-md" : "group-active:scale-95")}
                  fill={isActive ? "currentColor" : "none"}
                />
                {item.badge > 0 && (
                  <div className={cn(
                    "absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center shadow-sm border-[2px]",
                    isActive ? "bg-white text-primary border-primary" : "bg-primary text-white border-background"
                  )}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </div>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-bold leading-none transition-colors landscape:hidden",
                isActive ? "text-primary" : "text-muted-foreground/80"
              )}>
                {item.label}
              </span>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-0 inset-x-4 h-[3px] bg-primary rounded-b-full shadow-[0_0_8px_rgba(234,88,12,0.6)]" />
              )}
            </Link>
          );
        })}

        <button
          onClick={onOpenSidebar}
          className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2.5 min-h-[56px] landscape:py-1 landscape:min-h-[44px] transition-all duration-300 group rounded-xl my-1 text-muted-foreground hover:bg-secondary/50"
        >
          <Menu size={24} strokeWidth={2} className="group-active:scale-95 transition-transform" />
          <span className="text-[10px] font-bold leading-none text-muted-foreground/80 landscape:hidden">Ещё</span>
        </button>
      </div>
    </nav>
  );
}