(() => {
  const progress = document.getElementById('progressBar');
  const chapterLabel = document.getElementById('chapterLabel');
  const sections = [...document.querySelectorAll('main > section')];
  const scrollButtons = [...document.querySelectorAll('[data-scroll]')];

  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    const y = window.scrollY + window.innerHeight * 0.42;
    let active = 1;
    sections.forEach((section, index) => { if (y >= section.offsetTop) active = index + 1; });
    chapterLabel.textContent = `${String(active).padStart(2, '0')} / 09`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  scrollButtons.forEach(btn => btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const lineObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.reveal-line').forEach((line, i) => {
          setTimeout(() => line.classList.add('visible'), i * 120);
        });
        lineObserver.disconnect();
      }
    });
  }, { threshold: 0.18 });
  const letter = document.getElementById('typeLetter');
  if (letter) lineObserver.observe(letter);

  // Photo lightbox — all images remain the original uploaded files.
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightbox = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  document.querySelectorAll('[data-lightbox]').forEach(tile => tile.addEventListener('click', () => {
    lightboxImg.src = tile.dataset.lightbox;
    lightboxImg.alt = tile.querySelector('img')?.alt || '';
    lightboxCaption.textContent = tile.dataset.caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }));
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  // Optional, user-triggered ambient memory soundtrack. No autoplay and no external audio file required.
  const musicBtn = document.getElementById('musicBtn');
  let audioCtx = null, master = null, timer = null, playing = false;
  const chords = [[196.00,246.94,293.66],[174.61,220.00,261.63],[146.83,196.00,246.94],[164.81,207.65,246.94]];
  function note(freq, start, duration, volume=.018) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .9);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(master); osc.start(start); osc.stop(start + duration + .1);
  }
  function playPad() {
    const now = audioCtx.currentTime;
    chords.forEach((chord, i) => chord.forEach((f, j) => note(f, now + i * 4.2 + j * .03, 4.8, .012)));
    timer = setTimeout(playPad, 16500);
  }
  async function toggleMusic() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      master = audioCtx.createGain(); master.gain.value = .55; master.connect(audioCtx.destination);
    }
    if (playing) {
      await audioCtx.suspend(); playing = false; clearTimeout(timer);
      musicBtn.classList.remove('is-playing'); musicBtn.setAttribute('aria-pressed','false');
      musicBtn.querySelector('.music-label').textContent = 'Play our memory soundtrack';
    } else {
      await audioCtx.resume(); playing = true; playPad();
      musicBtn.classList.add('is-playing'); musicBtn.setAttribute('aria-pressed','true');
      musicBtn.querySelector('.music-label').textContent = 'Pause memory soundtrack';
    }
  }
  musicBtn.addEventListener('click', toggleMusic);
})();
