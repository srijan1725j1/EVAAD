import React, { useState, useEffect } from 'react';
import {
  Debate,
  Argument,
  Author,
  AuthenticityResult,
  DebateSummary,
  SocialPost,
  PostComment,
  AppNotification,
  AnonymousModerationReport,
} from './types';
import {
  getStoredDebates,
  saveStoredDebates,
  getStoredArguments,
  saveStoredArguments,
  getStoredSocialPosts,
  saveStoredSocialPosts,
  getStoredPostComments,
  saveStoredPostComments,
  getStoredUserVotes,
  saveStoredUserVotes,
  getStoredUserArgLikes,
  saveStoredUserArgLikes,
  getStoredUserDebateLikes,
  saveStoredUserDebateLikes,
  getStoredUserPostLikes,
  saveStoredUserPostLikes,
  getStoredUserPostCommentLikes,
  saveStoredUserPostCommentLikes,
  getStoredNotifications,
  saveStoredNotifications,
  getStoredPushEnabled,
  saveStoredPushEnabled,
  getStoredReportedItems,
  saveStoredReportedItems,
  getStoredAnonymousReports,
  saveStoredAnonymousReports,
} from './utils/storage';
import {
  getCurrentAuthor,
  saveCurrentAuthor,
  getPublicPostAuthor,
  savePublicPostAuthor,
  stripTraceableFieldsForDebate,
  generateFunnyDesiHandle,
  deriveInitialsFromHandle,
  deriveInitialsFromName,
} from './utils/anonymous';
import { TopicCard } from './components/TopicCard';
import { DebateChatView } from './components/DebateChatView';
import { CreateDebateModal } from './components/CreateDebateModal';
import { PostsSection } from './components/PostsSection';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SettingsModal } from './components/SettingsModal';
import { EvaadLogo } from './components/EvaadLogo';
import { LanguageSelectorButton } from './components/LanguageSelectorButton';
import { AiSearchCard, AiSearchSynthesis } from './components/AiSearchCard';
import { TrendingPulseSection } from './components/TrendingPulseSection';
import { NotificationBell, PushNotificationToast } from './components/NotificationBell';
import { ReportModal, ReportTargetInfo } from './components/ReportModal';
import {
  playNotificationChime,
  triggerBrowserPushNotification,
} from './utils/pushNotifications';
import { useTheme } from './contexts/ThemeContext';
import { useLanguage } from './contexts/LanguageContext';
import {
  Plus,
  Search,
  Sparkles,
  Flame,
  Settings as SettingsIcon,
  X,
  Scale,
  MessageSquareText,
  VenetianMask,
  User,
} from 'lucide-react';
import {
  auth,
  db,
  ensureAuthUser,
  testConnection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  cleanUsername,
  checkUsernameAvailability,
  claimUsername,
  findOwnedPublicProfileByUid,
} from './utils/username';

// Recursively strip undefined fields before writing to Firestore
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirestore(v);
    }
  }
  return clean as T;
}

