import React from "react";
import { Link, useLocation } from "wouter";
import {
  MessageCircle,
  Phone,
  Users,
  Gift,
  History,
  UserCircle,
  Settings,
  Rss,
  Wallet,
  MoreHorizontal,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/contexts/AppContext";
import { useGetMe } from "@workspace/api-client-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ADMIN_USER_IDS = [4];

const NAV_ITEMS = [
  { href: "/", icon: MessageCircle, label: "Чаты" },
  { href: "/calls", icon: Phone, label: "Звонки" },
  { href: "/feed", icon: Rss, label: "Лента" },
  { href: "/contacts", icon: Users, label: "Контакты" },
  { href: "/gifts", icon: Gift, label: "Подарки" },
  { href: "/stories", icon: History, label: "Истории" },
  { href: "/wallet", icon: Wallet, label: "Кошелёк" },
  { href: "/profile", icon: UserCircle, label: "Профиль" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAppContext();
  const { data: me } = useGetMe();

  const initial = me?.displayName?.[0]?.toUpperCase() || "U";

  return (
    <div className="hidden md:flex w-16 lg:w-64 h-screen bg-card border-r border-border flex-col items-center lg:items-stretch py-4 flex-shrink-0">
      <div className="flex items-center justify-center lg:justify-start lg:px-6 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,188,212,0.5)]">
          <MessageCircle className="text-primary-foreground" size={24} />
        </div>
        <span className="hidden lg:block ml-3 font-bold text-xl tracking-tight text-white">Pulse</span>
      </div>

      <nav className="flex-1 w-full flex flex-col gap-1 px-2 lg:px-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-primary/10 text-primary shadow-[inset_4px_0_0_0_hsl(var(--primary))]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon
                size={22}
                className={cn(
                  "transition-transform group-hover:scale-110 shrink-0",
                  isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]"
                )}
              />
              <span className="hidden lg:block font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="w-full px-2 lg:px-4 pt-3 mt-auto border-t border-border">
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-secondary transition-colors">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden"
            style={{ backgroundColor: me?.avatarColor || "#3B82F6" }}
          >
            {me?.avatarUrl ? (
              <img src={me.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>

          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{me?.displayName || "..."}</p>
            <p className="text-xs text-muted-foreground truncate">@{me?.username || "..."}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center w-full cursor-pointer">
                  <UserCircle size={15} className="mr-2 text-primary" />
                  Мой профиль
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center w-full cursor-pointer">
                  <Settings size={15} className="mr-2 text-muted-foreground" />
                  Настройки
                </Link>
              </DropdownMenuItem>
              {ADMIN_USER_IDS.includes(me?.id ?? -1) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center w-full cursor-pointer text-purple-400 focus:text-purple-400">
                      <Shield size={15} className="mr-2" />
                      Администратор
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut size={15} className="mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
