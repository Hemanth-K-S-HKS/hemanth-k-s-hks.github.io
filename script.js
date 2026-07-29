// ===== Year in footer =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Nav scroll state =====
const nav = document.getElementById('nav');
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  toTop.classList.toggle('show', y > 600);
}, { passive: true });

// ===== Mobile menu =====
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== Back to top =====
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Scroll reveal =====
const revealTargets = document.querySelectorAll(
  '.section-head, .about-text, .about-card, .skill-card, .exp-card, .project-card, .edu-card, .lang-card, .contact-card'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealTargets.forEach(el => io.observe(el));

// ===== Animated stat counters =====
const stats = document.querySelectorAll('.stat-num');
const statIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const isDecimal = String(target).includes('.');
    const duration = 1200;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isDecimal ? val.toFixed(2) : Math.round(val);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = isDecimal ? target.toFixed(2) : target;
    }
    requestAnimationFrame(tick);
    statIO.unobserve(el);
  });
}, { threshold: 0.5 });
stats.forEach(el => statIO.observe(el));

// ===== Terminal typing effect =====
const terminalBody = document.getElementById('terminalBody');
const lines = [
  { prompt: '~$ ', text: 'whoami', out: false },
  { prompt: '', text: 'hemanth-k-s', out: true },
  { prompt: '~$ ', text: 'cat role.txt', out: false },
  { prompt: '', text: 'System Engineer', out: true },
  { prompt: '~$ ', text: 'systemctl status homelab', out: false },
  { prompt: '', text: '● active — 2 VMs, Git Server & Django Stack', out: true },
];

function typeLine(lineIndex){
  if (lineIndex >= lines.length) {
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    terminalBody.appendChild(cursor);
    return;
  }
  const { prompt, text, out } = lines[lineIndex];
  const lineEl = document.createElement('div');
  const promptSpan = document.createElement('span');
  promptSpan.className = 'prompt';
  promptSpan.textContent = prompt;
  const textSpan = document.createElement('span');
  textSpan.className = out ? 'out' : '';
  lineEl.appendChild(promptSpan);
  lineEl.appendChild(textSpan);
  terminalBody.appendChild(lineEl);

  if (out) {
    textSpan.textContent = text;
    setTimeout(() => typeLine(lineIndex + 1), 380);
    return;
  }

  let i = 0;
  const speed = 42;
  function typeChar(){
    if (i < text.length) {
      textSpan.textContent += text[i];
      i++;
      setTimeout(typeChar, speed);
    } else {
      setTimeout(() => typeLine(lineIndex + 1), 320);
    }
  }
  typeChar();
}

const termIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      typeLine(0);
      termIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
termIO.observe(document.querySelector('.terminal-card'));