export default function App() {
  const { isDark } = useTheme();
  const { t, getTranslatedEntry } = useLanguage();
  const [debates, setDebates] = useState<Debate[]>(() => getStoredDebates());
  const [argumentsList, setArgumentsList] = useState<Argument[]>(() => getStoredArguments());
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => getStoredSocialPosts());
  const [postComments, setPostComments] = useState<PostComment[]>(() => getStoredPostComments());
  const [userVotes, setUserVotes] = useState<Record<string, 'for' | 'against'>>(() =>
    getStoredUserVotes()
  );
  const [userArgLikes, setUserArgLikes] = useState<Record<string, boolean>>(() =>
    getStoredUserArgLikes()
  );
  const [userDebateLikes, setUserDebateLikes] = useState<Record<string, boolean>>(() =>
    getStoredUserDebateLikes()
  );
  const [userPostLikes, setUserPostLikes] = useState<Record<string, boolean>>(() =>
    getStoredUserPostLikes()
  );
  const [userPostCommentLikes, setUserPostCommentLikes] = useState<Record<string, boolean>>(() =>
    getStoredUserPostCommentLikes()
  );
  // IDENTITY 1: 100% Untraceable Anonymous Debate Persona (Used ONLY in Debates & Arguments — unlimited changes)
  const [currentAuthor, setCurrentAuthor] = useState<Author>(() =>
    stripTraceableFieldsForDebate(getCurrentAuthor())
  );
  // IDENTITY 2: Public Post Profile with Real Name + Desired @Username (Used ONLY in Posts — 30-day username cooldown)
  const [publicPostAuthor, setPublicPostAuthor] = useState<Author>(() => getPublicPostAuthor());
  const [settingsInitialTab, setSettingsInitialTab] = useState<'debate' | 'post'>('debate');

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getStoredNotifications(getCurrentAuthor().handle)
  );
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => getStoredPushEnabled());
  const [activePushToast, setActivePushToast] = useState<AppNotification | null>(null);
  const [selectedDebate, setSelectedDebate] = useState<Debate | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [draftReferencePost, setDraftReferencePost] = useState<SocialPost | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reportedItems, setReportedItems] = useState<Record<string, boolean>>(() =>
    getStoredReportedItems()
  );
  const [reportTarget, setReportTarget] = useState<ReportTargetInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  // 2 Main Sections ('debates' | 'posts') + 1 Sub-Section ('trending')
  const [activeSection, setActiveSection] = useState<'debates' | 'posts' | 'trending'>('debates');
  const [isContestedOnly, setIsContestedOnly] = useState(false);

  // Test connection & ensure auth on mount
  useEffect(() => {
    testConnection();
    ensureAuthUser();
  }, []);

  // Listen to Firebase Auth state — bind Google account EXCLUSIVELY to Public Post Profile
  // NEVER attach Google UID or real name to the Anonymous Debate Persona (currentAuthor)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        const localPostAuthor = getPublicPostAuthor();
        const debatePersona = getCurrentAuthor();
        const debateHandleClean = cleanUsername(debatePersona.handle);
        let cleanHandle = cleanUsername(localPostAuthor.handle);
        // Ensure Public Post handle is never identical to Anonymous Debate handle
        if (cleanHandle === debateHandleClean) {
          cleanHandle = `${cleanHandle}_in`;
        }
        let displayName =
          localPostAuthor.name && !localPostAuthor.name.startsWith('u/')
            ? localPostAuthor.name
            : user.displayName || 'Aarav Sharma';
        let usernameChangedAt = localPostAuthor.usernameChangedAt;

        try {
          const ownedProfile = await findOwnedPublicProfileByUid(user.uid);
          if (ownedProfile) {
            cleanHandle = ownedProfile.handle;
            if (ownedProfile.displayName) {
              displayName = ownedProfile.displayName;
            }
            if (ownedProfile.usernameChangedAt) {
              usernameChangedAt = ownedProfile.usernameChangedAt;
            }
          } else {
            const avail = await checkUsernameAvailability(cleanHandle, user.uid);
            if (avail.available) {
              await claimUsername(cleanHandle, user.uid, undefined, displayName, usernameChangedAt);
            } else {
              cleanHandle = cleanUsername(generateFunnyDesiHandle());
              await claimUsername(cleanHandle, user.uid, undefined, displayName, usernameChangedAt);
            }
          }
        } catch {
          // fallback to local public post profile
        }

        const updatedPublicProfile: Author = {
          name: displayName,
          handle: `@${cleanHandle}`,
          avatarColor: localPostAuthor.avatarColor || '#0284c7',
          initials: deriveInitialsFromName(displayName) || deriveInitialsFromHandle(cleanHandle),
          uid: user.uid,
          isGoogleUser: true,
          isAnonymousPersona: false,
          usernameChangedAt,
        };

        setPublicPostAuthor(updatedPublicProfile);
        savePublicPostAuthor(updatedPublicProfile);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync real-time data from Firestore
  useEffect(() => {
    const unsubscribeDebates = onSnapshot(
      collection(db, 'debates'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Debate[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as Debate);
          });
          setDebates((prev) => {
            const map = new Map<string, Debate>();
            loaded.forEach((d) => map.set(d.id, d));
            prev.forEach((d) => {
              if (!map.has(d.id)) map.set(d.id, d);
            });
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        console.warn('Firestore snapshot debates note:', error.message);
      }
    );

    const unsubscribeArgs = onSnapshot(
      collection(db, 'arguments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Argument[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as Argument);
          });
          setArgumentsList((prev) => {
            const map = new Map<string, Argument>();
            loaded.forEach((a) => map.set(a.id, a));
            prev.forEach((a) => {
              if (!map.has(a.id)) map.set(a.id, a);
            });
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        console.warn('Firestore snapshot args note:', error.message);
      }
    );

    const unsubscribePosts = onSnapshot(
      collection(db, 'social_posts'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: SocialPost[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as SocialPost);
          });
          setSocialPosts((prev) => {
            const map = new Map<string, SocialPost>();
            loaded.forEach((p) => map.set(p.id, p));
            prev.forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      },
      () => {}
    );

    const unsubscribePostComments = onSnapshot(
      collection(db, 'post_comments'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: PostComment[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push(docSnap.data() as PostComment);
          });
          setPostComments((prev) => {
            const map = new Map<string, PostComment>();
            loaded.forEach((c) => map.set(c.id, c));
            prev.forEach((c) => {
              if (!map.has(c.id)) map.set(c.id, c);
            });
            return Array.from(map.values());
          });
        }
      },
      () => {}
    );

    const unsubscribeNotifications = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: AppNotification[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as AppNotification;
            if (
              data &&
              (data.recipientHandle === currentAuthor.handle ||
                data.recipientHandle === publicPostAuthor.handle ||
                (publicPostAuthor.uid && data.recipientUid === publicPostAuthor.uid))
            ) {
              loaded.push(data);
            }
          });
          if (loaded.length > 0) {
            setNotifications((prev) => {
              const map = new Map<string, AppNotification>();
              prev.forEach((n) => map.set(n.id, n));
              loaded.forEach((n) => {
                if (!map.has(n.id)) {
                  map.set(n.id, n);
                }
              });
              return Array.from(map.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          }
        }
      },
      () => {}
    );

    return () => {
      unsubscribeDebates();
      unsubscribeArgs();
      unsubscribePosts();
      unsubscribePostComments();
      unsubscribeNotifications();
    };
  }, [currentAuthor.handle, publicPostAuthor.handle, publicPostAuthor.uid]);

  useEffect(() => {
    saveStoredDebates(debates);
  }, [debates]);

  useEffect(() => {
    saveStoredArguments(argumentsList);
  }, [argumentsList]);

  useEffect(() => {
    saveStoredSocialPosts(socialPosts);
  }, [socialPosts]);

  useEffect(() => {
    saveStoredPostComments(postComments);
  }, [postComments]);

  useEffect(() => {
    saveStoredUserVotes(userVotes);
  }, [userVotes]);

  useEffect(() => {
    saveStoredUserArgLikes(userArgLikes);
  }, [userArgLikes]);

  useEffect(() => {
    saveStoredUserDebateLikes(userDebateLikes);
  }, [userDebateLikes]);

  useEffect(() => {
    saveStoredUserPostLikes(userPostLikes);
  }, [userPostLikes]);

  useEffect(() => {
    saveStoredUserPostCommentLikes(userPostCommentLikes);
  }, [userPostCommentLikes]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveStoredPushEnabled(pushEnabled);
  }, [pushEnabled]);

  // Auto-hide active push toast after 5.5 seconds
  useEffect(() => {
    if (!activePushToast) return;
    const timer = setTimeout(() => setActivePushToast(null), 5500);
    return () => clearTimeout(timer);
  }, [activePushToast]);

  // Helper to dispatch a push notification (in-app bell + live toast + browser push + Firestore)
  const triggerPushNotification = (
    payload: Omit<AppNotification, 'id' | 'read' | 'createdAt'>,
    deliverToCurrentUser = true
  ) => {
    const newNotif: AppNotification = {
      ...payload,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    if (auth.currentUser) {
      setDoc(doc(db, 'notifications', newNotif.id), sanitizeForFirestore(newNotif)).catch(() => {});
    }

    const isForCurrentUser =
      deliverToCurrentUser ||
      payload.recipientHandle === currentAuthor.handle ||
      payload.recipientHandle === publicPostAuthor.handle ||
      (Boolean(publicPostAuthor.uid) && payload.recipientUid === publicPostAuthor.uid);

    if (isForCurrentUser) {
      setNotifications((prev) => [newNotif, ...prev]);
      if (pushEnabled) {
        setActivePushToast(newNotif);
        playNotificationChime();
        triggerBrowserPushNotification(newNotif, handleSelectNotification);
      }
    }
  };

  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    if (auth.currentUser) {
      updateDoc(doc(db, 'notifications', notif.id), { read: true }).catch(() => {});
    }

    if (notif.targetType === 'debate') {
      const foundDebate = debates.find((d) => d.id === notif.targetId);
      if (foundDebate) {
        setActiveSection('debates');
        handleSelectDebate(foundDebate);
      }
    } else if (notif.targetType === 'post') {
      setSelectedDebate(null);
      setActiveSection('posts');
      setSelectedPostId(notif.targetId);
    }
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    if (auth.currentUser) {
      updateDoc(doc(db, 'notifications', notifId), { read: true }).catch(() => {});
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (notifId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    if (auth.currentUser) {
      deleteDoc(doc(db, 'notifications', notifId)).catch(() => {});
    }
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleTriggerTestPush = () => {
    const sampleDebate = debates[0];
    const samplePost = socialPosts[0];
    const isCommentTest = Math.random() > 0.4;

    if (isCommentTest && samplePost) {
      triggerPushNotification(
        {
          type: 'post_comment',
          recipientHandle: publicPostAuthor.handle,
          recipientUid: publicPostAuthor.uid,
          actor: {
            name: 'Rohan Kulkarni',
            handle: '@rohan_kulkarni',
            avatarColor: '#8b5cf6',
            initials: 'RK',
          },
          targetId: samplePost.id,
          targetType: 'post',
          targetTitle: samplePost.content.slice(0, 90),
          commentSnippet: 'Spot on point! This needs a national debate across every campus.',
        },
        true
      );
    } else if (sampleDebate) {
      triggerPushNotification(
        {
          type: 'debate_like',
          recipientHandle: currentAuthor.handle,
          actor: {
            name: 'u/chai_pe_charcha_42',
            handle: '@chai_pe_charcha_42',
            avatarColor: '#0ea5e9',
            initials: 'CP',
          },
          targetId: sampleDebate.id,
          targetType: 'debate',
          targetTitle: sampleDebate.title,
        },
        true
      );
    }
  };

  const handleSelectDebate = (debate: Debate, skipPushState = false) => {
    const updatedViews = (debate.views || 0) + 1;
    setDebates((prev) =>
      prev.map((d) => (d.id === debate.id ? { ...d, views: updatedViews } : d))
    );
    setSelectedDebate({ ...debate, views: updatedViews });

    if (!skipPushState) {
      const url = new URL(window.location.href);
      url.searchParams.set('debate', debate.id);
      url.searchParams.delete('arg');
      window.history.pushState({ debateId: debate.id }, '', url.toString());
    }

    if (auth.currentUser) {
      updateDoc(doc(db, 'debates', debate.id), { views: updatedViews }).catch(() => {});
    }
  };

  const handleBackFromDebate = () => {
    if (window.history.state && window.history.state.debateId) {
      window.history.back();
    } else {
      setSelectedDebate(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('debate');
      url.searchParams.delete('arg');
      window.history.replaceState({ debateId: null }, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  // Support mobile Android back gesture & browser navigation without exiting site
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const urlParams = new URLSearchParams(window.location.search);
      const debateId = e.state?.debateId || urlParams.get('debate');
      if (debateId) {
        const found = debates.find((d) => d.id === debateId);
        if (found) {
          setSelectedDebate(found);
          return;
        }
      }
      setSelectedDebate(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [debates]);

  // Deep-link initial load support + Android back gesture root trap
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const debateId = urlParams.get('debate');
    if (debateId) {
      // Setup history stack so that Android back gesture on a fresh link goes back to feed instead of exiting
      window.history.replaceState({ debateId: null }, '', window.location.pathname);
      window.history.pushState({ debateId }, '', window.location.search);
    }
  }, []);

  // When debates are loaded and there's a debate query param, open it
  useEffect(() => {
    if (debates.length > 0 && !selectedDebate) {
      const urlParams = new URLSearchParams(window.location.search);
      const debateId = urlParams.get('debate');
      if (debateId) {
        const target = debates.find((d) => d.id === debateId);
        if (target) {
          handleSelectDebate(target, true);
        }
      }
    }
  }, [debates]);

  const handleVote = (side: 'for' | 'against') => {
    if (!selectedDebate) return;
    const previousVote = userVotes[selectedDebate.id];

    // If the user clicks on the already selected option, deselect it and return to neutral
    if (previousVote === side) {
      const newFor = side === 'for' ? Math.max(0, selectedDebate.forVotes - 1) : selectedDebate.forVotes;
      const newAgainst = side === 'against' ? Math.max(0, selectedDebate.againstVotes - 1) : selectedDebate.againstVotes;

      setDebates((prev) =>
        prev.map((d) =>
          d.id === selectedDebate.id
            ? { ...d, forVotes: newFor, againstVotes: newAgainst }
            : d
        )
      );

      setSelectedDebate((prev) =>
        prev ? { ...prev, forVotes: newFor, againstVotes: newAgainst } : null
      );

      setUserVotes((prev) => {
        const next = { ...prev };
        delete next[selectedDebate.id];
        return next;
      });

      if (auth.currentUser) {
        updateDoc(doc(db, 'debates', selectedDebate.id), {
          forVotes: newFor,
          againstVotes: newAgainst,
        }).catch(() => {});
      }
      return;
    }

    // Normal vote cast or switch from opposing side
    let newFor = selectedDebate.forVotes;
    let newAgainst = selectedDebate.againstVotes;
    if (previousVote === 'for') newFor = Math.max(0, newFor - 1);
    if (previousVote === 'against') newAgainst = Math.max(0, newAgainst - 1);
    if (side === 'for') newFor += 1;
    if (side === 'against') newAgainst += 1;

    setDebates((prev) =>
      prev.map((d) => (d.id === selectedDebate.id ? { ...d, forVotes: newFor, againstVotes: newAgainst } : d))
    );

    setSelectedDebate((prev) => (prev ? { ...prev, forVotes: newFor, againstVotes: newAgainst } : null));
    setUserVotes((prev) => ({ ...prev, [selectedDebate.id]: side }));

    if (auth.currentUser) {
      updateDoc(doc(db, 'debates', selectedDebate.id), {
        forVotes: newFor,
        againstVotes: newAgainst,
      }).catch(() => {});
    }
  };

  // Like or unlike a debate post (Always uses untraceable anonymous persona)
  const handleToggleDebateLike = (debateId: string) => {
    const isLiked = !!userDebateLikes[debateId];
    let newLikesCount = 0;
    const targetDebate = debates.find((d) => d.id === debateId);
    const untraceableActor = stripTraceableFieldsForDebate(currentAuthor);

    setDebates((prev) =>
      prev.map((d) => {
        if (d.id !== debateId) return d;
        const currentLikes = d.likes ?? 0;
        newLikesCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
        return { ...d, likes: newLikesCount };
      })
    );
    setSelectedDebate((prev) => {
      if (!prev || prev.id !== debateId) return prev;
      const currentLikes = prev.likes ?? 0;
      return { ...prev, likes: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1 };
    });
    setUserDebateLikes((prev) => ({ ...prev, [debateId]: !isLiked }));

    if (!isLiked && targetDebate) {
      triggerPushNotification(
        {
          type: 'debate_like',
          recipientHandle: targetDebate.author.handle,
          actor: untraceableActor,
          targetId: targetDebate.id,
          targetType: 'debate',
          targetTitle: targetDebate.title,
        },
        targetDebate.author.handle === untraceableActor.handle
      );
    }

    if (auth.currentUser) {
      updateDoc(doc(db, 'debates', debateId), { likes: newLikesCount }).catch(() => {});
    }
  };

  // Like an argument inside a debate (Always uses untraceable anonymous persona)
  const handleToggleArgLike = (argumentId: string) => {
    const isLiked = !!userArgLikes[argumentId];
    let newLikes = 0;
    const targetArg = argumentsList.find((a) => a.id === argumentId);
    const untraceableActor = stripTraceableFieldsForDebate(currentAuthor);

    setArgumentsList((prev) =>
      prev.map((a) => {
        if (a.id !== argumentId) return a;
        newLikes = isLiked ? Math.max(0, a.likes - 1) : a.likes + 1;
        return { ...a, likes: newLikes };
      })
    );
    setUserArgLikes((prev) => ({ ...prev, [argumentId]: !isLiked }));

    if (!isLiked && targetArg) {
      const parentDebate = debates.find((d) => d.id === targetArg.debateId);
      triggerPushNotification(
        {
          type: 'argument_like',
          recipientHandle: targetArg.author.handle,
          actor: untraceableActor,
          targetId: targetArg.debateId,
          targetType: 'debate',
          targetTitle: parentDebate?.title || 'Debate Topic',
          commentSnippet: targetArg.content,
        },
        targetArg.author.handle === untraceableActor.handle
      );
    }

    if (auth.currentUser) {
      updateDoc(doc(db, 'arguments', argumentId), { likes: newLikes }).catch(() => {});
    }
  };

  const handleAddArgument = (side: 'for' | 'against', content: string) => {
    if (!selectedDebate) return;
    const untraceableAuthor = stripTraceableFieldsForDebate(currentAuthor);
    const newArg: Argument = {
      id: 'arg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      debateId: selectedDebate.id,
      side,
      author: untraceableAuthor,
      content,
      likes: 1,
      createdAt: new Date().toISOString(),
    };

    setArgumentsList((prev) => [...prev, newArg]);
    setUserArgLikes((prev) => ({ ...prev, [newArg.id]: true }));

    // Notify the debate author about the new argument (with untraceable actor)
    triggerPushNotification(
      {
        type: 'debate_comment',
        recipientHandle: selectedDebate.author.handle,
        actor: untraceableAuthor,
        targetId: selectedDebate.id,
        targetType: 'debate',
        targetTitle: selectedDebate.title,
        commentSnippet: content,
        side,
      },
      selectedDebate.author.handle === untraceableAuthor.handle
    );

    if (auth.currentUser) {
      setDoc(doc(db, 'arguments', newArg.id), sanitizeForFirestore(newArg)).catch((err) => {
        console.warn('Argument Firestore write sync:', err);
      });
    }
  };

  const handleCreateDebate = (rawDebate: Debate) => {
    const untraceableAuthor = stripTraceableFieldsForDebate(currentAuthor);
    const newDebate: Debate = {
      ...rawDebate,
      author: untraceableAuthor,
    };
    setDebates((prev) => [newDebate, ...prev]);
    setDraftReferencePost(null);
    setActiveSection('debates');
    setSelectedDebate(newDebate);

    if (newDebate.referencePost?.postId) {
      const refId = newDebate.referencePost.postId;
      setSocialPosts((prev) =>
        prev.map((p) =>
          p.id === refId
            ? { ...p, debatesCreatedCount: (p.debatesCreatedCount || 0) + 1 }
            : p
        )
      );

      triggerPushNotification(
        {
          type: 'post_referenced',
          recipientHandle: newDebate.referencePost.authorHandle,
          actor: untraceableAuthor,
          targetId: newDebate.id,
          targetType: 'debate',
          targetTitle: newDebate.title,
          commentSnippet: newDebate.referencePost.content,
        },
        newDebate.referencePost.authorHandle === publicPostAuthor.handle
      );
    }

    if (auth.currentUser) {
      setDoc(doc(db, 'debates', newDebate.id), sanitizeForFirestore(newDebate)).catch((err) => {
        console.warn('Debate Firestore write sync:', err);
      });
    }

    // Community engagement push notification when user starts a new debate
    setTimeout(() => {
      triggerPushNotification(
        {
          type: 'debate_like',
          recipientHandle: untraceableAuthor.handle,
          actor: {
            name: 'u/chai_pe_charcha_42',
            handle: '@chai_pe_charcha_42',
            avatarColor: '#0ea5e9',
            initials: 'CP',
          },
          targetId: newDebate.id,
          targetType: 'debate',
          targetTitle: newDebate.title,
        },
        true
      );
    }, 4500);
  };

  // --- Social Posts & Comments Handlers (Uses Public Post Profile: Real Name + @username) ---
  const handleCreatePost = (rawPost: SocialPost) => {
    const newPost: SocialPost = {
      ...rawPost,
      author: publicPostAuthor,
    };
    setSocialPosts((prev) => [newPost, ...prev]);
    setUserPostLikes((prev) => ({ ...prev, [newPost.id]: true }));
    if (auth.currentUser) {
      setDoc(doc(db, 'social_posts', newPost.id), sanitizeForFirestore(newPost)).catch(() => {});
    }

    // Community engagement push notification when user publishes a new post
    setTimeout(() => {
      triggerPushNotification(
        {
          type: 'post_like',
          recipientHandle: publicPostAuthor.handle,
          recipientUid: publicPostAuthor.uid,
          actor: {
            name: 'Ananya Verma',
            handle: '@ananya_verma',
            avatarColor: '#10b981',
            initials: 'AV',
          },
          targetId: newPost.id,
          targetType: 'post',
          targetTitle: newPost.content || 'Your new post',
        },
        true
      );
    }, 4000);
  };

  const handleTogglePostLike = (postId: string) => {
    const isLiked = !!userPostLikes[postId];
    let newLikes = 0;
    const targetPost = socialPosts.find((p) => p.id === postId);

    setSocialPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        newLikes = isLiked ? Math.max(0, p.likes - 1) : p.likes + 1;
        return { ...p, likes: newLikes };
      })
    );
    setUserPostLikes((prev) => ({ ...prev, [postId]: !isLiked }));

    if (!isLiked && targetPost) {
      triggerPushNotification(
        {
          type: 'post_like',
          recipientHandle: targetPost.author.handle,
          recipientUid: targetPost.author.uid,
          actor: publicPostAuthor,
          targetId: targetPost.id,
          targetType: 'post',
          targetTitle: targetPost.content || 'Social Post',
        },
        targetPost.author.handle === publicPostAuthor.handle
      );
    }

    if (auth.currentUser) {
      updateDoc(doc(db, 'social_posts', postId), { likes: newLikes }).catch(() => {});
    }
  };

  const handleAddPostComment = (postId: string, content: string) => {
    const targetPost = socialPosts.find((p) => p.id === postId);
    const newComm: PostComment = {
      id: `pcomm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      postId,
      author: publicPostAuthor,
      content,
      likes: 1,
      createdAt: new Date().toISOString(),
    };
    setPostComments((prev) => [...prev, newComm]);
    setUserPostCommentLikes((prev) => ({ ...prev, [newComm.id]: true }));
    setSocialPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      )
    );

    if (targetPost) {
      triggerPushNotification(
        {
          type: 'post_comment',
          recipientHandle: targetPost.author.handle,
          recipientUid: targetPost.author.uid,
          actor: publicPostAuthor,
          targetId: targetPost.id,
          targetType: 'post',
          targetTitle: targetPost.content || 'Social Post',
          commentSnippet: content,
        },
        targetPost.author.handle === publicPostAuthor.handle
      );
    }

    if (auth.currentUser) {
      setDoc(doc(db, 'post_comments', newComm.id), sanitizeForFirestore(newComm)).catch(() => {});
    }
  };

  const handleTogglePostCommentLike = (commentId: string) => {
    const isLiked = !!userPostCommentLikes[commentId];
    let newLikes = 0;
    const targetComm = postComments.find((c) => c.id === commentId);

    setPostComments((prev) =>
      prev.map((c) => {
        if (c.id !== commentId) return c;
        newLikes = isLiked ? Math.max(0, c.likes - 1) : c.likes + 1;
        return { ...c, likes: newLikes };
      })
    );
    setUserPostCommentLikes((prev) => ({ ...prev, [commentId]: !isLiked }));

    if (!isLiked && targetComm) {
      const parentPost = socialPosts.find((p) => p.id === targetComm.postId);
      triggerPushNotification(
        {
          type: 'post_comment_like',
          recipientHandle: targetComm.author.handle,
          recipientUid: targetComm.author.uid,
          actor: publicPostAuthor,
          targetId: targetComm.postId,
          targetType: 'post',
          targetTitle: parentPost?.content || 'Social Post',
          commentSnippet: targetComm.content,
        },
        targetComm.author.handle === publicPostAuthor.handle
      );
    }

    if (auth.currentUser) {
      updateDoc(doc(db, 'post_comments', commentId), { likes: newLikes }).catch(() => {});
    }
  };

  const handleStartDebateFromPost = (post: SocialPost) => {
    setDraftReferencePost(post);
    setIsCreateModalOpen(true);
  };

  const handleOpenOriginalPost = (postId: string) => {
    setSelectedDebate(null);
    setActiveSection('posts');
    setSelectedPostId(postId);
  };

  const handleLaunchDebateFromAiSearch = (synthesis: AiSearchSynthesis) => {
    const debateId = 'debate_' + Date.now().toString(36);
    const untraceableAuthor = stripTraceableFieldsForDebate(currentAuthor);
    const newDebate: Debate = {
      id: debateId,
      title: synthesis.framedQuestion,
      tags: synthesis.suggestedTags.length > 0 ? synthesis.suggestedTags : ['SOCIETY', 'INDIA'],
      author: untraceableAuthor,
      forVotes: 1,
      againstVotes: 1,
      views: 1,
      likes: 1,
      createdAt: new Date().toISOString(),
    };

    const seedArgs: Argument[] = [];
    if (synthesis.forPoints[0]) {
      seedArgs.push({
        id: `arg_${Date.now().toString(36)}_f1`,
        debateId,
        side: 'for',
        author: {
          name: 'u/chai_pe_charcha_18',
          handle: '@chai_pe_charcha_18',
          avatarColor: '#0284c7',
          initials: 'CP',
        },
        content: synthesis.forPoints[0],
        likes: 2,
        createdAt: new Date().toISOString(),
      });
    }
    if (synthesis.againstPoints[0]) {
      seedArgs.push({
        id: `arg_${Date.now().toString(36)}_a1`,
        debateId,
        side: 'against',
        author: {
          name: 'u/samosa_scholar_42',
          handle: '@samosa_scholar_42',
          avatarColor: '#e11d48',
          initials: 'SS',
        },
        content: synthesis.againstPoints[0],
        likes: 2,
        createdAt: new Date().toISOString(),
      });
    }

    setDebates((prev) => [newDebate, ...prev]);
    if (seedArgs.length > 0) {
      setArgumentsList((prev) => [...prev, ...seedArgs]);
    }
    setSearchQuery('');
    setSelectedDebate(newDebate);

    if (auth.currentUser) {
      setDoc(doc(db, 'debates', newDebate.id), sanitizeForFirestore(newDebate)).catch(() => {});
      seedArgs.forEach((arg) => {
        setDoc(doc(db, 'arguments', arg.id), sanitizeForFirestore(arg)).catch(() => {});
      });
    }
  };

  // Edit debate post
  const handleEditDebate = async (
    debateId: string,
    data: { title: string; tags: string[]; imageCaption?: string }
  ) => {
    setDebates((prev) =>
      prev.map((d) => (d.id === debateId ? { ...d, ...data } : d))
    );
    setSelectedDebate((prev) => (prev && prev.id === debateId ? { ...prev, ...data } : prev));

    if (auth.currentUser) {
      await updateDoc(doc(db, 'debates', debateId), sanitizeForFirestore(data));
    }
  };

  // Delete debate post
  const handleDeleteDebate = async (debateId: string) => {
    setDebates((prev) => prev.filter((d) => d.id !== debateId));
    setArgumentsList((prev) => prev.filter((a) => a.debateId !== debateId));
    if (selectedDebate?.id === debateId) {
      setSelectedDebate(null);
    }

    if (auth.currentUser) {
      await deleteDoc(doc(db, 'debates', debateId));
    }
  };

  // Edit argument comment
  const handleEditArgument = async (argumentId: string, newContent: string) => {
    setArgumentsList((prev) =>
      prev.map((a) => (a.id === argumentId ? { ...a, content: newContent } : a))
    );

    if (auth.currentUser) {
      await updateDoc(doc(db, 'arguments', argumentId), { content: newContent });
    }
  };

  // Delete argument comment
  const handleDeleteArgument = async (argumentId: string) => {
    setArgumentsList((prev) => prev.filter((a) => a.id !== argumentId));

    if (auth.currentUser) {
      await deleteDoc(doc(db, 'arguments', argumentId));
    }
  };

  const handleUpdateArgumentAuthenticity = (argumentId: string, result: AuthenticityResult) => {
    setArgumentsList((prev) =>
      prev.map((arg) => (arg.id === argumentId ? { ...arg, authenticityCheck: result } : arg))
    );

    if (auth.currentUser) {
      updateDoc(doc(db, 'arguments', argumentId), { authenticityCheck: result }).catch(() => {});
    }
  };

  const handleUpdateDebateSummary = (summary: DebateSummary) => {
    if (!selectedDebate) return;
    setSelectedDebate((prev) => (prev ? { ...prev, aiSummary: summary } : null));
    setDebates((prev) =>
      prev.map((d) => (d.id === selectedDebate.id ? { ...d, aiSummary: summary } : d))
    );

    if (auth.currentUser) {
      updateDoc(doc(db, 'debates', selectedDebate.id), { aiSummary: summary }).catch(() => {});
    }
  };

  const handleUpdateAuthor = (updated: Author) => {
    const cleanDebatePersona = stripTraceableFieldsForDebate(updated);
    setCurrentAuthor(cleanDebatePersona);
    saveCurrentAuthor(cleanDebatePersona);
  };

  const handleUpdatePublicPostAuthor = (updated: Author) => {
    setPublicPostAuthor(updated);
    savePublicPostAuthor(updated);
  };

  // --- 100% Untraceable Anonymous Moderation Reporting ---
  const handleOpenReportDebate = (debate: Debate) => {
    setReportTarget({
      targetType: 'debate',
      targetId: debate.id,
      debateId: debate.id,
      targetPreview: debate.title,
      targetAuthorHandle: debate.author.name || debate.author.handle,
    });
  };

  const handleOpenReportArgument = (arg: Argument) => {
    setReportTarget({
      targetType: 'argument',
      targetId: arg.id,
      debateId: arg.debateId,
      targetPreview: arg.content,
      targetAuthorHandle: arg.author.name || arg.author.handle,
    });
  };

  const handleSubmitAnonymousReport = (rawReport: AnonymousModerationReport) => {
    // Strictly whitelist ONLY non-identifying report fields so the report can NEVER link back to user identity
    const untraceableReport: AnonymousModerationReport = {
      id: rawReport.id,
      targetType: rawReport.targetType,
      targetId: rawReport.targetId,
      debateId: rawReport.debateId,
      targetPreview: rawReport.targetPreview,
      reason: rawReport.reason,
      ...(rawReport.details ? { details: rawReport.details } : {}),
      createdAt: rawReport.createdAt,
    };

    setReportedItems((prev) => {
      const next = { ...prev, [untraceableReport.targetId]: true };
      saveStoredReportedItems(next);
      return next;
    });

    const existingReports = getStoredAnonymousReports();
    saveStoredAnonymousReports([untraceableReport, ...existingReports]);

    if (auth.currentUser) {
      setDoc(
        doc(db, 'moderation_reports', untraceableReport.id),
        sanitizeForFirestore(untraceableReport)
      ).catch(() => {});
    }
  };

  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>(['INDIA', 'POLITICS', 'TECH', 'SOCIETY', 'EDUCATION', 'WORK', 'SPORTS', 'CULTURE']);
    debates.forEach((d) => {
      d.tags?.forEach((tag) => tagSet.add(tag.toUpperCase()));
    });
    return ['ALL', ...Array.from(tagSet)];
  }, [debates]);

  const filteredDebates = debates.filter((d) => {
    if (selectedTag !== 'ALL') {
      const hasTag = d.tags?.some((t) => t.toUpperCase() === selectedTag);
      if (!hasTag) return false;
    }
    if (isContestedOnly) {
      const total = d.forVotes + d.againstVotes;
      if (total < 2) return false;
      const forPct = (d.forVotes / total) * 100;
      if (forPct < 35 || forPct > 65) return false;
    }
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const translatedTitle = getTranslatedEntry(d.title)?.translatedText?.toLowerCase() || '';
    return (
      d.title.toLowerCase().includes(query) ||
      translatedTitle.includes(query) ||
      d.author.name.toLowerCase().includes(query) ||
      d.author.handle.toLowerCase().includes(query) ||
      d.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const filteredSocialPosts = socialPosts.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.content.toLowerCase().includes(query) ||
      p.author.name.toLowerCase().includes(query) ||
      p.author.handle.toLowerCase().includes(query) ||
      (p.speakerTitle && p.speakerTitle.toLowerCase().includes(query)) ||
      p.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const notificationBellElement = (
    <NotificationBell
      notifications={notifications}
      pushEnabled={pushEnabled}
      onTogglePushEnabled={setPushEnabled}
      onSelectNotification={handleSelectNotification}
      onMarkAsRead={handleMarkNotificationRead}
      onMarkAllAsRead={handleMarkAllNotificationsRead}
      onDeleteNotification={handleDeleteNotification}
      onClearAll={handleClearAllNotifications}
      onTriggerTestPush={handleTriggerTestPush}
    />
  );

  if (selectedDebate) {
    const currentArguments = argumentsList.filter(
      (a) => a.debateId === selectedDebate.id
    );

    return (
      <>
        <PushNotificationToast
          notification={activePushToast}
          onClose={() => setActivePushToast(null)}
          onSelect={handleSelectNotification}
        />
        <DebateChatView
          debate={selectedDebate}
          argumentsList={currentArguments}
          currentAuthor={currentAuthor}
          ambientEnabled={ambientEnabled}
          userVote={userVotes[selectedDebate.id]}
          isDebateLiked={!!userDebateLikes[selectedDebate.id]}
          userArgLikes={userArgLikes}
          reportedItems={reportedItems}
          onBack={handleBackFromDebate}
          onVote={handleVote}
          onToggleDebateLike={handleToggleDebateLike}
          onToggleArgLike={handleToggleArgLike}
          onReportDebate={handleOpenReportDebate}
          onReportArgument={handleOpenReportArgument}
          onToggleAmbient={() => setAmbientEnabled(!ambientEnabled)}
          onAddArgument={handleAddArgument}
          onUpdateArgumentAuthenticity={handleUpdateArgumentAuthenticity}
          onUpdateDebateSummary={handleUpdateDebateSummary}
          onEditDebate={handleEditDebate}
          onDeleteDebate={handleDeleteDebate}
          onEditArgument={handleEditArgument}
          onDeleteArgument={handleDeleteArgument}
          onOpenSettings={() => {
            setSettingsInitialTab('debate');
            setIsSettingsOpen(true);
          }}
          onOpenOriginalPost={handleOpenOriginalPost}
          headerNotificationSlot={notificationBellElement}
        />
        <ReportModal
          isOpen={Boolean(reportTarget)}
          target={reportTarget}
          onClose={() => setReportTarget(null)}
          onSubmitReport={handleSubmitAnonymousReport}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          currentAuthor={currentAuthor}
          publicPostAuthor={publicPostAuthor}
          ambientEnabled={ambientEnabled}
          initialTab={settingsInitialTab}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateAuthor={handleUpdateAuthor}
          onUpdatePublicPostAuthor={handleUpdatePublicPostAuthor}
          onToggleAmbient={() => setAmbientEnabled(!ambientEnabled)}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-x-hidden ${isDark ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Offline connectivity indicator */}
      <OfflineIndicator />

      {/* Live Push Notification Toast Banner */}
      <PushNotificationToast
        notification={activePushToast}
        onClose={() => setActivePushToast(null)}
        onSelect={handleSelectNotification}
      />

      {/* Background Ambient Glow (subtler, softer) */}
      {ambientEnabled && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div
            className="absolute -top-32 -left-20 w-[450px] h-[450px] rounded-full blur-[160px] opacity-[0.08] transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, #0284c7 0%, transparent 70%)' }}
          />
          <div
            className="absolute -top-32 -right-20 w-[450px] h-[450px] rounded-full blur-[160px] opacity-[0.08] transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle, #be123c 0%, transparent 70%)' }}
          />
        </div>
      )}

      {/* Top Navbar */}
      <header className={`px-3 sm:px-5 py-2 sm:py-3 backdrop-blur-md sticky top-0 z-30 border-b transition-colors ${
        isDark ? 'border-[#141928] bg-black/90' : 'border-slate-200 bg-white/90 shadow-xs'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div
            onClick={() => {
              setActiveSection('debates');
              setSelectedPostId(null);
            }}
            className="flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <EvaadLogo size={26} />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Install / Download App Button (Desktop/Tablet in header) */}
            <div className="hidden sm:inline-flex">
              <PWAInstallButton />
            </div>

            {/* Ambient Mode Toggle (Desktop/Tablet) */}
            <button
              onClick={() => setAmbientEnabled(!ambientEnabled)}
              title="Toggle Ambient Glow"
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                ambientEnabled
                  ? isDark
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                  : isDark
                  ? 'bg-white/[0.04] text-slate-400 border border-transparent hover:text-white'
                  : 'bg-slate-100 text-slate-600 border border-transparent hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{t('ambient')}</span>
            </button>

            {/* Quick Language Selector Dropdown */}
            <LanguageSelectorButton />

            {/* Push Notification Bell Icon & Manager */}
            {notificationBellElement}

            {/* Clean Profile / Settings Button */}
            {activeSection === 'posts' ? (
              <button
                onClick={() => {
                  setSettingsInitialTab('post');
                  setIsSettingsOpen(true);
                }}
                title={`${publicPostAuthor.name} (${publicPostAuthor.handle})`}
                className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] text-slate-200'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                  style={{ backgroundColor: publicPostAuthor.avatarColor }}
                >
                  {publicPostAuthor.initials}
                </div>
                <span className="text-xs font-bold truncate max-w-[85px] sm:max-w-[115px]">
                  {publicPostAuthor.name}
                </span>
                <SettingsIcon className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setSettingsInitialTab('debate');
                  setIsSettingsOpen(true);
                }}
                title={`Anonymous handle: ${currentAuthor.name}`}
                className={`flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1 rounded-full border transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.1] hover:bg-white/[0.08] text-slate-200'
                    : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                  style={{ backgroundColor: currentAuthor.avatarColor }}
                >
                  {currentAuthor.initials}
                </div>
                <VenetianMask className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-mono truncate max-w-[85px] sm:max-w-[120px]">
                  {currentAuthor.name}
                </span>
                <SettingsIcon className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
              </button>
            )}

            {/* + New Debate Button (Visible on sm+ in header; on mobile it sits in the thumb-zone bottom bar) */}
            <button
              onClick={() => {
                setDraftReferencePost(null);
                setIsCreateModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs tracking-tight transition-all cursor-pointer shadow-sm active:scale-95 shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('newDebate')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-0 sm:px-4 md:px-6 pt-2.5 sm:pt-5 pb-24 sm:pb-8 flex-1 flex flex-col relative z-10">
        {/* Top Section Tabs + Search Bar */}
        <div className="px-3 sm:px-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3.5 sm:mb-5">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            {/* MAIN SECTION 1: DEBATES (No count badge) */}
            <button
              type="button"
              onClick={() => {
                setActiveSection('debates');
                setSelectedPostId(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all cursor-pointer border shrink-0 whitespace-nowrap ${
                activeSection === 'debates'
                  ? isDark
                    ? 'bg-white text-black border-white shadow-xs'
                    : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : isDark
                  ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('debates')}</span>
            </button>

            {/* MAIN SECTION 2: POSTS (No count badge) */}
            <button
              type="button"
              onClick={() => {
                setActiveSection('posts');
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold tracking-tight transition-all cursor-pointer border shrink-0 whitespace-nowrap ${
                activeSection === 'posts'
                  ? isDark
                    ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                    : 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : isDark
                  ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Posts</span>
            </button>

            {/* SUB-SECTION: WHAT'S TRENDING NOW */}
            <button
              type="button"
              onClick={() => setActiveSection('trending')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer border shrink-0 whitespace-nowrap ${
                activeSection === 'trending'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-transparent shadow-sm'
                  : isDark
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 ${
                  activeSection === 'trending'
                    ? 'fill-white text-white'
                    : 'fill-amber-500 text-amber-500'
                }`}
              />
              <span>Trending Now</span>
            </button>
          </div>

          {/* Search + 50/50 Split Filter */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72 md:w-80 sm:flex-none">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeSection === 'trending' && e.target.value.trim().length >= 2) {
                    setActiveSection('debates');
                  }
                }}
                placeholder={
                  activeSection === 'posts'
                    ? 'Search posts, people, statements, or tags...'
                    : 'Search or ask AI any topic...'
                }
                className={`w-full rounded-xl pl-8 pr-7 py-2 sm:py-1.5 text-xs transition-colors focus:outline-none ${
                  isDark
                    ? 'bg-[#060810] border border-[#141928] text-white placeholder-slate-500 focus:border-sky-500/60'
                    : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeSection === 'debates' && (
              <button
                onClick={() => setIsContestedOnly((prev) => !prev)}
                title="Show closely contested 50/50 split debates"
                className={`inline-flex items-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer shrink-0 border select-none active:scale-95 whitespace-nowrap ${
                  isContestedOnly
                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/40 shadow-xs'
                    : isDark
                    ? 'bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.07]'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Scale className={`w-3.5 h-3.5 ${isContestedOnly ? 'text-purple-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline">50/50 Split</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================
            SUB-SECTION FULL VIEW: WHAT'S TRENDING NOW
           =================================================================== */}
        {activeSection === 'trending' ? (
          <TrendingPulseSection
            variant="page"
            debates={debates}
            onOpenTrendingPage={() => setActiveSection('trending')}
            onBackToDebates={() => setActiveSection('debates')}
            onSelectDebate={handleSelectDebate}
            onLaunchTrendDebate={handleLaunchDebateFromAiSearch}
          />
        ) : (
          /* ===================================================================
             MAIN FEED (DEBATES or POSTS) + RIGHT TRENDING NOW SIDEBAR (Desktop lg+)
             =================================================================== */
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* CENTER COLUMN: Active Main Section (Debates OR Posts) */}
            <div className="flex-1 min-w-0 w-full">
              {activeSection === 'posts' ? (
                <>
                  {/* Compact Horizontal Glimpse of What's Trending Now on mobile */}
                  {searchQuery.trim().length < 2 && !selectedPostId && (
                    <TrendingPulseSection
                      variant="glimpse"
                      debates={debates}
                      onOpenTrendingPage={() => setActiveSection('trending')}
                      onSelectDebate={handleSelectDebate}
                      onLaunchTrendDebate={handleLaunchDebateFromAiSearch}
                    />
                  )}

                  <PostsSection
                    posts={filteredSocialPosts}
                    comments={postComments}
                    debates={debates}
                    currentAuthor={publicPostAuthor}
                    userPostLikes={userPostLikes}
                    userCommentLikes={userPostCommentLikes}
                    selectedPostId={selectedPostId}
                    onSelectPostId={setSelectedPostId}
                    onCreatePost={handleCreatePost}
                    onTogglePostLike={handleTogglePostLike}
                    onAddComment={handleAddPostComment}
                    onToggleCommentLike={handleTogglePostCommentLike}
                    onStartDebateFromPost={handleStartDebateFromPost}
                    onOpenDebate={handleSelectDebate}
                    onOpenProfileSettings={() => {
                      setSettingsInitialTab('post');
                      setIsSettingsOpen(true);
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Horizontal Category Topic Filter Bar */}
                  <div className="px-3 sm:px-0 mb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {availableTags.map((tag) => {
                      const active = selectedTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSelectedTag(active && tag !== 'ALL' ? 'ALL' : tag)}
                          className={`px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] font-mono font-semibold tracking-wider transition-all cursor-pointer shrink-0 border whitespace-nowrap ${
                            active
                              ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                              : isDark
                              ? 'bg-[#080c17] border-[#141928] text-slate-400 hover:text-white hover:border-slate-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                          }`}
                        >
                          {tag === 'ALL' ? t('all') : `#${tag}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* AI-Based Search Result & 180° Topic Synthesis Card */}
                  {searchQuery.trim().length >= 2 && (
                    <AiSearchCard
                      query={searchQuery}
                      matchingCount={filteredDebates.length}
                      onLaunchDebate={handleLaunchDebateFromAiSearch}
                    />
                  )}

                  {/* Compact Horizontal Glimpse of What's Trending Now (Mobile & Tablet) */}
                  {searchQuery.trim().length < 2 && (
                    <TrendingPulseSection
                      variant="glimpse"
                      debates={debates}
                      onOpenTrendingPage={() => setActiveSection('trending')}
                      onSelectDebate={handleSelectDebate}
                      onLaunchTrendDebate={handleLaunchDebateFromAiSearch}
                    />
                  )}

                  {/* Debates Feed: End-to-end timeline with separating lines */}
                  {filteredDebates.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      {t('noDebatesFound')}
                    </div>
                  ) : (
                    <div className="w-full border-t border-b sm:border sm:rounded-2xl sm:overflow-hidden border-slate-200 dark:border-[#141928] bg-white dark:bg-[#060810]/95">
                      {filteredDebates.map((debate) => {
                        const currentArgs = argumentsList.filter(
                          (a) => a.debateId === debate.id
                        );
                        return (
                          <TopicCard
                            key={debate.id}
                            debate={debate}
                            argumentsList={currentArgs}
                            ambientEnabled={ambientEnabled}
                            isLiked={!!userDebateLikes[debate.id]}
                            isReported={!!reportedItems[debate.id]}
                            isTrending={false}
                            userVote={userVotes[debate.id]}
                            onToggleLike={handleToggleDebateLike}
                            onReportDebate={handleOpenReportDebate}
                            onSelect={handleSelectDebate}
                            onSelectTag={(tag) => setSelectedTag((prev) => (prev === tag.toUpperCase() ? 'ALL' : tag.toUpperCase()))}
                            onOpenOriginalPost={handleOpenOriginalPost}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT STICKY SUB-SECTION: X-Style "What's Trending Now" Sidebar (Desktop lg+) */}
            <TrendingPulseSection
              variant="sidebar"
              debates={debates}
              onOpenTrendingPage={() => setActiveSection('trending')}
              onSelectDebate={handleSelectDebate}
              onLaunchTrendDebate={handleLaunchDebateFromAiSearch}
            />
          </div>
        )}
      </main>

      {/* MOBILE THUMB-ZONE FIXED BOTTOM TAB BAR (< 640px sm:hidden) */}
      <nav
        aria-label="Mobile Primary Navigation"
        className={`sm:hidden fixed bottom-0 left-0 right-0 z-30 border-t backdrop-blur-md pb-safe transition-colors ${
          isDark
            ? 'bg-black/95 border-[#141928] text-slate-400'
            : 'bg-white/95 border-slate-200 text-slate-600 shadow-lg'
        }`}
      >
        <div className="grid grid-cols-5 items-center h-14 px-1">
          <button
            type="button"
            onClick={() => {
              setActiveSection('debates');
              setSelectedPostId(null);
            }}
            className={`flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors ${
              activeSection === 'debates'
                ? isDark ? 'text-white font-bold' : 'text-slate-900 font-bold'
                : ''
            }`}
          >
            <Scale className={`w-4 h-4 ${activeSection === 'debates' ? 'text-sky-400' : ''}`} />
            <span className="text-[10px] tracking-tight whitespace-nowrap">{t('debates')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('posts')}
            className={`flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors ${
              activeSection === 'posts'
                ? 'text-sky-400 font-bold'
                : ''
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Posts</span>
          </button>

          {/* Center Primary CTA: Start New Debate */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                setDraftReferencePost(null);
                setIsCreateModalOpen(true);
              }}
              aria-label="Start New Debate"
              className="w-10 h-10 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveSection('trending')}
            className={`flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors ${
              activeSection === 'trending'
                ? 'text-amber-400 font-bold'
                : ''
            }`}
          >
            <Flame className={`w-4 h-4 ${activeSection === 'trending' ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Trending</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSettingsInitialTab(activeSection === 'posts' ? 'post' : 'debate');
              setIsSettingsOpen(true);
            }}
            className="flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-[10px] tracking-tight whitespace-nowrap">Profile</span>
          </button>
        </div>
      </nav>

      {/* Anonymous Moderation Report Modal */}
      <ReportModal
        isOpen={Boolean(reportTarget)}
        target={reportTarget}
        onClose={() => setReportTarget(null)}
        onSubmitReport={handleSubmitAnonymousReport}
      />

      {/* Create Debate Modal */}
      <CreateDebateModal
        isOpen={isCreateModalOpen}
        currentAuthor={currentAuthor}
        initialReferencePost={draftReferencePost}
        availablePosts={socialPosts}
        onClose={() => {
          setIsCreateModalOpen(false);
          setDraftReferencePost(null);
        }}
        onCreateDebate={handleCreateDebate}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        currentAuthor={currentAuthor}
        publicPostAuthor={publicPostAuthor}
        ambientEnabled={ambientEnabled}
        initialTab={settingsInitialTab}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateAuthor={handleUpdateAuthor}
        onUpdatePublicPostAuthor={handleUpdatePublicPostAuthor}
        onToggleAmbient={() => setAmbientEnabled(!ambientEnabled)}
      />
    </div>
  );
}
