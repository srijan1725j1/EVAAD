import React, { useState } from 'react';
import { Debate, Author } from '../types';
import { X } from 'lucide-react';

interface CreateDebateModalProps {
  isOpen: boolean;
  currentAuthor: Author;
  onClose: () => void;
  onCreateDebate: (debate: Debate) => void;
}

const COMMON_TAGS = ['POLITICS', 'INDIA', 'SPORTS', 'TECH', 'EDUCATION', 'WORK', 'SOCIETY', 'WORLD'];

export const CreateDebateModal: React.FC<CreateDebateModalProps> = ({
  isOpen,
  currentAuthor,
  onClose,
  onCreateDebate,
}) => {
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['POLITICS', 'INDIA']);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState('');

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
      likes: 1,
      createdAt: new Date().toISOString(),
    };

    onCreateDebate(newDebate);
    onClose();
    setTitle('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#080d1a] border border-[#152038] rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Author Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md ring-2 ring-white/10"
            style={{ backgroundColor: currentAuthor.avatarColor }}
          >
            {currentAuthor.initials}
          </div>
          <div>
            <div className="font-bold text-white text-sm">{currentAuthor.name}</div>
            <div className="text-xs text-slate-400 font-mono">{currentAuthor.handle}</div>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Debate Question
            </label>
            <textarea
              rows={3}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Should India host the 2036 Olympic Games?"
              className="w-full bg-[#040711] border border-[#152038] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 resize-none"
              maxLength={180}
            />
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
                        ? 'bg-gradient-to-r from-[#00b4d8] to-[#00f5d4] text-slate-950 font-bold'
                        : 'bg-[#10172c] border border-[#1b2747] text-slate-400 hover:text-white'
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
              className="w-full bg-[#040711] border border-[#152038] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
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
