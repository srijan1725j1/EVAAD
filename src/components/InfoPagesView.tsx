import React, { useState } from 'react';
import {
  ArrowLeft,
  Scale,
  Shield,
  FileText,
  Mail,
  Flag,
  CheckCircle2,
  Trash2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AnonymousModerationReport } from '../types';
import { formatRelativeTime } from '../utils/format';

export type InfoPageRoute = 'about' | 'privacy' | 'guidelines' | 'contact' | 'moderation';

interface InfoPagesViewProps {
  activePage: InfoPageRoute;
  reports: AnonymousModerationReport[];
  isAdminUser: boolean;
  adminEmail?: string | null;
  onNavigatePage: (page: InfoPageRoute) => void;
  onBackToFeed: () => void;
  onOpenAdSettings: () => void;
  onDismissReport: (reportId: string) => void;
  onDeleteReportedTarget: (report: AnonymousModerationReport) => void;
}

const PAGE_TABS: Array<{ id: InfoPageRoute; label: string; path: string }> = [
  { id: 'about', label: 'About', path: '/about' },
  { id: 'guidelines', label: 'Community Guidelines', path: '/guidelines' },
  { id: 'privacy', label: 'Privacy Policy', path: '/privacy' },
  { id: 'contact', label: 'Contact', path: '/contact' },
  { id: 'moderation', label: 'Moderation & Safety', path: '/moderation' },
];

