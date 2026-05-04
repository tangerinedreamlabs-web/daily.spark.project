
const showSubmissionSuccess = (form) => {
  const section = document.querySelector('#demo');
  const note = document.querySelector('.form-note');
  const panel = document.querySelector('.submission-success-panel');

  if (note) {
    showSubmissionSuccess(form);
    note.classList.remove('error');
    note.classList.add('success');
  }

  if (form) {
    showSubmissionSuccess(form);
    form.classList.add('is-submitted');
  }

  if (panel) {
    panel.hidden = false;
  }

  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  if (typeof trackConversion === 'function') {
    trackConversion('lead_success_state_viewed', { source: 'demo_form' });
  }

  if (window.gtag) {
    window.gtag('event', 'generate_lead', {
      event_category: 'lead',
      event_label: 'demo_form'
    });
  }
};

const showSubmissionError = () => {
  const note = document.querySelector('.form-note');
  if (note) {
    showSubmissionError();
    note.classList.remove('success');
    note.classList.add('error');
  }

  if (typeof trackConversion === 'function') {
    trackConversion('lead_submit_error', { source: 'demo_form' });
  }
};

import { firebaseConfig, FIRESTORE_COLLECTIONS, ENABLE_FIREBASE_ANALYTICS } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import { getFirestore, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { getAnalytics, isSupported as analyticsIsSupported, logEvent } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js';

const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('#nav-links');
const form = document.querySelector('.demo-form');
const note = document.querySelector('.form-note');

const appLinks = {
  manager: 'https://apple.co/4cHG4O9',
  daily: 'https://apple.co/4tFrUmq',
};

const isFirebaseConfigured = firebaseConfig?.apiKey &&
  !firebaseConfig.apiKey.startsWith('REPLACE_') &&
  firebaseConfig?.projectId &&
  !firebaseConfig.projectId.startsWith('REPLACE_');

let firebaseApp = null;
let db = null;
let analytics = null;
let analyticsReady = Promise.resolve(null);

if (isFirebaseConfigured) {
  firebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(firebaseApp);

  if (ENABLE_FIREBASE_ANALYTICS && firebaseConfig.measurementId && !firebaseConfig.measurementId.startsWith('REPLACE_')) {
    analyticsReady = analyticsIsSupported()
      .then((supported) => {
        if (!supported) return null;
        analytics = getAnalytics(firebaseApp);
        return analytics;
      })
      .catch(() => null);
  }
}

const getOrCreateSessionId = () => {
  const key = 'dailySparkSessionId';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto?.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
};

const getOrCreateVisitorId = () => {
  const key = 'dailySparkVisitorId';
  let visitorId = localStorage.getItem(key);

  if (!visitorId) {
    visitorId = crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(key, visitorId);
  }

  return visitorId;
};

const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  return keys.reduce((result, key) => {
    const value = params.get(key);
    if (value) result[key] = value;
    return result;
  }, {});
};

const detectDevice = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const platform = navigator.platform || '';
  const isIPadOS = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || isIPadOS;
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || /Mobile/i.test(ua);

  document.documentElement.classList.toggle('device-ios', isIOS);
  document.documentElement.classList.toggle('device-android', isAndroid);
  document.documentElement.classList.toggle('device-desktop', !isIOS && !isAndroid);

  return {
    isIOS,
    isAndroid,
    isMobile,
    type: isIOS ? 'ios' : isAndroid ? 'android' : isMobile ? 'mobile' : 'desktop',
  };
};

const deviceInfo = detectDevice();

const baseEventPayload = () => ({
  visitorId: getOrCreateVisitorId(),
  sessionId: getOrCreateSessionId(),
  pageUrl: window.location.href,
  pagePath: window.location.pathname,
  pageHash: window.location.hash || '',
  referrer: document.referrer || '',
  deviceType: deviceInfo.type,
  userAgent: navigator.userAgent || '',
  language: navigator.language || '',
  viewport: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  utm: getUtmParams(),
});

