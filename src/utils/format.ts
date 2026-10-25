// Compact number and time formatting utilities

/**
 * Formats numbers into compact 'k' and 'm' notation
 * e.g., 842 -> "842", 1256 -> "1.3k", 14200 -> "14.2k", 100000 -> "100k", 2400000 -> "2.4m"
 */
export function formatCompactNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '0';
  if (num < 1000) return num.toString();
  
  if (num < 1000000) {
    const k = num / 1000;
    // If >= 100k, don't show decimal (e.g. 100k)
    // If < 10k, show 1 decimal (e.g. 1.3k, 9.8k)
    if (k >= 100) {
      return `${Math.round(k)}k`;
    }
    const formatted = k.toFixed(1);
    return formatted.endsWith('.0') ? `${Math.round(k)}k` : `${formatted}k`;
  }

  const m = num / 1000000;
  if (m >= 100) {
    return `${Math.round(m)}m`;
  }
  const formatted = m.toFixed(1);
  return formatted.endsWith('.0') ? `${Math.round(m)}m` : `${formatted}m`;
}

/**
 * Format relative time (e.g., "now", "2m", "4h", "2d")
 */
export function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d`;
  return new Date(dateString).toLocaleDateString([], { month: 'short', day: 'numeric' });
}
