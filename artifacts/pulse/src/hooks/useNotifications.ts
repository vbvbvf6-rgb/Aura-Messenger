import { useState, useCallback, useEffect } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof Notification === "undefined") return "denied";
    if (Notification.permission === "denied") return "denied";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const notify = useCallback(
    (title: string, options: { body?: string; icon?: string; url?: string; tag?: string; type?: "message" | "call" | "gift" } = {}) => {
      if (typeof Notification === "undefined") return;
      if (Notification.permission !== "granted") return;
      if (document.visibilityState === "visible" && document.hasFocus()) return;

      const type = options.type ?? "message";
      if (type === "message" && localStorage.getItem("pulse-notify-messages") === "false") return;
      if (type === "call" && localStorage.getItem("pulse-notify-calls") === "false") return;
      if (type === "gift" && localStorage.getItem("pulse-notify-gifts") === "false") return;

      const showPreview = localStorage.getItem("pulse-notify-preview") !== "false";
      const body = showPreview ? (options.body || "") : "";

      const notifOpts: NotificationOptions = {
        body,
        icon: options.icon || "/favicon.svg",
        badge: "/favicon.svg",
        tag: options.tag || "pulse-message",
        silent: localStorage.getItem("pulse-notify-sounds") === "false",
        data: { url: options.url || "/" },
      };

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "show-notification",
          title,
          ...notifOpts,
          url: options.url || "/",
        });
      } else {
        try {
          new Notification(title, notifOpts);
        } catch {}
      }
    },
    []
  );

  const isSupported = typeof Notification !== "undefined";

  return { permission, requestPermission, notify, isSupported };
}
