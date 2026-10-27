import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'ml'
  | 'pa'
  | 'ur'
  | 'es'
  | 'fr'
  | 'de'
  | 'ar'
  | 'pt'
  | 'ru'
  | 'ja'
  | 'zh'
  | 'ko';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  shortLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', shortLabel: 'EN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', shortLabel: 'हिं' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', shortLabel: 'বাং' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', shortLabel: 'தமி' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', shortLabel: 'తెలు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', shortLabel: 'मरा' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', shortLabel: 'ગુજ' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', shortLabel: 'ಕನ್ನ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', shortLabel: 'മല' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', shortLabel: 'ਪੰਜਾ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', shortLabel: 'اردو' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', shortLabel: 'ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', shortLabel: 'FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', shortLabel: 'DE' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', shortLabel: 'عربي' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', shortLabel: 'PT' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', shortLabel: 'RU' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', shortLabel: '日本' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', shortLabel: '中文' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', shortLabel: '한국' },
];

export type TranslationKey =
  | 'debates'
  | 'activeDiscussions'
  | 'searchPlaceholder'
  | 'trending'
  | 'arguments'
  | 'args'
  | 'views'
  | 'newDebate'
  | 'newShort'
  | 'ambient'
  | 'for'
  | 'against'
  | 'voteFor'
  | 'votedFor'
  | 'voteAgainst'
  | 'votedAgainst'
  | 'votes'
  | 'resetVoteTip'
  | 'share'
  | 'copied'
  | 'aiInsights'
  | 'liveStream'
  | 'alternatingSorted'
  | 'live'
  | 'balanced'
  | 'noArgumentsYet'
  | 'noDebatesFound'
  | 'yourSide'
  | 'postArgumentPlaceholder'
  | 'send'
  | 'verifyFacts'
  | 'sharedPoint'
  | 'recordingAudio'
  | 'done'
  | 'cancel'
  | 'transcribingSpeech'
  | 'save'
  | 'saving'
  | 'seeOriginal'
  | 'seeTranslation'
  | 'showingOriginal'
  | 'translating'
  | 'language'
  | 'selectLanguage'
  | 'languageDesc'
  | 'settings'
  | 'themeAppearance'
  | 'darkMode'
  | 'lightMode'
  | 'subtleAmbientGlow'
  | 'ambientDesc'
  | 'enabled'
  | 'disabled'
  | 'uniqueUsername'
  | 'strictlyUnique'
  | 'suggestedUsernames'
  | 'newIdeas'
  | 'saveUsername'
  | 'account'
  | 'signOut'
  | 'googleLogin'
  | 'close'
  | 'startNewDebate'
  | 'postOpenControversy'
  | 'debateQuestion'
  | 'dictateWithVoice'
  | 'stopRecording'
  | 'attachImage'
  | 'uploadGraphOrImage'
  | 'selectTags'
  | 'postDebate'
  | 'readMore'
  | 'showLess'
  | 'aiDebateIntelligence'
  | 'executiveSummary'
  | 'debateAssistant'
  | 'objectiveSynthesis'
  | 'regenerate'
  | 'conflictCore'
  | 'keyArgsFor'
  | 'keyArgsAgainst'
  | 'groundOfAgreement'
  | 'fundamentalDisagreements'
  | 'takeaway'
  | 'askAnythingPlaceholder'
  | 'all'
  | 'factCheck'
  | 'installApp';

const EN_STRINGS: Record<TranslationKey, string> = {
  debates: 'Debates',
  activeDiscussions: 'Active Discussions',
  searchPlaceholder: 'Search debates...',
  trending: 'Trending',
  arguments: 'arguments',
  args: 'args',
  views: 'views',
  newDebate: 'New Debate',
  newShort: 'New',
  ambient: 'Ambient',
  for: 'For',
  against: 'Against',
  voteFor: 'Vote For',
  votedFor: 'Voted For',
  voteAgainst: 'Vote Against',
  votedAgainst: 'Voted Against',
  votes: 'votes',
  resetVoteTip: 'Tip: Click your active vote again to reset to neutral',
  share: 'Share',
  copied: 'Copied!',
  aiInsights: 'AI Insights',
  liveStream: 'Live stream (chronological)',
  alternatingSorted: 'Alternating arguments sorted by likes:',
  live: 'Live',
  balanced: 'Balanced (A ⇄ B)',
  noArgumentsYet: 'No arguments posted yet. Be the first to reply!',
  noDebatesFound: 'No discussions found.',
  yourSide: 'Your side:',
  postArgumentPlaceholder: 'Post an argument on this topic... (or click mic)',
  send: 'Send',
  verifyFacts: 'Verify Facts',
  sharedPoint: 'Shared point',
  recordingAudio: 'Recording audio... Speak your argument clearly',
  done: 'Done',
  cancel: 'Cancel',
  transcribingSpeech: 'Transcribing your speech...',
  save: 'Save',
  saving: 'Saving...',
  seeOriginal: 'See original',
  seeTranslation: 'See translation',
  showingOriginal: 'Original text',
  translating: 'Translating...',
  language: 'Language & Translation',
  selectLanguage: 'App & Content Language',
  languageDesc: 'Translates the entire interface, all debate posts, and all comments into your chosen language.',
  settings: 'Settings',
  themeAppearance: 'Theme & Appearance',
  darkMode: 'Dark Mode',
  lightMode: 'Light Mode',
  subtleAmbientGlow: 'Subtle Ambient Glow',
  ambientDesc: 'Soft background light reflecting debate energy',
  enabled: 'Enabled',
  disabled: 'Disabled',
  uniqueUsername: 'Unique Username',
  strictlyUnique: 'Strictly unique per debater',
  suggestedUsernames: 'Suggested Usernames:',
  newIdeas: 'New Ideas',
  saveUsername: 'Save Username',
  account: 'Account',
  signOut: 'Sign Out',
  googleLogin: 'Google Login',
  close: 'Close',
  startNewDebate: 'Start a New Debate',
  postOpenControversy: 'Post an open controversy. People will debate and vote on both sides.',
  debateQuestion: 'Debate Question',
  dictateWithVoice: 'Dictate with Voice',
  stopRecording: 'Stop Recording',
  attachImage: 'Attach Image / Infographic (Optional)',
  uploadGraphOrImage: 'Upload a graph, chart, or reference image',
  selectTags: 'Select Tags (up to 3)',
  postDebate: 'Post Debate',
  readMore: 'Read more',
  showLess: 'Show less',
  aiDebateIntelligence: 'AI Debate Intelligence',
  executiveSummary: 'Executive Summary',
  debateAssistant: 'Debate Assistant',
  objectiveSynthesis: 'Objective Debate Synthesis',
  regenerate: 'Regenerate',
  conflictCore: 'Conflict Core',
  keyArgsFor: 'Key Arguments FOR',
  keyArgsAgainst: 'Key Arguments AGAINST',
  groundOfAgreement: 'Ground of Agreement',
  fundamentalDisagreements: 'Fundamental Disagreements',
  takeaway: 'Takeaway',
  askAnythingPlaceholder: 'Ask anything about this debate...',
  all: 'All',
  factCheck: 'Authenticity & Fact Check',
  installApp: 'Install App',
};

