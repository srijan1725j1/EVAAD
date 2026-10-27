import { db, doc, getDoc, setDoc, deleteDoc, ensureAuthUser, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { generateFunnyDesiHandle, PUBLIC_USERNAME_COOLDOWN_MS } from './anonymous';

const RESERVED_USERNAMES = new Set([
  'admin',
  'evaad',
  'moderator',
  'system',
  'official',
  'support',
  'help',
  'api',
  'root',
  'security',
]);

export function cleanUsername(input: string): string {
  return input
    .trim()
    .replace(/^@+/, '')
    .replace(/^u\//, '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export function isValidUsername(input: string): { valid: boolean; message?: string } {
  const clean = cleanUsername(input);

  if (!clean || clean.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long.' };
  }
  if (clean.length > 25) {
    return { valid: false, message: 'Username cannot exceed 25 characters.' };
  }
  if (!/^[a-z0-9_]+$/.test(clean)) {
    return { valid: false, message: 'Only letters, numbers, and underscores are allowed.' };
  }
  if (RESERVED_USERNAMES.has(clean)) {
    return { valid: false, message: 'This username is reserved.' };
  }
  return { valid: true };
}

/**
 * Look up if a user (by UID) already has a saved Public Post Profile in Firestore.
 * NOTE: This is ONLY for the Public Post section. Debate personas are NEVER stored with a UID.
 */
export async function findOwnedPublicProfileByUid(uid: string): Promise<{
  handle: string;
  displayName?: string;
  usernameChangedAt?: string;
} | null> {
  if (!uid) return null;
  try {
    const q = query(collection(db, 'usernames'), where('uid', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const firstDoc = snap.docs[0].data();
      if (firstDoc?.handle) {
        return {
          handle: cleanUsername(firstDoc.handle),
          displayName: typeof firstDoc.displayName === 'string' ? firstDoc.displayName : undefined,
          usernameChangedAt: typeof firstDoc.usernameChangedAt === 'string' ? firstDoc.usernameChangedAt : undefined,
        };
      }
    }
  } catch (err) {
    console.warn('findOwnedPublicProfileByUid fallback:', err);
  }
  return null;
}

export async function findOwnedHandleByUid(uid: string): Promise<string | null> {
  const res = await findOwnedPublicProfileByUid(uid);
  return res ? res.handle : null;
}

/**
 * Check if a Public Post username handle is available or owned by current UID.
 */
export async function checkUsernameAvailability(
  handle: string,
  currentUid?: string
): Promise<{ available: boolean; message: string; clean: string }> {
  const clean = cleanUsername(handle);
  const validation = isValidUsername(clean);

  if (!validation.valid) {
    return { available: false, message: validation.message || 'Invalid username', clean };
  }

  try {
    const userRef = doc(db, 'usernames', clean);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return { available: true, message: 'Username is available!', clean };
    }

    const data = snap.data();
    if (currentUid && data?.uid === currentUid) {
      return { available: true, message: 'This is your current public username.', clean };
    }

    return { available: false, message: 'Username is already taken by another user.', clean };
  } catch (error) {
    console.warn('Username check fallback note:', error);
    return { available: true, message: 'Username looks good!', clean };
  }
}

/**
 * Claim and reserve a unique Public Post username for a given user UID,
 * enforcing the 30-day (1-month) username change limit when switching from a previously set username.
 */
export async function claimUsername(
  newHandle: string,
  uid: string,
  previousHandle?: string,
  displayName?: string,
  lastUsernameChangedAt?: string
): Promise<{
  success: boolean;
  handle: string;
  usernameChangedAt?: string;
  message: string;
}> {
  const clean = cleanUsername(newHandle);
  const oldClean = previousHandle ? cleanUsername(previousHandle) : '';
  const isHandleChanging = Boolean(oldClean && oldClean !== clean);

  // Enforce 30-day (1-month) cooldown if the user already changed their public username within the last 30 days
  if (isHandleChanging && lastUsernameChangedAt) {
    const lastMs = new Date(lastUsernameChangedAt).getTime();
    if (!Number.isNaN(lastMs) && Date.now() - lastMs < PUBLIC_USERNAME_COOLDOWN_MS) {
      const daysLeft = Math.max(
        1,
        Math.ceil((PUBLIC_USERNAME_COOLDOWN_MS - (Date.now() - lastMs)) / (24 * 60 * 60 * 1000))
      );
      return {
        success: false,
        handle: oldClean,
        usernameChangedAt: lastUsernameChangedAt,
        message: `Public Post username can only be changed once every 30 days (${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining). Your Debate anonymous handle has no limits!`,
      };
    }
  }

  const check = await checkUsernameAvailability(clean, uid);
  if (!check.available) {
    return { success: false, handle: clean, message: check.message };
  }

  const nowIso = new Date().toISOString();
  const nextChangedAt = isHandleChanging ? nowIso : lastUsernameChangedAt || nowIso;

  try {
    await ensureAuthUser();

    const newRef = doc(db, 'usernames', clean);
    await setDoc(newRef, {
      handle: clean,
      uid,
      ...(displayName ? { displayName: displayName.trim().slice(0, 80) } : {}),
      usernameChangedAt: nextChangedAt,
      updatedAt: nowIso,
    });

    if (isHandleChanging && oldClean) {
      try {
        const oldRef = doc(db, 'usernames', oldClean);
        const oldSnap = await getDoc(oldRef);
        if (oldSnap.exists() && oldSnap.data()?.uid === uid) {
          await deleteDoc(oldRef);
        }
      } catch (cleanupErr) {
        console.warn('Previous username release note:', cleanupErr);
      }
    }

    return {
      success: true,
      handle: clean,
      usernameChangedAt: nextChangedAt,
      message: isHandleChanging
        ? `Public @${clean} saved! (Next username change available in 30 days)`
        : `Public profile updated!`,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `usernames/${clean}`);
    return { success: false, handle: clean, message: 'Failed to reserve username. Please try again.' };
  }
}

/**
 * Generate 6 funny, readable Reddit-style Indian-tone random username suggestions
 * for the Anonymous Debate section. NEVER uses the user's real name or public handle.
 */
export function generateUsernameSuggestions(): string[] {
  const suggestions: string[] = [];
  let attempts = 0;

  while (suggestions.length < 6 && attempts < 30) {
    attempts++;
    const candidate = cleanUsername(generateFunnyDesiHandle()).slice(0, 25);
    if (candidate.length >= 4 && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
  }

  return suggestions;
}
