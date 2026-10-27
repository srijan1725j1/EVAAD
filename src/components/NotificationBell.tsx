import React, { useState, useRef, useEffect } from 'react';
import { AppNotification } from '../types';
import {
  Bell,
  BellRing,
  BellOff,
  Heart,
  MessageCircle,
  Scale,
  Quote,
  CheckCheck,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatRelativeTime } from '../utils/format';
import {
  formatNotificationCopy,
  requestBrowserPushPermission,
} from '../utils/pushNotifications';

interface NotificationBellProps {
  notifications: AppNotification[];
  pushEnabled: boolean;
  onTogglePushEnabled: (enabled: boolean) => void;
  onSelectNotification: (notif: AppNotification) => void;
  onMarkAsRead: (notifId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notifId: string) => void;
  onClearAll: () => void;
  onTriggerTestPush?: () => void;
}

type NotificationFilter = 'all' | 'unread' | 'comments' | 'likes';

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  pushEnabled,
  onTogglePushEnabled,
  onSelectNotification,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onTriggerTestPush,
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [isRinging, setIsRinging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(notifications.length);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Animate bell when a new notification arrives
  useEffect(() => {
    if (notifications.length > prevCountRef.current) {
      setIsRinging(true);
      const timer = setTimeout(() => setIsRinging(false), 1500);
      prevCountRef.current = notifications.length;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = notifications.length;
  }, [notifications.length]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleTogglePush = async () => {
    const nextState = !pushEnabled;
    if (nextState) {
      await requestBrowserPushPermission();
    }
    onTogglePushEnabled(nextState);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'comments') {
      return (
        n.type === 'debate_comment' ||
        n.type === 'post_comment' ||
        n.type === 'post_referenced'
      );
    }
    if (activeFilter === 'likes') {
      return (
        n.type === 'debate_like' ||
        n.type === 'post_like' ||
        n.type === 'argument_like' ||
        n.type === 'post_comment_like'
      );
    }
    return true;
  });

  const renderTypeBadge = (notif: AppNotification) => {
    if (
      notif.type === 'debate_like' ||
      notif.type === 'post_like' ||
      notif.type === 'argument_like' ||
      notif.type === 'post_comment_like'
    ) {
      return (
        <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
          <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
        </div>
      );
    }
    if (notif.type === 'debate_comment') {
      return (
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
            notif.side === 'against'
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : 'bg-sky-500/20 border-sky-500/40 text-sky-400'
          }`}
        >
          <Scale className="w-2.5 h-2.5" />
        </div>
      );
    }
    if (notif.type === 'post_referenced') {
      return (
        <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
          <Quote className="w-2.5 h-2.5" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
        <MessageCircle className="w-2.5 h-2.5" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Notifications & Push Alerts"
        aria-label="Notifications"
        className={`relative flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border transition-all cursor-pointer shrink-0 ${
          isOpen
            ? isDark
              ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
              : 'bg-sky-50 border-sky-300 text-sky-700'
            : isDark
            ? 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.09] text-slate-200'
            : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
        }`}
      >
        {isRinging ? (
          <BellRing className="w-4 h-4 text-sky-400 animate-bounce" />
        ) : pushEnabled ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4 text-slate-400" />
        )}

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center shadow-xs border border-black/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown */}
      {isOpen && (
        <div
          className={`fixed sm:absolute right-2 sm:right-0 top-13 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] max-w-sm sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden transition-all ${
            isDark
              ? 'bg-[#070b16] border-[#182238] text-white shadow-black/80'
              : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
          }`}
        >
          {/* Top Header Bar */}
          <div
            className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 ${
              isDark ? 'border-[#141c30] bg-[#0a0f1e]' : 'border-slate-100 bg-slate-50/80'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Push Alerts ON/OFF Switch */}
              <button
                type="button"
                onClick={handleTogglePush}
                title={
                  pushEnabled
                    ? 'Push alerts enabled for new likes & comments'
                    : 'Click to enable push notifications'
                }
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  pushEnabled
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : isDark
                    ? 'bg-white/[0.04] text-slate-400 border-white/[0.08]'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    pushEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span>{pushEnabled ? 'Push ON' : 'Push OFF'}</span>
              </button>

              {/* Test Live Push Button */}
              {onTriggerTestPush && (
                <button
                  type="button"
                  onClick={onTriggerTestPush}
                  title="Send a live test push alert right now"
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-semibold border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-sky-500/15 border-sky-500/30 text-sky-300 hover:bg-sky-500/25'
                      : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Test</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer sm:hidden"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Pills + Mark All Read */}
          <div
            className={`px-3 py-2 border-b flex items-center justify-between gap-1.5 ${
              isDark ? 'border-[#141c30]' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: 'Unread' },
                  { id: 'comments', label: 'Comments' },
                  { id: 'likes', label: 'Likes' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-sky-500 text-white'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                title="Mark all notifications as read"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300 cursor-pointer shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Scrollable Notifications List */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-[#12192b] custom-comments-scrollbar overscroll-contain">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <Bell
                  className={`w-7 h-7 mx-auto mb-2 opacity-30 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                />
                <p
                  className={`text-xs font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  No notifications in this tab yet.
                </p>
                <p
                  className={`text-[11px] mt-1 ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  When someone likes or comments on your debates or posts, you’ll get an instant alert here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const copy = formatNotificationCopy(notif);
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      onMarkAsRead(notif.id);
                      onSelectNotification(notif);
                      setIsOpen(false);
                    }}
                    className={`px-3.5 py-2.5 flex items-start gap-2.5 cursor-pointer transition-colors ${
                      !notif.read
                        ? isDark
                          ? 'bg-sky-500/[0.07] hover:bg-sky-500/[0.12]'
                          : 'bg-sky-50/70 hover:bg-sky-100/60'
                        : isDark
                        ? 'hover:bg-white/[0.03]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Actor Avatar + Badge */}
                    <div className="relative shrink-0 mt-0.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
                        style={{ backgroundColor: notif.actor.avatarColor || '#0284c7' }}
                      >
                        {notif.actor.initials || 'U'}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        {renderTypeBadge(notif)}
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <p
                          className={`text-xs leading-snug truncate ${
                            isDark ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          <span className="font-bold">
                            {notif.actor.handle || notif.actor.name}
                          </span>{' '}
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                            {copy.actionLabel}
                          </span>
                        </p>
                        <span
                          className={`text-[10px] font-mono shrink-0 ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      {/* Comment Snippet if present */}
                      {notif.commentSnippet && (
                        <p
                          className={`mt-1 text-xs line-clamp-2 rounded-lg px-2 py-1 border ${
                            isDark
                              ? 'bg-[#0b1122] border-[#17213a] text-slate-200'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          &ldquo;{notif.commentSnippet}&rdquo;
                        </p>
                      )}

                      {/* Target Debate/Post Title */}
                      <p
                        className={`mt-1 text-[11px] font-mono truncate ${
                          isDark ? 'text-sky-400/90' : 'text-sky-700'
                        }`}
                      >
                        {notif.targetType === 'debate' ? '⚖️ ' : '💬 '}
                        {notif.targetTitle}
                      </p>
                    </div>

                    {/* Unread Dot + Delete Action */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      {!notif.read && (
                        <span
                          className="w-2 h-2 rounded-full bg-sky-400"
                          title="Unread"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(notif.id);
                        }}
                        title="Remove notification"
                        className="p-1 rounded-md text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          {notifications.length > 0 && (
            <div
              className={`px-3.5 py-2 border-t flex items-center justify-between text-[11px] font-mono ${
                isDark
                  ? 'border-[#141c30] bg-[#090d19] text-slate-400'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <span>
                {notifications.length} total alert{notifications.length === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PushNotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onSelect: (notif: AppNotification) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onClose,
  onSelect,
}) => {
  const { isDark } = useTheme();
  if (!notification) return null;

  const copy = formatNotificationCopy(notification);
  const isLike =
    notification.type === 'debate_like' ||
    notification.type === 'post_like' ||
    notification.type === 'argument_like' ||
    notification.type === 'post_comment_like';

  return (
    <div className="fixed top-15 right-3 sm:right-5 z-50 w-[calc(100vw-1.5rem)] max-w-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        onClick={() => {
          onSelect(notification);
          onClose();
        }}
        className={`p-3 rounded-2xl border shadow-2xl cursor-pointer flex items-start gap-3 backdrop-blur-md transition-all ${
          isDark
            ? 'bg-[#090f20]/95 border-sky-500/40 text-white shadow-black/80'
            : 'bg-white/95 border-sky-300 text-slate-900 shadow-slate-900/15'
        }`}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5"
          style={{ backgroundColor: notification.actor.avatarColor || '#0284c7' }}
        >
          {notification.actor.initials || 'U'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {isLike ? (
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
            ) : (
              <BellRing className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            )}
            <span className="text-xs font-extrabold truncate">{copy.title}</span>
          </div>
          <p
            className={`text-xs line-clamp-2 ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {copy.body}
          </p>
          <span className="mt-1 inline-block text-[10px] font-mono font-bold text-sky-400">
            Tap to view {notification.targetType} →
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