const CORE_TRANSLATIONS: Partial<Record<LanguageCode, Partial<Record<TranslationKey, string>>>> = {
  hi: {
    debates: 'वाद-विवाद (Debates)',
    activeDiscussions: 'सक्रिय चर्चाएँ',
    searchPlaceholder: 'वाद-विवाद खोजें...',
    trending: 'ट्रेंडिंग',
    arguments: 'तर्क',
    args: 'तर्क',
    views: 'व्यूज',
    newDebate: 'नया वाद-विवाद',
    newShort: 'नया',
    ambient: 'एम्बिएंट',
    for: 'पक्ष (For)',
    against: 'विपक्ष (Against)',
    voteFor: 'पक्ष में वोट दें',
    votedFor: 'पक्ष में वोट दिया',
    voteAgainst: 'विपक्ष में वोट दें',
    votedAgainst: 'विपक्ष में वोट दिया',
    votes: 'वोट',
    resetVoteTip: 'सुझाव: तटस्थ (Neutral) होने के लिए अपने सक्रिय वोट पर फिर से क्लिक करें',
    share: 'शेयर',
    copied: 'कॉपी हो गया!',
    aiInsights: 'AI विश्लेषण',
    liveStream: 'लाइव स्ट्रीम (कालानुक्रमिक)',
    alternatingSorted: 'पसंद के अनुसार क्रमबद्ध तर्क:',
    live: 'लाइव',
    balanced: 'संतुलित (A ⇄ B)',
    noArgumentsYet: 'अभी तक कोई तर्क पोस्ट नहीं किया गया है। सबसे पहले उत्तर दें!',
    noDebatesFound: 'कोई चर्चा नहीं मिली।',
    yourSide: 'आपका पक्ष:',
    postArgumentPlaceholder: 'इस विषय पर अपना तर्क लिखें... (या माइक दबाएं)',
    send: 'भेजें',
    verifyFacts: 'तथ्य जाँचें',
    sharedPoint: 'साझा किया गया तर्क',
    recordingAudio: 'ऑडियो रिकॉर्ड हो रहा है... स्पष्ट बोलें',
    done: 'पूर्ण',
    cancel: 'रद्द करें',
    transcribingSpeech: 'आवाज़ को टेक्स्ट में बदला जा रहा है...',
    save: 'सेव करें',
    saving: 'सेव हो रहा है...',
    seeOriginal: 'मूल पाठ देखें (See original)',
    seeTranslation: 'अनुवाद देखें (See translation)',
    showingOriginal: 'मूल भाषा का पाठ',
    translating: 'अनुवाद हो रहा है...',
    language: 'भाषा और अनुवाद (Language)',
    selectLanguage: 'ऐप और पोस्ट की भाषा चुनें',
    languageDesc: 'यह सेटिंग पूरे ऐप, सभी वाद-विवाद पोस्ट और सभी टिप्पणियों को आपकी चुनी हुई भाषा में बदल देती है।',
    settings: 'सेटिंग्स',
    themeAppearance: 'थीम और दिखावट',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    subtleAmbientGlow: 'हल्की एम्बिएंट चमक',
    ambientDesc: 'चर्चा की ऊर्जा को दर्शाने वाली सौम्य पृष्ठभूमि रोशनी',
    enabled: 'चालू',
    disabled: 'बंद',
    uniqueUsername: 'यूनिक यूज़रनेम',
    strictlyUnique: 'प्रत्येक वक्ता के लिए अद्वितीय',
    suggestedUsernames: 'सुझाए गए यूज़रनेम:',
    newIdeas: 'नए सुझाव',
    saveUsername: 'यूज़रनेम सेव करें',
    account: 'खाता (Account)',
    signOut: 'साइन आउट',
    googleLogin: 'गूगल लॉगिन',
    close: 'बंद करें',
    startNewDebate: 'नया वाद-विवाद शुरू करें',
    postOpenControversy: 'एक ज्वलंत प्रश्न पूछें। लोग दोनों पक्षों पर तर्क और वोट देंगे।',
    debateQuestion: 'वाद-विवाद का प्रश्न',
    dictateWithVoice: 'आवाज़ से लिखें',
    stopRecording: 'रिकॉर्डिंग रोकें',
    attachImage: 'चित्र या ग्राफ़ जोड़ें (वैकल्पिक)',
    uploadGraphOrImage: 'कोई ग्राफ़, चार्ट या संदर्भ चित्र अपलोड करें',
    selectTags: 'टैग चुनें (अधिकतम 3)',
    postDebate: 'पोस्ट करें',
    readMore: 'और पढ़ें',
    showLess: 'कम दिखाएं',
    aiDebateIntelligence: 'AI वाद-विवाद विश्लेषण',
    executiveSummary: 'सारांश',
    debateAssistant: 'डिबेट सहायक',
    objectiveSynthesis: 'निष्पक्ष वाद-विवाद संश्लेषण',
    regenerate: 'पुनः जनरेट करें',
    conflictCore: 'मुख्य विवाद बिंदु',
    keyArgsFor: 'पक्ष में मुख्य तर्क',
    keyArgsAgainst: 'विपक्ष में मुख्य तर्क',
    groundOfAgreement: 'सहमति के बिंदु',
    fundamentalDisagreements: 'मूलभूत असहमति',
    takeaway: 'निष्कर्ष',
    askAnythingPlaceholder: 'इस वाद-विवाद के बारे में कुछ भी पूछें...',
  },
  es: {
    debates: 'Debates',
    activeDiscussions: 'Debates Activos',
    searchPlaceholder: 'Buscar debates...',
    trending: 'Tendencias',
    arguments: 'argumentos',
    args: 'args',
    views: 'vistas',
    newDebate: 'Nuevo Debate',
    newShort: 'Nuevo',
    ambient: 'Ambiente',
    for: 'A favor',
    against: 'En contra',
    voteFor: 'Votar a favor',
    votedFor: 'Votado a favor',
    voteAgainst: 'Votar en contra',
    votedAgainst: 'Votado en contra',
    votes: 'votos',
    resetVoteTip: 'Consejo: Haz clic de nuevo en tu voto activo para volver a neutral',
    share: 'Compartir',
    copied: '¡Copiado!',
    aiInsights: 'Análisis IA',
    liveStream: 'En vivo (cronológico)',
    alternatingSorted: 'Argumentos alternados por votos:',
    live: 'En vivo',
    balanced: 'Equilibrado (A ⇄ B)',
    noArgumentsYet: 'Aún no hay argumentos. ¡Sé el primero en responder!',
    noDebatesFound: 'No se encontraron debates.',
    yourSide: 'Tu postura:',
    postArgumentPlaceholder: 'Publica un argumento sobre este tema... (o usa el micrófono)',
    send: 'Enviar',
    verifyFacts: 'Verificar hechos',
    sharedPoint: 'Punto compartido',
    recordingAudio: 'Grabando audio... Habla con claridad',
    done: 'Listo',
    cancel: 'Cancelar',
    transcribingSpeech: 'Transcribiendo voz...',
    save: 'Guardar',
    saving: 'Guardando...',
    seeOriginal: 'Ver original',
    seeTranslation: 'Ver traducción',
    showingOriginal: 'Texto original',
    translating: 'Traduciendo...',
    language: 'Idioma y Traducción',
    selectLanguage: 'Idioma de la aplicación y publicaciones',
    languageDesc: 'Traduce toda la interfaz, los debates y todos los comentarios al idioma elegido.',
    settings: 'Ajustes',
    themeAppearance: 'Tema y Apariencia',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    subtleAmbientGlow: 'Brillo Ambiental Sutil',
    ambientDesc: 'Luz de fondo suave que refleja la energía del debate',
    enabled: 'Activado',
    disabled: 'Desactivado',
    uniqueUsername: 'Nombre de usuario único',
    strictlyUnique: 'Estrictamente único por usuario',
    suggestedUsernames: 'Nombres sugeridos:',
    newIdeas: 'Nuevas ideas',
    saveUsername: 'Guardar usuario',
    account: 'Cuenta',
    signOut: 'Cerrar sesión',
    googleLogin: 'Iniciar con Google',
    close: 'Cerrar',
    startNewDebate: 'Iniciar un Nuevo Debate',
    postOpenControversy: 'Publica una pregunta abierta. La comunidad debatirá y votará en ambos lados.',
    debateQuestion: 'Pregunta del Debate',
    dictateWithVoice: 'Dictar por voz',
    stopRecording: 'Detener grabación',
    attachImage: 'Adjuntar Imagen / Infografía (Opcional)',
    uploadGraphOrImage: 'Sube un gráfico, tabla o imagen de referencia',
    selectTags: 'Seleccionar etiquetas (máx. 3)',
    postDebate: 'Publicar Debate',
    readMore: 'Leer más',
    showLess: 'Mostrar menos',
    aiDebateIntelligence: 'Inteligencia de Debate IA',
    executiveSummary: 'Resumen Ejecutivo',
    debateAssistant: 'Asistente de Debate',
    objectiveSynthesis: 'Síntesis Objetiva del Debate',
    regenerate: 'Regenerar',
    conflictCore: 'Núcleo del Conflicto',
    keyArgsFor: 'Argumentos Clave A FAVOR',
    keyArgsAgainst: 'Argumentos Clave EN CONTRA',
    groundOfAgreement: 'Puntos de Acuerdo',
    fundamentalDisagreements: 'Desacuerdos Fundamentales',
    takeaway: 'Conclusión Clave',
    askAnythingPlaceholder: 'Pregunta cualquier cosa sobre este debate...',
  },
  fr: {
    debates: 'Débats',
    activeDiscussions: 'Discussions Actives',
    searchPlaceholder: 'Rechercher des débats...',
    trending: 'Tendances',
    arguments: 'arguments',
    args: 'args',
    views: 'vues',
    newDebate: 'Nouveau Débat',
    newShort: 'Nouveau',
    ambient: 'Ambiance',
    for: 'Pour',
    against: 'Contre',
    voteFor: 'Voter Pour',
    votedFor: 'Voté Pour',
    voteAgainst: 'Voter Contre',
    votedAgainst: 'Voté Contre',
    votes: 'votes',
    resetVoteTip: 'Astuce : Cliquez à nouveau sur votre vote pour redevenir neutre',
    share: 'Partager',
    copied: 'Copié !',
    aiInsights: 'Analyse IA',
    liveStream: 'Flux en direct (chronologique)',
    alternatingSorted: 'Arguments alternés triés par mentions :',
    live: 'En direct',
    balanced: 'Équilibré (A ⇄ B)',
    noArgumentsYet: 'Aucun argument publié. Soyez le premier à répondre !',
    noDebatesFound: 'Aucune discussion trouvée.',
    yourSide: 'Votre camp :',
    postArgumentPlaceholder: 'Publiez un argument sur ce sujet... (ou cliquez sur le micro)',
    send: 'Envoyer',
    verifyFacts: 'Vérifier les faits',
    sharedPoint: 'Point partagé',
    recordingAudio: 'Enregistrement audio...',
    done: 'Terminé',
    cancel: 'Annuler',
    transcribingSpeech: 'Transcription en cours...',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    seeOriginal: 'Voir l’original',
    seeTranslation: 'Voir la traduction',
    showingOriginal: 'Texte original',
    translating: 'Traduction...',
    language: 'Langue et Traduction',
    selectLanguage: 'Langue de l’application et des publications',
    languageDesc: 'Traduit toute l’interface, les débats et les commentaires dans la langue choisie.',
    settings: 'Paramètres',
    themeAppearance: 'Thème et Apparence',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    subtleAmbientGlow: 'Lueur Ambiante Subtile',
    ambientDesc: 'Lumière douce reflétant l’énergie du débat',
    enabled: 'Activé',
    disabled: 'Désactivé',
    uniqueUsername: 'Nom d’utilisateur unique',
    strictlyUnique: 'Strictement unique par débatteur',
    suggestedUsernames: 'Suggestions :',
    newIdeas: 'Nouvelles idées',
    saveUsername: 'Enregistrer le nom',
    account: 'Compte',
    signOut: 'Déconnexion',
    googleLogin: 'Connexion Google',
    close: 'Fermer',
    startNewDebate: 'Lancer un Nouveau Débat',
    postOpenControversy: 'Posez une question ouverte. Les utilisateurs débattront des deux côtés.',
    debateQuestion: 'Question du Débat',
    dictateWithVoice: 'Dicter à la voix',
    stopRecording: 'Arrêter',
    attachImage: 'Joindre une image / infographie (Optionnel)',
    uploadGraphOrImage: 'Télécharger un graphique ou une image',
    selectTags: 'Sélectionner des tags (max 3)',
    postDebate: 'Publier le Débat',
    readMore: 'Lire la suite',
    showLess: 'Voir moins',
    aiDebateIntelligence: 'Intelligence IA du Débat',
    executiveSummary: 'Résumé Exécutif',
    debateAssistant: 'Assistant Débat',
    objectiveSynthesis: 'Synthèse Objective du Débat',
    regenerate: 'Régénérer',
    conflictCore: 'Cœur du Conflit',
    keyArgsFor: 'Arguments Clés POUR',
    keyArgsAgainst: 'Arguments Clés CONTRE',
    groundOfAgreement: 'Terrain d’Entente',
    fundamentalDisagreements: 'Désaccords Fondamentaux',
    takeaway: 'À retenir',
    askAnythingPlaceholder: 'Posez une question sur ce débat...',
  },
  bn: {
    debates: 'বিতর্ক (Debates)',
    activeDiscussions: 'সক্রিয় আলোচনা',
    searchPlaceholder: 'বিতর্ক খুঁজুন...',
    trending: 'ট্রেন্ডিং',
    arguments: 'যুক্তি',
    args: 'যুক্তি',
    views: 'ভিউ',
    newDebate: 'নতুন বিতর্ক',
    newShort: 'নতুন',
    for: 'পক্ষে (For)',
    against: 'বিপক্ষে (Against)',
    voteFor: 'পক্ষে ভোট দিন',
    votedFor: 'পক্ষে ভোট দিয়েছেন',
    voteAgainst: 'বিপক্ষে ভোট দিন',
    votedAgainst: 'বিপক্ষে ভোট দিয়েছেন',
    votes: 'ভোট',
    resetVoteTip: 'টিপস: নিরপেক্ষ হতে আপনার সক্রিয় ভোটে আবার ক্লিক করুন',
    share: 'শেয়ার',
    copied: 'কপি হয়েছে!',
    aiInsights: 'AI বিশ্লেষণ',
    seeOriginal: 'মূল লেখা দেখুন (See original)',
    seeTranslation: 'অনুবাদ দেখুন (See translation)',
    showingOriginal: 'মূল লেখা',
    translating: 'অনুবাদ হচ্ছে...',
    language: 'ভাষা এবং অনুবাদ',
    selectLanguage: 'অ্যাপ এবং পোস্টের ভাষা',
    languageDesc: 'সমস্ত ইন্টারফেস, বিতর্ক পোস্ট এবং মন্তব্য আপনার পছন্দের ভাষায় অনুবাদ করে।',
    settings: 'সেটিংস',
    readMore: 'আরও পড়ুন',
    showLess: 'কম দেখান',
    verifyFacts: 'সত্যতা যাচাই',
    send: 'পাঠান',
    yourSide: 'আপনার পক্ষ:',
  },
  ta: {
    debates: 'விவாதங்கள் (Debates)',
    activeDiscussions: 'செயலில் உள்ள விவாதங்கள்',
    searchPlaceholder: 'விவாதங்களைத் தேடுங்கள்...',
    trending: 'டிரெண்டிங்',
    arguments: 'வாதங்கள்',
    args: 'வாதங்கள்',
    views: 'பார்வைகள்',
    newDebate: 'புதிய விவாதம்',
    newShort: 'புதிய',
    for: 'ஆதரவு (For)',
    against: 'எதிர்ப்பு (Against)',
    voteFor: 'ஆதரவாக வாக்களி',
    votedFor: 'ஆதரவாக வாக்களிக்கப்பட்டது',
    voteAgainst: 'எதிராக வாக்களி',
    votedAgainst: 'எதிராக வாக்களிக்கப்பட்டது',
    votes: 'வாக்குகள்',
    resetVoteTip: 'குறிப்பு: நடுநிலைக்குத் திரும்ப உங்கள் வாக்கை மீண்டும் கிளிக் செய்யவும்',
    share: 'பகிர்',
    copied: 'நகலெடுக்கப்பட்டது!',
    aiInsights: 'AI பகுப்பாய்வு',
    seeOriginal: 'அசல் உரையைப் பார்க்க (See original)',
    seeTranslation: 'மொழிபெயர்ப்பைப் பார்க்க',
    showingOriginal: 'அசல் உரை',
    translating: 'மொழிபெயர்க்கிறது...',
    language: 'மொழி & மொழிபெயர்ப்பு',
    selectLanguage: 'செயலி மற்றும் பதிவுகளின் மொழி',
    languageDesc: 'அனைத்து பதிவுகளையும் கருத்துகளையும் நீங்கள் தேர்ந்தெடுத்த மொழியில் மொழிபெயர்க்கிறது.',
    settings: 'அமைப்புகள்',
    readMore: 'மேலும் படிக்க',
    showLess: 'சுருக்குக',
    verifyFacts: 'உண்மை சரிபார்ப்பு',
    send: 'அனுப்பு',
    yourSide: 'உங்கள் பக்கம்:',
  },
  te: {
    debates: 'చర్చలు (Debates)',
    activeDiscussions: 'చురుకైన చర్చలు',
    searchPlaceholder: 'చర్చలను వెతకండి...',
    trending: 'ట్రెండింగ్',
    arguments: 'వాదనలు',
    args: 'వాదనలు',
    views: 'వీక్షణలు',
    newDebate: 'కొత్త చర్చ',
    newShort: 'కొత్త',
    for: 'అనుకూలం (For)',
    against: 'వ్యతిరేకం (Against)',
    voteFor: 'అనుకూలంగా ఓటు వేయండి',
    votedFor: 'అనుకూలంగా ఓటు వేశారు',
    voteAgainst: 'వ్యతిరేకంగా ఓటు వేయండి',
    votedAgainst: 'వ్యతిరేకంగా ఓటు వేశారు',
    votes: 'ఓట్లు',
    resetVoteTip: 'చిట్కా: తటస్థంగా మారడానికి మీ ఓటుపై మళ్లీ క్లిక్ చేయండి',
    share: 'షేర్',
    copied: 'కాపీ చేయబడింది!',
    aiInsights: 'AI విశ్లేషణ',
    seeOriginal: 'అసలు పాఠాన్ని చూడండి (See original)',
    seeTranslation: 'అనువాదాన్ని చూడండి',
    showingOriginal: 'అసలు పాఠం',
    translating: 'అనువదిస్తోంది...',
    language: 'భాష & అనువాదం',
    selectLanguage: 'యాప్ మరియు పోస్ట్‌ల భాష',
    languageDesc: 'అన్ని పోస్ట్‌లు మరియు కామెంట్‌లను మీరు ఎంచుకున్న భాషలోకి అనువదిస్తుంది.',
    settings: 'సెట్టింగ్‌లు',
    readMore: 'మరింత చదవండి',
    showLess: 'తక్కువ చూపించు',
    verifyFacts: 'వాస్తవాలను తనిఖీ చేయండి',
    send: 'పంపు',
    yourSide: 'మీ పక్షం:',
  },
  mr: {
    debates: 'वादविवाद (Debates)',
    activeDiscussions: 'सक्रिय चर्चा',
    searchPlaceholder: 'वादविवाद शोधा...',
    trending: 'ट्रेंडिंग',
    arguments: 'युक्तिवाद',
    args: 'युक्तिवाद',
    views: 'व्ह्यूज',
    newDebate: 'नवीन वादविवाद',
    newShort: 'नवीन',
    for: 'बाजूने (For)',
    against: 'विरोधात (Against)',
    voteFor: 'बाजूने मत द्या',
    votedFor: 'बाजूने मत दिले',
    voteAgainst: 'विरोधात मत द्या',
    votedAgainst: 'विरोधात मत दिले',
    votes: 'मते',
    resetVoteTip: 'टीप: तटस्थ होण्यासाठी तुमच्या सक्रिय मतावर पुन्हा क्लिक करा',
    share: 'शेअर',
    copied: 'कॉपी केले!',
    aiInsights: 'AI विश्लेषण',
    seeOriginal: 'मूळ मजकूर पहा (See original)',
    seeTranslation: 'भाषांतर पहा',
    showingOriginal: 'मूळ मजकूर',
    translating: 'भाषांतर होत आहे...',
    language: 'भाषा आणि भाषांतर',
    selectLanguage: 'ॲप आणि पोस्टची भाषा',
    languageDesc: 'सर्व वादविवाद पोस्ट आणि कमेंट्स तुमच्या निवडलेल्या भाषेत भाषांतरित करते.',
    settings: 'सेटिंग्ज',
    readMore: 'पुढे वाचा',
    showLess: 'कमी दाखवा',
    verifyFacts: 'तथ्य तपासा',
    send: 'पाठवा',
    yourSide: 'तुमची बाजू:',
  },
  ar: {
    debates: 'المناظرات',
    activeDiscussions: 'نقاشات نشطة',
    searchPlaceholder: 'ابحث في المناظرات...',
    trending: 'الرائج',
    arguments: 'حجج',
    args: 'حجج',
    views: 'مشاهدة',
    newDebate: 'مناظرة جديدة',
    newShort: 'جديد',
    for: 'مؤيد',
    against: 'معارض',
    voteFor: 'صوّت كمؤيد',
    votedFor: 'صوّتت كمؤيد',
    voteAgainst: 'صوّت كمعارض',
    votedAgainst: 'صوّتت كمعارض',
    votes: 'أصوات',
    resetVoteTip: 'نصيحة: انقر على تصويتك مرة أخرى للعودة إلى الحياد',
    share: 'مشاركة',
    copied: 'تم النسخ!',
    aiInsights: 'تحليل الذكاء الاصطناعي',
    seeOriginal: 'عرض النص الأصلي',
    seeTranslation: 'عرض الترجمة',
    showingOriginal: 'النص الأصلي',
    translating: 'جاري الترجمة...',
    language: 'اللغة والترجمة',
    selectLanguage: 'لغة التطبيق والمنشورات',
    languageDesc: 'ترجمة واجهة التطبيق وجميع المنشورات والتعليقات إلى لغتك المختارة.',
    settings: 'الإعدادات',
    readMore: 'اقرأ المزيد',
    showLess: 'عرض أقل',
    verifyFacts: 'تحقق من الحقائق',
    send: 'إرسال',
    yourSide: 'موقفك:',
  },
  de: {
    debates: 'Debatten',
    activeDiscussions: 'Aktive Diskussionen',
    searchPlaceholder: 'Debatten durchsuchen...',
    trending: 'Trends',
    arguments: 'Argumente',
    args: 'Arg.',
    views: 'Aufrufe',
    newDebate: 'Neue Debatte',
    newShort: 'Neu',
    for: 'Dafür',
    against: 'Dagegen',
    voteFor: 'Dafür stimmen',
    votedFor: 'Dafür gestimmt',
    voteAgainst: 'Dagegen stimmen',
    votedAgainst: 'Dagegen gestimmt',
    votes: 'Stimmen',
    resetVoteTip: 'Tipp: Klicke erneut auf deine Stimme, um neutral zu werden',
    share: 'Teilen',
    copied: 'Kopiert!',
    aiInsights: 'KI-Analyse',
    seeOriginal: 'Original ansehen',
    seeTranslation: 'Übersetzung ansehen',
    showingOriginal: 'Originaltext',
    translating: 'Übersetze...',
    language: 'Sprache & Übersetzung',
    selectLanguage: 'App- und Inhaltssprache',
    languageDesc: 'Übersetzt die gesamte Oberfläche sowie alle Beiträge und Kommentare in Ihre gewählte Sprache.',
    settings: 'Einstellungen',
    readMore: 'Mehr lesen',
    showLess: 'Weniger anzeigen',
    verifyFacts: 'Fakten prüfen',
    send: 'Senden',
    yourSide: 'Deine Seite:',
  },
  ja: {
    debates: 'ディベート',
    activeDiscussions: '活発な議論',
    searchPlaceholder: 'ディベートを検索...',
    trending: 'トレンド',
    arguments: '件の意見',
    args: '意見',
    views: '閲覧',
    newDebate: '新規ディベート',
    newShort: '新規',
    for: '賛成',
    against: '反対',
    voteFor: '賛成に投票',
    votedFor: '賛成に投票済み',
    voteAgainst: '反対に投票',
    votedAgainst: '反対に投票済み',
    votes: '票',
    resetVoteTip: 'ヒント：もう一度クリックすると中立に戻ります',
    share: '共有',
    copied: 'コピー完了！',
    aiInsights: 'AI分析',
    seeOriginal: '原文を見る',
    seeTranslation: '翻訳を見る',
    showingOriginal: '原文表示中',
    translating: '翻訳中...',
    language: '言語と翻訳設定',
    selectLanguage: 'アプリと投稿の表示言語',
    languageDesc: 'UI全体、すべての投稿、およびコメントを選択した言語に自動翻訳します。',
    settings: '設定',
    readMore: '続きを読む',
    showLess: '閉じる',
    verifyFacts: 'ファクトチェック',
    send: '送信',
    yourSide: 'あなたの立場:',
  },
  zh: {
    debates: '辩论主题',
    activeDiscussions: '热门讨论',
    searchPlaceholder: '搜索辩论...',
    trending: '热门',
    arguments: '条观点',
    args: '观点',
    views: '次浏览',
    newDebate: '发起辩论',
    newShort: '发起',
    for: '正方 (支持)',
    against: '反方 (反对)',
    voteFor: '投支持票',
    votedFor: '已支持',
    voteAgainst: '投反对票',
    votedAgainst: '已反对',
    votes: '票',
    resetVoteTip: '提示：再次点击已选按钮可恢复中立',
    share: '分享',
    copied: '已复制！',
    aiInsights: 'AI 洞察',
    seeOriginal: '查看原文',
    seeTranslation: '查看翻译',
    showingOriginal: '原文内容',
    translating: '翻译中...',
    language: '语言与翻译',
    selectLanguage: '界面与帖子语言',
    languageDesc: '将整个界面、所有辩论帖子和评论自动翻译为您选择的语言。',
    settings: '设置',
    readMore: '展开全文',
    showLess: '收起',
    verifyFacts: '核实事实',
    send: '发送',
    yourSide: '你的立场:',
  },
  pt: {
    debates: 'Debates',
    activeDiscussions: 'Discussões Ativas',
    searchPlaceholder: 'Pesquisar debates...',
    trending: 'Em alta',
    arguments: 'argumentos',
    args: 'args',
    views: 'visualizações',
    newDebate: 'Novo Debate',
    newShort: 'Novo',
    for: 'A favor',
    against: 'Contra',
    voteFor: 'Votar a favor',
    votedFor: 'Votou a favor',
    voteAgainst: 'Votar contra',
    votedAgainst: 'Votou contra',
    votes: 'votos',
    resetVoteTip: 'Dica: Clique novamente no seu voto para voltar ao neutro',
    share: 'Compartilhar',
    copied: 'Copiado!',
    aiInsights: 'Análise IA',
    seeOriginal: 'Ver original',
    seeTranslation: 'Ver tradução',
    showingOriginal: 'Texto original',
    translating: 'Traduzindo...',
    language: 'Idioma e Tradução',
    selectLanguage: 'Idioma do aplicativo e postagens',
    languageDesc: 'Traduz toda a interface, debates e comentários para o idioma escolhido.',
    settings: 'Configurações',
    readMore: 'Ler mais',
    showLess: 'Mostrar menos',
    verifyFacts: 'Verificar fatos',
    send: 'Enviar',
    yourSide: 'Seu lado:',
  },
  ru: {
    debates: 'Дебаты',
    activeDiscussions: 'Активные споры',
    searchPlaceholder: 'Поиск дебатов...',
    trending: 'В тренде',
    arguments: 'аргументов',
    args: 'арг.',
    views: 'просм.',
    newDebate: 'Новый спор',
    newShort: 'Создать',
    for: 'За',
    against: 'Против',
    voteFor: 'Голосовать За',
    votedFor: 'Вы За',
    voteAgainst: 'Голосовать Против',
    votedAgainst: 'Вы Против',
    votes: 'голосов',
    resetVoteTip: 'Совет: нажмите на ваш голос еще раз, чтобы сбросить выбор',
    share: 'Поделиться',
    copied: 'Скопировано!',
    aiInsights: 'ИИ Анализ',
    seeOriginal: 'Показать оригинал',
    seeTranslation: 'Показать перевод',
    showingOriginal: 'Оригинальный текст',
    translating: 'Перевод...',
    language: 'Язык и перевод',
    selectLanguage: 'Язык интерфейса и постов',
    languageDesc: 'Автоматически переводит интерфейс, все посты и комментарии на выбранный язык.',
    settings: 'Настройки',
    readMore: 'Читать далее',
    showLess: 'Свернуть',
    verifyFacts: 'Проверить факты',
    send: 'Отправить',
    yourSide: 'Ваша сторона:',
  },
  ko: {
    debates: '토론',
    activeDiscussions: '활발한 토론',
    searchPlaceholder: '토론 검색...',
    trending: '인기',
    arguments: '개의 의견',
    args: '의견',
    views: '조회',
    newDebate: '새 토론',
    newShort: '새 글',
    for: '찬성',
    against: '반대',
    voteFor: '찬성 투표',
    votedFor: '찬성함',
    voteAgainst: '반대 투표',
    votedAgainst: '반대함',
    votes: '표',
    resetVoteTip: '팁: 선택한 투표를 다시 클릭하면 중립으로 돌아갑니다',
    share: '공유',
    copied: '복사됨!',
    aiInsights: 'AI 분석',
    seeOriginal: '원문 보기',
    seeTranslation: '번역 보기',
    showingOriginal: '원문 텍스트',
    translating: '번역 중...',
    language: '언어 및 번역',
    selectLanguage: '앱 및 게시물 언어',
    languageDesc: '전체 인터페이스와 모든 토론 게시물 및 댓글을 선택한 언어로 번역합니다.',
    settings: '설정',
    readMore: '더 보기',
    showLess: '접기',
    verifyFacts: '팩트 체크',
    send: '보내기',
    yourSide: '나의 입장:',
  },
};

