/**
 * Copies text to clipboard with modern navigator.clipboard and reliable legacy fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback to textarea execCommand below
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Generates an absolute share link for a debate, optionally pinpointing an individual argument
 */
export function getShareUrl(debateId: string, argumentId?: string): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const url = new URL(`${origin}${pathname}`);
  url.searchParams.set('debate', debateId);
  if (argumentId) {
    url.searchParams.set('arg', argumentId);
  }
  return url.toString();
}
