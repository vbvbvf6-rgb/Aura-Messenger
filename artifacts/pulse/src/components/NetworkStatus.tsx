import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export function NetworkStatus() {
  const [status, setStatus] = useState<"online" | "offline" | "restored">("online");
  const restoredTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Don't flash "online" on first mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!navigator.onLine) setStatus("offline");
    }

    const handleOffline = () => {
      if (restoredTimer.current) {
        clearTimeout(restoredTimer.current);
        restoredTimer.current = null;
      }
      setStatus("offline");
    };

    const handleOnline = () => {
      setStatus("restored");
      restoredTimer.current = setTimeout(() => {
        setStatus("online");
        restoredTimer.current = null;
      }, 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (restoredTimer.current) clearTimeout(restoredTimer.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {(status === "offline" || status === "restored") && (
        <motion.div
          key={status}
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
          className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center pointer-events-none"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-b-2xl text-white text-xs font-semibold shadow-lg pointer-events-auto ${
              status === "offline"
                ? "bg-red-500"
                : "bg-green-500"
            }`}
          >
            {status === "offline" ? (
              <>
                <WifiOff size={14} />
                Нет соединения
              </>
            ) : (
              <>
                <Wifi size={14} />
                Соединение восстановлено
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
