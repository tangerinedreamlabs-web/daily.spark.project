const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('#nav-links');
const form = document.querySelector('.demo-form');
const note = document.querySelector('.form-note');

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

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name')?.toString().trim() || 'there';
  note.textContent = `Thanks, ${name}. Your demo request has been captured.`;
  form.reset();
});


const appLinks = {
  manager: 'https://apple.co/4cHG4O9',
  daily: 'https://apple.co/4tFrUmq',
};

const detectDevice = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const platform = navigator.platform || '';
  const isIPadOS = platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || isIPadOS;
  const isAndroid = /Android/i.test(ua);

  document.documentElement.classList.toggle('device-ios', isIOS);
  document.documentElement.classList.toggle('device-android', isAndroid);
  document.documentElement.classList.toggle('device-desktop', !isIOS && !isAndroid);

  return { isIOS, isAndroid };
};

const wireAppStoreLinks = () => {
  const { isIOS, isAndroid } = detectDevice();
  const message = document.querySelector('#device-message');

  document.querySelectorAll('[data-app]').forEach((link) => {
    const app = link.dataset.app;
    if (appLinks[app]) link.href = appLinks[app];

    if (isIOS) {
      link.target = '_self';
      link.setAttribute('aria-label', `Open ${app === 'manager' ? 'Daily Spark Manager' : 'Daily Spark'} in the App Store`);
    }

    if (isAndroid) {
      link.target = '_blank';
    }
  });

  if (message && isIOS) {
    message.textContent = 'Tap a button below to open the correct App Store listing.';
  } else if (message && isAndroid) {
    message.textContent = 'Daily Spark is currently available for iOS. Share or scan the QR codes with an iPhone or iPad.';
  }
};

wireAppStoreLinks();
