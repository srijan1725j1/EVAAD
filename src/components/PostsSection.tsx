import React, { useState, useRef } from 'react';
import { SocialPost, PostComment, Author, Debate } from '../types';
import {
  MessageCircle,
  Heart,
  Share2,
  Check,
  Scale,
  Image as ImageIcon,
  Video,
  Send,
  X,
  Trash2,
  Eye,
  Quote,
  ArrowLeft,
  Flag,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatCompactNumber, formatRelativeTime } from '../utils/format';
import { TranslatedTextBlock } from './TranslatedTextBlock';
import { copyToClipboard, getShareUrl } from '../utils/clipboard';
import { AdPreferences, getVariableAdPlacements } from '../utils/adPersonalization';
import { AdUnitCard } from './AdUnitCard';

interface PostsSectionProps {
  posts: SocialPost[];
  comments: PostComment[];
  debates: Debate[];
  currentAuthor: Author;
  userPostLikes: Record<string, boolean>;
  userCommentLikes: Record<string, boolean>;
  reportedItems?: Record<string, boolean>;
  selectedPostId: string | null;
  adPreferences?: AdPreferences;
  onSelectPostId: (postId: string | null) => void;
  onCreatePost: (post: SocialPost) => void;
  onTogglePostLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onToggleCommentLike: (commentId: string) => void;
  onStartDebateFromPost: (post: SocialPost) => void;
  onOpenDebate?: (debate: Debate) => void;
  onOpenProfileSettings?: () => void;
  onReportPost?: (post: SocialPost) => void;
  onReportPostComment?: (comment: PostComment) => void;
  onDismissAd?: (campaignId: string) => void;
  onOpenAdSettings?: () => void;
}

const POST_TAGS = ['INDIA', 'POLITICS', 'SPORTS', 'TECH', 'WORK', 'CULTURE', 'EDUCATION'];

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  } catch {
    return null;
  }
}