export const InfoPagesView: React.FC<InfoPagesViewProps> = ({
  activePage,
  reports,
  isAdminUser,
  adminEmail,
  onNavigatePage,
  onBackToFeed,
  onOpenAdSettings,
  onDismissReport,
  onDeleteReportedTarget,
}) => {
  const { isDark } = useTheme();
  const configuredContactEmail = (
    (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || ''
  ).trim();
  const configuredEntityName = (
    (import.meta.env.VITE_LEGAL_ENTITY_NAME as string | undefined) || ''
  ).trim();
  const configuredJurisdiction = (
    (import.meta.env.VITE_LEGAL_JURISDICTION as string | undefined) || ''
  ).trim();

  // Contact form helper state (opens mailto when VITE_CONTACT_EMAIL is configured)
  const [contactCategory, setContactCategory] = useState('General Inquiry');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [modStatusFilter, setModStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  const filteredReports = reports.filter((r) => {
    const status = r.status || 'pending';
    if (modStatusFilter === 'all') return true;
    return status === modStatusFilter;
  });

  const handleComposeMailto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuredContactEmail) return;
    const subject = encodeURIComponent(
      `[evaad ${contactCategory}] ${contactSubject.trim() || 'Website Inquiry'}`
    );
    const body = encodeURIComponent(contactMessage.trim());
    window.location.href = `mailto:${configuredContactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-0 pb-12">
      {/* Sub-Navigation Bar for Info & Policy Pages */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 px-3 mb-5 rounded-2xl border backdrop-blur-xl transition-colors ${
          isDark
            ? 'bg-black/75 border-[#141928] shadow-sm'
            : 'bg-white/85 border-slate-200/90 shadow-2xs'
        }`}
      >
        <button
          type="button"
          onClick={onBackToFeed}
          className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-white/[0.05] border-white/[0.1] text-slate-200 hover:bg-white/[0.1]'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Feed</span>
        </button>

        <nav
          aria-label="Information Pages Navigation"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0"
        >
          {PAGE_TABS.map((tab) => {
            const active = activePage === tab.id;
            return (
              <a
                key={tab.id}
                href={tab.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePage(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                  active
                    ? isDark
                      ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                      : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : isDark
                    ? 'bg-[#080c17]/90 border-[#141928] text-slate-400 hover:text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Main Content Card */}
      <div
        className={`rounded-2xl border p-5 sm:p-8 space-y-6 ${
          isDark
            ? 'bg-[#060810] border-[#141928] text-slate-200'
            : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        {/* ===================================================================
            1. ABOUT PAGE (/about)
           =================================================================== */}
        {activePage === 'about' && (
          <article className="space-y-6">
            <header className="border-b pb-4 border-slate-200 dark:border-[#141928]">
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
                <Scale className="w-4 h-4" />
                <span>About evaad</span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Exploring Different Perspectives Through Structured Debate
              </h1>
              <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                evaad is a public discussion and debate platform built around a simple principle: understanding a complex issue requires examining the strongest arguments on both sides.
              </p>
            </header>

            <section className="space-y-3">
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Our Purpose
              </h2>
              <p className="text-sm leading-relaxed">
                Most social feeds reward one-sided echo chambers and rapid outrage. evaad is designed to slow down reactive commentary and organize public discussion into clear, side-by-side viewpoints—what we call the <strong>180° perspective</strong>. Whether the topic involves public policy, technology, work culture, education, or sports, evaad gives every participant an equal structure to present their reasoning.
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  1. Structured Two-Sided Debates
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Every debate topic presents a clear proposition where users can vote and submit arguments explicitly marked <strong>For</strong> or <strong>Against</strong>. Readers can view arguments in an alternating timeline to compare opposing points directly.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  2. Public Posts &amp; Referenced Statements
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  In the <strong>Posts</strong> section, users can share updates, images, videos, or public statements and discuss them in standard comment threads—or use any post as a reference to start a structured For/Against debate.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  3. Separate Public &amp; Debate Handles
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  To help people connect openly in Posts while evaluating debate arguments strictly on merit, evaad uses a display name and <span className="font-mono">@username</span> in the Posts feed and a separate pseudonymous handle (<span className="font-mono">u/username</span>) in Debates.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  4. Fact-Checking, Summaries &amp; Multi-Language Access
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Optional AI-assisted tools help summarize key points on both sides, check factual claims against web sources, and translate discussions across multiple Indian and international languages.
                </p>
              </div>
            </section>

            <section className="pt-2 border-t border-slate-200 dark:border-[#141928] flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => onNavigatePage('guidelines')}
                className="font-bold text-sky-400 hover:underline cursor-pointer"
              >
                Read Community Guidelines →
              </button>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <button
                type="button"
                onClick={() => onNavigatePage('privacy')}
                className="font-bold text-sky-400 hover:underline cursor-pointer"
              >
                Read Privacy Policy →
              </button>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <button
                type="button"
                onClick={() => onNavigatePage('contact')}
                className="font-bold text-sky-400 hover:underline cursor-pointer"
              >
                Contact Us →
              </button>
            </section>
          </article>
        )}

        {/* ===================================================================
            2. COMMUNITY GUIDELINES PAGE (/guidelines)
           =================================================================== */}
        {activePage === 'guidelines' && (
          <article className="space-y-6">
            <header className="border-b pb-4 border-slate-200 dark:border-[#141928]">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <Shield className="w-4 h-4" />
                <span>Community Guidelines</span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Rules for Constructive &amp; Respectful Disagreement
              </h1>
              <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                evaad welcomes strong opinions and sharp debate. You are never required to agree with other participants, but you must challenge ideas rather than attacking people.
              </p>
            </header>

            <section className="space-y-3">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Core Principle: Challenge the Argument, Never the Person
              </h2>
              <p className="text-sm leading-relaxed">
                Healthy debate depends on good-faith reasoning. Use evidence, examples, and clear logic to support your side. Pseudonymity in the Debates section is provided so ideas can be judged without bias—not as a shield for abuse or unlawful behavior.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Prohibited Content &amp; Conduct
              </h2>
              <div className="space-y-3 text-sm">
                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                    1. Illegal Content &amp; Unlawful Acts:
                  </strong>{' '}
                  Do not post content that violates applicable laws, promotes illegal acts, facilitates fraud, or distributes unlawful material.
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                    2. Threats of Violence &amp; Harm:
                  </strong>{' '}
                  Never threaten violence, encourage self-harm, or incite physical harm against any person, group, or institution.
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                    3. Harassment, Bullying &amp; Targeted Abuse:
                  </strong>{' '}
                  Personal insults, targeted harassment, stalking, intimidation, and sexual harassment are strictly prohibited across both Debates and Posts.
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                    4. Hate Speech &amp; Communal Incitement:
                  </strong>{' '}
                  Do not post slurs, dehumanizing language, or attacks targeting individuals or groups based on religion, caste, race, ethnicity, nationality, gender, sexual orientation, or disability.
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                    5. Doxxing &amp; Privacy Violations:
                  </strong>{' '}
                  Do not publish private personal information (phone numbers, home addresses, private emails, financial details) or attempt to unmask another user&apos;s anonymous debate handle.
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                    6. Spam, Manipulation &amp; Deceptive Media:
                  </strong>{' '}
                  Do not flood threads with repetitive promotional links, artificial vote manipulation, or doctored/fabricated quotes presented as real statements.
                </div>

                <div
                  className={`p-3.5 rounded-xl border ${
                    isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <strong className={isDark ? 'text-white' : 'text-slate-900'}>
                    7. Copyright &amp; Intellectual Property Infringement:
                  </strong>{' '}
                  Only upload images, video clips, and text that you have the right to share or that qualify as lawful quotation/commentary with proper attribution.
                </div>
              </div>
            </section>

            <section className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#141928]">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Reporting &amp; Enforcement
              </h2>
              <p className="text-sm leading-relaxed">
                Every debate, argument, social post, and comment on evaad includes a <strong>Report</strong> (flag) button. Reports are submitted without attaching your identity and are reviewed in the platform&apos;s Moderation Queue. Content that violates these guidelines may be removed.
              </p>
            </section>
          </article>
        )}

        {/* ===================================================================
            3. PRIVACY POLICY PAGE (/privacy)
           =================================================================== */}
        {activePage === 'privacy' && (
          <article className="space-y-6">
            <header className="border-b pb-4 border-slate-200 dark:border-[#141928]">
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
                <FileText className="w-4 h-4" />
                <span>Privacy Policy</span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Privacy Policy &amp; Data Practices
              </h1>
              <p className={`mt-2 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Last Updated: October 2026
              </p>
            </header>

            {/* Owner Confirmation Notice */}
            {(!configuredContactEmail || !configuredEntityName || !configuredJurisdiction) && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  isDark
                    ? 'bg-amber-950/25 border-amber-500/30 text-amber-200'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Publisher Details to Confirm Before Final Publication:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {!configuredEntityName && (
                    <li>
                      <strong>Operator / Legal Entity Name:</strong> Set <code className="font-mono">VITE_LEGAL_ENTITY_NAME</code> in your environment variables (currently displayed as <em>evaad Platform Operator</em>).
                    </li>
                  )}
                  {!configuredJurisdiction && (
                    <li>
                      <strong>Governing Jurisdiction:</strong> Set <code className="font-mono">VITE_LEGAL_JURISDICTION</code> in your environment variables if you wish to specify a local jurisdiction.
                    </li>
                  )}
                  {!configuredContactEmail && (
                    <li>
                      <strong>Privacy Contact Email:</strong> Set <code className="font-mono">VITE_CONTACT_EMAIL</code> in your environment variables so users can reach you regarding data requests.
                    </li>
                  )}
                </ul>
              </div>
            )}

            <section className="space-y-2 text-sm leading-relaxed">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                1. Overview
              </h2>
              <p>
                This Privacy Policy explains how <strong>{configuredEntityName || 'evaad'}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;the platform&rdquo;) collects, uses, stores, and shares information when you use the evaad web application. It is based directly on the technical services integrated into this application.
              </p>
            </section>

            <section className="space-y-2 text-sm leading-relaxed">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                2. Information We Collect &amp; How Profiles Work
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Authentication (Firebase Authentication):</strong> When you visit evaad, the application initializes a session using Google Firebase Authentication (supporting guest/anonymous sessions and optional Google Sign-In via popup). If you choose to click <em>Connect Google</em> in Profile &amp; Settings, Firebase Authentication receives your Google account UID and display name to back up your public Posts profile.
                </li>
                <li>
                  <strong>Public Posts Profile:</strong> Content you publish in the <strong>Posts</strong> section (posts, comments, uploaded images/videos, and likes) is stored in Google Cloud Firestore (<code className="font-mono text-xs">social_posts</code>, <code className="font-mono text-xs">post_comments</code>, and <code className="font-mono text-xs">usernames</code> collections) alongside your chosen display name, <code className="font-mono text-xs">@username</code>, and account UID.
                </li>
                <li>
                  <strong>Pseudonymous Debate Handle:</strong> Content you publish in the <strong>Debates</strong> section (debate propositions and For/Against arguments in the <code className="font-mono text-xs">debates</code> and <code className="font-mono text-xs">arguments</code> Firestore collections) is stored with your pseudonymous debate handle (<code className="font-mono text-xs">u/username</code>). The application strips your Google UID and profile photo URL from debate and argument records before writing them to Cloud Firestore.
                </li>
                <li>
                  <strong>Moderation Reports:</strong> When you flag content using the Report button, the report record (<code className="font-mono text-xs">moderation_reports</code> collection) stores only the target item ID, content preview, reason code, optional notes, and timestamp—without your UID, name, or username.
                </li>
                <li>
                  <strong>Voice Dictation, Fact-Checking &amp; Translation:</strong> If you use voice dictation (<code className="font-mono text-xs">/api/transcribe-audio</code>), AI summaries (<code className="font-mono text-xs">/api/summarize-debate</code>), AI moderator chat (<code className="font-mono text-xs">/api/debate-chat</code>), or fact-checking (<code className="font-mono text-xs">/api/check-authenticity</code>), the audio buffer or text you submit is sent to our backend server and processed via the Google Gemini API. Multi-language text translation (<code className="font-mono text-xs">/api/translate-batch</code>) uses the MyMemory Translation API (<code className="font-mono text-xs">api.mymemory.translated.net</code>) and Google Gemini as a fallback.
                </li>
              </ul>
            </section>

            <section className="space-y-2 text-sm leading-relaxed">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                3. Cookies, Local Storage &amp; Google AdSense Advertising Disclosure
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Browser Local Storage:</strong> evaad uses browser <code className="font-mono text-xs">localStorage</code> to save your theme preference (dark/light mode), selected UI language, push notification preference, cached feed state for offline resilience, and your local ad preferences (<code className="font-mono text-xs">evaad_ad_preferences_v1</code>).
                </li>
                <li>
                  <strong>Google AdSense &amp; Third-Party Advertising Cookies:</strong> We use Google AdSense (<code className="font-mono text-xs">pagead2.googlesyndication.com</code>) to display advertisements. Third-party vendors, including Google, use cookies, web beacons, IP addresses, or similar technologies to serve ads based on a user&apos;s prior visits to this website or other websites on the internet.
                </li>
                <li>
                  <strong>Personalized vs. Non-Personalized Ads:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to you based on your visit to evaad and/or other sites on the internet. In addition, evaad maintains an on-device topic-tag affinity score (such as <code className="font-mono text-xs">#TECH</code> or <code className="font-mono text-xs">#SPORTS</code>) in your browser&apos;s <code className="font-mono text-xs">localStorage</code> to match relevant in-feed sponsored units without linking your anonymous debate handle.
                </li>
                <li>
                  <strong>How to Opt Out of Personalized Advertising:</strong> You may turn off personalized ads at any time inside evaad by opening <strong>Profile &amp; Settings → Ad Preferences &amp; Privacy</strong> (which switches ads to contextual-only mode and sets <code className="font-mono text-xs">adsbygoogle.requestNonPersonalizedAds = 1</code>). You may also opt out of personalized advertising by Google by visiting{' '}
                  <a
                    href="https://adssettings.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    Google Ads Settings <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  or opt out of third-party vendor cookies at{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline inline-flex items-center gap-0.5"
                  >
                    aboutads.info/choices <ExternalLink className="w-3 h-3" />
                  </a>
                  .
                </li>
              </ul>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAdSettings}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold hover:bg-sky-500/25 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Manage Your Ad Preferences &amp; Topic Interests</span>
                </button>
              </div>
            </section>

            <section className="space-y-2 text-sm leading-relaxed">
              <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                4. Data Sharing, Storage &amp; User Choices
              </h2>
              <p>
                Public debates, arguments, posts, and comments are visible to other visitors of the platform. You can edit or delete debates and arguments created in your current session directly from the interface, sign out of Google at any time in Profile &amp; Settings, or clear your browser storage to reset local preferences.
                {configuredJurisdiction ? ` Governing jurisdiction: ${configuredJurisdiction}.` : ''}
                {configuredContactEmail
                  ? ` For privacy inquiries or content removal requests, contact ${configuredContactEmail}.`
                  : ''}
              </p>
            </section>
          </article>
        )}

        {/* ===================================================================
            4. CONTACT PAGE (/contact)
           =================================================================== */}
        {activePage === 'contact' && (
          <article className="space-y-6">
            <header className="border-b pb-4 border-slate-200 dark:border-[#141928]">
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
                <Mail className="w-4 h-4" />
                <span>Contact Us</span>
              </div>
              <h1
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Get in Touch with evaad
              </h1>
              <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Have a question about platform policies, copyright/DMCA notices, privacy requests, or advertising partnerships? Reach out below.
              </p>
            </header>

            {configuredContactEmail ? (
              <div className="space-y-5">
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-mono text-slate-400">Official Contact Email</div>
                    <div className={`text-base font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {configuredContactEmail}
                    </div>
                  </div>
                  <a
                    href={`mailto:${configuredContactEmail}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Directly</span>
                  </a>
                </div>

                <form onSubmit={handleComposeMailto} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-400">
                        Inquiry Topic
                      </label>
                      <select
                        value={contactCategory}
                        onChange={(e) => setContactCategory(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                          isDark
                            ? 'bg-[#090d18] border-[#182238] text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Moderation / Content Appeal">Moderation / Content Appeal</option>
                        <option value="Privacy & Data Request">Privacy &amp; Data Request</option>
                        <option value="Copyright / DMCA Notice">Copyright / DMCA Notice</option>
                        <option value="Advertising & Partnerships">Advertising &amp; Partnerships</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-slate-400">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder="Brief summary of your message"
                        className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                          isDark
                            ? 'bg-[#090d18] border-[#182238] text-white placeholder-slate-500'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-400">
                      Message Details
                    </label>
                    <textarea
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Include relevant links, debate/post titles, or details..."
                      className={`w-full rounded-xl p-3 text-xs border focus:outline-none ${
                        isDark
                          ? 'bg-[#090d18] border-[#182238] text-white placeholder-slate-500'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Email Client</span>
                  </button>
                </form>
              </div>
            ) : (
              <div
                className={`p-5 rounded-xl border space-y-3 ${
                  isDark
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Contact Email Configuration Required</span>
                </div>
                <p className="text-xs leading-relaxed">
                  To display your official contact email address on this page without exposing a placeholder or fake address, set the environment variable{' '}
                  <code className="font-mono font-bold px-1.5 py-0.5 rounded bg-black/20">
                    VITE_CONTACT_EMAIL
                  </code>{' '}
                  in your project environment (or Render dashboard Environment settings) and rebuild the application.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => onNavigatePage('moderation')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 font-bold cursor-pointer"
                  >
                    Open Content Moderation &amp; Reporting →
                  </button>
                </div>
              </div>
            )}
          </article>
        )}

        {/* ===================================================================
            5. MODERATION & CONTENT SAFETY QUEUE (/moderation)
           =================================================================== */}
        {activePage === 'moderation' && (
          <article className="space-y-6">
            <header className="border-b pb-4 border-slate-200 dark:border-[#141928] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-1">
                  <Flag className="w-4 h-4" />
                  <span>User-Generated Content Safety</span>
                </div>
                <h1
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Moderation &amp; Flagged Content Queue
                </h1>
                <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Review anonymous community flags across Debates, Arguments, Posts, and Post Comments.
                </p>
              </div>

              <div
                className={`px-3 py-2 rounded-xl border text-xs font-mono shrink-0 flex items-center gap-2 ${
                  isAdminUser
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isDark
                    ? 'bg-white/[0.03] border-white/[0.08] text-slate-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isAdminUser
                    ? `Admin Active (${adminEmail})`
                    : 'Session Moderation Queue'}
                </span>
              </div>
            </header>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(['all', 'pending', 'resolved', 'dismissed'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setModStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold capitalize border cursor-pointer transition-colors ${
                      modStatusFilter === status
                        ? 'bg-sky-500 text-white border-sky-500'
                        : isDark
                        ? 'bg-[#090d18] border-[#161f33] text-slate-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <span className="text-xs font-mono tabular-nums text-slate-400">
                {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
              </span>
            </div>

            {filteredReports.length === 0 ? (
              <div
                className={`p-8 rounded-2xl border text-center space-y-2 ${
                  isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  No Flagged Items in This View
                </div>
                <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Users can flag any debate proposition, argument, social post, or comment using the Report icon on each card. Flagged items appear here for review and removal.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((rep) => {
                  const status = rep.status || 'pending';
                  return (
                    <div
                      key={rep.id}
                      className={`p-4 rounded-xl border space-y-3 ${
                        isDark ? 'bg-[#090d18] border-[#161f33]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-400 uppercase">
                            {rep.targetType.replace('_', ' ')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Reason: {rep.reason.replace('_', ' ')}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-400">
                            {formatRelativeTime(rep.createdAt)}
                          </span>
                        </div>

                        <span
                          className={`font-bold uppercase ${
                            status === 'resolved'
                              ? 'text-emerald-400'
                              : status === 'dismissed'
                              ? 'text-slate-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-lg border text-xs italic ${
                          isDark
                            ? 'bg-[#050811] border-[#141c2e] text-slate-200'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        &ldquo;{rep.targetPreview}&rdquo;
                      </div>

                      {rep.details && (
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <strong>Notes:</strong> {rep.details}
                        </p>
                      )}

                      {status === 'pending' && (
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onDismissReport(rep.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                              isDark
                                ? 'bg-white/[0.04] border-white/[0.1] text-slate-300 hover:bg-white/[0.08]'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Dismiss Report</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteReportedTarget(rep)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Reported Content</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
};