const trackConversion = async (eventName, detail = {}) => {
  const payload = {
    eventName,
    category: 'conversion',
    ...detail,
    ...baseEventPayload(),
    createdAtClient: new Date().toISOString(),
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, detail);
  }

  analyticsReady.then((instance) => {
    if (instance) logEvent(instance, eventName, detail);
  });

  document.dispatchEvent(new CustomEvent('dailySparkConversion', { detail: payload }));

  if (!db) return;

  try {
    await addDoc(collection(db, FIRESTORE_COLLECTIONS.conversions), {
      ...payload,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Daily Spark conversion event was not saved:', error);
  }
};

toggle?.addEventListener('click', () => {
  const isOpen = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});

links?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    links.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('[data-conversion]').forEach((link) => {
  link.addEventListener('click', () => {
    trackConversion(link.dataset.conversion, {
      label: link.textContent.trim(),
      href: link.getAttribute('href'),
    });
  });
});

const focusContactField = () => {
  const target = document.querySelector('#demo');
  const firstField = document.querySelector('#contact-form input[name="name"]');
  if (!target || !firstField) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => firstField.focus({ preventScroll: true }), 550);
};

document.querySelectorAll('a[href="#demo"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    history.pushState(null, '', '#demo');
    trackConversion('contact_anchor_click', {
      label: link.textContent.trim(),
      location: link.closest('nav') ? 'nav' : link.closest('.first-visit-modal') ? 'modal' : 'page',
    });
    focusContactField();
  });
});

if (window.location.hash === '#demo') {
  window.setTimeout(focusContactField, 250);
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const data = new FormData(form);
  const name = data.get('name')?.toString().trim() || '';
  const email = data.get('email')?.toString().trim() || '';
  const message = data.get('message')?.toString().trim() || '';
  const source = data.get('source')?.toString().trim() || 'DailySparkPractice.com contact form';
  const emailDomain = email.includes('@') ? email.split('@').pop().toLowerCase() : '';

  trackConversion('prospect_form_submit_attempt', { emailDomain });

  submitButton.disabled = true;
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Sending...';
  note.textContent = '';

  try {
    if (!db) {
      throw new Error('Firebase is not configured yet. Add your Firebase Web App values in firebase-config.js.');
    }

    const prospectPayload = {
      name,
      email,
      emailDomain,
      message,
      source,
      status: 'new',
      tags: ['website-lead'],
      pageUrl: window.location.href,
      pagePath: window.location.pathname,
      referrer: document.referrer || '',
      visitorId: getOrCreateVisitorId(),
      sessionId: getOrCreateSessionId(),
      deviceType: deviceInfo.type,
      isIOS: deviceInfo.isIOS,
      isAndroid: deviceInfo.isAndroid,
      userAgent: navigator.userAgent || '',
      language: navigator.language || '',
      utm: getUtmParams(),
      createdAtClient: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, FIRESTORE_COLLECTIONS.prospects), prospectPayload);

    trackConversion('prospect_form_submit_success', { emailDomain });
    note.textContent = `Thanks, ${name || 'there'}. Your request has been sent.`;
    showSubmissionSuccess(form);
  } catch (error) {
    trackConversion('prospect_form_submit_error', { message: error.message });
    note.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

const wireAppStoreLinks = () => {
  const message = document.querySelector('#device-message');

  document.querySelectorAll('[data-app]').forEach((link) => {
    const app = link.dataset.app;
    if (appLinks[app]) link.href = appLinks[app];

    link.addEventListener('click', () => {
      trackConversion('app_store_click', {
        app,
        label: link.getAttribute('aria-label') || link.textContent.trim(),
        href: link.href,
        linkType: link.classList.contains('launch-art-link') ? 'launch_art' : 'app_store_badge',
      });
    });

    if (deviceInfo.isIOS) {
      link.target = '_self';
      link.setAttribute('aria-label', `Open ${app === 'manager' ? 'Daily Spark Manager' : 'Daily Spark'} in the App Store`);
    }

    if (deviceInfo.isAndroid) {
      link.target = '_blank';
    }
  });

  if (message && deviceInfo.isIOS) {
    message.textContent = 'Tap a button below to open the correct App Store listing.';
  } else if (message && deviceInfo.isAndroid) {
    message.textContent = 'Daily Spark is currently available for iOS. Share or scan the QR codes with an iPhone or iPad.';
  }
};

wireAppStoreLinks();
trackConversion('page_view', { title: document.title });

const firstVisitModal = document.querySelector('#first-visit-modal');
const firstVisitStorageKey = 'dailySparkStartPopupSeen';

const openFirstVisitModal = () => {
  if (!firstVisitModal) return;
  firstVisitModal.classList.add('open');
  firstVisitModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  trackConversion('first_visit_modal_open');
};

const closeFirstVisitModal = () => {
  if (!firstVisitModal) return;
  firstVisitModal.classList.remove('open');
  firstVisitModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  localStorage.setItem(firstVisitStorageKey, 'true');
  trackConversion('first_visit_modal_close');
};

let firstVisitScrollArmed = firstVisitModal && localStorage.getItem(firstVisitStorageKey) !== 'true';

const maybeOpenFirstVisitModalOnScroll = () => {
  if (!firstVisitScrollArmed) return;

  const scrolledEnough = window.scrollY > Math.min(420, document.documentElement.scrollHeight * 0.18);
  if (!scrolledEnough) return;

  firstVisitScrollArmed = false;
  openFirstVisitModal();
  window.removeEventListener('scroll', maybeOpenFirstVisitModalOnScroll);
};

if (firstVisitScrollArmed) {
  window.addEventListener('scroll', maybeOpenFirstVisitModalOnScroll, { passive: true });
}

firstVisitModal?.querySelectorAll('[data-modal-close]').forEach((control) => {
  control.addEventListener('click', closeFirstVisitModal);
});

firstVisitModal?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeFirstVisitModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && firstVisitModal?.classList.contains('open')) {
    closeFirstVisitModal();
  }
});