const STORAGE_KEY_LANG = 'evaad_preferred_language_v1';
const STORAGE_KEY_CACHE = 'evaad_translation_cache_v1';

interface TranslationEntry {
  translatedText: string;
  detectedSourceLang: string;
}

// Cache format: `${targetLang}:::${originalText}` -> TranslationEntry
type TranslationCacheMap = Record<string, TranslationEntry>;

interface LanguageContextType {
  language: LanguageCode;
  currentLanguageObj: LanguageOption;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  registerTextsForTranslation: (texts: string[]) => void;
  getTranslatedEntry: (text: string) => TranslationEntry | null;
  isShowingOriginal: (itemId: string) => boolean;
  toggleShowOriginal: (itemId: string, e?: React.MouseEvent) => void;
  isBatchTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function hasNonAscii(str: string): boolean {
  return /[^\x00-\x7F]/.test(str);
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG) as LanguageCode;
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const [cache, setCache] = useState<TranslationCacheMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CACHE);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return {};
  });

  // Dynamic UI dictionary cache for languages not fully covered in CORE_TRANSLATIONS
  const [dynamicUiCache, setDynamicUiCache] = useState<Record<string, Record<string, string>>>({});

  // Per-post and per-comment "See original" toggle state
  const [originalOverrides, setOriginalOverrides] = useState<Record<string, boolean>>({});
  const [isBatchTranslating, setIsBatchTranslating] = useState(false);

  const pendingTextsRef = useRef<Set<string>>(new Set());
  const inFlightTextsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<number | null>(null);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    // Reset "See original" overrides when user picks a new target language so everything translates cleanly
    setOriginalOverrides({});
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {}
  }, []);

  // Save cache to localStorage periodically
  useEffect(() => {
    try {
      const keys = Object.keys(cache);
      if (keys.length > 600) {
        // Trim oldest entries to keep storage light
        const trimmed: TranslationCacheMap = {};
        keys.slice(-500).forEach((k) => {
          trimmed[k] = cache[k];
        });
        localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(trimmed));
      } else {
        localStorage.setItem(STORAGE_KEY_CACHE, JSON.stringify(cache));
      }
    } catch {}
  }, [cache]);

  // Translate missing UI dictionary keys if user picks a language with partial static keys (e.g. gu, kn, ml, pa, ur)
  useEffect(() => {
    if (language === 'en') return;
    if (dynamicUiCache[language]) return;

    const existing = CORE_TRANSLATIONS[language] || {};
    const missingKeys = (Object.keys(EN_STRINGS) as TranslationKey[]).filter(
      (k) => !existing[k]
    );

    if (missingKeys.length === 0) return;

    const textsToTranslate = missingKeys.map((k) => EN_STRINGS[k]);
    let cancelled = false;

    fetch('/api/translate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: textsToTranslate,
        targetLang: language,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data?.translations)) return;
        const map: Record<string, string> = {};
        missingKeys.forEach((key, idx) => {
          const translated = data.translations[idx]?.translatedText;
          if (translated) {
            map[key] = translated;
          }
        });
        setDynamicUiCache((prev) => ({
          ...prev,
          [language]: map,
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [language, dynamicUiCache]);

  const flushTranslationQueue = useCallback(async (targetLang: LanguageCode) => {
    const allPending = Array.from(pendingTextsRef.current);
    if (allPending.length === 0) return;

    pendingTextsRef.current.clear();

    const toFetch = allPending.filter((text) => {
      const key = `${targetLang}:::${text}`;
      return ! inFlightTextsRef.current.has(key);
    });

    if (toFetch.length === 0) return;

    toFetch.forEach((text) => inFlightTextsRef.current.add(`${targetLang}:::${text}`));
    setIsBatchTranslating(true);

    try {
      // Process in chunks of 30
      for (let i = 0; i < toFetch.length; i += 30) {
        const chunk = toFetch.slice(i, i + 30);
        const res = await fetch('/api/translate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: chunk,
            targetLang,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.translations)) {
            setCache((prev) => {
              const next = { ...prev };
              chunk.forEach((originalText, idx) => {
                const item = data.translations[idx];
                if (item && item.translatedText) {
                  next[`${targetLang}:::${originalText}`] = {
                    translatedText: item.translatedText,
                    detectedSourceLang: item.detectedSourceLang || 'auto',
                  };
                }
              });
              return next;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Batch translation warning:', err);
    } finally {
      toFetch.forEach((text) => inFlightTextsRef.current.delete(`${targetLang}:::${text}`));
      setIsBatchTranslating(false);
    }
  }, []);

  const registerTextsForTranslation = useCallback(
    (texts: string[]) => {
      let added = false;
      for (const raw of texts) {
        const text = raw?.trim();
        if (!text) continue;

        // If language is English and text has no non-ASCII characters, no translation needed unless requested
        if (language === 'en' && !hasNonAscii(text)) {
          continue;
        }

        const cacheKey = `${language}:::${text}`;
        if (!cache[cacheKey] && !inFlightTextsRef.current.has(cacheKey)) {
          pendingTextsRef.current.add(text);
          added = true;
        }
      }

      if (added) {
        if (debounceTimerRef.current) {
          window.clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = window.setTimeout(() => {
          flushTranslationQueue(language);
        }, 60);
      }
    },
    [language, cache, flushTranslationQueue]
  );

  const getTranslatedEntry = useCallback(
    (text: string): TranslationEntry | null => {
      if (!text) return null;
      const trimmed = text.trim();
      const cacheKey = `${language}:::${trimmed}`;
      if (cache[cacheKey]) {
        return cache[cacheKey];
      }
      return null;
    },
    [language, cache]
  );

  const isShowingOriginal = useCallback(
    (itemId: string): boolean => {
      return !!originalOverrides[itemId];
    },
    [originalOverrides]
  );

  const toggleShowOriginal = useCallback((itemId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setOriginalOverrides((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      if (language === 'en') {
        return EN_STRINGS[key] || key;
      }
      const staticVal = CORE_TRANSLATIONS[language]?.[key];
      if (staticVal) return staticVal;
      const dynamicVal = dynamicUiCache[language]?.[key];
      if (dynamicVal) return dynamicVal;
      return EN_STRINGS[key] || key;
    },
    [language, dynamicUiCache]
  );

  const currentLanguageObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguageObj,
        setLanguage,
        t,
        registerTextsForTranslation,
        getTranslatedEntry,
        isShowingOriginal,
        toggleShowOriginal,
        isBatchTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
