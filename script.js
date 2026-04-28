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
