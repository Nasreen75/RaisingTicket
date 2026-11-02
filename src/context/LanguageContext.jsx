import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    brand: 'MITS Helpdesk',
    dashboard: 'Dashboard',
    raiseComplaint: '+ Raise Complaint',
    myComplaints: 'My Complaints',
    faq: 'FAQ',
    reports: 'Reports',
    deptBoard: 'Dept Board',
    adminConsole: 'Admin Console',
    qrReport: '📷 Scan QR Report',
    qrGenerator: '🖨️ QR Codes',
    logout: 'Logout',
    welcomeBack: 'Welcome back',
    role: 'Role',
    totalManaged: 'Total Managed',
    totalRaised: 'Total Raised',
    pending: 'Pending',
    assigned: 'Assigned',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
    recentTickets: 'Recent Tickets',
    viewAll: 'View All',
    searchPlaceholder: 'Search complaints...',
    allCategories: 'All Categories',
    allStatuses: 'All Statuses',
    allPriorities: 'All Priorities',
    title: 'Title',
    category: 'Category',
    priority: 'Priority',
    description: 'Description',
    location: 'Location / Room Tag',
    submit: 'Submit Complaint Ticket',
    anonymousLabel: '🕶️ Submit as Anonymous Complaint (Identity Protected)',
    anonymousDesc: 'Check this for sensitive complaints like ragging, harassment, or safety issues. Your name and roll number will be hidden.',
    sentimentFrustrated: '⚠️ High Frustration Detected by AI: Priority elevated to Urgent',
    sentimentAlert: 'Frustrated / Urgent Sentiment',
    auditHistory: '📜 Ticket Audit Trail & History',
    slaTarget: 'SLA Target',
    escalatedBadge: 'Escalated to Central Admin',
    chatTitle: 'MITS Campus AI Bot',
    chatPlaceholder: 'Ask about Wi-Fi, hostel, fees (English or తెలుగు)...',
    quickActions: '⚡ QUICK ACTIONS & SHORTCUTS',
    adminManageCampus: '🛡️ Central Complaints Console',
    campusAuditReports: '📊 Campus Audit & Reports',
    helpdeskKnowledgeBase: '📚 Helpdesk Knowledge Base',
    deptResolutionDesk: '🏢 Department Resolution Desk',
    deptComplaintsTitle: '🏛️ Dept Complaints',
    deptAnalytics: '📊 Department Analytics',
    campusFaq: '📚 Campus FAQ',
    raiseNewServiceRequest: '+ Raise New Service Request',
    trackMyTickets: '📋 Track My Tickets',
    knowledgeBaseFaq: '💡 Knowledge Base / FAQ',
    recentCampusComplaints: 'Recent Campus Complaints',
    recentDeptComplaints: 'Recent Department Complaints',
    myRecentTickets: 'My Recent Tickets',
    clickToInspect: 'Click any card to inspect status, conversation thread, attachments and escalate',
    clickToTrack: 'Click any ticket to view progress tracking, replies, or leave rating',
    noComplaintsFound: 'No complaints found.',
    allCaughtUp: 'All caught up! No complaints currently queued.',
    clickToReport: 'Click "+ Raise New Service Request" above to report any campus issue.',
    loadingTickets: 'Loading tickets...',
    qrDetectedBanner: '📍 QR-Code Location Detected & Auto-Tagged:',
    qrLockedDesc: 'Your complaint will automatically route to the department in charge of this room.',
  },
  te: {
    brand: 'మిట్స్ హెల్ప్‌డెస్క్',
    dashboard: 'డ్యాష్‌బోర్డ్',
    raiseComplaint: '+ ఫిర్యాదు చేయండి',
    myComplaints: 'నా ఫిర్యాదులు',
    faq: 'సందేహాలు (FAQ)',
    reports: 'రిపోర్టులు',
    deptBoard: 'విభాగ బోర్డు',
    adminConsole: 'అడ్మిన్ కన్సోల్',
    qrReport: '📷 QR స్కాన్ ఫిర్యాదు',
    qrGenerator: '🖨️ QR కోడ్‌లు',
    logout: 'లాగౌట్',
    welcomeBack: 'మళ్ళీ స్వాగతం',
    role: 'పాత్ర',
    totalManaged: 'మొత్తం నిర్వహించినవి',
    totalRaised: 'మొత్తం ఫిర్యాదులు',
    pending: 'పెండింగ్‌లో ఉన్నాయి',
    assigned: 'కేటాయించబడినవి',
    inProgress: 'పరిశీలనలో ఉంది',
    resolved: 'పరిష్కరించబడినవి',
    closed: 'ముగిసినవి',
    recentTickets: 'ఇటీవలి ఫిర్యాదులు',
    viewAll: 'అన్నీ చూడండి',
    searchPlaceholder: 'ఫిర్యాదులను వెతకండి...',
    allCategories: 'అన్ని విభాగాలు',
    allStatuses: 'అన్ని స్థితులు',
    allPriorities: 'అన్ని ప్రాధాన్యతలు',
    title: 'శీర్షిక',
    category: 'విభాగం',
    priority: 'ప్రాధాన్యత',
    description: 'వివరణ',
    location: 'ప్రాంతం / గది నంబర్',
    submit: 'ఫిర్యాదు టికెట్‌ను సమర్పించండి',
    anonymousLabel: '🕶️ అజ్ఞాతంగా ఫిర్యాదు చేయండి (గుర్తింపు రహస్యంగా ఉంటుంది)',
    anonymousDesc: 'ర్యాగింగ్ లేదా వేధింపుల వంటి సున్నితమైన సమస్యల కొరకు దీనిని ఎంచుకోండి. మీ వివరాలు ఎవరికీ కనిపించవు.',
    sentimentFrustrated: '⚠️ AI తీవ్ర అసంతృప్తిని గుర్తించింది: ప్రాధాన్యత అత్యవసరంగా మార్చబడింది',
    sentimentAlert: 'తీవ్ర అసంతృప్తి / అత్యవసరం',
    auditHistory: '📜 టికెట్ ఆడిట్ లాగ్స్ & మార్పుల చరిత్ర',
    slaTarget: 'SLA పరిష్కార సమయం',
    escalatedBadge: 'సెంట్రల్ అడ్మినిస్ట్రేషన్‌కు ఎస్కలేట్ చేయబడింది',
    chatTitle: 'మిట్స్ క్యాంపస్ AI అసిస్టెంట్',
    chatPlaceholder: 'వైఫై, హాస్టల్, ఫీజుల గురించి అడగండి (తెలుగు లేదా English)...',
    quickActions: '⚡ శీఘ్ర చర్యలు & సత్వరమార్గాలు',
    adminManageCampus: '🛡️ కేంద్ర ఫిర్యాదుల కన్సోల్',
    campusAuditReports: '📊 క్యాంపస్ ఆడిట్ & రిపోర్టులు',
    helpdeskKnowledgeBase: '📚 హెల్ప్‌డెస్క్ నాలెడ్జ్ బేస్',
    deptResolutionDesk: '🏢 విభాగ పరిష్కార డెస్క్',
    deptComplaintsTitle: '🏛️ విభాగ ఫిర్యాదులు',
    deptAnalytics: '📊 విభాగ విశ్లేషణలు',
    campusFaq: '📚 క్యాంపస్ FAQ',
    raiseNewServiceRequest: '+ కొత్త ఫిర్యాదు చేయండి',
    trackMyTickets: '📋 నా టికెట్ల ట్రాకింగ్',
    knowledgeBaseFaq: '💡 సందేహాలు & సమాధానాలు',
    recentCampusComplaints: 'ఇటీవలి క్యాంపస్ ఫిర్యాదులు',
    recentDeptComplaints: 'ఇటీవలి విభాగ ఫిర్యాదులు',
    myRecentTickets: 'నా ఇటీవలి టికెట్లు',
    clickToInspect: 'స్థితి, సంభాషణ, ఫోటోలు చూడటానికి మరియు చర్యలు తీసుకోవడానికి కార్డుపై క్లిక్ చేయండి',
    clickToTrack: 'పురోగతిని చూడటానికి లేదా రేటింగ్ ఇవ్వడానికి టికెట్‌పై క్లిక్ చేయండి',
    noComplaintsFound: 'ఫిర్యాదులు ఏవీ లేవు.',
    allCaughtUp: 'అన్ని సమస్యలు పరిష్కరించబడ్డాయి! ప్రస్తుతం పెండింగ్ టికెట్లు లేవు.',
    clickToReport: 'సమస్యను నివేదించడానికి పైన ఉన్న "+ కొత్త ఫిర్యాదు చేయండి" బటన్‌పై క్లిక్ చేయండి.',
    loadingTickets: 'టికెట్లను లోడ్ చేస్తోంది...',
    qrDetectedBanner: '📍 QR-కోడ్ స్థానం గుర్తించబడింది:',
    qrLockedDesc: 'ఈ గదిని పర్యవేక్షించే విభాగానికి మీ ఫిర్యాదు స్వయంచాలకంగా చేరుతుంది.',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('mits_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('mits_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'te' : 'en'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
