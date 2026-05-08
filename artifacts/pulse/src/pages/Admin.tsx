import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Users, TrendingUp, Send, CheckCircle, AlertTriangle, RefreshCw, Minus, Plus } from "lucide-react";

const ADMIN_USER_IDS = [4];

interface AdminUser {
  id: number;
  username: string;
  display_name: string;
  avatar_color: string;
  avatar_url: string | null;
  status: string;
  balance: number;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalSpark: number;
}

function getHeader() {
  const uid = localStorage.getItem("pulse-user-id");
  return uid ? { "x-user-id": uid } : {};
}

export default function Admin() {
  const userId = Number(localStorage.getItem("pulse-user-id") || "0");

  if (!ADMIN_USER_IDS.includes(userId)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield size={64} className="mx-auto mb-4 text-destructive opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Доступ запрещён</h2>
          <p className="text-muted-foreground">У вас нет прав администратора</p>
        </div>
      </div>
    );
  }

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [giveAmount, setGiveAmount] = useState<string>("");
  const [giveLoading, setGiveLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [search, setSearch] = useState("");

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users", { headers: getHeader() }),
        fetch("/api/admin/stats", { headers: getHeader() }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGive = async (amount: number) => {
    if (!selectedUser) return;
    setGiveLoading(true);
    try {
      const res = await fetch("/api/admin/give-currency", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getHeader() },
        body: JSON.stringify({ userId: selectedUser.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || "Ошибка", "err"); return; }
      showToast(`✅ ${amount > 0 ? "+" : ""}${amount} ⚡ SPARK → ${selectedUser.display_name}`, "ok");
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: data.newBalance } : u));
      setSelectedUser(prev => prev ? { ...prev, balance: data.newBalance } : null);
      if (stats) setStats(prev => prev ? { ...prev, totalSpark: prev.totalSpark + amount } : null);
      setGiveAmount("");
    } catch { showToast("Ошибка соединения", "err"); }
    setGiveLoading(false);
  };

  const handleCustomAmount = () => {
    const n = Number(giveAmount);
    if (isNaN(n) || n === 0) return showToast("Введите корректную сумму (можно отрицательную)", "err");
    handleGive(n);
  };

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm shadow-2xl backdrop-blur-xl border ${
              toast.type === "ok"
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/20 border-red-500/30 text-red-300"
            }`}
          >
            {toast.type === "ok" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-card/80 backdrop-blur-md shrink-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield className="text-primary" size={20} /> Панель администратора
        </h1>
        <button onClick={fetchData} className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Пользователей</p>
                <p className="text-2xl font-black text-foreground">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Zap size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">SPARK в обороте</p>
                <p className="text-2xl font-black text-foreground">{stats.totalSpark.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Среднний баланс</p>
                <p className="text-2xl font-black text-foreground">
                  {stats.totalUsers > 0 ? Math.round(stats.totalSpark / stats.totalUsers).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground">Пользователи</h2>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="text-sm bg-background border border-border rounded-xl px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-36 transition-colors"
              />
            </div>
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-secondary" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-secondary rounded w-24" />
                      <div className="h-2 bg-secondary rounded w-16" />
                    </div>
                  </div>
                ))
              ) : filtered.map(user => (
                <motion.button
                  key={user.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${selectedUser?.id === user.id ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: user.avatar_color }}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : user.display_name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-sm font-bold shrink-0">
                    <Zap size={12} /> {Number(user.balance).toLocaleString()}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            {selectedUser ? (
              <motion.div
                key={selectedUser.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: selectedUser.avatar_color }}
                  >
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : selectedUser.display_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{selectedUser.display_name}</p>
                    <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-muted-foreground">Баланс</p>
                    <p className="text-xl font-black text-primary flex items-center gap-1">
                      <Zap size={16} /> {Number(selectedUser.balance).toLocaleString()}
                    </p>
                  </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Быстрая выдача ⚡ SPARK</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[50, 100, 500, 1000, 5000, 10000].map(amt => (
                    <motion.button
                      key={amt}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleGive(amt)}
                      disabled={giveLoading}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm hover:bg-primary/20 transition-all disabled:opacity-50"
                    >
                      <Plus size={12} /> {amt >= 1000 ? `${amt / 1000}k` : amt}
                    </motion.button>
                  ))}
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Произвольная сумма</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={giveAmount}
                    onChange={e => setGiveAmount(e.target.value)}
                    placeholder="Сумма (отриц. — списать)"
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors text-sm"
                    onKeyDown={e => e.key === "Enter" && handleCustomAmount()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCustomAmount}
                    disabled={giveLoading || !giveAmount}
                    className="px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    {giveLoading ? "..." : "Выдать"}
                  </motion.button>
                </div>
                <p className="text-xs text-muted-foreground">Введите отрицательное число чтобы списать валюту</p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 text-muted-foreground">
                <Users size={48} className="mb-3 opacity-20" />
                <p className="font-medium">Выберите пользователя</p>
                <p className="text-sm opacity-60 mt-1">для управления балансом ⚡ SPARK</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
