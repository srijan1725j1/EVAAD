import { AppNotification } from '../types';

/**
 * Formats a human-readable notification headline & body for push alerts and dropdown items.
 */
export function formatNotificationCopy(notif: AppNotification): {
  title: string;
  actionLabel: string;
  body: string;
} {
  const actorName = notif.actor.handle || notif.actor.name || 'Someone';

  switch (notif.type) {
    case 'debate_comment':
      return {
        title: `${actorName} argued ${notif.side === 'against' ? 'AGAINST' : 'FOR'} on your debate`,
        actionLabel: `commented ${notif.side === 'against' ? 'AGAINST' : 'FOR'} on your debate`,
        body: notif.commentSnippet
          ? `"${notif.commentSnippet.slice(0, 110)}${notif.commentSnippet.length > 110 ? '…' : ''}"`
          : notif.targetTitle,
      };
    case 'debate_like':
      return {
        title: `${actorName} liked your debate`,
        actionLabel: 'liked your debate topic',
        body: notif.targetTitle,
      };
    case 'argument_like':
      return {
        title: `${actorName} liked your debate argument`,
        actionLabel: 'liked your argument in',
        body: notif.commentSnippet || notif.targetTitle,
      };
    case 'post_comment':
      return {
        title: `${actorName} commented on your post`,
        actionLabel: 'replied to your post',
        body: notif.commentSnippet
          ? `"${notif.commentSnippet.slice(0, 110)}${notif.commentSnippet.length > 110 ? '…' : ''}"`
          : notif.targetTitle,
      };
    case 'post_like':
      return {
        title: `${actorName} liked your post`,
        actionLabel: 'liked your post',
        body: notif.targetTitle,
      };
    case 'post_comment_like':
      return {
        title: `${actorName} liked your comment`,
        actionLabel: 'liked your comment on',
        body: notif.commentSnippet || notif.targetTitle,
      };
    case 'post_referenced':
      return {
        title: `${actorName} started a debate from your post`,
        actionLabel: 'referenced your post in a debate',
        body: notif.targetTitle,
      };
    default:
      return {
        title: `${actorName} interacted with your post`,
        actionLabel: 'interacted with your post',
        body: notif.targetTitle,
      };
  }
}

/**
 * Plays a soft, pleasant two-tone notification chime using the Web Audio API.
 */
export function playNotificationChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.09); // A5

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);
  } catch {
    // AudioContext blocked before user gesture — ignore silently
  }
}

/**
 * Requests browser Notification permission safely (handles iframe restrictions gracefully).
 */
export async function requestBrowserPushPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  try {
    const result = await Notification.requestPermission();
    return result === 'granted' ? 'granted' : 'denied';
  } catch {
    return 'unsupported';
  }
}

/**
 * Sends a native browser / service-worker push notification when permission is granted.
 */
export function triggerBrowserPushNotification(
  notif: AppNotification,
  onClickNotification?: (notif: AppNotification) => void
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const { title, body } = formatNotificationCopy(notif);

  try {
    const browserNotif = new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      badge: '/favicon.png',
      tag: notif.id,
    });
    browserNotif.onclick = () => {
      window.focus();
      if (onClickNotification) {
        onClickNotification(notif);
      }
      browserNotif.close();
    };
  } catch {
    // Fallback to ServiceWorkerRegistration.showNotification if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/pwa-192x192.png',
            badge: '/favicon.png',
            tag: notif.id,
          });
        })
        .catch(() => {});
    }
  }
}
