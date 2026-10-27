import React, { useState, useEffect } from 'react';
import { Debate } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { X, Edit3, Loader2 } from 'lucide-react';

interface EditDebateModalProps {
  isOpen: boolean;
  debate: Debate | null;
  onClose: () => void;
  onSave: (debateId: string, updatedData: { title: string; tags: string[]; imageCaption?: string }) => Promise<void>;
}

export const EditDebateModal: React.FC<EditDebateModalProps> = ({
  isOpen,
  debate,
  onClose,
  onSave,
}) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debate && isOpen) {
      setTitle(debate.title);
      setTagsInput(debate.tags ? debate.tags.join(', ') : '');
      setCaption(debate.imageCaption || '');
      setError(null);
    }
  }, [debate, isOpen]);

  if (!isOpen || !debate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0)
      .slice(0, 5);

    try {
      await onSave(debate.id, {
        title: title.trim(),
        tags: parsedTags,
        imageCaption: caption.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update debate';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
          isDark
            ? 'bg-[#0a0d16] border-[#1e2538] text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-[#1a2133] bg-[#070910]' : 'border-slate-100 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold tracking-tight">Edit Debate</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-xs font-medium bg-rose-500/15 border border-rose-500/30 text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-xs font-mono font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Debate Proposition / Question
            </label>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="State the core motion or question..."
              className={`w-full rounded-xl p-3 text-sm transition-all focus:outline-none ${
                isDark
                  ? 'bg-[#060810] border border-[#1b2235] text-white focus:border-sky-500'
                  : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
              }`}
            />
            <div className="flex justify-end text-[10px] font-mono text-slate-400 mt-1">
              {title.length}/500
            </div>
          </div>

          <div>
            <label className={`block text-xs font-mono font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. AI, Philosophy, Tech, Society"
              className={`w-full rounded-xl px-3 py-2 text-xs transition-all focus:outline-none ${
                isDark
                  ? 'bg-[#060810] border border-[#1b2235] text-white focus:border-sky-500'
                  : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
              }`}
            />
          </div>

          {debate.imageUrl && (
            <div>
              <label className={`block text-xs font-mono font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Image Caption
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional caption for image..."
                className={`w-full rounded-xl px-3 py-2 text-xs transition-all focus:outline-none ${
                  isDark
                    ? 'bg-[#060810] border border-[#1b2235] text-white focus:border-sky-500'
                    : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
                }`}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
