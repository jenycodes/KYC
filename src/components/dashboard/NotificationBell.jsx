import { useEffect, useRef, useState } from "react";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../utils/applicationApi.js";

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const containerRef = useRef(null);

  async function refresh() {
    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch {
      // Non-critical — leave the last-known list in place on a transient failure.
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleToggle() {
    setOpen((v) => !v);
  }

  async function handleMarkRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markNotificationRead(id);
    } catch {
      refresh();
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      refresh();
    }
  }

  return (
    <div className="notif" ref={containerRef}>
      <button
        type="button"
        className="notif__trigger"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
          <path
            d="M10 2.5c-2.2 0-3.8 1.7-3.8 3.9v2.1c0 .7-.3 1.6-.8 2.3l-.7 1c-.5.7 0 1.7.9 1.7h9c.9 0 1.4-1 .9-1.7l-.7-1c-.5-.7-.8-1.6-.8-2.3V6.4c0-2.2-1.6-3.9-3.8-3.9Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M8.3 15.5a1.8 1.8 0 0 0 3.4 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 ? <span className="notif__badge">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="notif__panel">
          <div className="notif__panel-head">
            <span>Notifications</span>
            {unreadCount > 0 ? (
              <button type="button" className="notif__mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <p className="notif__empty">You're all caught up.</p>
          ) : (
            <ul className="notif__list">
              {notifications.slice(0, 15).map((n) => (
                <li
                  key={n.id}
                  className={`notif__item${n.read ? "" : " notif__item--unread"}`}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                >
                  <p className="notif__message">{n.message}</p>
                  <span className="notif__time">{formatTime(n.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
