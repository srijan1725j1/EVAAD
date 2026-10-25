import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
  buttonClassName?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  maxLines = 6,
  className = '',
  buttonClassName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // Estimate canExpand initially if text has many lines or length is high
  const initialEstimate =
    (text.match(/\n/g) || []).length >= maxLines - 1 || text.length > maxLines * 55;
  const [canExpand, setCanExpand] = useState(initialEstimate);
  const contentRef = useRef<HTMLDivElement>(null);

  const checkOverflow = () => {
    const el = contentRef.current;
    if (!el) return;
    if (!isExpanded) {
      const hasOverflow = el.scrollHeight > el.clientHeight + 2;
      setCanExpand(hasOverflow);
    }
  };

  useLayoutEffect(() => {
    checkOverflow();
  }, [text, maxLines, isExpanded]);

  useEffect(() => {
    const handleResize = () => {
      checkOverflow();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={contentRef}
        className="transition-all duration-200"
        style={
          !isExpanded
            ? {
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {text}
      </div>

      {(canExpand || isExpanded) && (
        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center gap-1 mt-1.5 font-semibold text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer select-none underline-offset-2 hover:underline ${buttonClassName}`}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};
