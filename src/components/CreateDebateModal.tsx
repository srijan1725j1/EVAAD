import React, { useState, useRef } from 'react';
import { Debate, Author } from '../types';
import { X, Image, Trash2, Link, Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

interface CreateDebateModalProps {
  isOpen: boolean;
  currentAuthor: Author;
  onClose: () => void;
  onCreateDebate: (debate: Debate) => void;
}

const COMMON_TAGS = ['POLITICS', 'INDIA', 'SPORTS', 'TECH', 'EDUCATION', 'WORK', 'SOCIETY', 'CULTURE'];

export const CreateDebateModal: React.FC<CreateDebateModalProps> = ({
  isOpen,
  currentAuthor,
  onClose,
  onCreateDebate,
}) => {
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['POLITICS', 'INDIA']);
  const [customTag, setCustomTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
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

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      if (selectedTags.length > 1) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
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
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (max 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setError('');
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
      againstVotes: 1,
      views: 1,
      likes: 0,
      imageUrl: imageUrl.trim() || undefined,
      imageCaption: imageCaption.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onCreateDebate(newDebate);
    onClose();
    setTitle('');
    setImageUrl('');
    setImageCaption('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#060810] border border-[#141928] rounded-2xl max-w-lg w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
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
            <div className="font-bold text-white text-sm">{currentAuthor.name}</div>
            <div className="text-xs text-slate-400 font-mono">Posting as anonymous Redditor</div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mb-1">Start a New Debate</h2>
        <p className="text-xs text-slate-400 mb-4">
          Post an open controversy. People will debate and vote on both sides.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Debate Question
              </label>
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`text-[11px] font-mono flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/10'
                }`}
              >
                {isRecording ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3" />}
                <span>{isRecording ? 'Stop Recording' : isTranscribing ? 'Transcribing...' : 'Dictate with Voice'}</span>
              </button>
            </div>

            {isRecording && (
              <div className="mb-2 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                <span>Listening... Speak the debate question aloud</span>
              </div>
            )}

            {isTranscribing && (
              <div className="mb-2 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
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
              placeholder="e.g. Does official NFHS data prove that India is not predominantly vegetarian?"
              className="w-full bg-black border border-[#141928] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none"
              maxLength={220}
            />
          </div>

          {/* Image Attachment Option */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Attach Image / Infographic (Optional)
              </label>
              {!imageUrl && (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                >
                  <Link className="w-3 h-3" />
                  <span>{showUrlInput ? 'Upload file instead' : 'Or paste URL'}</span>
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative rounded-xl border border-[#1b253b] bg-black/80 p-2 flex flex-col gap-2">
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
                  placeholder="Optional graphic caption or data source (e.g. NFHS-5 Survey Report)"
                  className="w-full bg-[#070b14] border border-[#141928] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>
            ) : showUrlInput ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image or graph URL (https://...)"
                  className="w-full bg-black border border-[#141928] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
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
                  className="flex items-center justify-center gap-2 border border-dashed border-[#1e293b] hover:border-[#38bdf8]/50 rounded-xl py-3 px-4 bg-[#050812] hover:bg-[#090e1c] cursor-pointer transition-all text-xs text-slate-400 hover:text-slate-200"
                >
                  <Image className="w-4 h-4 text-[#38bdf8]" />
                  <span>Upload a graph, chart, or reference image</span>
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Tags (up to 3)
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
                        ? 'bg-[#0284c7] text-white font-bold'
                        : 'bg-[#0c101c] border border-[#141928] text-slate-400 hover:text-white'
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
              className="w-full bg-black border border-[#141928] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md active:scale-95"
            >
              Post Debate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