const videoModal = document.querySelector('#video-modal');
const demoVideoPlayer = document.querySelector('#demo-video-player');
const videoTriggers = document.querySelectorAll('.video-modal-trigger');
const videoCloseButtons = document.querySelectorAll('[data-video-close]');

const openVideoModal = (src) => {
  if (!videoModal || !demoVideoPlayer) return;

  const source = demoVideoPlayer.querySelector('source');
  if (source && src && source.getAttribute('src') !== src) {
    source.setAttribute('src', src);
    demoVideoPlayer.load();
  }

  videoModal.hidden = false;
  videoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  demoVideoPlayer.play().catch(() => {});

  if (typeof trackConversion === 'function') {
    trackConversion('demo_video_opened', { source: 'watch_demo_cta' });
  }

  if (window.gtag) {
    window.gtag('event', 'video_start', {
      event_category: 'engagement',
      event_label: 'DSManager demo'
    });
  }
};

const closeVideoModal = () => {
  if (!videoModal || !demoVideoPlayer) return;

  demoVideoPlayer.pause();
  videoModal.hidden = true;
  videoModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

videoTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openVideoModal(trigger.dataset.videoSrc || trigger.getAttribute('href'));
  });
});

videoCloseButtons.forEach((button) => {
  button.addEventListener('click', closeVideoModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeVideoModal();
});

if (demoVideoPlayer) {
  demoVideoPlayer.addEventListener('ended', () => {
    if (typeof trackConversion === 'function') {
      trackConversion('demo_video_completed', { source: 'video_modal' });
    }

    if (window.gtag) {
      window.gtag('event', 'video_complete', {
        event_category: 'engagement',
        event_label: 'DSManager demo'
      });
    }
  });
}
