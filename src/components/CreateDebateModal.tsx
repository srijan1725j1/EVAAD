import React, { useState, useRef, useEffect } from 'react';
import { Debate, Author, SocialPost, ReferencePostEmbed } from '../types';
import { X, Image, Trash2, Link, Mic, MicOff, Loader2, Quote } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ReferencePostCard } from './ReferencePostCard';

interface CreateDebateModalProps {
  isOpen: boolean;
  currentAuthor: Author;
  initialReferencePost?: SocialPost | null;
  availablePosts?: SocialPost[];
  onClose: () => void;
  onCreateDebate: (debate: Debate) => void;
}

const COMMON_TAGS = ['POLITICS', 'INDIA', 'SPORTS', 'TECH', 'EDUCATION', 'WORK', 'SOCIETY', 'CULTURE'];

function socialPostToEmbed(post: SocialPost): ReferencePostEmbed {
  return {
    postId: post.id,
    authorName: post.author.name,
    authorHandle: post.author.handle,
    authorAvatarColor: post.author.avatarColor,
    authorInitials: post.author.initials,
    speakerLabel: post.speakerTitle,
    content: post.content,
    imageUrl: post.imageUrl,
    videoUrl: post.videoUrl,
    createdAt: post.createdAt,
  };
}

export const CreateDebateModal: React.FC<CreateDebateModalProps> = ({
  isOpen,
  currentAuthor,
  initialReferencePost = null,
  availablePosts = [],
  onClose,
  onCreateDebate,
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['POLITICS', 'INDIA']);
  const [customTag, setCustomTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [selectedRefPost, setSelectedRefPost] = useState<SocialPost | null>(null);
  const [showPostPicker, setShowPostPicker] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    isTranscribing,
    error: micError,
    startRecording,
    stopRecording,
  } = useVoiceRecorder({
    onTranscriptionComplete: (text) => {
      setTitle((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  // Sync when modal opens with an initialReferencePost
  useEffect(() => {
    if (isOpen && initialReferencePost) {
      setSelectedRefPost(initialReferencePost);
      const speaker = initialReferencePost.speakerTitle
        ? `${initialReferencePost.author.handle} (${initialReferencePost.speakerTitle})`
        : initialReferencePost.author.handle;
      const snippet =
        initialReferencePost.content.length > 110
          ? initialReferencePost.content.slice(0, 107).trim() + '...'
          : initialReferencePost.content;
      setTitle(
        `This statement was made by ${speaker}: ${snippet} — Do you agree or disagree?`.slice(0, 220)
      );
      if (initialReferencePost.tags && initialReferencePost.tags.length > 0) {
        setSelectedTags(initialReferencePost.tags.slice(0, 3));
      }
    } else if (!isOpen) {
      setSelectedRefPost(null);
      setShowPostPicker(false);
    }
  }, [isOpen, initialReferencePost]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((tItem) => tItem !== tag));
      }
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const addCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTag.trim()) {
      e.preventDefault();
      const upper = customTag.trim().toUpperCase();
      if (!selectedTags.includes(upper) && selectedTags.length < 3) {
        setSelectedTags([...selectedTags, upper]);
      }
      setCustomTag('');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image file is too large (max 8MB).');
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
            const compressed = canvas.toDataURL('image/jpeg', 0.78);
            setImageUrl(compressed);
          } else {
            setImageUrl(rawDataUrl);
          }
          setError('');
        };
        img.onerror = () => {
          setImageUrl(rawDataUrl);
          setError('');
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePickPostReference = (post: SocialPost) => {
    setSelectedRefPost(post);
    setShowPostPicker(false);
    if (!title.trim()) {
      const speaker = post.speakerTitle
        ? `${post.author.handle} (${post.speakerTitle})`
        : post.author.handle;
      const snippet =
        post.content.length > 110
          ? post.content.slice(0, 107).trim() + '...'
          : post.content;
      setTitle(
        `This statement was made by ${speaker}: ${snippet} — Do you agree or disagree?`.slice(0, 220)
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 8) {
      setError('Please enter a clear debate question (at least 8 characters).');
      return;
    }

    const newDebate: Debate = {
      id: 'debate_' + Date.now().toString(36),
      title: title.trim(),
      tags: selectedTags,
      author: currentAuthor,
      forVotes: 1,
      againstVotes: 0,
      views: 1,
      likes: 1,
      ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      ...(imageCaption.trim() ? { imageCaption: imageCaption.trim() } : {}),
      ...(selectedRefPost ? { referencePost: socialPostToEmbed(selectedRefPost) } : {}),
      createdAt: new Date().toISOString(),
    };

    onCreateDebate(newDebate);
    setTitle('');
    setImageUrl('');
    setImageCaption('');
    setSelectedRefPost(null);
    setShowUrlInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`border rounded-2xl max-w-lg w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#060810] border-[#141928] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-5 right-5 p-1 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-white/5'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Author Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md ring-1 ring-white/10"
            style={{ backgroundColor: currentAuthor.avatarColor }}
          >
            {currentAuthor.initials}
          </div>
          <div>
            <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentAuthor.name}
            </div>
            <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <strong className={isDark ? 'text-sky-400' : 'text-sky-600'}>
                {currentAuthor.handle}
              </strong>
            </div>
          </div>
        </div>

        <h2 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {selectedRefPost ? 'Start Debate on Referenced Post' : t('startNewDebate')}
        </h2>
        <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {selectedRefPost
            ? 'Ask the community whether they agree or disagree with this statement/post.'
            : t('postOpenControversy')}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reference Post / Statement Selector or Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className={`block text-xs font-semibold ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Referenced Post / Statement (Optional)
              </label>

              {selectedRefPost ? (
                <button
                  type="button"
                  onClick={() => setSelectedRefPost(null)}
                  className="text-[11px] font-mono text-rose-400 hover:underline cursor-pointer"
                >
                  Remove Reference
                </button>
              ) : (
                availablePosts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPostPicker((v) => !v)}
                    className={`inline-flex items-center gap-1 text-[11px] font-mono hover:underline cursor-pointer ${
                      isDark ? 'text-sky-400' : 'text-sky-600'
                    }`}
                  >
                    <Quote className="w-3 h-3" />
                    <span>{showPostPicker ? 'Hide Posts' : 'Pick a Post to Reference'}</span>
                  </button>
                )
              )}
            </div>

            {selectedRefPost && (
              <ReferencePostCard
                reference={socialPostToEmbed(selectedRefPost)}
                compact
              />
            )}

            {!selectedRefPost && showPostPicker && availablePosts.length > 0 && (
              <div
                className={`max-h-48 overflow-y-auto rounded-xl border divide-y p-1 ${
                  isDark
                    ? 'bg-[#080c18] border-[#1a233a] divide-[#141b2d]'
                    : 'bg-slate-50 border-slate-200 divide-slate-200'
                }`}
              >
                {availablePosts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePickPostReference(p)}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-400 mb-0.5">
                      <span>{p.author.handle}</span>
                      {p.speakerTitle && (
                        <span className="text-amber-400">· {p.speakerTitle}</span>
                      )}
                    </div>
                    <p
                      className={`text-xs line-clamp-2 ${
                        isDark ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      {p.content}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Debate Question */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className={`block text-xs font-semibold ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {t('debateQuestion')}
              </label>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`text-[11px] font-mono flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : isDark
                    ? 'bg-white/[0.04] text-slate-400 hover:text-white border-white/10'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-3 h-3 text-rose-400" />
                ) : (
                  <Mic className="w-3 h-3" />
                )}
                <span>
                  {isRecording
                    ? t('stopRecording')
                    : isTranscribing
                    ? t('transcribingSpeech')
                    : t('dictateWithVoice')}
                </span>
              </button>
            </div>

            {isRecording && (
              <div className="mb-2 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>Listening... Speak the debate question aloud</span>
              </div>
            )}

            {isTranscribing && (
              <div className="mb-2 p-2 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 text-xs flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
                <span>Transcribing voice speech...</span>
              </div>
            )}

            {micError && (
              <div className="mb-2 p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                {micError}
              </div>
            )}

            <textarea
              rows={3}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. This was the statement made — Do you agree or disagree with this view?"
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm transition-all focus:outline-none resize-none ${
                isDark
                  ? 'bg-black border border-[#141928] text-white placeholder-slate-500 focus:border-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
              }`}
              maxLength={220}
            />
          </div>

          {/* Image Attachment Option */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className={`block text-xs font-semibold ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {t('attachImage')}
              </label>
              {!imageUrl && (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className={`text-[11px] hover:underline flex items-center gap-1 cursor-pointer font-mono ${
                    isDark ? 'text-sky-400' : 'text-sky-600'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  <span>{showUrlInput ? 'Upload file instead' : 'Or paste URL'}</span>
                </button>
              )}
            </div>

            {imageUrl ? (
              <div
                className={`relative rounded-xl border p-2 flex flex-col gap-2 ${
                  isDark ? 'border-[#1b253b] bg-black/80' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="relative max-h-48 overflow-hidden rounded-lg">
                  <img
                    src={imageUrl}
                    alt="Debate graphic preview"
                    className="w-full h-auto max-h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 hover:bg-rose-900/90 text-rose-300 border border-rose-800 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Optional graphic caption or data source"
                  className={`w-full rounded-lg px-3 py-1.5 text-xs focus:outline-none ${
                    isDark
                      ? 'bg-[#070b14] border border-[#141928] text-white placeholder-slate-500 focus:border-slate-500'
                      : 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                  }`}
                />
              </div>
            ) : showUrlInput ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image or graph URL (https://...)"
                  className={`w-full rounded-xl px-3.5 py-2 text-xs focus:outline-none ${
                    isDark
                      ? 'bg-black border border-[#141928] text-white placeholder-slate-500 focus:border-slate-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                  }`}
                />
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                  id="debate-image-upload"
                />
                <label
                  htmlFor="debate-image-upload"
                  className={`flex items-center justify-center gap-2 border border-dashed rounded-xl py-3 px-4 cursor-pointer transition-all text-xs ${
                    isDark
                      ? 'border-[#1e293b] hover:border-sky-500/50 bg-[#050812] hover:bg-[#090e1c] text-slate-400 hover:text-slate-200'
                      : 'border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Image className="w-4 h-4 text-sky-500" />
                  <span>{t('uploadGraphOrImage')}</span>
                </label>
              </div>
            )}
          </div>

          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              {t('selectTags')}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold'
                        : isDark
                        ? 'bg-[#0c101c] border border-[#141928] text-slate-400 hover:text-white'
                        : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={addCustomTag}
              placeholder="Or type a custom tag and press Enter"
              className={`w-full rounded-xl px-3 py-1.5 text-xs focus:outline-none ${
                isDark
                  ? 'bg-black border border-[#141928] text-white placeholder-slate-500 focus:border-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              {t('postDebate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
