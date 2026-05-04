const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('#nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const ua = window.navigator.userAgent || '';
const isiOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /Android/.test(ua);

document.documentElement.classList.toggle('device-ios', isiOS);
document.documentElement.classList.toggle('device-android', isAndroid);

document.querySelectorAll('.store-link').forEach((link) => {
  if (isiOS) {
    link.removeAttribute('target');
  }
});

const demoForm = document.querySelector('.demo-form');
const formNote = document.querySelector('.form-note');
const successPanel = document.querySelector('.submission-success-panel');

const showSubmissionSuccess = () => {
  if (formNote) {
    formNote.textContent = "Thanks, we’ll be in contact soon!";
    formNote.classList.remove('error');
    formNote.classList.add('success');
  }

  if (demoForm) {
    demoForm.reset();
    demoForm.classList.add('is-submitted');
  }

  if (successPanel) {
    successPanel.hidden = false;
  }
};

const showSubmissionError = () => {
  if (formNote) {
    formNote.textContent = 'Something went wrong. Please try again, or email us directly.';
    formNote.classList.remove('success');
    formNote.classList.add('error');
  }
};

if (demoForm) {
  demoForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = demoForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
    }

    try {
      const response = await fetch(demoForm.action, {
        method: 'POST',
        body: new FormData(demoForm),
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      showSubmissionSuccess();
    } catch (error) {
      console.error(error);
      showSubmissionError();

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send';
      }
    }
  });
}

document.querySelectorAll('a[href="#demo"]').forEach((link) => {
  link.addEventListener('click', () => {
    window.setTimeout(() => {
      const firstField = document.querySelector('.demo-form input[name="name"], .demo-form input[name="email"]');
      if (firstField) firstField.focus({ preventScroll: true });
    }, 500);
  });
});

const firstVisitModal = document.querySelector('#first-visit-modal');
const firstVisitCloseButtons = document.querySelectorAll('[data-first-visit-close]');
const firstVisitStorageKey = 'dailySparkFirstVisitSeen';

const openFirstVisitModal = () => {
  if (!firstVisitModal) return;
  firstVisitModal.hidden = false;
  firstVisitModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  localStorage.setItem(firstVisitStorageKey, 'true');
};

const closeFirstVisitModal = () => {
  if (!firstVisitModal) return;
  firstVisitModal.hidden = true;
  firstVisitModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
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

firstVisitCloseButtons.forEach((button) => {
  button.addEventListener('click', closeFirstVisitModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeFirstVisitModal();
  }
});