export const PostsSection: React.FC<PostsSectionProps> = ({
  posts,
  comments,
  debates,
  currentAuthor,
  userPostLikes,
  userCommentLikes,
  reportedItems = {},
  selectedPostId,
  adPreferences,
  onSelectPostId,
  onCreatePost,
  onTogglePostLike,
  onAddComment,
  onToggleCommentLike,
  onStartDebateFromPost,
  onOpenDebate,
  onOpenProfileSettings,
  onReportPost,
  onReportPostComment,
  onDismissAd,
  onOpenAdSettings,
}) => {
  const { isDark } = useTheme();

  // Composer State
  const [content, setContent] = useState('');
  const [speakerTitle, setSpeakerTitle] = useState('');
  const [showSpeakerInput, setShowSpeakerInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [selectedTag, setSelectedTag] = useState('INDIA');
  const [composerError, setComposerError] = useState('');

  // Comment Input State (keyed by postId)
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({
    post_founder_70hr_statement: true,
  });
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setComposerError('Image is too large (max 8MB).');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const rawDataUrl = reader.result as string;
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 900;
        const maxHeight = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setImageUrl(canvas.toDataURL('image/jpeg', 0.78));
        } else {
          setImageUrl(rawDataUrl);
        }
        setComposerError('');
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 700 * 1024) {
      setComposerError('Uploaded video clip must be under 700KB, or paste a direct video / YouTube URL.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoUrl(reader.result as string);
      setComposerError('');
    };
    reader.readAsDataURL(file);
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl && !videoUrl) {
      setComposerError('Write something or attach an image/video to post.');
      return;
    }

    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      author: currentAuthor,
      speakerTitle: speakerTitle.trim() || undefined,
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      tags: [selectedTag, 'INDIA'].filter((v, i, a) => a.indexOf(v) === i),
      likes: 1,
      commentsCount: 0,
      views: 1,
      debatesCreatedCount: 0,
      createdAt: new Date().toISOString(),
    };

    onCreatePost(newPost);
    setContent('');
    setSpeakerTitle('');
    setShowSpeakerInput(false);
    setImageUrl('');
    setVideoUrl('');
    setShowVideoInput(false);
    setComposerError('');
  };

  const handleSharePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const url = getShareUrl(postId);
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2000);
    }
  };

  const submitComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const renderPostMedia = (post: SocialPost) => {
    const ytEmbed = post.videoUrl ? getYouTubeEmbedUrl(post.videoUrl) : null;
    return (
      <>
        {post.imageUrl && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`mb-3 rounded-xl overflow-hidden border max-h-80 ${
              isDark ? 'border-[#161f36] bg-[#03060c]' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <img
              src={post.imageUrl}
              alt="Post media"
              className="w-full h-auto max-h-80 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {post.videoUrl && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`mb-3 rounded-xl overflow-hidden border bg-black ${
              isDark ? 'border-[#161f36]' : 'border-slate-200'
            }`}
          >
            {ytEmbed ? (
              <iframe
                src={ytEmbed}
                title="Video player"
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={post.videoUrl}
                controls
                preload="metadata"
                className="w-full max-h-80 object-contain"
              />
            )}
          </div>
        )}
      </>
    );
  };

  // If a specific post was clicked (e.g., from a Debate's "Referenced Post" card), focus it
  const focusedPost = selectedPostId ? posts.find((p) => p.id === selectedPostId) : null;
  const displayPosts = focusedPost ? [focusedPost] : posts;

  return (
    <div className="w-full">
      {/* Focused Single Post Back Banner */}
      {focusedPost && (
        <div className="px-3.5 sm:px-0 mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onSelectPostId(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
              isDark
                ? 'bg-white/[0.04] border-white/[0.1] text-slate-200 hover:bg-white/[0.08]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Posts</span>
          </button>
          <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Viewing Referenced Post & Comments
          </span>
        </div>
      )}

      {/* X-Style Post Composer (Text, Statement Quote, Image, Video) */}
      {!focusedPost && (
        <form
          onSubmit={handlePublishPost}
          className={`mb-3.5 border-y sm:border sm:rounded-2xl p-3.5 sm:p-4 transition-colors ${
            isDark
              ? 'bg-[#060913]/95 border-[#141928]'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5"
              style={{ backgroundColor: currentAuthor.avatarColor }}
            >
              {currentAuthor.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1 min-w-0">
                <span
                  className={`text-xs font-bold truncate ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {currentAuthor.name}
                </span>
                <span className="text-[11px] font-mono text-sky-400 truncate">
                  {currentAuthor.handle}
                </span>
              </div>

              {/* Optional Speaker / Public Statement Label */}
              {showSpeakerInput && (
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={speakerTitle}
                    onChange={(e) => setSpeakerTitle(e.target.value)}
                    placeholder="Optional context (e.g., Politician Statement, Celebrity Quote, News Clip)..."
                    className={`w-full rounded-lg px-2.5 py-1 text-xs border focus:outline-none ${
                      isDark
                        ? 'bg-[#0b1020] border-amber-500/30 text-amber-200 placeholder-slate-500'
                        : 'bg-amber-50/60 border-amber-200 text-amber-900 placeholder-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSpeakerTitle('');
                      setShowSpeakerInput(false);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={2}
                placeholder="Share a post, photo, video, or quote a public statement..."
                className={`w-full resize-none bg-transparent text-sm sm:text-base focus:outline-none leading-relaxed ${
                  isDark
                    ? 'text-white placeholder-slate-500'
                    : 'text-slate-900 placeholder-slate-400'
                }`}
              />

              {/* Image Preview */}
              {imageUrl && (
                <div className="relative mt-2 mb-2 rounded-xl overflow-hidden border border-slate-200 dark:border-[#182238] max-h-56">
                  <img
                    src={imageUrl}
                    alt="Upload preview"
                    className="w-full h-auto max-h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Video URL / Upload Input */}
              {showVideoInput && (
                <div className="mt-2 mb-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="url"
                    value={videoUrl.startsWith('data:') ? '' : videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Paste YouTube or direct .mp4 video URL..."
                    className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs border focus:outline-none ${
                      isDark
                        ? 'bg-[#0b1020] border-[#1c2640] text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border cursor-pointer shrink-0 ${
                      isDark
                        ? 'bg-white/[0.05] border-white/[0.1] text-slate-300 hover:text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Upload Clip
                  </button>
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {composerError && (
                <p className="text-xs text-rose-400 mt-1 mb-1">{composerError}</p>
              )}

              {/* Composer Bottom Toolbar */}
              <div
                className={`pt-2.5 mt-2 border-t flex flex-wrap items-center justify-between gap-2 ${
                  isDark ? 'border-[#141928]' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    title="Attach Image"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      imageUrl
                        ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                        : isDark
                        ? 'text-slate-400 hover:text-sky-400 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-sky-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVideoInput((v) => !v)}
                    title="Attach Video"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      showVideoInput || videoUrl
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        : isDark
                        ? 'text-slate-400 hover:text-purple-400 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-purple-600 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSpeakerInput((v) => !v)}
                    title="Tag as Celebrity / Politician Statement"
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      showSpeakerInput || speakerTitle
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : isDark
                        ? 'text-slate-400 hover:text-amber-400 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                    }`}
                  >
                    <Quote className="w-3.5 h-3.5" />
                    <span>Statement Tag</span>
                  </button>

                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-mono border focus:outline-none cursor-pointer ${
                      isDark
                        ? 'bg-[#080c17] border-[#141928] text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {POST_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        #{tag}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs tracking-tight transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* X-Style Posts Feed (Comments Only — No For/Against Bar, with "Start Debate" Reference Action) */}
      <div className="w-full border-t border-b sm:border sm:rounded-2xl sm:overflow-hidden border-slate-200 dark:border-[#141928] bg-white dark:bg-[#060810]/95 divide-y divide-slate-200 dark:divide-[#141928]">
        {(() => {
          const postAdPlacements = getVariableAdPlacements(
            displayPosts.length,
            'social_posts',
            6,
            10
          );
          return displayPosts.map((post, postIdx) => {
            const postComments = comments.filter((c) => c.postId === post.id);
            const isLiked = !!userPostLikes[post.id];
            const isCommentsOpen = !!expandedComments[post.id] || !!focusedPost;
            const linkedDebates = debates.filter(
              (d) => d.referencePost?.postId === post.id
            );
            const adSlotIndex = postAdPlacements.get(postIdx);
            const shouldRenderAdAfter =
              !focusedPost &&
              adPreferences &&
              onDismissAd &&
              onOpenAdSettings &&
              adSlotIndex !== undefined;

          return (
            <React.Fragment key={post.id}>
              <article
                className={`px-4 sm:px-5 py-3.5 sm:py-4 transition-colors ${
                  isDark ? 'hover:bg-[#080c18]/80' : 'hover:bg-slate-50/70'
                }`}
              >
              {/* Top Author Row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                    style={{ backgroundColor: post.author.avatarColor }}
                  >
                    {post.author.initials}
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-bold truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {!post.author.name?.startsWith('u/')
                      ? post.author.name
                      : post.author.handle || post.author.name}
                  </span>

                  {!post.author.name?.startsWith('u/') && post.author.handle && (
                    <span className="text-xs font-mono text-sky-400 truncate">
                      {post.author.handle}
                    </span>
                  )}

                  {post.speakerTitle && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        isDark
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <Quote className="w-2.5 h-2.5" />
                      {post.speakerTitle}
                    </span>
                  )}

                  <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>·</span>
                  <span
                    className={`text-xs font-mono shrink-0 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {formatRelativeTime(post.createdAt)}
                  </span>
                </div>

                {/* Views */}
                <div
                  className={`flex items-center gap-1 text-xs font-mono shrink-0 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 opacity-70" />
                  <span>{formatCompactNumber(post.views)}</span>
                </div>
              </div>

              {/* Post Body Text (Translated with "See original" support) */}
              <div
                onClick={() =>
                  setExpandedComments((prev) => ({
                    ...prev,
                    [post.id]: !prev[post.id],
                  }))
                }
                className={`text-sm sm:text-base leading-relaxed mb-3 cursor-pointer ${
                  isDark ? 'text-slate-100' : 'text-slate-800'
                }`}
              >
                <TranslatedTextBlock
                  itemId={`social_post_${post.id}`}
                  originalText={post.content}
                  maxLines={8}
                />
              </div>

              {/* Image or Video Attachment */}
              {renderPostMedia(post)}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-[11px] font-mono ${
                        isDark ? 'text-sky-400/80' : 'text-sky-600'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Linked Debates Banner (If someone already started a Debate from this Post!) */}
              {linkedDebates.length > 0 && onOpenDebate && (
                <div
                  onClick={() => onOpenDebate(linkedDebates[0])}
                  className={`mb-3 px-3 py-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    isDark
                      ? 'bg-purple-500/10 border-purple-500/25 hover:bg-purple-500/15 text-purple-200'
                      : 'bg-purple-50 border-purple-200 hover:bg-purple-100/70 text-purple-900'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Scale className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-xs font-semibold truncate">
                      Debate Active: &ldquo;{linkedDebates[0].title}&rdquo;
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-purple-400 shrink-0">
                    Join Debate →
                  </span>
                </div>
              )}

              {/* Bottom X-Style Action Bar: Comments · Like · Share · "Start Debate on This" */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-3 sm:gap-5">
                  {/* Comments Toggle Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedComments((prev) => ({
                        ...prev,
                        [post.id]: !prev[post.id],
                      }))
                    }
                    className={`inline-flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                      isCommentsOpen
                        ? 'text-sky-400 font-bold bg-sky-500/10'
                        : isDark
                        ? 'text-slate-400 hover:text-sky-400 hover:bg-white/[0.04]'
                        : 'text-slate-500 hover:text-sky-600 hover:bg-slate-100'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{postComments.length}</span>
                  </button>

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => onTogglePostLike(post.id)}
                    className={`inline-flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                      isLiked
                        ? 'text-rose-500 font-bold bg-rose-500/10'
                        : isDark
                        ? 'text-slate-400 hover:text-rose-400 hover:bg-white/[0.04]'
                        : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                    <span>{formatCompactNumber(post.likes)}</span>
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={(e) => handleSharePost(e, post.id)}
                    className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                      isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {copiedPostId === post.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Report Post Button */}
                  {onReportPost && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReportPost(post);
                      }}
                      title={
                        reportedItems[post.id]
                          ? 'Reported for moderation'
                          : 'Report post for moderation'
                      }
                      className={`inline-flex items-center gap-1 px-1.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                        reportedItems[post.id]
                          ? 'text-amber-400 bg-amber-500/10'
                          : isDark
                          ? 'text-slate-500 hover:text-rose-400 hover:bg-white/[0.04]'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {reportedItems[post.id] && (
                        <span className="text-[10px]">Reported</span>
                      )}
                    </button>
                  )}
                </div>

                {/* USE AS REFERENCE TO START A DEBATE BUTTON */}
                <button
                  type="button"
                  onClick={() => onStartDebateFromPost(post)}
                  title="Use this post or statement as a reference to start a 2-sided Debate (Agree vs Disagree)"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all cursor-pointer border active:scale-95 whitespace-nowrap shrink-0 ${
                    isDark
                      ? 'bg-gradient-to-r from-sky-500/15 via-purple-500/15 to-rose-500/15 border-sky-500/35 text-sky-300 hover:border-sky-400'
                      : 'bg-gradient-to-r from-sky-50 via-purple-50 to-rose-50 border-sky-200 text-sky-800 hover:border-sky-400'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="sm:hidden">Start Debate</span>
                  <span className="hidden sm:inline">Start Debate on This</span>
                </button>
              </div>

              {/* ===============================================================
                  STANDARD X-STYLE COMMENTS SECTION (No For/Against Debate UI)
                 =============================================================== */}
              {isCommentsOpen && (
                <div
                  className={`mt-3.5 pt-3 border-t ${
                    isDark ? 'border-[#141b2d]' : 'border-slate-200'
                  }`}
                >
                  {/* Add Comment Input Row */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                      style={{ backgroundColor: currentAuthor.avatarColor }}
                    >
                      {currentAuthor.initials}
                    </div>
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          submitComment(post.id);
                        }
                      }}
                      placeholder="Write a comment..."
                      className={`flex-1 rounded-xl px-3 py-1.5 text-xs border focus:outline-none ${
                        isDark
                          ? 'bg-[#090d1a] border-[#1a2236] text-white placeholder-slate-500 focus:border-sky-500/50'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => submitComment(post.id)}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Comments List with Dedicated Second Scrollbar */}
                  {postComments.length === 0 ? (
                    <p
                      className={`text-xs py-2 text-center ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      No comments yet. Be the first to reply!
                    </p>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2 px-0.5">
                        <span
                          className={`text-[11px] font-mono font-semibold ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          Comments ({postComments.length})
                        </span>
                        {postComments.length > 2 && (
                          <span
                            className={`text-[10px] font-mono ${
                              isDark ? 'text-sky-400/80' : 'text-sky-600'
                            }`}
                          >
                            ↕ Scroll inside box
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-h-56 sm:max-h-64 overflow-y-auto pr-1.5 space-y-2.5 custom-comments-scrollbar overscroll-contain rounded-xl p-1.5 border ${
                          isDark
                            ? 'bg-[#04070f]/80 border-[#111829]'
                            : 'bg-slate-100/50 border-slate-200/70'
                        }`}
                      >
                        {postComments.map((comm) => {
                          const commLiked = !!userCommentLikes[comm.id];
                          return (
                            <div
                              key={comm.id}
                              className={`p-2.5 rounded-xl border ${
                                isDark
                                  ? 'bg-[#080c17] border-[#131b2e]'
                                  : 'bg-white border-slate-200/80'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div
                                    className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] text-white shrink-0"
                                    style={{ backgroundColor: comm.author.avatarColor }}
                                  >
                                    {comm.author.initials}
                                  </div>
                                  <span
                                    className={`text-xs font-semibold truncate ${
                                      isDark ? 'text-slate-200' : 'text-slate-800'
                                    }`}
                                  >
                                    {!comm.author.name?.startsWith('u/')
                                      ? comm.author.name
                                      : comm.author.handle || comm.author.name}
                                  </span>
                                  {!comm.author.name?.startsWith('u/') && comm.author.handle && (
                                    <span className="text-[11px] font-mono text-sky-400 truncate">
                                      {comm.author.handle}
                                    </span>
                                  )}
                                  <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>
                                    ·
                                  </span>
                                  <span
                                    className={`text-[10px] font-mono ${
                                      isDark ? 'text-slate-500' : 'text-slate-400'
                                    }`}
                                  >
                                    {formatRelativeTime(comm.createdAt)}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => onToggleCommentLike(comm.id)}
                                    className={`inline-flex items-center gap-1 text-[11px] font-mono cursor-pointer ${
                                      commLiked
                                        ? 'text-rose-500 font-bold'
                                        : isDark
                                        ? 'text-slate-500 hover:text-rose-400'
                                        : 'text-slate-400 hover:text-rose-600'
                                    }`}
                                  >
                                    <Heart
                                      className={`w-3 h-3 ${
                                        commLiked ? 'fill-rose-500 text-rose-500' : ''
                                      }`}
                                    />
                                    <span>{comm.likes}</span>
                                  </button>

                                  {onReportPostComment && (
                                    <button
                                      type="button"
                                      onClick={() => onReportPostComment(comm)}
                                      title={
                                        reportedItems[comm.id]
                                          ? 'Reported for moderation'
                                          : 'Report comment for moderation'
                                      }
                                      className={`inline-flex items-center gap-1 text-[11px] font-mono cursor-pointer ${
                                        reportedItems[comm.id]
                                          ? 'text-amber-400'
                                          : isDark
                                          ? 'text-slate-600 hover:text-rose-400'
                                          : 'text-slate-400 hover:text-rose-600'
                                      }`}
                                    >
                                      <Flag className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div
                                className={`text-xs sm:text-[13px] leading-relaxed ${
                                  isDark ? 'text-slate-200' : 'text-slate-800'
                                }`}
                              >
                                <TranslatedTextBlock
                                  itemId={`post_comm_${comm.id}`}
                                  originalText={comm.content}
                                  maxLines={6}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
              </article>

              {shouldRenderAdAfter && adSlotIndex !== undefined && (
                <AdUnitCard
                  slotIndex={adSlotIndex + 1}
                  placement="infeed-post"
                  adPreferences={adPreferences}
                  contextualTags={post.tags}
                  onDismissAd={onDismissAd}
                  onOpenAdSettings={onOpenAdSettings}
                />
              )}
            </React.Fragment>
          );
        });
        })()}
      </div>
    </div>
  );
};
