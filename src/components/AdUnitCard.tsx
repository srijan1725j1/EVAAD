import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Info, X, SlidersHorizontal, EyeOff, Scale } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import {
  AdPreferences,
  selectCampaignForSlot,
} from '../utils/adPersonalization';

interface AdUnitCardProps {
  slotIndex: number;
  placement: 'infeed-debate' | 'infeed-post' | 'sidebar';
  adPreferences: AdPreferences;
  contextualTags?: string[];
  onDismissAd: (campaignId: string) => void;
  onOpenAdSettings: () => void;
  onStartSponsoredDebate?: (question: string, tags: string[]) => void;
}

export const AdUnitCard: React.FC<AdUnitCardProps> = ({
  slotIndex,
  placement,
  adPreferences,
  contextualTags = [],
  onDismissAd,
  onOpenAdSettings,
  onStartSponsoredDebate,
}) => {
  const { isDark } = useTheme();
  const [showWhyThisAd, setShowWhyThisAd] = useState(false);
  const adSensePushedRef = useRef(false);

  const adSenseClientId = (import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined)?.trim();
  const adSenseSlotId = (
    placement === 'sidebar'
      ? (import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT as string | undefined)
      : (import.meta.env.VITE_ADSENSE_INFEED_SLOT as string | undefined)
  )?.trim();

  const hasLiveAdSenseConfig = Boolean(
    adSenseClientId && adSenseClientId.startsWith('ca-pub-') && adSenseSlotId
  );

  const { campaign, matchedTag, isPersonalizedMatch } = selectCampaignForSlot(
    slotIndex,
    adPreferences,
    contextualTags
  );

  useEffect(() => {
    if (!hasLiveAdSenseConfig || adSensePushedRef.current) return;
    try {
      const queue = (window.adsbygoogle = window.adsbygoogle || []);
      queue.requestNonPersonalizedAds = adPreferences.personalizedAdsEnabled ? 0 : 1;
      queue.push({});
      adSensePushedRef.current = true;
    } catch {
      // Ignore AdSense push error if blocked by browser extension or unapproved domain
    }
  }, [hasLiveAdSenseConfig, adPreferences.personalizedAdsEnabled]);

  if (adPreferences.dismissedAdIds.includes(campaign.id)) {
    return null;
  }

  // ===========================================================================
  // DESKTOP RIGHT SIDEBAR DISPLAY UNIT
  // ===========================================================================
  if (placement === 'sidebar') {
    return (
      <div
        className={`mt-4 rounded-2xl border overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#070a14] border-[#1a2236]'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        {/* Top Metadata Bar (Unboxed Typography per Zero-Pill Rule) */}
        <div
          className={`px-3.5 py-2 border-b flex items-center justify-between text-[11px] font-mono ${
            isDark ? 'border-[#141b2d] text-slate-400' : 'border-slate-100 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="font-semibold">Sponsored</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">
              {isPersonalizedMatch ? `Matched to #${matchedTag}` : `Contextual #${matchedTag}`}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowWhyThisAd((v) => !v)}
              title="Why am I seeing this ad?"
              className={`p-1 rounded transition-colors cursor-pointer ${
                showWhyThisAd
                  ? 'text-sky-400 bg-sky-500/10'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDismissAd(campaign.id)}
              title="Hide this ad"
              className={`p-1 rounded transition-colors cursor-pointer ${
                isDark ? 'text-slate-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* "Why This Ad?" Disclosure Drawer */}
        {showWhyThisAd && (
          <div
            className={`px-3.5 py-2.5 border-b text-xs space-y-2 ${
              isDark ? 'bg-[#0b1020] border-[#1a2236] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <p className="leading-relaxed">
              {isPersonalizedMatch ? (
                <>
                  Shown based on your local topic interest in{' '}
                  <strong className="font-mono text-sky-400">#{matchedTag}</strong>. Your anonymous debate handle is never shared with advertisers.
                </>
              ) : (
                <>
                  <strong>Contextual placement</strong> — Personalized ads are turned off, so this unit is matched only to general topic context.
                </>
              )}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={onOpenAdSettings}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:underline cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Ad Preferences</span>
              </button>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <button
                type="button"
                onClick={() => onDismissAd(campaign.id)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:underline cursor-pointer"
              >
                <EyeOff className="w-3 h-3" />
                <span>Hide Ad</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Google AdSense Slot (if Publisher ID + Slot ID are set) */}
        {hasLiveAdSenseConfig && (
          <div className="px-3 pt-2">
            <ins
              className="adsbygoogle block"
              data-ad-client={adSenseClientId}
              data-ad-slot={adSenseSlotId}
              data-ad-format="rectangle, horizontal"
              data-full-width-responsive="true"
            />
          </div>
        )}

        {/* Native Sponsored Display Card Body */}
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0"
              style={{ backgroundColor: campaign.avatarColor }}
            >
              {campaign.advertiserInitials}
            </div>
            <div className="min-w-0">
              <div
                className={`text-xs font-bold truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {campaign.advertiserName}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">
                {campaign.domainLabel} · {campaign.metricsLabel}
              </div>
            </div>
          </div>

          <h3
            className={`text-xs font-bold leading-snug ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            {campaign.headline}
          </h3>

          <p
            className={`text-[11px] leading-relaxed line-clamp-3 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {campaign.body}
          </p>

          <div className="pt-1 flex items-center gap-2">
            <a
              href={campaign.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors whitespace-nowrap"
            >
              <span>{campaign.ctaLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // IN-FEED AD UNIT (Interleaved in Debates Timeline & Posts Timeline)
  // ===========================================================================
  return (
    <div
      className={`px-3.5 sm:px-5 py-3.5 sm:py-4 border-b transition-colors ${
        isDark
          ? 'border-[#141928] bg-[#070b16]/70 hover:bg-[#090e1c]/90'
          : 'border-slate-200 bg-slate-50/45 hover:bg-slate-50/90'
      }`}
    >
      {/* Top Unboxed Metadata Line */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap text-xs">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0"
            style={{ backgroundColor: campaign.avatarColor }}
          >
            {campaign.advertiserInitials}
          </div>
          <span
            className={`font-bold truncate ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}
          >
            {campaign.advertiserName}
          </span>
          <span className="font-mono text-sky-400 truncate text-[11px]">
            {campaign.advertiserHandle}
          </span>
          <span aria-hidden="true" className={isDark ? 'text-slate-600' : 'text-slate-300'}>
            ·
          </span>
          <span
            className={`font-mono text-[11px] ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Sponsored
          </span>
          <span aria-hidden="true" className={isDark ? 'text-slate-600' : 'text-slate-300'}>
            ·
          </span>
          <span
            className={`font-mono text-[11px] ${
              isDark ? 'text-slate-500' : 'text-slate-500'
            }`}
          >
            {isPersonalizedMatch
              ? `Matched to #${matchedTag}`
              : `Contextual #${matchedTag}`}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowWhyThisAd((v) => !v)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
              showWhyThisAd
                ? 'text-sky-400 bg-sky-500/10'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Info className="w-3 h-3" />
            <span className="hidden sm:inline">Why this ad?</span>
          </button>

          <button
            type="button"
            onClick={() => onDismissAd(campaign.id)}
            title="Hide ad"
            className={`p-1 rounded transition-colors cursor-pointer ${
              isDark ? 'text-slate-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable "Why This Ad?" Privacy & Targeting Disclosure */}
      {showWhyThisAd && (
        <div
          className={`mb-3 p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
            isDark
              ? 'bg-[#0a1020] border-[#1b253b] text-slate-300'
              : 'bg-white border-slate-200 text-slate-700'
          }`}
        >
          <div className="leading-relaxed">
            {isPersonalizedMatch ? (
              <>
                <strong>Personalized via Topic Tags:</strong> Selected because you engage with{' '}
                <span className="font-mono text-sky-400 font-semibold">#{matchedTag}</span> topics. Your anonymous debate handle is never linked to ad targeting.
              </>
            ) : (
              <>
                <strong>Contextual Placement (Non-Personalized):</strong> Personalized ads are switched off in your settings; this ad is matched only to general topic context.
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
            <button
              type="button"
              onClick={onOpenAdSettings}
              className="inline-flex items-center gap-1 text-sky-400 hover:underline font-semibold cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Ad Preferences</span>
            </button>
            <button
              type="button"
              onClick={() => onDismissAd(campaign.id)}
              className="inline-flex items-center gap-1 text-rose-400 hover:underline font-semibold cursor-pointer whitespace-nowrap"
            >
              <EyeOff className="w-3 h-3" />
              <span>Hide Ad</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Google AdSense In-Feed Slot (when VITE_ADSENSE_CLIENT_ID is configured) */}
      {hasLiveAdSenseConfig && (
        <div className="mb-2">
          <ins
            className="adsbygoogle block"
            data-ad-format="fluid"
            data-ad-layout-key="-fb+5w+4e-db+86"
            data-ad-client={adSenseClientId}
            data-ad-slot={adSenseSlotId}
          />
        </div>
      )}

      {/* Headline & Body Copy */}
      <h3
        className={`text-sm sm:text-base font-bold leading-snug mb-1 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {campaign.headline}
      </h3>
      <p
        className={`text-xs sm:text-sm leading-relaxed mb-3 ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {campaign.body}
      </p>

      {/* Bottom Action Bar: Domain Info + Primary Advertiser CTA + Optional Sponsored Debate Launch */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div
          className={`flex items-center gap-1.5 text-[11px] font-mono tabular-nums ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <span>{campaign.domainLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{campaign.metricsLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          {placement === 'infeed-debate' &&
            campaign.sponsoredDebatePrompt &&
            onStartSponsoredDebate && (
              <button
                type="button"
                onClick={() =>
                  onStartSponsoredDebate(campaign.sponsoredDebatePrompt!, campaign.tags)
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.1] text-slate-200 hover:bg-white/[0.08]'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-sky-400" />
                <span>Debate This Topic</span>
              </button>
            )}

          <a
            href={campaign.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <span>{campaign.ctaLabel}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
