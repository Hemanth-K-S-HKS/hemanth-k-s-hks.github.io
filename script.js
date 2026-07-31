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

// ===== Terminal typing effect =====
const terminalBody = document.getElementById('terminalBody');
const lines = [
  { prompt: '~$ ', text: 'whoami', out: false },
  { prompt: '', text: 'hemanth-k-s', out: true },
  { prompt: '~$ ', text: 'cat role.txt', out: false },
  { prompt: '', text: 'System Engineer', out: true },
  { prompt: '~$ ', text: 'systemctl status homelab', out: false },
  { prompt: '', text: '● active — 3 VMs, Git Server, Build Server, Production Server', out: true },
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

// ===== Certifications & Badges: click handling =====
// Each .cert-card carries data-type="badge" | "certificate".
//   badge       -> data-href points to the Credly badge page, opened in a new tab.
//   certificate -> data-pdf points to a PDF inside the certification/ folder,
//                  shown inline in the popup modal below.
const certModal = document.getElementById('certModal');
const certModalFrame = document.getElementById('certModalFrame');
const certModalTitle = document.getElementById('certModalTitle');
let certLastFocused = null;

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

async function renderCertPDF(pdfPath){
  certModalFrame.innerHTML = '<p class="cert-modal-status">Loading certificate…</p>';
  if (!window.pdfjsLib) {
    certModalFrame.innerHTML = `<p class="cert-modal-status">Couldn't load the PDF viewer. <a href="${pdfPath}" target="_blank" rel="noopener">Open the PDF directly</a>.</p>`;
    return;
  }
  try {
    const pdf = await pdfjsLib.getDocument(pdfPath).promise;
    certModalFrame.innerHTML = '';
    const targetWidth = certModalFrame.clientWidth - 48; // account for padding
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.className = 'cert-pdf-page';
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      certModalFrame.appendChild(canvas);

      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport }).promise;
    }
  } catch (err) {
    console.error('Certificate PDF failed to render:', err);
    certModalFrame.innerHTML = `<p class="cert-modal-status">Couldn't load the certificate. <a href="${pdfPath}" target="_blank" rel="noopener">Open the PDF directly</a>.</p>`;
  }
}

function openCertModal(pdfPath, titleText){
  certLastFocused = document.activeElement;
  certModalTitle.textContent = titleText || 'Certificate';
  certModal.classList.add('open');
  certModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('certModalClose').focus();
  renderCertPDF(pdfPath);
}

function closeCertModal(){
  certModal.classList.remove('open');
  certModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  certModalFrame.innerHTML = '';
  if (certLastFocused) certLastFocused.focus();
}

document.querySelectorAll('.cert-card').forEach(card => {
  card.addEventListener('click', () => {
    const type = card.dataset.type;
    if (type === 'certificate' && card.dataset.pdf) {
      const titleText = card.querySelector('h3')?.textContent || 'Certificate';
      openCertModal(card.dataset.pdf, titleText);
    } else if (type === 'badge' && card.dataset.href) {
      window.open(card.dataset.href, '_blank', 'noopener');
    }
  });
});

if (certModal) {
  certModal.querySelectorAll('[data-cert-close]').forEach(el => {
    el.addEventListener('click', closeCertModal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('open')) closeCertModal();
  });
}
