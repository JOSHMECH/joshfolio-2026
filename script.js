/* ════════════════════════════════════════════════════════
   Josh_d_Guru — Portfolio Script
   Firebase Firestore integration + localStorage fallback
   ════════════════════════════════════════════════════════ */

/* ─── UI Sound System (Web Audio API Synthesizer) ────── */
let audioCtx = null;
let isMuted = localStorage.getItem('josh_sound_mute') === 'true';

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playAudioEffect(type, param) {
  if (isMuted) return;
  try {
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    
    switch(type) {
      case 'hover': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
        
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case 'click': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
        
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'plot': {
        const freq = param ? 200 + (1 - param) * 600 : 440;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.15);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'terminal': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);
        
        filter.type = 'bandpass';
        filter.frequency.value = 1100;
        filter.Q.value = 6;
        
        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
      }
      case 'chord': {
        const freqs = [261.63, 329.63, 392.00, 523.25];
        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.05, now + 0.15);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        masterGain.connect(audioCtx.destination);
        
        freqs.forEach(f => {
          const osc = audioCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = f;
          osc.connect(masterGain);
          osc.start(now);
          osc.stop(now + 1.5);
        });
        break;
      }
      case 'boot': {
        const freqs = [130.81, 164.81, 196.00, 261.63, 329.63, 392.00, 523.25];
        freqs.forEach((f, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.08);
          
          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.04, now + idx * 0.08 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.6);
        });
        break;
      }
      case 'diag': {
        const osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        const gain = audioCtx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 1.2);
        
        filter.type = 'peaking';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 1.2);
        filter.Q.value = 8;
        
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now);
        osc.stop(now + 1.5);
        
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(440, now + 0.4);
        osc2.frequency.setValueAtTime(554.37, now + 0.6);
        osc2.frequency.setValueAtTime(659.25, now + 0.8);
        osc2.frequency.setValueAtTime(880, now + 1.0);
        
        gain2.gain.setValueAtTime(0, now + 0.4);
        gain2.gain.linearRampToValueAtTime(0.03, now + 0.4 + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
        
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(now + 0.4);
        osc2.stop(now + 1.4);
        break;
      }
    }
  } catch(e) {
    console.warn('Audio effect failed to play:', e);
  }
}

/* ─── Custom System Modal Alerts ────────────────────────── */
function showSystemModal(title, text, isSuccess = true) {
  const modal = document.getElementById('sysModal');
  const modalTitle = document.getElementById('sysModalTitle');
  const modalText = document.getElementById('sysModalText');
  const modalIcon = document.getElementById('sysModalIcon');
  const modalDot = modal ? modal.querySelector('.sm-dot') : null;
  const confirmBtn = document.getElementById('sysModalConfirmBtn');
  const closeBtn = document.getElementById('sysModalCloseBtn');
  
  if (!modal) return;
  
  if (modalTitle) modalTitle.textContent = title;
  if (modalText) modalText.textContent = text;
  if (modalIcon) {
    modalIcon.textContent = isSuccess ? '✦' : '⚠';
    modalIcon.style.color = isSuccess ? 'var(--gold)' : '#FF5F56';
  }
  if (modalDot) {
    modalDot.className = 'sm-dot' + (isSuccess ? ' green' : '');
  }
  if (confirmBtn) {
    confirmBtn.textContent = isSuccess ? 'ACKNOWLEDGE REPORT' : 'DISMISS WARNING';
  }
  
  if (typeof playAudioEffect === 'function') {
    playAudioEffect('chord');
  }
  
  modal.classList.add('open');
  
  function closeModal() {
    modal.classList.remove('open');
    if (typeof playAudioEffect === 'function') {
      playAudioEffect('click');
    }
  }
  
  if (confirmBtn) {
    confirmBtn.onclick = closeModal;
  }
  if (closeBtn) {
    closeBtn.onclick = closeModal;
  }
}

// Override default window.alert globally
window.alert = function(message) {
  showSystemModal("SYSTEM REPORT", message, true);
};

function initSoundToggle() {
  const toggle = document.getElementById('soundToggle');
  if (!toggle) return;
  
  const muteIcon = `<svg class="sound-icon" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  const playIcon = `<svg class="sound-icon" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  
  if (isMuted) {
    toggle.classList.add('muted');
    toggle.innerHTML = muteIcon;
  } else {
    toggle.innerHTML = playIcon;
  }
  
  toggle.addEventListener('click', () => {
    isMuted = !isMuted;
    localStorage.setItem('josh_sound_mute', isMuted);
    toggle.classList.toggle('muted', isMuted);
    toggle.innerHTML = isMuted ? muteIcon : playIcon;
    if (!isMuted) {
      playAudioEffect('click');
    }
  });
}

/* ─── Demo Projects (always shown) ──────────────────── */
const DEMO_PROJECTS = [];

/* ─── Custom Cursor (pointer devices only) ──────────── */
const cursor      = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursorTrail');
let mx=0,my=0,tx=0,ty=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if(cursor){ cursor.style.left=mx+'px'; cursor.style.top=my+'px'; }
});
(function animCursor(){
  tx += (mx-tx)*.12; ty += (my-ty)*.12;
  if(cursorTrail){ cursorTrail.style.left=tx+'px'; cursorTrail.style.top=ty+'px'; }
  requestAnimationFrame(animCursor);
})();

document.querySelectorAll('a,button,.role-pill,.filter-btn,.tab-btn,.stag,.project-card,.social-btn').forEach(el=>{
  el.addEventListener('mouseenter',()=>{
    if(cursor){cursor.style.width='14px';cursor.style.height='14px';}
    if(cursorTrail){cursorTrail.style.width='46px';cursorTrail.style.height='46px';}
    playAudioEffect('hover');
  });
  el.addEventListener('mouseleave',()=>{
    if(cursor){cursor.style.width='8px';cursor.style.height='8px';}
    if(cursorTrail){cursorTrail.style.width='32px';cursorTrail.style.height='32px';}
  });
  el.addEventListener('click',()=>{
    playAudioEffect('click');
  });
});

/* ─── Navbar ─────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const menuOvl   = document.getElementById('menuOverlay');

window.addEventListener('scroll', ()=>{
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  highlightNav();
}, {passive:true});

hamburger.addEventListener('click', ()=>{
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  menuOvl.classList.toggle('visible', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

menuOvl.addEventListener('click', closeMenu);
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', closeMenu));

/* ─── Navbar Dropdown Interactions ───────────────────── */
const navDropdowns = document.querySelectorAll('.nav-dropdown');
navDropdowns.forEach(dd => {
  const trigger = dd.querySelector('.nav-dropdown-trigger');
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = dd.classList.contains('open');
      // Close all other dropdowns
      navDropdowns.forEach(other => {
        if (other !== dd) {
          other.classList.remove('open');
          const t = other.querySelector('.nav-dropdown-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
      dd.classList.toggle('open', !wasOpen);
      trigger.setAttribute('aria-expanded', !wasOpen);
      playAudioEffect('click');
    });
  }
});

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-dropdown')) {
    navDropdowns.forEach(dd => {
      dd.classList.remove('open');
      const trigger = dd.querySelector('.nav-dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }
});

// Keyboard support (Escape to close dropdowns)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    navDropdowns.forEach(dd => {
      dd.classList.remove('open');
      const trigger = dd.querySelector('.nav-dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }
});

function closeMenu(){
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded','false');
  menuOvl.classList.remove('visible');
  document.body.style.overflow = '';
  navDropdowns.forEach(dd => {
    dd.classList.remove('open');
    const trigger = dd.querySelector('.nav-dropdown-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

/* ─── Active Nav Link ────────────────────────────────── */
const sections   = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');
function highlightNav(){
  let current='';
  sections.forEach(s => { if(window.scrollY >= s.offsetTop - 100) current = s.id; });
  navLinkEls.forEach(l => {
    const active = l.getAttribute('href') === '#'+current;
    l.classList.toggle('active', active);
  });
}

/* ─── Role Pills Rotation ────────────────────────────── */
const rolePills = document.querySelectorAll('.role-pill');
let currentRole = 0;
if(rolePills.length){
  setInterval(()=>{
    rolePills[currentRole].classList.remove('active');
    currentRole = (currentRole+1) % rolePills.length;
    rolePills[currentRole].classList.add('active');
  }, 2400);
}

/* ─── Count-Up Stats ─────────────────────────────────── */
function animateCounter(el){
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const step = target / (duration/16);
  let count = 0;
  const t = setInterval(()=>{
    count += step;
    if(count >= target){ count=target; clearInterval(t); }
    el.textContent = Math.floor(count);
  }, 16);
}
const statsObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      document.querySelectorAll('.stat-num').forEach(animateCounter);
      statsObs.disconnect();
    }
  });
},{threshold:.5});
const statsEl = document.querySelector('.hero-stats');
if(statsEl) statsObs.observe(statsEl);

/* ─── Skill Bars ─────────────────────────────────────── */
function animateSkillBars(panel){
  panel.querySelectorAll('.skill-fill').forEach(bar=>{
    bar.style.width = bar.dataset.w+'%';
  });
}

/* ─── Skill Tabs ─────────────────────────────────────── */
const tabBtns = document.querySelectorAll('.tab-btn');
const panels  = document.querySelectorAll('.skills-panel');
function openTab(tabId){
  tabBtns.forEach(b=>b.classList.remove('active'));
  panels.forEach(p=>p.classList.remove('active'));
  const btn   = document.querySelector(`[data-tab="${tabId}"]`);
  const panel = document.getElementById(`tab-${tabId}`);
  if(btn) btn.classList.add('active');
  if(panel){ panel.classList.add('active'); setTimeout(()=>animateSkillBars(panel),100); }
}
tabBtns.forEach(btn=>btn.addEventListener('click',()=>openTab(btn.dataset.tab)));

const skillsObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const active = document.querySelector('.skills-panel.active');
      if(active) animateSkillBars(active);
      skillsObs.disconnect();
    }
  });
},{threshold:.2});
const skillsSec = document.getElementById('skills');
if(skillsSec) skillsObs.observe(skillsSec);

/* ─── Project Card Builder ───────────────────────────── */
function buildCard(project){
  // Normalize project fields (database vs GitHub API schemas)
  const title = project.title || '';
  const image = project.image || project.coverImage || '';
  const desc = project.desc || project.description || '';
  const liveUrl = project.liveUrl || project.projectUrl || '';
  const stack = project.stack || project.technologies || [];

  let thumbHtml = '';
  if (project.isGitHubRepo && !image) {
    thumbHtml = `
      <div class="github-preview-thumb">
        <div class="gh-preview-grid"></div>
        <div class="gh-preview-orb"></div>
        <div class="gh-preview-header">
          <span class="gh-preview-lang">${project.language || 'Code'}</span>
          <span class="gh-preview-stars">★ ${project.stars || 0}</span>
        </div>
        <div class="gh-preview-code">
          <span class="gh-preview-bracket">[</span>
          <span class="gh-preview-name">${title}</span>
          <span class="gh-preview-bracket">]</span>
        </div>
        <div class="gh-preview-footer">
          <span>github.com/JOSHMECH</span>
        </div>
      </div>`;
  } else {
    thumbHtml = image
      ? `<img src="${image}" alt="${title}" loading="lazy"/>`
      : `<div class="curated-preview-thumb">
          <div class="cp-grid"></div>
          <div class="cp-orb"></div>
          <div class="cp-header">
            <span class="cp-category">${project.categoryLabel || project.category || 'Project'}</span>
            <span class="cp-badge">${project.emoji || '✦'}</span>
          </div>
          <div class="cp-title-block">
            <span class="cp-bracket">❖</span>
            <span class="cp-name">${title}</span>
          </div>
          <div class="cp-footer">
            <span class="cp-stack">${stack.slice(0, 3).join(' · ') || 'Curated Project'}</span>
          </div>
        </div>`;
  }

  const repoLink = project.isGitHubRepo
    ? `private.html?repo=${encodeURIComponent(title)}&live=${(project.isOverridden && liveUrl) ? encodeURIComponent(liveUrl) : ''}`
    : project.repoUrl;

  let liveBtnHtml = '';
  if (project.isGitHubRepo && !project.isOverridden) {
    liveBtnHtml = `<span class="overlay-btn disabled-btn">Demo Not Live</span>`;
  } else if (liveUrl) {
    liveBtnHtml = `<a href="${liveUrl}" class="overlay-btn" target="_blank" rel="noopener">Live ↗</a>`;
  }

  const overlayBtns = [
    liveBtnHtml,
    repoLink ? `<a href="${repoLink}" class="overlay-btn ghost" target="_blank" rel="noopener">Repo</a>` : ''
  ].filter(Boolean).join('');

  const stackHtml = stack.map(s=>`<span class="stack-tag">${s}</span>`).join('');
  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.cat = project.category;
  card.innerHTML = `
    <div class="project-thumb">
      ${thumbHtml}
      ${overlayBtns ? `<div class="project-overlay">${overlayBtns}</div>` : ''}
    </div>
    <div class="project-body">
      <p class="project-cat">${project.categoryLabel||project.category}</p>
      <h3 class="project-title">${title}</h3>
      <p class="project-desc">${desc}</p>
      <div class="project-stack">${stackHtml}</div>
    </div>`;

  // Make the entire card body clickable for GitHub repos to ease mobile & desktop navigation
  if (project.isGitHubRepo) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Ignore if user clicked on Live or Repo overlay buttons directly
      if (e.target.closest('.overlay-btn')) return;
      window.open(repoLink, '_blank');
    });
  }

  return card;
}

/* ─── Featured Projects Horizontal Infinite Loop Strip ── */
let featTrackListenersAttached = false;
let featScrollTickerActive = false;
let featTickerPaused = false;
let featPauseTimer = null;

function renderFeaturedProjects(projects) {
  const section = document.getElementById('featured');
  const track   = document.getElementById('featuredTrack');
  if (!section || !track) return;

  // Filter projects marked featured, or fallback to first 4 published projects if none marked
  let featured = projects.filter(p => p.featured);
  if (featured.length === 0) {
    featured = projects.filter(p => !p.status || p.status === 'published').slice(0, 4);
  }

  if (featured.length === 0) {
    section.style.display = 'none';
    return;
  }

  track.innerHTML = '';

  // Duplicate items 3 times to ensure a seamless infinite horizontal loop
  const loopList = [...featured, ...featured, ...featured];

  loopList.forEach(p => {
    const title   = p.title || '';
    const image   = p.coverImage || p.image || '';
    const desc    = p.description || p.desc || '';
    const liveUrl = p.projectUrl || p.liveUrl || '';
    const stack   = (p.technologies || p.stack || []).slice(0, 3);
    const cat     = p.categoryLabel || p.category || 'Featured Work';

    const card = document.createElement('div');
    card.className = 'feat-card';
    card.innerHTML = `
      <div class="feat-card-img">
        ${image
          ? `<img src="${image}" alt="${title}" loading="lazy" />`
          : `<div class="feat-card-placeholder"><span>✦</span></div>`}
        <div class="feat-card-overlay">
          ${liveUrl ? `<a href="${liveUrl}" class="feat-overlay-btn" target="_blank" rel="noopener">View ↗</a>` : ''}
        </div>
      </div>
      <div class="feat-card-body">
        <div class="feat-card-header-row">
          <p class="feat-card-cat">${cat}</p>
          ${liveUrl ? `<a href="${liveUrl}" target="_blank" rel="noopener" class="feat-card-live-tag">Live ↗</a>` : ''}
        </div>
        <h4 class="feat-card-title" title="${title}">${title}</h4>
        <p class="feat-card-desc">${desc}</p>
        <div class="feat-card-stack">${stack.map(s => `<span class="feat-stack-tag">${s}</span>`).join('')}</div>
      </div>`;
    track.appendChild(card);
  });

  // Start continuous infinite auto-scrolling ticker
  startFeaturedAutoScroll();

  // Setup scroll buttons and drag physics once
  if (!featTrackListenersAttached) {
    featTrackListenersAttached = true;
    const prevBtn = document.getElementById('featPrevBtn');
    const nextBtn = document.getElementById('featNextBtn');

    const pauseTickerTemporarily = (duration = 2000) => {
      featTickerPaused = true;
      if (featPauseTimer) clearTimeout(featPauseTimer);
      featPauseTimer = setTimeout(() => {
        featTickerPaused = false;
      }, duration);
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        pauseTickerTemporarily(2500);
        track.scrollBy({ left: -320, behavior: 'smooth' });
        playAudioEffect('click');
        // Handle wrap back if near left start
        setTimeout(() => {
          if (track.scrollLeft <= 10) {
            track.scrollLeft += (track.scrollWidth / 3);
          }
        }, 350);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        pauseTickerTemporarily(2500);
        track.scrollBy({ left: 320, behavior: 'smooth' });
        playAudioEffect('click');
      });
    }

    // Hover pauses auto-scroll smoothly
    track.addEventListener('mouseenter', () => {
      featTickerPaused = true;
    });

    track.addEventListener('mouseleave', () => {
      if (!isDown) {
        pauseTickerTemporarily(800);
      }
    });

    // Touch & Drag-to-scroll support for mouse
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      featTickerPaused = true;
      track.classList.add('active');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        track.classList.remove('active');
        pauseTickerTemporarily(1200);
      }
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Mobile touch events
    track.addEventListener('touchstart', () => {
      featTickerPaused = true;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      pauseTickerTemporarily(1500);
    }, { passive: true });
  }

  section.style.display = 'block';
}

function startFeaturedAutoScroll() {
  if (featScrollTickerActive) return;
  featScrollTickerActive = true;

  function step() {
    const track = document.getElementById('featuredTrack');
    if (track && !featTickerPaused && track.scrollWidth > track.clientWidth) {
      track.scrollLeft += 0.65; // Silky-smooth auto scroll speed
      const thirdWidth = track.scrollWidth / 3;
      // Seamless wrap-around
      if (track.scrollLeft >= thirdWidth * 2) {
        track.scrollLeft -= thirdWidth;
      }
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ─── Render Projects with Transitions ──────────────── */
let allAdminProjects = [];
function renderProjects(filter='all'){
  const grid = document.getElementById('projectsGrid');
  const note = document.getElementById('adminNote');
  if(!grid) return;
  
  const cards = Array.from(grid.querySelectorAll('.project-card'));
  
  if (cards.length > 0) {
    cards.forEach(card => {
      card.classList.add('fade-out');
    });
    setTimeout(() => {
      performRender();
    }, 250);
  } else {
    performRender();
  }
  
  function performRender() {
    grid.innerHTML = '';
    let shown = 0;
    let projectsToRender = [];
    
    if (filter === 'github') {
      projectsToRender = allAdminProjects.filter(p => p.isGitHubRepo);
      // Sort: overridden projects first
      projectsToRender.sort((a, b) => {
        const aOver = a.isOverridden ? 1 : 0;
        const bOver = b.isOverridden ? 1 : 0;
        return bOver - aOver;
      });
      if (note) {
        note.textContent = `✦ ${projectsToRender.length} repository${projectsToRender.length !== 1 ? 'ies' : ''} synchronized from GitHub`;
      }
    } else {
      const curated = allAdminProjects.filter(p => !p.isGitHubRepo);
      projectsToRender = curated.filter(p => filter === 'all' || p.category === filter);
      if (note) {
        note.textContent = '';
      }
    }
    
    if(projectsToRender.length === 0){
      grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:3rem;font-family:var(--font-mono);font-size:.85rem;">No projects in this category yet.</p>';
      return;
    }
    
    projectsToRender.forEach((p, idx) => {
      const card = buildCard(p);
      card.classList.add('fade-in');
      grid.appendChild(card);
      
      // Re-bind mouse enter/leave for custom cursor & hover sounds
      card.addEventListener('mouseenter',()=>{
        if(cursor){cursor.style.width='14px';cursor.style.height='14px';}
        if(cursorTrail){cursorTrail.style.width='46px';cursorTrail.style.height='46px';}
        playAudioEffect('hover');
      });
      card.addEventListener('mouseleave',()=>{
        if(cursor){cursor.style.width='8px';cursor.style.height='8px';}
        if(cursorTrail){cursorTrail.style.width='32px';cursorTrail.style.height='32px';}
      });
      
      // Hook audio click/hover for overlays
      card.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => playAudioEffect('click'));
        a.addEventListener('mouseenter', () => playAudioEffect('hover'));
      });
      
      // Trigger staggered animation in next frame
      setTimeout(() => {
        card.classList.remove('fade-in');
        card.classList.add('fade-in-active');
        card.style.transitionDelay = `${idx * 40}ms`;
      }, 50);
    });
  }
}

/* ─── Filter Buttons ─────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn=>{
  btn.addEventListener('click',()=>{
    filterBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(btn.dataset.filter);
  });
});

/* ─── GitHub API Fetching & Caching ──────────────────── */
async function fetchGitHubRepos() {
  const cacheKey = 'josh_github_repos';
  const cacheTimeKey = 'josh_github_repos_time';
  const cacheDuration = 30 * 60 * 1000; // 30 minutes
  
  const cached = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(cacheTimeKey);
  
  if (cached && cachedTime && (Date.now() - parseInt(cachedTime) < cacheDuration)) {
    try { return JSON.parse(cached); } catch(e) {}
  }
  
  try {
    const res = await fetch('https://api.github.com/users/JOSHMECH/repos?sort=updated&per_page=100');
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();
    
    const mapped = repos
      .filter(r => !r.fork)
      .map(r => {
        const topics = r.topics || [];
        let category = 'dev';
        
        if (topics.includes('design') || topics.includes('ui-ux') || topics.includes('creative')) {
          category = 'design';
        } else if (topics.includes('data-science') || topics.includes('data') || topics.includes('statistics') || topics.includes('analytics') || topics.includes('r') || topics.includes('spss')) {
          category = 'data';
        }
        
        let emoji = '🚀';
        if (category === 'design') emoji = '🎨';
        else if (category === 'data') emoji = '📊';
        else if (r.language === 'JavaScript' || r.language === 'TypeScript') emoji = '🟨';
        else if (r.language === 'Python') emoji = '🐍';
        else if (r.language === 'HTML' || r.language === 'CSS') emoji = '💻';
        
        const stack = [r.language, ...topics.filter(t => t !== category)].filter(Boolean);
        const uniqueStack = [...new Set(stack)];
        
        return {
          id: 'gh-' + r.id,
          title: r.name.replace(/[-_]/g, ' '),
          category,
          categoryLabel: category === 'dev' ? 'Development' : (category === 'design' ? 'Creative Design' : 'Data Science'),
          desc: r.description || 'Public GitHub repository.',
          stack: uniqueStack.slice(0, 5),
          emoji,
          liveUrl: r.homepage || null,
          repoUrl: r.html_url,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language,
          createdAt: r.created_at,
          isGitHubRepo: true
        };
      });
      
    localStorage.setItem(cacheKey, JSON.stringify(mapped));
    localStorage.setItem(cacheTimeKey, Date.now().toString());
    return mapped;
  } catch (err) {
    console.warn('GitHub fetch failed, returning empty:', err);
    return [];
  }
}

function normalizeRepoUrl(url) {
  if (!url) return '';
  return url.toLowerCase().trim().replace(/\.git$/, '').replace(/\/$/, '');
}

async function getHiddenRepoIds() {
  const { db, firebaseReady } = window.joshFirebase || {};
  const localSet = getLocalHiddenRepos();
  if (firebaseReady && db) {
    try {
      const snap = await db.collection('hidden_repos').get();
      const dbIds = snap.docs.map(d => String(d.id));
      return new Set([...localSet, ...dbIds]);
    } catch (err) {
      console.warn('Failed to fetch hidden repos, using localStorage:', err);
      return new Set(localSet);
    }
  }
  return new Set(localSet);
}

function getLocalHiddenRepos() {
  try { return JSON.parse(localStorage.getItem('josh_hidden_repos') || '[]'); }
  catch { return []; }
}

async function getGitHubOverrides() {
  const { db, firebaseReady } = window.joshFirebase || {};
  const local = lsGetGitHubOverrides();
  if (firebaseReady && db) {
    try {
      const snap = await db.collection('github_overrides').get();
      const overrides = {};
      snap.forEach(doc => {
        overrides[doc.id] = doc.data();
      });
      return { ...local, ...overrides };
    } catch (err) {
      console.warn('Failed to fetch github overrides, using localStorage:', err);
      return local;
    }
  }
  return local;
}

function lsGetGitHubOverrides() {
  try { return JSON.parse(localStorage.getItem('josh_github_overrides') || '{}'); }
  catch { return {}; }
}

/* ─── Merge Firestore and local projects ─────────────────── */
function mergeProjects(fbList, localList) {
  const mergedMap = new Map();
  fbList.forEach(p => mergedMap.set(p.id, p));
  localList.forEach(p => {
    if (!mergedMap.has(p.id)) {
      mergedMap.set(p.id, p);
    } else {
      const fbProj = mergedMap.get(p.id);
      const fbTime = fbProj.updatedAt ? (fbProj.updatedAt.toDate ? fbProj.updatedAt.toDate().getTime() : new Date(fbProj.updatedAt).getTime()) : 0;
      const localTime = p.updatedAt ? new Date(p.updatedAt).getTime() : (p.createdAt ? new Date(p.createdAt).getTime() : 0);
      if (localTime > fbTime) {
        mergedMap.set(p.id, p);
      }
    }
  });
  return Array.from(mergedMap.values()).sort((a, b) => {
    const timeA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime()) : 0;
    const timeB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime()) : 0;
    return timeB - timeA;
  });
}

/* ─── Load Projects from Firebase or localStorage ────── */
async function loadAdminProjects(){
  const loading = document.getElementById('projectsLoading');
  try {
    const { db, firebaseReady } = window.joshFirebase || {};

    let firebaseProjects = [];
    if(firebaseReady && db){
      try{
        // Use simple .get() without orderBy — avoids Firestore composite index requirement.
        // We do our own timestamp sort in mergeProjects().
        const snap = await db.collection('projects').get();
        firebaseProjects = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(p => !p.status || p.status === 'published'); // only show published
      } catch(err){
        console.warn('[JoshFolio] Firestore project read failed, using localStorage:', err);
        firebaseProjects = getLocalProjects().filter(p => !p.status || p.status === 'published');
      }
    } else {
      firebaseProjects = getLocalProjects().filter(p => !p.status || p.status === 'published');
    }

    // Fetch GitHub projects
    let githubProjects = await fetchGitHubRepos();

    // Fetch Hidden Repo IDs
    const hiddenRepoIds = await getHiddenRepoIds();

    // Filter out any hidden repos
    githubProjects = githubProjects.filter(gh => {
      const rawId = gh.id.replace('gh-', '');
      return !hiddenRepoIds.has(String(rawId));
    });

    // Apply overrides (Live URL and Preview image overrides)
    try {
      const overrides = await getGitHubOverrides();
      githubProjects = githubProjects.map(gh => {
        const rawId = gh.id.replace('gh-', '');
        const o = overrides[rawId];
        if (o) {
          return {
            ...gh,
            liveUrl: o.liveUrl || gh.liveUrl,
            image: o.previewUrl || gh.image || '',
            isOverridden: true
          };
        }
        return {
          ...gh,
          isOverridden: false
        };
      });
    } catch (err) {
      console.warn('Failed to apply GitHub overrides:', err);
      githubProjects = githubProjects.map(gh => ({ ...gh, isOverridden: false }));
    }

    // Merge Firestore projects with local projects overrides/fallbacks
    const localProjects = getLocalProjects()
      .filter(p => !p.status || p.status === 'published');
    const mergedCurated = mergeProjects(firebaseProjects, localProjects);

    // Explicitly mark curated projects so filter logic works reliably
    // Also filter to only published projects for the public portfolio
    const taggedCurated = mergedCurated
      .filter(p => !p.status || p.status === 'published')
      .map(p => ({
        ...p,
        isGitHubRepo: false,
        isOverridden: false
      }));

    // Merge: Curated projects take precedence.
    const firebaseRepos = new Set(
      taggedCurated
        .map(p => normalizeRepoUrl(p.repoUrl))
        .filter(Boolean)
    );

    const filteredGitHub = githubProjects.filter(gh => {
      const url = normalizeRepoUrl(gh.repoUrl);
      return !firebaseRepos.has(url);
    });

    // Combine lists: curated projects first, then github repositories
    allAdminProjects = [...taggedCurated, ...filteredGitHub];
  } catch (err) {
    console.error('[JoshFolio] loadAdminProjects error:', err);
    // Still try to render whatever we have
    allAdminProjects = allAdminProjects.length ? allAdminProjects : getLocalProjects().map(p => ({ ...p, isGitHubRepo: false }));
  } finally {
    if(loading) loading.style.display='none';
    renderProjects('all');
    renderFeaturedProjects(allAdminProjects);
  }
}

function getLocalProjects(){
  try{ return JSON.parse(localStorage.getItem('josh_admin_projects')||'[]'); }
  catch{ return []; }
}

/* ─── Contact Form — Firebase + fallback ─────────────── */
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');
const contactBtn  = document.getElementById('contactBtn');

if(contactForm){
  contactForm.addEventListener('submit', async e=>{
    e.preventDefault();
    const name    = document.getElementById('fname').value.trim();
    const email   = document.getElementById('femail').value.trim();
    const subject = document.getElementById('fsubject').value.trim();
    const message = document.getElementById('fmsg').value.trim();

    if(!name||!email||!message){
      setStatus('⚠ Please fill in all required fields.','error'); return;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      setStatus('⚠ Please enter a valid email address.','error'); return;
    }

    contactBtn.textContent = 'Sending…';
    contactBtn.disabled = true;

    const payload = {
      name, email, subject: subject||'(No subject)',
      message, sentAt: new Date().toISOString(),
      source: window.location.hostname
    };

    const { db, firebaseReady } = window.joshFirebase || {};
    try{
      if(firebaseReady && db){
        await db.collection('messages').add({
          ...payload,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      
      // Send EmailJS alert / auto-reply if enabled
      try {
        const emailSettings = await getEmailSettings();
        if (emailSettings && emailSettings.enabled && emailSettings.publicJSKey && emailSettings.serviceID) {
          if (typeof emailjs !== 'undefined') {
            emailjs.init(emailSettings.publicJSKey);
            
            // 1. Send alert notification to Josh
            if (emailSettings.templateID) {
              await emailjs.send(emailSettings.serviceID, emailSettings.templateID, {
                from_name: name,
                reply_to: email,
                subject: subject || '(No subject)',
                message: message
              });
            }
            
            // 2. Send Auto-Reply to visitor
            if (emailSettings.autoReplyEnabled && emailSettings.autoReplyTemplateID) {
              await emailjs.send(emailSettings.serviceID, emailSettings.autoReplyTemplateID, {
                from_name: name,
                reply_to: email,
                subject: subject || '(No subject)',
                message: message
              });
            }
          } else {
            console.warn('EmailJS SDK not loaded when sending message.');
          }
        }
      } catch (emailErr) {
        console.warn('Failed to send EmailJS alert/auto-reply (non-blocking):', emailErr);
      }

      setStatus('✓ Message sent! I\'ll be in touch soon.','');
      contactForm.reset();
    } catch(err){
      console.error('Contact form error:', err);
      setStatus('⚠ Something went wrong. Please email me directly.','error');
    } finally{
      contactBtn.textContent = 'Send Message →';
      contactBtn.disabled = false;
    }
    setTimeout(()=>{ if(formStatus) formStatus.textContent=''; }, 6000);
  });
}

function setStatus(msg, type){
  if(!formStatus) return;
  formStatus.textContent = msg;
  formStatus.className = 'form-status' + (type?' '+type:'');
}

/* ─── Scroll-triggered fade-in ──────────────────────── */
const fadeObs = new IntersectionObserver(entries=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>{
        e.target.style.opacity='1';
        e.target.style.transform='translateY(0)';
      }, i*60);
      fadeObs.unobserve(e.target);
    }
  });
},{threshold:.08});
document.querySelectorAll('.about-card,.contact-link,.skill-item,.project-card,.sbg-card,.startup-prod-card,.eco-node,.etg-badge,.fs-card,.sw-card,.globe-card').forEach(el=>{
  el.style.cssText += 'opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease;';
  fadeObs.observe(el);
});

/* ─── Statistics Lab: Regression Canvas ──────────────── */
function initRegressionLab() {
  const canvas = document.getElementById('regressionCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let points = [];
  
  const regEq = document.getElementById('reg-eq');
  const regSlope = document.getElementById('reg-slope');
  const regIntercept = document.getElementById('reg-intercept');
  const regR = document.getElementById('reg-r');
  const regR2 = document.getElementById('reg-r2');
  const regCount = document.getElementById('reg-count');
  const clearBtn = document.getElementById('clearStatsBtn');
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gridColor = 'rgba(200, 169, 110, 0.08)';
    const axisColor = 'rgba(200, 169, 110, 0.3)';
    const pointColor = '#C8A96E';
    const lineColor = '#FAF6EE';
    
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    const step = 25;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, canvas.height - 30);
    ctx.lineTo(canvas.width, canvas.height - 30);
    ctx.stroke();
    
    ctx.fillStyle = pointColor;
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(200, 169, 110, 0.2)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.stroke();
    });
    
    const N = points.length;
    if (N >= 2) {
      const originX = 30;
      const originY = canvas.height - 30;
      
      const dataset = points.map(p => ({
        x: p.x - originX,
        y: originY - p.y
      }));
      
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
      dataset.forEach(d => {
        sumX += d.x;
        sumY += d.y;
        sumXY += d.x * d.y;
        sumXX += d.x * d.x;
        sumYY += d.y * d.y;
      });
      
      const meanX = sumX / N;
      const meanY = sumY / N;
      
      const numSlope = sumXY - (sumX * sumY) / N;
      const denSlope = sumXX - (sumX * sumX) / N;
      
      let slope = denSlope !== 0 ? numSlope / denSlope : 0;
      let intercept = meanY - slope * meanX;
      
      const numR = N * sumXY - sumX * sumY;
      const denR = Math.sqrt((N * sumXX - sumX * sumX) * (N * sumYY - sumY * sumY));
      let r = denR !== 0 ? numR / denR : 0;
      let r2 = r * r;
      
      if (regEq) regEq.textContent = `y = ${slope.toFixed(2)}x ${intercept >= 0 ? '+' : ''}${intercept.toFixed(2)}`;
      if (regSlope) regSlope.textContent = slope.toFixed(3);
      if (regIntercept) regIntercept.textContent = intercept.toFixed(3);
      if (regR) regR.textContent = r.toFixed(3);
      if (regR2) regR2.textContent = r2.toFixed(3);
      if (regCount) regCount.textContent = N;
      
      const startX = originX;
      const startY = originY - (slope * (startX - originX) + intercept);
      const endX = canvas.width;
      const endY = originY - (slope * (endX - originX) + intercept);
      
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else {
      if (regEq) regEq.textContent = "y = 0.00x + 0.00";
      if (regSlope) regSlope.textContent = "0.000";
      if (regIntercept) regIntercept.textContent = "0.000";
      if (regR) regR.textContent = "0.000";
      if (regR2) regR2.textContent = "0.000";
      if (regCount) regCount.textContent = N;
    }
  }
  
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    if (x >= 30 && y <= canvas.height - 30) {
      points.push({ x, y });
      playAudioEffect('plot', y / canvas.height);
      draw();
    }
  });
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      points = [];
      draw();
      playAudioEffect('click');
    });
  }
  
  draw();
}

/* ─── Stats Lab Tabs Switching ──────────────────────── */
function initStatsLabTabs() {
  const tabs = document.querySelectorAll('.stats-tab-btn');
  const regressionView = document.getElementById('regression-view');
  const knnView = document.getElementById('knn-view');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const targetModel = tab.dataset.tab;
      playAudioEffect('click');
      
      if (targetModel === 'regression') {
        regressionView.classList.add('active');
        regressionView.style.display = 'grid';
        knnView.classList.remove('active');
        knnView.style.display = 'none';
      } else {
        regressionView.classList.remove('active');
        regressionView.style.display = 'none';
        knnView.classList.add('active');
        knnView.style.display = 'grid';
        // Force redraw on KNN canvas
        const canvas = document.getElementById('knnCanvas');
        if (canvas) {
          const event = new Event('redraw-knn');
          canvas.dispatchEvent(event);
        }
      }
    });
  });
}

/* ─── Statistics Lab: KNN Classifier Canvas ─────────── */
function initKnnLab() {
  const canvas = document.getElementById('knnCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let knnPoints = [];
  let queryPoint = null;
  let activeMode = 'red';
  let kValue = 5;
  let isDraggingQuery = false;
  
  const kSlider = document.getElementById('knn-k-slider');
  const kValSpan = document.getElementById('knn-k-val');
  const redCountSpan = document.getElementById('knn-red-count');
  const blueCountSpan = document.getElementById('knn-blue-count');
  const predictionSpan = document.getElementById('knn-prediction');
  const clearBtn = document.getElementById('clearKnnBtn');
  const modeBtns = document.querySelectorAll('.knn-mode-btn');
  
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMode = btn.dataset.mode;
      playAudioEffect('click');
    });
  });
  
  if (kSlider && kValSpan) {
    kSlider.addEventListener('input', (e) => {
      kValue = parseInt(e.target.value);
      kValSpan.textContent = kValue;
      draw();
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      knnPoints = [];
      queryPoint = null;
      draw();
      playAudioEffect('click');
    });
  }
  
  function getDist(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
  }
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const gridColor = 'rgba(200, 169, 110, 0.08)';
    const axisColor = 'rgba(200, 169, 110, 0.3)';
    
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const step = 25;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, canvas.height - 30);
    ctx.lineTo(canvas.width, canvas.height - 30);
    ctx.stroke();
    
    const redPoints = knnPoints.filter(p => p.label === 'red');
    const bluePoints = knnPoints.filter(p => p.label === 'blue');
    if (redCountSpan) redCountSpan.textContent = redPoints.length;
    if (blueCountSpan) blueCountSpan.textContent = bluePoints.length;
    
    knnPoints.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 'red' ? '#FF5F56' : '#38bdf8';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.strokeStyle = p.label === 'red' ? 'rgba(255, 95, 86, 0.2)' : 'rgba(56, 189, 248, 0.2)';
      ctx.stroke();
    });
    
    if (queryPoint && knnPoints.length > 0) {
      const list = knnPoints.map(p => {
        return {
          point: p,
          dist: getDist(queryPoint, p)
        };
      });
      
      list.sort((a, b) => a.dist - b.dist);
      
      const actualK = Math.min(kValue, list.length);
      const neighbors = list.slice(0, actualK);
      
      let votesRed = 0;
      let votesBlue = 0;
      
      neighbors.forEach(n => {
        if (n.point.label === 'red') votesRed++;
        else votesBlue++;
      });
      
      let prediction = 'Undecided';
      let predColor = 'var(--text-muted)';
      if (votesRed > votesBlue) {
        prediction = 'Red Class';
        predColor = '#FF5F56';
      } else if (votesBlue > votesRed) {
        prediction = 'Blue Class';
        predColor = '#38bdf8';
      }
      
      if (predictionSpan) {
        predictionSpan.textContent = prediction;
        predictionSpan.style.color = predColor;
      }
      
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      neighbors.forEach(n => {
        ctx.beginPath();
        ctx.moveTo(queryPoint.x, queryPoint.y);
        ctx.lineTo(n.point.x, n.point.y);
        ctx.strokeStyle = n.point.label === 'red' ? 'rgba(255, 95, 86, 0.5)' : 'rgba(56, 189, 248, 0.5)';
        ctx.stroke();
      });
      ctx.setLineDash([]);
      
      if (neighbors.length > 0) {
        const maxDist = neighbors[neighbors.length - 1].dist;
        ctx.beginPath();
        ctx.arc(queryPoint.x, queryPoint.y, maxDist, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 169, 110, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      ctx.beginPath();
      ctx.arc(queryPoint.x, queryPoint.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#C8A96E';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(queryPoint.x, queryPoint.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = predColor === 'var(--text-muted)' ? '#080808' : predColor;
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(queryPoint.x, queryPoint.y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200, 169, 110, 0.3)';
      ctx.stroke();
    } else {
      if (predictionSpan) {
        predictionSpan.textContent = queryPoint ? 'Need training points' : 'Plot points';
        predictionSpan.style.color = 'var(--text-muted)';
      }
      
      if (queryPoint) {
        ctx.beginPath();
        ctx.arc(queryPoint.x, queryPoint.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#C8A96E';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(queryPoint.x, queryPoint.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 169, 110, 0.3)';
        ctx.stroke();
      }
    }
  }
  
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }
  
  canvas.addEventListener('mousedown', e => {
    const pos = getMousePos(e);
    if (pos.x >= 30 && pos.y <= canvas.height - 30) {
      if (queryPoint && getDist(pos, queryPoint) < 15) {
        isDraggingQuery = true;
        playAudioEffect('click');
      } else {
        if (activeMode === 'query') {
          queryPoint = { x: pos.x, y: pos.y };
          playAudioEffect('plot', pos.y / canvas.height);
          draw();
        } else {
          knnPoints.push({ x: pos.x, y: pos.y, label: activeMode });
          playAudioEffect('plot', pos.y / canvas.height);
          draw();
        }
      }
    }
  });
  
  canvas.addEventListener('mousemove', e => {
    if (isDraggingQuery && queryPoint) {
      const pos = getMousePos(e);
      if (pos.x >= 30 && pos.y <= canvas.height - 30) {
        queryPoint = { x: pos.x, y: pos.y };
        draw();
      }
    }
  });
  
  window.addEventListener('mouseup', () => {
    isDraggingQuery = false;
  });
  
  canvas.addEventListener('redraw-knn', () => {
    draw();
  });
  
  draw();
}



/* ─── Developer CLI Terminal Simulator ──────────────── */
function initTerminalCLI() {
  const termOverlay = document.getElementById('terminalOverlay');
  const toggleBtn = document.getElementById('cliToggleBtn');
  const closeBtn = document.getElementById('terminalCloseBtn');
  const termInput = document.getElementById('terminalInput');
  const termBody = document.getElementById('terminalBody');
  
  if (!termOverlay || !toggleBtn || !termInput || !termBody) return;
  
  toggleBtn.addEventListener('click', () => {
    const isOpen = termOverlay.classList.toggle('open');
    if (isOpen) {
      termInput.focus();
      playAudioEffect('chord');
    } else {
      playAudioEffect('click');
    }
  });
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      termOverlay.classList.remove('open');
      playAudioEffect('click');
    });
  }
  
  termOverlay.addEventListener('click', e => {
    if (e.target === termOverlay) {
      termOverlay.classList.remove('open');
    }
  });

  const termContainer = termOverlay.querySelector('.terminal-container');
  if (termContainer) {
    termContainer.addEventListener('click', e => {
      // Focus the input if they click anywhere inside the container, unless they clicked the close button
      if (e.target !== closeBtn && !e.target.closest('#terminalCloseBtn')) {
        termInput.focus();
      }
    });
  }
  
  const commands = {
    help: () => [
      "Available commands:",
      "  help     - Show list of system commands",
      "  about    - Print biographical system logs",
      "  projects - List synchronized repositories",
      "  startup  - Show GuruLabs ecosystem details",
      "  globe    - Print location and globe telemetry",
      "  contact  - Retrieve messaging endpoints",
      "  skills   - Display tech competency levels",
      "  neofetch - Print terminal system overview",
      "  synth    - Play synthesizer audio sequence",
      "  matrix   - Trigger system decryption stream",
      "  clear    - Clear console log stack",
      "  exit     - Shutdown console session"
    ],
    about: () => [
      "SYSTEM DATA LOG: IDOWU JOSHUA VICTOR",
      "------------------------------------",
      "ROLE: Software Developer, Designer & Data Scientist",
      "LOCATION: Lagos, Nigeria",
      "EDUCATION: BSc Statistics (Olabisi Onabanjo University)",
      "BIO: Creative technologist engineering rich, accessible user",
      "     interfaces and training predictive analytics systems."
    ],
    projects: () => {
      const list = allAdminProjects.map(p => {
        const label = p.isGitHubRepo ? "[github]" : "[curated]";
        return `  ${label.padEnd(10)} ${p.title}`;
      });
      return [
        "LOADED REPOSITORIES & PROJECTS:",
        "------------------------------------",
        ...list
      ];
    },
    startup: () => [
      "GURULABS DIAGNOSTICS & SYSTEM STATUS:",
      "------------------------------------",
      "MISSION: Building Africa's Next Digital Ecosystem",
      "STATUS: Development Beta",
      "PRODUCTS ACTIVE:",
      "  - Kudiflow (Smart Wallet & Finance Manager)",
      "  - ScholarLens (AI Academic Sandbox)",
      "METRICS:",
      "  - Active Beta Users: 2,400+",
      "  - Ecosystem Nodes: 3 Built",
      "  - Community Members: 15,000+",
      "INTEGRATIONS: Multi-Modal AI, Supabase, Cloud DB"
    ],
    globe: () => [
      "LOCATION TELEMETRY SYSTEM:",
      "------------------------------------",
      "HEADQUARTERS: Lagos, Nigeria",
      "COORDINATES: 6.5244° N, 3.3792° E",
      "RADAR SCAN: MapLibre GL 3D Globe Active",
      "BASEMAP: Carto Dark Matter Vector Style",
      "SPIN STATE: Slow auto-rotation, drag interaction enabled"
    ],
    contact: () => {
      const s = window.joshSocials || { email: "joshmech851@gmail.com", phone: "+234 816 1523 407", github: "https://github.com/JOSHMECH" };
      return [
        "CONTACT ENDPOINTS:",
        "------------------------------------",
        `  email: ${s.email}`,
        `  phone: ${s.phone}`,
        `  github: ${s.github.replace('https://', '').replace('http://', '')}`
      ];
    },
    skills: () => [
      "DEVELOPER CORE SKILLS:",
      "------------------------------------",
      "  Frontend / JS      [█████████░] 90%",
      "  UI/UX Design       [████████░░] 80%",
      "  Python / Data Sci  [████████░░] 80%",
      "  Holographic Canvas [█████████░] 90%",
      "  Ecosystem Design   [████████░░] 80%"
    ],
    neofetch: () => {
      const uptimeSec = Math.floor((Date.now() - performance.timeOrigin) / 1000);
      const m = Math.floor(uptimeSec / 60);
      const s = uptimeSec % 60;
      const uptimeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
      
      const userAgent = navigator.userAgent;
      let os = "Unknown OS";
      if (userAgent.indexOf("Win") !== -1) os = "Windows";
      else if (userAgent.indexOf("Mac") !== -1) os = "macOS";
      else if (userAgent.indexOf("Linux") !== -1) os = "Linux";
      else if (userAgent.indexOf("Android") !== -1) os = "Android";
      else if (userAgent.indexOf("like Mac") !== -1) os = "iOS";
      
      const dbStr = (window.joshFirebase && window.joshFirebase.firebaseReady) ? "Supabase Cloud DB (Connected)" : "Local Storage Fallback";
      const audioStr = isMuted ? "MUTED" : "Active (Web Audio Synthesizer)";
      const projectsCount = allAdminProjects.length;
      
      return [
        "      /\\       guest@josh_d_guru",
        "     /  \\      -----------------",
        `    /\\  /\\     OS: ${os}`,
        `   /  \\/  \\    Uptime: ${uptimeStr}`,
        `   \\  /\\  /    Database: ${dbStr}`,
        `    \\/  \\/     Synth Audio: ${audioStr}`,
        `     \\  /      Loaded Projects: ${projectsCount} items`,
        "      \\/       Terminal Version: 2.6.0-gold"
      ];
    },
    synth: () => {
      if (typeof playAudioEffect === 'function') {
        playAudioEffect('boot');
      }
      return [
        "SYNTH MODULE INITIALIZED",
        "------------------------------------",
        "Triggering synthesized arpeggio scale...",
        "  C4  (130.8 Hz)  ██░░░░░░░░",
        "  E4  (164.8 Hz)  ████░░░░░░",
        "  G4  (196.0 Hz)  ██████░░░░",
        "  C5  (261.6 Hz)  ████████░░",
        "  E5  (329.6 Hz)  ██████████",
        "Sound arpeggio complete. Engine status: ONLINE"
      ];
    },
    matrix: () => {
      let count = 0;
      const interval = setInterval(() => {
        if (count >= 20 || !termOverlay.classList.contains('open')) {
          clearInterval(interval);
          if (typeof addLine === 'function') {
            addLine("SYSTEM SCAN CLEAN. ENCRYPTED LINK SECURED.", "matrix-green");
          }
          return;
        }
        const chars = "0123456789ABCDEF@#$%&*+=?:";
        let str = "";
        for (let i = 0; i < 35; i++) {
          str += chars[Math.floor(Math.random() * chars.length)] + " ";
        }
        if (typeof addLine === 'function') {
          addLine(str, "matrix-green");
        }
        count++;
      }, 70);
      return ["DECRYPTING MATRIX SYSTEM DATA..."];
    },
    clear: () => {
      termBody.innerHTML = '';
      return [];
    },
    exit: () => {
      termOverlay.classList.remove('open');
      return ["Console session closed."];
    }
  };
  
  function addLine(text, className = '') {
    const line = document.createElement('div');
    line.className = 'terminal-output-line' + (className ? ' ' + className : '');
    line.textContent = text;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }
  
  termInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const rawInput = termInput.value;
      const cmd = rawInput.trim().toLowerCase();
      termInput.value = '';
      
      if (!cmd) return;
      
      addLine(`guest@josh_d_guru:~$ ${rawInput}`, 'terminal-output-line-user');
      
      if (commands[cmd]) {
        const output = commands[cmd]();
        output.forEach(line => addLine(line));
      } else {
        addLine(`✕ Command not found: '${cmd}'. Type 'help' for instructions.`, 'terminal-output-line-error');
      }
    } else {
      if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1) {
        playAudioEffect('terminal');
      }
    }
  });
}

/* ─── Magnetic button & parallax animation effects ─── */
function initMagneticAndParallax() {
  const magnetics = document.querySelectorAll('.cli-toggle-btn, .theme-toggle, .btn-primary, .social-btn, .nav-logo, .sound-toggle');
  
  document.addEventListener('mousemove', e => {
    const mx = e.clientX;
    const my = e.clientY;
    
    magnetics.forEach(el => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dist = Math.hypot(mx - centerX, my - centerY);
      
      if (dist < 45) {
        const strength = 12;
        const deltaX = ((mx - centerX) / dist) * strength;
        const deltaY = ((my - centerY) / dist) * strength;
        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = 'transform 0.1s ease-out';
      } else {
        el.style.transform = '';
        el.style.transition = 'transform 0.3s ease';
      }
    });
  });
  
  const orb1 = document.querySelector('.hero-orb-1');
  const orb2 = document.querySelector('.hero-orb-2');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (orb1) {
      orb1.style.transform = `translateY(${scrolled * 0.15}px)`;
    }
    if (orb2) {
      orb2.style.transform = `translateY(${scrolled * -0.1}px)`;
    }
  }, { passive: true });
}

/* ─── 3D MapLibre GL Location Globe & Command Center ───────── */
let locationMap = null;
function initLocationGlobe() {
  const container = document.getElementById('locationGlobe');
  if (!container) return;

  // Initialize Lagos Local Time Ticker
  const timeEl = document.getElementById('nodeLocalTime');
  const statusEl = document.getElementById('nodeTimezoneStatus');
  
  function updateLagosTime() {
    try {
      const now = new Date();
      const options = {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const timeFormatter = new Intl.DateTimeFormat('en-US', options);
      const timeStr = timeFormatter.format(now);
      if (timeEl) timeEl.textContent = `${timeStr} WAT`;

      // Determine operational hours (8 AM - 10 PM WAT)
      const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour: 'numeric', hour12: false });
      const currentHour = parseInt(hourFormatter.format(now), 10);
      if (statusEl) {
        if (currentHour >= 8 && currentHour < 22) {
          statusEl.textContent = 'Active Core Production Hours';
          statusEl.style.color = '#10B981';
        } else {
          statusEl.textContent = 'After Hours · Global On-Call';
          statusEl.style.color = 'var(--gold)';
        }
      }
    } catch (e) {
      if (timeEl) timeEl.textContent = 'UTC+1 (Lagos)';
    }
  }

  updateLagosTime();
  setInterval(updateLagosTime, 1000);

  if (typeof maplibregl === 'undefined') {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--gold);font-family:var(--font-mono);font-size:0.8rem;text-align:center;padding:1rem;">
        <span style="font-size:2rem;margin-bottom:0.5rem;">⬡</span>
        <span>LAGOS DEV NODE</span>
        <span style="font-size:0.7rem;color:var(--text-muted);margin-top:0.3rem;">[6.5244° N, 3.3792° E]</span>
      </div>
    `;
    return;
  }

  try {
    // Initialize MapLibre GL
    locationMap = new maplibregl.Map({
      container: 'locationGlobe',
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [3.3792, 6.5244], // Lagos longitude/latitude
      zoom: 1.85,
      pitch: 15,
      projection: { type: 'globe' }, // Enable 3D Globe view
      attributionControl: false,
      dragPan: true,
      dragRotate: true,
      touchZoomRotate: true,
      scrollZoom: false, // Prevent page scrolling hijacking
      doubleClickZoom: true,
      boxZoom: false,
      keyboard: false
    });

    let isRotating = true;
    let userInteracted = false;
    let idleTimeout = null;

    locationMap.on('load', () => {
      // Add custom gold pulse marker
      const el = document.createElement('div');
      el.className = 'maplibre-custom-marker';
      
      const pulse = document.createElement('div');
      pulse.className = 'maplibre-pulse-ring';
      el.appendChild(pulse);

      const core = document.createElement('div');
      core.className = 'maplibre-core-dot';
      el.appendChild(core);

      // Create and add the marker to the map
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([3.3792, 6.5244])
        .addTo(locationMap);

      // Custom Popup styled in dark gold
      const popup = new maplibregl.Popup({
        offset: 18,
        closeButton: false,
        closeOnClick: false,
        className: 'maplibre-custom-popup'
      })
        .setHTML(`
          <div class="map-popup-header">
            <span class="mph-dot"></span>
            <span class="mph-title">LAGOS NODE</span>
          </div>
          <div class="map-popup-body">
            <p class="mp-loc">Lagos, Nigeria</p>
            <p class="mp-status">✦ STATUS: ACTIVE DEV NODE</p>
            <p class="mp-coords">[6.5244° N, 3.3792° E]</p>
          </div>
        `);

      marker.setPopup(popup);
      popup.addTo(locationMap);

      // Slow Auto-Rotation Loop
      function rotateGlobe() {
        if (isRotating && !userInteracted && locationMap) {
          const center = locationMap.getCenter();
          center.lng = (center.lng + 0.16) % 360;
          locationMap.setCenter(center);
          requestAnimationFrame(rotateGlobe);
        }
      }

      const stopRotation = () => {
        userInteracted = true;
        if (idleTimeout) clearTimeout(idleTimeout);
      };

      const startRotation = () => {
        userInteracted = false;
        if (isRotating) rotateGlobe();
      };

      // Listen to user map interactions to stop rotation
      locationMap.on('dragstart', stopRotation);
      locationMap.on('zoomstart', stopRotation);
      locationMap.on('rotatestart', stopRotation);
      locationMap.on('touchstart', stopRotation);

      // Setup idle timer to resume rotation after 6 seconds
      const resetIdleTimer = () => {
        if (idleTimeout) clearTimeout(idleTimeout);
        idleTimeout = setTimeout(startRotation, 6000);
      };

      locationMap.on('dragend', resetIdleTimer);
      locationMap.on('zoomend', resetIdleTimer);
      locationMap.on('rotateend', resetIdleTimer);
      locationMap.on('touchend', resetIdleTimer);

      // Start auto-rotation
      rotateGlobe();

      // Setup Interactive Controls
      const flyLagosBtn = document.getElementById('globeFlyLagosBtn');
      const toggleRotateBtn = document.getElementById('globeToggleRotateBtn');
      const rotateIcon = document.getElementById('globeRotateIcon');
      const rotateLabel = document.getElementById('globeRotateLabel');
      const zoomInBtn = document.getElementById('globeZoomInBtn');
      const zoomOutBtn = document.getElementById('globeZoomOutBtn');

      if (flyLagosBtn) {
        flyLagosBtn.addEventListener('click', () => {
          stopRotation();
          locationMap.flyTo({
            center: [3.3792, 6.5244],
            zoom: 2.3,
            pitch: 20,
            bearing: 0,
            speed: 1.2,
            curve: 1.4,
            essential: true
          });
          playAudioEffect('click');
          resetIdleTimer();
        });
      }

      if (toggleRotateBtn) {
        toggleRotateBtn.addEventListener('click', () => {
          isRotating = !isRotating;
          if (isRotating) {
            userInteracted = false;
            if (rotateIcon) rotateIcon.textContent = '↻';
            if (rotateLabel) rotateLabel.textContent = 'Pause Spin';
            rotateGlobe();
          } else {
            if (rotateIcon) rotateIcon.textContent = '▶';
            if (rotateLabel) rotateLabel.textContent = 'Resume Spin';
          }
          playAudioEffect('click');
        });
      }

      if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
          stopRotation();
          locationMap.zoomIn({ duration: 400 });
          playAudioEffect('click');
          resetIdleTimer();
        });
      }

      if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
          stopRotation();
          locationMap.zoomOut({ duration: 400 });
          playAudioEffect('click');
          resetIdleTimer();
        });
      }
    });

    // Resize observer for responsive orientation changes
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        if (locationMap) locationMap.resize();
      });
      ro.observe(container);
    }
    window.addEventListener('resize', () => {
      if (locationMap) locationMap.resize();
    });

  } catch (err) {
    console.warn('MapLibre GL error:', err);
  }
}

/* ─── GuruLabs Waitlist ──────────────────────────────── */
function initStartupWaitlist() {
  const form = document.getElementById('waitlistForm');
  const emailInput = document.getElementById('waitlistEmail');
  const status = document.getElementById('waitlistStatus');
  if (!form || !emailInput || !status) return;
  
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = emailInput.value.trim();
    
    if (!email) {
      status.textContent = '⚠ Please enter your email address.';
      status.className = 'sw-status error';
      playAudioEffect('terminal');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = '⚠ Please enter a valid email address.';
      status.className = 'sw-status error';
      playAudioEffect('terminal');
      return;
    }
    
    playAudioEffect('click');
    status.textContent = 'Connecting to ecosystem...';
    status.className = 'sw-status';
    
    const payload = {
      email,
      subscribedAt: new Date().toISOString(),
      source: 'GuruLabs Waitlist'
    };
    
    const { db, firebaseReady } = window.joshFirebase || {};
    
    try {
      if (firebaseReady && db) {
        await db.collection('waitlist').add({
          ...payload,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } else {
        const waitlist = JSON.parse(localStorage.getItem('josh_waitlist') || '[]');
        waitlist.push(payload);
        localStorage.setItem('josh_waitlist', JSON.stringify(waitlist));
      }
      
      status.textContent = '✓ Welcome to the ecosystem! You\'re on the list.';
      status.className = 'sw-status';
      form.reset();
      playAudioEffect('chord');
    } catch (err) {
      console.error('Waitlist submission failed:', err);
      status.textContent = '⚠ Something went wrong. Saving locally...';
      status.className = 'sw-status error';
      
      try {
        const waitlist = JSON.parse(localStorage.getItem('josh_waitlist') || '[]');
        waitlist.push(payload);
        localStorage.setItem('josh_waitlist', JSON.stringify(waitlist));
        status.textContent = '✓ Saved offline! Welcome to the ecosystem.';
        status.className = 'sw-status';
        form.reset();
        playAudioEffect('chord');
      } catch (localErr) {
        status.textContent = '⚠ Save failed. Please check internet connection.';
        status.className = 'sw-status error';
      }
    }
    
    setTimeout(() => {
      status.textContent = '';
      status.className = 'sw-status';
    }, 6000);
  });
}

/* ─── GuruLabs Startup Metrics Count-Up ──────────────── */
function initStartupMetrics() {
  const metricsEl = document.querySelector('.sh-metrics');
  if (!metricsEl) return;
  
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        metricsEl.querySelectorAll('.sh-met-num').forEach(animateCounter);
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  
  obs.observe(metricsEl);
}

/* ─── Interactive Mockups (Kudiflow & ScholarLens) ───── */
function initInteractiveMockups() {
  const wallet = document.querySelector('.mockup-wallet');
  const balance = document.querySelector('.mw-balance');
  if (wallet && balance) {
    let isNaira = true;
    wallet.style.cursor = 'pointer';
    wallet.addEventListener('click', () => {
      isNaira = !isNaira;
      playAudioEffect('click');
      if (isNaira) {
        balance.textContent = '₦450,000.00';
      } else {
        balance.textContent = '$300.00';
      }
      
      const bars = wallet.querySelectorAll('.mw-graph-bar');
      bars.forEach(bar => {
        const origHeight = bar.style.height;
        bar.style.height = '0px';
        setTimeout(() => {
          bar.style.height = origHeight;
        }, 80);
      });
    });
  }
  
  const scholar = document.querySelector('.mockup-scholar');
  const promptEl = document.querySelector('.ms-prompt');
  const replyLines = document.querySelectorAll('.ms-reply-line');
  const gpaVal = document.querySelector('.ms-stats .ms-stat:nth-child(1) .ms-num');
  const effVal = document.querySelector('.ms-stats .ms-stat:nth-child(2) .ms-num');
  
  if (scholar && promptEl) {
    const prompts = [
      {
        text: '"Summarize SPSS ANOVA results..."',
        gpa: '4.8',
        eff: '92%',
        widths: ['100%', '80%', '90%']
      },
      {
        text: '"Generate APA citations for AI model..."',
        gpa: '4.9',
        eff: '95%',
        widths: ['85%', '95%', '60%']
      },
      {
        text: '"Plot regression trends of GPA..."',
        gpa: '4.7',
        eff: '88%',
        widths: ['95%', '70%', '80%']
      }
    ];
    
    let currentPromptIdx = 0;
    let isTyping = false;
    scholar.style.cursor = 'pointer';
    
    scholar.addEventListener('click', () => {
      if (isTyping) return;
      isTyping = true;
      playAudioEffect('click');
      
      currentPromptIdx = (currentPromptIdx + 1) % prompts.length;
      const targetPrompt = prompts[currentPromptIdx];
      
      replyLines.forEach(line => { line.style.width = '0%'; line.style.opacity = '0'; });
      if (gpaVal) gpaVal.style.opacity = '0.3';
      if (effVal) effVal.style.opacity = '0.3';
      
      let currentText = '';
      const fullText = targetPrompt.text;
      let charIdx = 0;
      promptEl.textContent = '';
      
      const typeTimer = setInterval(() => {
        if (charIdx < fullText.length) {
          currentText += fullText[charIdx];
          promptEl.textContent = currentText;
          charIdx++;
          if (charIdx % 3 === 0) {
            playAudioEffect('terminal');
          }
        } else {
          clearInterval(typeTimer);
          
          setTimeout(() => {
            replyLines.forEach((line, idx) => {
              setTimeout(() => {
                line.style.opacity = '1';
                line.style.width = targetPrompt.widths[idx];
                playAudioEffect('hover');
              }, idx * 100);
            });
            
            if (gpaVal) {
              gpaVal.textContent = targetPrompt.gpa;
              gpaVal.style.opacity = '1';
            }
            if (effVal) {
              effVal.textContent = targetPrompt.eff;
              effVal.style.opacity = '1';
            }
            
            isTyping = false;
          }, 250);
        }
      }, 25);
    });
  }
}


/* ─── Footer Telemetry Dashboard ────────────────────────── */
function initFooterTelemetry() {
  const dbNode = document.getElementById('telDbNode');
  const audioSynth = document.getElementById('telAudioSynth');
  const latency = document.getElementById('telLatency');
  const uptime = document.getElementById('telUptime');
  const diagBtn = document.getElementById('telDiagBtn');
  const scanOverlay = document.getElementById('scanOverlay');
  const scanBar = document.getElementById('scanBar');
  
  function updateDbStatus() {
    if (!dbNode) return;
    const { firebaseReady } = window.joshFirebase || {};
    if (firebaseReady) {
      dbNode.innerHTML = '<span class="tel-dot pulsing"></span> SUPABASE_CLOUD';
    } else {
      dbNode.innerHTML = '<span class="tel-dot pulsing-amber"></span> LOCAL_FALLBACK';
    }
  }
  
  setTimeout(updateDbStatus, 1000);
  
  function updateAudioStatus() {
    if (!audioSynth) return;
    if (isMuted) {
      audioSynth.innerHTML = '<span class="tel-dot muted"></span> MUTED';
    } else {
      audioSynth.innerHTML = '<span class="tel-dot pulsing-gold"></span> SYNTH_ACTIVE';
    }
  }
  
  updateAudioStatus();
  
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      setTimeout(updateAudioStatus, 50);
    });
  }
  
  if (latency) {
    setInterval(() => {
      const baseLatency = Math.floor(Math.random() * 30) + 25;
      latency.textContent = baseLatency + 'ms';
    }, 2000);
  }
  
  if (uptime) {
    const startTime = Date.now();
    setInterval(() => {
      const diff = Math.floor((Date.now() - startTime) / 1000);
      const hrs = String(Math.floor(diff / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const secs = String(diff % 60).padStart(2, '0');
      uptime.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
  }
  
  if (diagBtn) {
    diagBtn.addEventListener('click', () => {
      if (diagBtn.disabled) return;
      diagBtn.disabled = true;
      diagBtn.textContent = "⚡ SYSTEM SCANNING...";
      
      playAudioEffect('diag');
      
      if (latency) latency.textContent = '824ms';
      if (scanOverlay) scanOverlay.classList.add('scanning');
      if (scanBar) scanBar.classList.add('scanning');
      
      setTimeout(() => {
        diagBtn.disabled = false;
        diagBtn.innerHTML = '<span class="diag-icon">✓</span> SCAN COMPLETE (CLEAN)';
        
        if (scanOverlay) scanOverlay.classList.remove('scanning');
        if (scanBar) scanBar.classList.remove('scanning');
        if (latency) latency.textContent = '35ms';
        
        if (typeof showToast === 'function') {
          showToast('✦ Telemetry scan complete. System registers 100% clean!');
        } else {
          alert('✦ Telemetry diagnostics scan complete. All system nodes green!');
        }
        
        setTimeout(() => {
          diagBtn.innerHTML = '<span class="diag-icon">⚡</span> RUN TELEMETRY DIAGNOSTICS';
        }, 3000);
      }, 2000);
    });
  }
}

/* ─── Init ───────────────────────────────────────────── */

initFooterTelemetry();
initSoundToggle();
initRegressionLab();
initStatsLabTabs();
initKnnLab();

initTerminalCLI();
initMagneticAndParallax();
loadAdminProjects();
initLocationGlobe();
initStartupWaitlist();
initStartupMetrics();
initInteractiveMockups();
initDottedSurface();
initSocialSettings();
initGuruAiCompanion();
initNetworkSpeedMonitor();
initNeuralTTS();

// Load CMS Dynamic Sections
loadDynamicAbout();
loadDynamicServicesAndPlans();
loadDynamicCertifications();
setupCertModalClose();
loadDynamicTestimonials();
setupTestimonialControls();
loadDynamicBlogs();
setupBlogReaderClose();

/* ─── Social Settings Fetcher & Populator ────────────── */
async function initSocialSettings() {
  const settings = await getSocialSettings();
  window.joshSocials = settings;
  
  const emailVal = settings.email || 'joshmech851@gmail.com';
  const phoneVal = settings.phone || '+234 816 1523 407';
  
  // About email button
  const aboutMailLink = document.getElementById('aboutMailLink');
  if (aboutMailLink) aboutMailLink.href = `mailto:${emailVal}`;
  
  // Contact email links
  const contactEmailLink = document.getElementById('contactEmailLink');
  if (contactEmailLink) {
    contactEmailLink.href = `mailto:${emailVal}`;
    const mailText = contactEmailLink.querySelector('.email-val');
    if (mailText) mailText.textContent = emailVal;
  }
  
  // Contact phone link
  const contactPhoneLink = document.getElementById('contactPhoneLink');
  if (contactPhoneLink) {
    contactPhoneLink.href = `tel:${phoneVal.replace(/\s+/g, '')}`;
    const phoneText = contactPhoneLink.querySelector('.phone-val');
    if (phoneText) phoneText.textContent = phoneVal;
  }
  
  // Social row buttons
  const socialGithub = document.getElementById('socialGithub');
  if (socialGithub) socialGithub.href = settings.github || '#';
  
  const socialLinkedin = document.getElementById('socialLinkedin');
  if (socialLinkedin) socialLinkedin.href = settings.linkedin || '#';
  
  const socialTwitter = document.getElementById('socialTwitter');
  if (socialTwitter) socialTwitter.href = settings.twitter || '#';
  
  const socialBehance = document.getElementById('socialBehance');
  if (socialBehance) socialBehance.href = settings.behance || '#';
  
  const socialInstagram = document.getElementById('socialInstagram');
  if (socialInstagram) socialInstagram.href = settings.instagram || '#';
}

async function getSocialSettings() {
  const { db, firebaseReady } = window.joshFirebase || {};
  const local = lsGetSocials();
  if (firebaseReady && db) {
    try {
      const doc = await db.collection('settings').doc('socials').get();
      if (doc.exists) {
        return { ...local, ...doc.data() };
      }
    } catch (err) {
      console.warn('Failed to fetch socials from Firestore, using localStorage:', err);
    }
  }
  return local;
}

function lsGetSocials() {
  try {
    const local = JSON.parse(localStorage.getItem('josh_socials') || '{}');
    return { ...defaultSocials(), ...local };
  } catch {
    return defaultSocials();
  }
}

function defaultSocials() {
  return {
    github: "https://github.com/JOSHMECH",
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    behance: "https://behance.net",
    instagram: "https://instagram.com",
    email: "joshmech851@gmail.com",
    phone: "+234 816 1523 407"
  };
}

/* ─── Email Alerts Settings Fetcher ──────────────────────── */
function defaultEmailSettings() {
  return {
    enabled: false,
    publicJSKey: "",
    serviceID: "",
    templateID: "",
    autoReplyEnabled: false,
    autoReplyTemplateID: ""
  };
}

function lsGetEmailSettings() {
  try {
    const local = JSON.parse(localStorage.getItem('josh_email_settings') || '{}');
    return { ...defaultEmailSettings(), ...local };
  } catch {
    return defaultEmailSettings();
  }
}

async function getEmailSettings() {
  const { db, firebaseReady } = window.joshFirebase || {};
  const local = lsGetEmailSettings();
  if (firebaseReady && db) {
    try {
      const doc = await db.collection('settings').doc('email').get();
      if (doc.exists) {
        return { ...local, ...doc.data() };
      }
    } catch (err) {
      console.warn('Failed to fetch email settings from Firestore, using localStorage:', err);
    }
  }
  return local;
}

/* ─── Dynamic CMS Fetchers & Renderers ───────────────── */

async function loadDynamicAbout() {
  const { db, firebaseReady } = window.joshFirebase || {};
  let data = null;
  if (firebaseReady && db) {
    try {
      const doc = await db.collection('settings').doc('about').get();
      if (doc.exists) data = doc.data();
    } catch (err) {
      console.warn('Failed to load about settings from Firebase:', err);
    }
  }
  if (!data) {
    try {
      data = JSON.parse(localStorage.getItem('josh_about'));
    } catch (e) {}
  }
  
  if (data) {
    // Update bio paragraphs
    const aboutTextEl = document.querySelector('.about-text');
    if (aboutTextEl && data.bio) {
      // Clear previous paragraphs (excluding the about-ctas block)
      const paras = aboutTextEl.querySelectorAll('p');
      paras.forEach(p => p.remove());
      
      // Add new paragraphs from bio (split by newlines)
      const lines = data.bio.split('\n').map(l => l.trim()).filter(Boolean);
      lines.reverse().forEach(line => {
        const p = document.createElement('p');
        p.innerHTML = line;
        aboutTextEl.insertBefore(p, aboutTextEl.firstChild);
      });
    }
    
    // Update profile image if set
    if (data.profileImage) {
      const profilePhotos = document.querySelectorAll('.hero-photo');
      profilePhotos.forEach(img => img.src = data.profileImage);
    }
    
    // Update resume download button
    if (data.resumeUrl) {
      const resumeBtns = document.querySelectorAll('a[download*="RESUME"]');
      resumeBtns.forEach(btn => btn.href = data.resumeUrl);
    }
  }
}

async function loadDynamicServicesAndPlans() {
  const { db, firebaseReady } = window.joshFirebase || {};
  let services = [];
  let plans = [];
  
  if (firebaseReady && db) {
    try {
      const sSnap = await db.collection('services').orderBy('order', 'asc').get();
      services = sSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const pSnap = await db.collection('plans').orderBy('order', 'asc').get();
      plans = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('Failed to load services/plans from Firebase, checking local:', err);
    }
  }
  
  if (services.length === 0) {
    try {
      services = JSON.parse(localStorage.getItem('josh_services') || '[]');
    } catch(e) {}
  }
  if (plans.length === 0) {
    try {
      plans = JSON.parse(localStorage.getItem('josh_plans') || '[]');
    } catch(e) {}
  }
  
  // Render Services
  const servicesGrid = document.getElementById('servicesGrid');
  if (servicesGrid) {
    servicesGrid.innerHTML = '';
    if (services.length === 0) {
      // Default Fallback Services if empty
      services = [
        { name: 'Frontend Engineering', icon: '⚙', description: 'Responsive, performant, accessible web apps with modern JavaScript, React, and CSS.', price: '₦150k+', features: ['React/Next.js integration', 'Semantic & responsive HTML', 'Dynamic micro-animations'] },
        { name: 'Creative Design', icon: '✦', description: 'Brand identities, UI/UX design, print media, and motion graphics with industry tools.', price: '₦100k+', features: ['Figma design source file', 'Harmonious design tokens', 'Logo configurator setups'] },
        { name: 'Data Science', icon: '◈', description: 'Statistical modelling, predictive analytics, and visualisation using Python, R, and SPSS.', price: '₦200k+', features: ['Statistical tests (ANOVA/Regression)', 'Python notebook reports', 'Data visualization charts'] }
      ];
    }
    
    // Sanitize legacy emojis/informal fallback icons
    services.forEach(s => {
      if (s.icon === '💻') s.icon = '⚙';
      if (s.icon === '🎨') s.icon = '✦';
      if (s.icon === '📊') s.icon = '◈';
      if (s.icon === '💼') s.icon = '⚙';
    });
    
    services.forEach(s => {
      const card = document.createElement('div');
      card.className = 'service-card reveal-up';
      const featuresHtml = (s.features || []).map(f => `<li><span class="feat-bullet">✓</span> ${f}</li>`).join('');
      card.innerHTML = `
        <div class="serv-icon">${s.icon || '⚙'}</div>
        <h3 class="serv-title">${s.name}</h3>
        <p class="serv-desc">${s.description}</p>
        <p class="serv-price">${s.price}</p>
        <ul class="serv-features">${featuresHtml}</ul>
      `;
      servicesGrid.appendChild(card);
    });
  }
  
  // Render Pricing Plans
  const plansGrid = document.getElementById('plansGrid');
  if (plansGrid) {
    plansGrid.innerHTML = '';
    plans.forEach(p => {
      const card = document.createElement('div');
      card.className = `plan-card ${p.popular ? 'popular' : ''} reveal-up`;
      const featuresHtml = (p.features || []).map(f => `<li><span class="feat-bullet">✓</span> ${f}</li>`).join('');
      card.innerHTML = `
        ${p.popular ? '<span class="plan-badge">Most Popular</span>' : ''}
        <h3 class="plan-title">${p.name}</h3>
        <p class="plan-price">${p.price}</p>
        <ul class="plan-features">${featuresHtml}</ul>
        <a href="#contact" class="${p.popular ? 'btn-primary' : 'btn-ghost'} plan-btn">${p.ctaText || 'Get Started'}</a>
      `;
      plansGrid.appendChild(card);
    });
  }
}

let currentTestimonialIndex = 0;
let testimonialsList = [];

async function seedTestimonialsIfEmpty() {
  const { db, firebaseReady } = window.joshFirebase || {};

  const demoTestimonials = [
    {
      clientName: 'Chinedu Okeke',
      position: 'Director of Product',
      company: 'Apex Solutions',
      review: "Joshua's ability to turn complex statistical data models into highly polished, responsive front-end views is absolutely unique. Our client dashboard has never looked better.",
      rating: 5,
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      clientName: 'Amina Yusuf',
      position: 'Founder',
      company: 'EduVibe Africa',
      review: 'An exceptional software developer and creative designer. He redesigned our brand identity and implemented the platform on time. Highly recommended for any serious web project!',
      rating: 5,
      profileImage: '',
      createdAt: new Date().toISOString()
    },
    {
      clientName: 'Sarah Jenkins',
      position: 'Head of Engineering',
      company: 'Vanguard Analytics',
      review: 'The SPSS analytics dashboard Joshua built for us is both robust and visually striking. His clean code, use of design tokens, and automation workflow transformed our operations.',
      rating: 5,
      profileImage: '',
      createdAt: new Date().toISOString()
    }
  ];

  if (firebaseReady && db) {
    try {
      const snap = await db.collection('testimonials').get();
      if (snap.empty) {
        for (const t of demoTestimonials) {
          await db.collection('testimonials').add(t);
        }
        localStorage.setItem('josh_testimonials_seeded', 'true');
        console.log("[JoshFolio] Testimonials successfully seeded to Firestore.");
      }
    } catch (err) {
      console.warn("Failed to seed testimonials to Firestore:", err);
    }
  } else {
    try {
      const local = JSON.parse(localStorage.getItem('josh_testimonials') || '[]');
      if (local.length === 0) {
        const demoWithIds = demoTestimonials.map(t => ({
          id: 't-demo-' + Math.random().toString(36).substring(2, 9),
          ...t
        }));
        localStorage.setItem('josh_testimonials', JSON.stringify(demoWithIds));
        localStorage.setItem('josh_testimonials_seeded', 'true');
        console.log("[JoshFolio] Testimonials successfully seeded to localStorage.");
      }
    } catch (e) {
      console.warn("Failed to seed testimonials to localStorage:", e);
    }
  }
}

async function seedBlogsIfEmpty() {
  const { db, firebaseReady } = window.joshFirebase || {};

  const demoBlogs = [
    {
      title: 'Bridging Creative Design with Front-End Code',
      slug: 'bridging-design-with-code',
      author: 'Idowu Joshua Victor',
      tags: ['Design', 'Development'],
      content: 'In modern web design, having a division between design and code slows down product creation. By using design systems directly mapped to CSS custom tokens, creative developers can create live web projects that feel organic, dynamic, and beautiful at first render.\n\n### The Design System Hierarchy\n- Predefined HSL Color Tokens\n- Strict Typography Postures\n- Uniform spacing matrices\n- Fluid micro-animations.',
      publishDate: new Date().toISOString(),
      featuredImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
      status: 'published'
    },
    {
      title: 'Introducing Kudiflow: Smart Finance for Creators',
      slug: 'introducing-kudiflow-smart-finance',
      author: 'Idowu Joshua Victor',
      tags: ['Fintech', 'Productivity'],
      content: 'Managing operations and transaction tracking as a student builder or digital creator shouldn\'t feel like a chore. Kudiflow was engineered under the GuruLabs parent ecosystem to automate bookkeeping, expense logging, and cash flow visualizations.\n\n### Streamlined Financial Operations\nBy integrating intelligent ledger controls and predictive analytics, Kudiflow helps you:\n- Maintain real-time balance sheets\n- Set automated savings targets\n- Generate interactive expense reports instantly.',
      publishDate: new Date(Date.now() - 3600000).toISOString(),
      featuredImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      status: 'published'
    },
    {
      title: 'ScholarLens: Elevating Student Research with AI',
      slug: 'scholarlens-ai-research-sandbox',
      author: 'Idowu Joshua Victor',
      tags: ['Edtech', 'AI'],
      content: 'Academic research is often hindered by fragmented tools. ScholarLens bridges the gap by offering a unified sandbox where students can extract key text insights, compile citations, and analyze grade predictions.\n\n### The Academic Sandbox Model\nDesigned to empower youth innovation, ScholarLens provides:\n- Automated AI summaries for PDFs\n- Citations mapping\n- Linear regression models for GPA predictions.',
      publishDate: new Date(Date.now() - 7200000).toISOString(),
      featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      status: 'published'
    }
  ];

  if (firebaseReady && db) {
    try {
      for (const b of demoBlogs) {
        const snap = await db.collection('blog').where('slug', '==', b.slug).get();
        if (snap.empty) {
          await db.collection('blog').add(b);
          console.log(`[JoshFolio] Seeded Firestore blog: ${b.title}`);
        }
      }
      localStorage.setItem('josh_blogs_seeded', 'true');
    } catch (err) {
      console.warn("Failed to seed blogs to Firestore:", err);
    }
  }

  // Always sync local storage for redundancy/offline mode
  try {
    const local = JSON.parse(localStorage.getItem('josh_blog') || '[]');
    let updated = false;
    for (const b of demoBlogs) {
      if (!local.some(x => x.slug === b.slug)) {
        local.push({
          id: 'b-demo-' + Math.random().toString(36).substring(2, 9),
          ...b
        });
        updated = true;
        console.log(`[JoshFolio] Seeded localStorage blog: ${b.title}`);
      }
    }
    if (updated) {
      localStorage.setItem('josh_blog', JSON.stringify(local));
    }
    localStorage.setItem('josh_blogs_seeded', 'true');
  } catch (e) {
    console.warn("Failed to seed blogs to localStorage:", e);
  }
}

async function loadDynamicTestimonials() {
  const { db, firebaseReady } = window.joshFirebase || {};
  
  await seedTestimonialsIfEmpty();

  let list = [];
  
  if (firebaseReady && db) {
    try {
      const snap = await db.collection('testimonials').orderBy('createdAt', 'desc').get();
      list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('Failed to load testimonials from Firebase, checking local:', err);
    }
  }
  
  if (list.length === 0) {
    try {
      list = JSON.parse(localStorage.getItem('josh_testimonials') || '[]');
    } catch(e) {}
  }
  
  testimonialsList = list;
  if (testimonialsList.length === 0) {
    testimonialsList = [
      { clientName: 'Oluwaseun Alabi', position: 'CTO', company: 'Lagos Tech Hub', review: 'Joshua delivered a pixel-perfect, highly automated portfolio workspace that wowed our board members. His statistics edge and AI automation workflow are rare skills in a front-end engineer.', rating: 5, profileImage: '' },
      { clientName: 'Dr. Kunle Adeleke', position: 'Associate Professor', company: 'OOU Dept. of Statistics', review: 'His expertise with SPSS, ANOVA, and data visualisations is exemplary. He was able to bridge code and statistics to build complex sandbox analytics that look premium.', rating: 5, profileImage: '' }
    ];
  }
  
  renderTestimonials3d();
}

function renderTestimonials3d() {
  const wall = document.getElementById('testimonials3dWall');
  if (!wall || testimonialsList.length === 0) return;
  
  wall.innerHTML = '';
  
  const columnsCount = 4;
  for (let c = 0; c < columnsCount; c++) {
    const colEl = document.createElement('div');
    colEl.className = 'marquee-column' + (c % 2 === 1 ? ' reverse' : '');
    colEl.style.setProperty('--duration', `${25 + c * 5}s`);
    
    const innerEl = document.createElement('div');
    innerEl.className = 'marquee-inner';
    
    // Mix up testimonials per column to create variance
    const items = [...testimonialsList];
    if (c === 1) items.reverse();
    if (c === 2) items.sort(() => 0.5 - Math.random());
    if (c === 3) items.sort(() => 0.5 - Math.random()).reverse();
    
    // Duplicate list to make a seamless vertical marquee loop
    const loopedItems = [...items, ...items, ...items, ...items];
    
    loopedItems.forEach(t => {
      const card = document.createElement('div');
      card.className = 'testimonial-card-3d';
      
      const initials = t.clientName ? t.clientName.charAt(0) : 'C';
      const ratingStars = '★'.repeat(t.rating || 5);
      
      const avatarHtml = t.profileImage 
        ? `<img src="${t.profileImage}" alt="${t.clientName}" />`
        : initials;
        
      card.innerHTML = `
        <div class="t-card-header">
          <div class="t-card-avatar">${avatarHtml}</div>
          <div class="t-card-meta">
            <span class="t-card-name">${t.clientName}</span>
            <span class="t-card-company">${t.position || 'Client'} · ${t.company || 'Company'}</span>
            <span class="t-card-rating">${ratingStars}</span>
          </div>
        </div>
        <blockquote class="t-card-quote">"${t.review}"</blockquote>
      `;
      innerEl.appendChild(card);
    });
    
    colEl.appendChild(innerEl);
    wall.appendChild(colEl);
  }
}

function setupTestimonialControls() {
  // Read-only state for 3D Wall (controls not needed)
}

async function loadDynamicBlogs() {
  const { db, firebaseReady } = window.joshFirebase || {};
  
  await seedBlogsIfEmpty();

  let list = [];
  
  if (firebaseReady && db) {
    try {
      const snap = await db.collection('blog').orderBy('publishDate', 'desc').get();
      list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn('Failed to load blogs from Firebase, checking local:', err);
    }
  }
  
  if (list.length === 0) {
    try {
      list = JSON.parse(localStorage.getItem('josh_blog') || '[]');
    } catch(e) {}
  }
  
  if (list.length === 0) {
    list = [
      {
        id: "bridging-design-with-code",
        title: "Bridging Creative Design with Front-End Code",
        summary: "In modern web design, having a division between design and code slows down product creation. By using design systems directly mapped to CSS custom tokens, creative developers can create live web projects that feel organic, dynamic, and beautiful at first render.",
        content: "### The Design System Hierarchy\n- Predefined HSL Color Tokens\n- Strict Typography Postures\n- Uniform spacing matrices\n- Fluid micro-animations.",
        tags: ["Design", "Development"],
        featuredImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
        author: "Idowu Joshua Victor",
        publishDate: new Date().toISOString(),
        status: "published"
      },
      {
        id: "introducing-kudiflow-smart-finance",
        title: "Introducing Kudiflow: Smart Finance for Creators",
        summary: "Managing operations and transaction tracking as a student builder or digital creator shouldn't feel like a chore. Kudiflow was engineered under the GuruLabs parent ecosystem to automate bookkeeping, expense logging, and cash flow visualizations.",
        content: "### Streamlined Financial Operations\nBy integrating intelligent ledger controls and predictive analytics, Kudiflow helps you:\n- Maintain real-time balance sheets\n- Set automated savings targets\n- Generate interactive expense reports instantly.",
        tags: ["Fintech", "Productivity"],
        featuredImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
        author: "Idowu Joshua Victor",
        publishDate: new Date(Date.now() - 3600000).toISOString(),
        status: "published"
      },
      {
        id: "scholarlens-ai-research-sandbox",
        title: "ScholarLens: Elevating Student Research with AI",
        summary: "Academic research is often hindered by fragmented tools. ScholarLens bridges the gap by offering a unified sandbox where students can extract key text insights, compile citations, and analyze grade predictions.",
        content: "### The Academic Sandbox Model\nDesigned to empower youth innovation, ScholarLens provides:\n- Automated AI summaries for PDFs\n- Citations mapping\n- Linear regression models for GPA predictions.",
        tags: ["Edtech", "AI"],
        featuredImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
        author: "Idowu Joshua Victor",
        publishDate: new Date(Date.now() - 7200000).toISOString(),
        status: "published"
      }
    ];
  }
  
  const published = list.filter(b => b.status === 'published');
  
  // Limit to 3 most recent on the homepage; full list available on blog.html
  const preview = published.slice(0, 3);
  
  const blogGrid = document.getElementById('blogGrid');
  if (blogGrid) {
    blogGrid.innerHTML = '';
    
    preview.forEach(b => {
      const card = document.createElement('div');
      card.className = 'blog-card reveal-up';
      const date = b.publishDate && typeof b.publishDate.toDate === 'function' 
        ? b.publishDate.toDate() 
        : (b.publishDate ? new Date(b.publishDate) : new Date());
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const tagsHtml = (b.tags || []).map(t => `<span class="blog-card-tag">${t}</span>`).join('');
      const cover = b.featuredImage || 'https://via.placeholder.com/640x360.png?text=Blog+Article';
      
      card.innerHTML = `
        <div class="blog-card-image-wrap">
          <img src="${cover}" alt="${b.title}" class="blog-card-image" />
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
             <span class="blog-card-date">${dateStr}</span>
             <div class="blog-card-tags">${tagsHtml}</div>
          </div>
          <h3 class="blog-card-title">${b.title}</h3>
          <p class="blog-card-summary">${b.content.substring(0, 120)}...</p>
          <button class="btn-read-more" data-id="${b.id}">Read Article →</button>
        </div>
      `;
      blogGrid.appendChild(card);
    });
    
    blogGrid.querySelectorAll('.btn-read-more').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const post = list.find(p => p.id === id);
        if (post) openBlogReaderModal(post);
      });
    });

    // Add "See All Articles" CTA after the grid if there are more posts
    const ctaWrap = document.getElementById('blogSeeCta');
    if (ctaWrap) {
      ctaWrap.style.display = published.length > 0 ? 'flex' : 'none';
    }
  }
}

function renderMarkdownLite(content) {
  return (content || '').split('\n\n').map(para => {
    if (para.startsWith('### ')) return `<h3>${para.substring(4)}</h3>`;
    if (para.startsWith('## '))  return `<h2>${para.substring(3)}</h2>`;
    if (para.startsWith('# '))   return `<h2>${para.substring(2)}</h2>`;
    if (para.startsWith('- ')) {
      const items = para.split('\n').filter(i => i.startsWith('- ')).map(i => i.substring(2));
      return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
    return `<p>${para.replace(/\n/g, '<br/>')}</p>`;
  }).join('');
}

function openBlogReaderModal(post) {
  const overlay = document.getElementById('blogReaderOverlay');
  const hero = document.getElementById('blogReaderHero');
  const tag = document.getElementById('blogReaderTag');
  const title = document.getElementById('blogReaderTitle');
  const author = document.getElementById('blogReaderAuthor');
  const dateEl = document.getElementById('blogReaderDate');
  const content = document.getElementById('blogReaderContent');
  
  if (!overlay) return;
  
  const date = post.publishDate && typeof post.publishDate.toDate === 'function' 
    ? post.publishDate.toDate() 
    : (post.publishDate ? new Date(post.publishDate) : new Date());
  const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const cover = post.featuredImage || 'https://via.placeholder.com/960x540.png?text=Blog+Article';
  
  hero.style.backgroundImage = `url('${cover}')`;
  tag.textContent = (post.tags || []).join(', ') || 'Article';
  title.textContent = post.title;
  author.textContent = post.author || 'Idowu Joshua Victor';
  dateEl.textContent = dateStr;
  
  content.innerHTML = renderMarkdownLite(post.content) + `
    <div class="blog-reader-footer" style="margin-top: 3rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2rem; display: flex; justify-content: flex-start;">
      <button class="btn-ghost" id="bottomBackBlogReader" style="display: inline-flex; align-items: center; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.8rem; cursor: pointer; padding: 0.6rem 1.2rem; border: 1px solid var(--border); border-radius: 20px; color: var(--text);">
        ← Back to Articles
      </button>
    </div>
  `;
    
  overlay.style.display = 'flex';
  setTimeout(() => { overlay.classList.add('open'); }, 10);
  document.body.style.overflow = 'hidden';
  playAudioEffect('chord');
}

function setupBlogReaderClose() {
  const closeBtn = document.getElementById('closeBlogReader');
  const backBtn = document.getElementById('backBlogReader');
  const overlay = document.getElementById('blogReaderOverlay');
  const content = document.getElementById('blogReaderContent');
  
  const closeModal = () => {
    if (overlay) {
      overlay.classList.remove('open');
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
    }
    document.body.style.overflow = '';
    playAudioEffect('click');
  };
  
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backBtn) backBtn.addEventListener('click', closeModal);
  if (content) {
    content.addEventListener('click', e => {
      if (e.target && e.target.closest('#bottomBackBlogReader')) {
        closeModal();
      }
    });
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ─── Certifications & Verified Credentials ───────── */
let cachedClientCerts = [];

async function loadDynamicCertifications() {
  const { db, firebaseReady } = window.joshFirebase || {};
  let certs = [];

  if (firebaseReady && db) {
    try {
      const doc = await db.collection('settings').doc('certifications_store').get();
      if (doc.exists && doc.data() && Array.isArray(doc.data().items)) {
        certs = doc.data().items;
      }
    } catch (err) {
      console.warn('[JoshFolio] Failed to load certs from DB, checking local fallback:', err);
    }
  }

  if (certs.length === 0) {
    try {
      certs = JSON.parse(localStorage.getItem('josh_cached_certs') || '[]');
    } catch (e) {}
  }

  if (certs.length === 0) {
    certs = [
      {
        title: "Meta Front-End Developer Professional Certificate",
        issuer: "Meta",
        issueDate: "2024",
        credentialUrl: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
        skills: ["React.js", "JavaScript (ES6+)", "UI/UX Architecture", "HTML5 & CSS3"],
        imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "Google Data Analytics Professional Certificate",
        issuer: "Google",
        issueDate: "2024",
        credentialUrl: "https://www.coursera.org/professional-certificates/google-data-analytics",
        skills: ["R Programming", "SQL", "Statistical Modeling", "Tableau & Spreadsheets"],
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "Responsive Web Design & Algorithms",
        issuer: "freeCodeCamp",
        issueDate: "2023",
        credentialUrl: "https://www.freecodecamp.org/certification/fcc-responsive-web-design",
        skills: ["CSS Flexbox & Grid", "Accessibility", "Design Systems", "Web Performance"],
        imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80"
      }
    ];
  }

  cachedClientCerts = certs;
  renderCertifications(certs);
}

function renderCertifications(certs) {
  const grid = document.getElementById('certificationsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  certs.forEach((cert, idx) => {
    const card = document.createElement('div');
    card.className = 'cert-card reveal-up';
    
    const skills = Array.isArray(cert.skills) ? cert.skills : (cert.skills ? String(cert.skills).split(',').map(s => s.trim()) : []);
    const skillsHtml = skills.map(s => `<span class="cert-skill-tag">${s}</span>`).join('');
    
    const thumbHtml = cert.imageUrl
      ? `<img src="${cert.imageUrl}" alt="${cert.title}" class="cert-thumb-img" loading="lazy" />`
      : `<div class="cert-thumb-placeholder">
           <span class="cert-ph-icon">✪</span>
           <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted);">Verified Credential</span>
         </div>`;

    card.innerHTML = `
      <div class="cert-thumb-wrap" data-idx="${idx}">
        ${thumbHtml}
        <div class="cert-zoom-overlay">
          <span>🔍</span> Inspect Credential
        </div>
      </div>
      <div class="cert-content">
        <div class="cert-meta-row">
          <span class="cert-issuer-badge">✪ ${cert.issuer || 'Accredited Issuer'}</span>
          ${cert.issueDate ? `<span class="cert-date">${cert.issueDate}</span>` : ''}
        </div>
        <h3 class="cert-title">${cert.title}</h3>
        <div class="cert-skills-wrap">${skillsHtml}</div>
        <div class="cert-footer-row">
          ${cert.credentialUrl ? `<a href="${cert.credentialUrl}" target="_blank" rel="noopener" class="cert-verify-link">Verify Credential ↗</a>` : '<span style="font-size:0.75rem; color:var(--text-dim); font-family:var(--font-mono);">Verified Record</span>'}
          <button type="button" class="cert-preview-btn" data-idx="${idx}">Preview 🔍</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach Lightbox triggers
  grid.querySelectorAll('.cert-thumb-wrap, .cert-preview-btn').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const idx = parseInt(trigger.dataset.idx);
      const cert = cachedClientCerts[idx];
      if (cert) openCertModal(cert);
    });
  });
}

function openCertModal(cert) {
  const overlay = document.getElementById('certModalOverlay');
  const imgEl = document.getElementById('certModalImg');
  const titleEl = document.getElementById('certModalTitle');
  const tagEl = document.getElementById('certModalIssuerTag');
  const metaEl = document.getElementById('certModalMeta');
  const skillsEl = document.getElementById('certModalSkills');
  const actionsEl = document.getElementById('certModalActions');
  if (!overlay) return;

  if (imgEl) {
    if (cert.imageUrl) {
      imgEl.src = cert.imageUrl;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }
  }
  if (titleEl) titleEl.textContent = cert.title || 'Professional Certificate';
  if (tagEl) tagEl.textContent = cert.issuer ? `✪ ${cert.issuer}` : 'Verified Credential';
  if (metaEl) metaEl.textContent = cert.issueDate ? `Issued in ${cert.issueDate}` : 'Verified Competency Badge';

  if (skillsEl) {
    const skills = Array.isArray(cert.skills) ? cert.skills : (cert.skills ? String(cert.skills).split(',').map(s => s.trim()) : []);
    skillsEl.innerHTML = skills.map(s => `<span class="cert-skill-tag">${s}</span>`).join('');
  }

  if (actionsEl) {
    actionsEl.innerHTML = cert.credentialUrl 
      ? `<a href="${cert.credentialUrl}" target="_blank" rel="noopener" class="btn-primary" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.6rem 1.4rem; font-size:0.85rem;">
           Verify On Official Portal ↗
         </a>`
      : '';
  }

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  playAudioEffect('chord');
}

function setupCertModalClose() {
  const overlay = document.getElementById('certModalOverlay');
  const closeBtn = document.getElementById('certModalCloseBtn');

  const close = () => {
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
    playAudioEffect('click');
  };

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.style.display !== 'none') {
      close();
    }
  });
}

/* ─── WebGL Waving Dotted Particle Surface Background ─── */
function initDottedSurface() {
  const container = document.getElementById('dottedSurfaceContainer');
  if (!container || typeof THREE === 'undefined') return;

  const SEPARATION = 150;
  const AMOUNTX = 40;
  const AMOUNTY = 60;

  // Setup Scene & Camera
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x080808, 2000, 10000);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    1,
    10000
  );
  camera.position.set(0, 355, 1220);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(scene.fog.color, 0);

  container.appendChild(renderer.domElement);

  // Particles positioning
  const positions = [];
  const colors = [];

  for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
      const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
      const y = 0;
      const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

      positions.push(x, y, z);
      // Gold colors to match theme (var(--gold) is roughly rgb(200, 169, 110))
      colors.push(200 / 255, 169 / 255, 110 / 255);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 5.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let count = 0;
  let animationId;

  function animate() {
    animationId = requestAnimationFrame(animate);

    const positionAttribute = geometry.attributes.position;
    const posArr = positionAttribute.array;

    let i = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const index = i * 3;
        posArr[index + 1] =
          Math.sin((ix + count) * 0.35) * 45 +
          Math.sin((iy + count) * 0.5) * 45;
        i++;
      }
    }

    positionAttribute.needsUpdate = true;
    renderer.render(scene, camera);
    count += 0.045; // Smooth slow waving animation
  }

  function handleResize() {
    if (!container.clientWidth || !container.clientHeight) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', handleResize);

  animate();
}

/* ════════════════════════════════════════════════════════
   Guru AI Companion — Interactive Co-Pilot Logic
   ════════════════════════════════════════════════════════ */

function initGuruAiCompanion() {
  // Elements: Flagship Showcase Section
  const terminalForm = document.getElementById('guruTerminalForm');
  const terminalInput = document.getElementById('guruTerminalInput');
  const terminalBody = document.getElementById('guruTerminalBody');
  const promptChips = document.querySelectorAll('.gpt-chip');
  const btnLaunchGuru = document.getElementById('btnLaunchGuruAi');
  const btnSignalPuzzle = document.getElementById('btnGuruSignalPuzzle');

  // Elements: Floating Widget & Slide-Out Drawer
  const widget = document.getElementById('guruAiWidget');
  const drawer = document.getElementById('guruAiDrawer');
  const overlay = document.getElementById('guruDrawerOverlay');
  const closeBtn = document.getElementById('gadCloseBtn');
  const clearBtn = document.getElementById('gadClearBtn');
  const soundToggleBtn = document.getElementById('gadSoundToggle');
  const soundIcon = document.getElementById('gadSoundIcon');
  const gadForm = document.getElementById('gadForm');
  const gadInput = document.getElementById('gadInput');
  const gadMessages = document.getElementById('gadMessages');
  const drawerChips = document.querySelectorAll('.gad-chip');
  const latencyEl = document.getElementById('gadLatency');

  let isDrawerSoundEnabled = true;

  // 1. Knowledge Base & Response Engine
  function getAiResponse(rawQuery) {
    const q = rawQuery.toLowerCase().trim();

    if (q.includes('signal') || q.includes('decrypt') || q.includes('handshake') || q.includes('initiate_signal_handshake')) {
      return {
        text: `<strong>[PROTOCOL CLEARANCE: GRANTED]</strong><br/>
Signal Pathway Decryption: <code>SHA-256::GURU-ALPHA-2026</code> verified.<br/>
- Decrypted Block: <em>"Innovate from raw constraints. Bridge UI elegance with statistical precision."</em><br/>
- Onboarding status: <strong>LEVEL 4 BUILDER ACCESS ACTIVE</strong>. Welcome to the GuruLabs core.`,
        suggest: 'Explore GuruLabs startup roadmap.'
      };
    }

    if (q.includes('who is') || q.includes('joshua') || q.includes('about') || q.includes('profile') || q.includes('bio')) {
      return {
        text: `<strong>Idowu Joshua Victor (Josh_d_Guru)</strong> is a creative technologist, software engineer, and BSc Statistics student at Olabisi Onabanjo University (OOU).<br/><br/>
He serves as the founder of <strong>GuruLabs</strong>, engineering flagship projects including <em>Kudiflow</em> (smart business finance) and <em>ScholarLens</em> (AI academic research). His work merges modern frontend design with statistical machine learning and custom cognitive integrations.`,
        suggest: 'Show me his frontend and SPSS statistics stack.'
      };
    }

    if (q.includes('stack') || q.includes('skills') || q.includes('technolog') || q.includes('frontend') || q.includes('languages')) {
      return {
        text: `Joshua's core technical stack spans three interconnected disciplines:<br/>
• <strong>Frontend & Creative Engineering:</strong> Vanilla JS (ES6+), Three.js WebGL, Tailwind CSS, Next.js, React, Web Audio API.<br/>
• <strong>Backend & Cloud Architecture:</strong> Supabase, Firebase Cloud Firestore, Node.js, REST & Serverless APIs.<br/>
• <strong>Data Science & Statistics:</strong> Python (Pandas, NumPy, Scikit-learn), SPSS (ANOVA, Chi-square, Multi-variable Regression), Linear & KNN sandbox modeling.`,
        suggest: 'What is Kudiflow and ScholarLens?'
      };
    }

    if (q.includes('kudiflow') || q.includes('scholarlens') || q.includes('startup') || q.includes('gurulabs') || q.includes('cases')) {
      return {
        text: `<strong>GuruLabs Startup Ecosystem:</strong><br/>
1. <strong>Kudiflow:</strong> Smart financial ledger and cash flow automation for student entrepreneurs and builders.<br/>
2. <strong>ScholarLens:</strong> AI-powered academic research sandbox featuring automated PDF analysis, citation compilation, and predictive GPA modeling.<br/>
3. <strong>Guru AI Companion:</strong> Developer & builder co-pilot with zero-latency offline caching.`,
        suggest: 'How can I collaborate or hire Joshua?'
      };
    }

    if (q.includes('hire') || q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('collaborate')) {
      return {
        text: `You can reach Joshua directly for engineering roles, technical co-founding, or client contracts:<br/>
• <strong>Email:</strong> <a href="mailto:joshmech851@gmail.com" style="color:var(--gold); text-decoration:underline;">joshmech851@gmail.com</a><br/>
• <strong>Phone / WhatsApp:</strong> <a href="tel:+2348161523407" style="color:var(--gold); text-decoration:underline;">+234 816 1523 407</a><br/>
• <strong>GitHub:</strong> <a href="https://github.com/JOSHMECH" target="_blank" style="color:var(--gold); text-decoration:underline;">github.com/JOSHMECH</a><br/>
• Or use the <em>#contact</em> form below on this page.`,
        suggest: 'Tell me about the Guru AI Companion architecture.'
      };
    }

    if (q.includes('companion') || q.includes('guru ai') || q.includes('architecture') || q.includes('model') || q.includes('engine')) {
      return {
        text: `<strong>Guru AI Companion Architecture:</strong><br/>
• <strong>Cognitive Pipeline:</strong> Autonomous multi-modal reasoning with context-engineered prompt architectures.<br/>
• <strong>Client Pipeline:</strong> Lightweight Vanilla ES6+ core for maximum client responsiveness.<br/>
• <strong>Data Layer:</strong> Supabase PostgreSQL with real-time sync and client session storage fallback.<br/>
• <strong>Audio Feedback:</strong> Real-time Web Audio API frequency synthesizers.`,
        suggest: 'Run Signal Handshake protocol.'
      };
    }

    // Default intelligent fallback
    return {
      text: `Understood. As Joshua's <strong>Guru AI Co-Pilot</strong>, I am tuned to assist with development roadmaps, data engineering questions, or briefing you on Joshua's project portfolio. Feel free to query his software builds, statistics research, or startup launchpad.`,
      suggest: 'Who is Joshua and what does he build?'
    };
  }

  // 2. Interactive Terminal Simulator in Section
  function appendTerminalMessage(sender, htmlContent, isUser = false) {
    if (!terminalBody) return;
    const msg = document.createElement('div');
    if (isUser) {
      msg.className = 'gpt-msg-user';
      msg.textContent = htmlContent;
    } else {
      msg.className = 'gpt-msg-assistant';
      msg.innerHTML = `
        <span class="gpt-avatar">✦</span>
        <div class="gpt-text">${htmlContent}</div>
      `;
    }
    terminalBody.appendChild(msg);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function handleTerminalQuery(queryText) {
    if (!queryText.trim()) return;
    appendTerminalMessage('user', queryText, true);
    playAudioEffect('terminal');

    // Simulate typing delay
    setTimeout(() => {
      const resp = getAiResponse(queryText);
      appendTerminalMessage('assistant', resp.text);
      playAudioEffect('chord');
    }, 400);
  }

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener('submit', e => {
      e.preventDefault();
      const val = terminalInput.value.trim();
      if (!val) return;
      handleTerminalQuery(val);
      terminalInput.value = '';
    });
  }

  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt') || chip.textContent;
      handleTerminalQuery(prompt);
      playAudioEffect('click');
    });
  });

  // 3. Floating Widget & Slide-Out Drawer Controls
  function openDrawer(prefillQuery = null) {
    if (!drawer || !overlay) return;
    overlay.classList.add('open');
    drawer.classList.add('open');
    document.body.style.overflow = 'hidden';
    playAudioEffect('chord');

    // Randomize slight latency ticker for realism
    if (latencyEl) {
      latencyEl.textContent = `${Math.floor(Math.random() * 15 + 14)}ms latency`;
    }

    if (prefillQuery) {
      sendDrawerMessage(prefillQuery);
    } else if (gadInput) {
      setTimeout(() => gadInput.focus(), 300);
    }
  }

  function closeDrawer() {
    if (!drawer || !overlay) return;
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    document.body.style.overflow = '';
    playAudioEffect('click');
  }

  if (widget) {
    widget.addEventListener('click', () => openDrawer());
  }

  if (btnLaunchGuru) {
    btnLaunchGuru.addEventListener('click', () => openDrawer());
  }

  if (btnSignalPuzzle) {
    btnSignalPuzzle.addEventListener('click', () => {
      openDrawer('INITIATE_SIGNAL_HANDSHAKE');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // 4. Drawer Messages & Input
  function appendDrawerMessage(role, htmlText, suggestion = null) {
    if (!gadMessages) return;
    const bubble = document.createElement('div');
    bubble.className = `gad-bubble ${role}`;

    const avatar = role === 'user' 
      ? '<span style="font-family:var(--font-mono);font-size:0.65rem;font-weight:700;">YOU</span>' 
      : '✦';
    let suggestHtml = '';
    if (suggestion) {
      suggestHtml = `
        <div class="gad-suggest-box">
          <span class="gsb-label">Suggested query:</span>
          <button class="gsb-btn" data-chat="${suggestion}">"${suggestion}" →</button>
        </div>
      `;
    }

    let ttsBtnHtml = '';
    if (role === 'assistant') {
      ttsBtnHtml = `<button class="gad-bubble-tts-btn" title="Read Aloud" aria-label="Read Message Aloud">🔊</button>`;
    }

    bubble.innerHTML = `
      <div class="gad-bubble-avatar">${avatar}</div>
      <div class="gad-bubble-body">
        <div>${htmlText}</div>
        ${suggestHtml}
        ${ttsBtnHtml}
      </div>
    `;

    gadMessages.appendChild(bubble);
    gadMessages.scrollTop = gadMessages.scrollHeight;

    // Attach listener for suggestion button inside bubble
    const suggestBtn = bubble.querySelector('.gsb-btn');
    if (suggestBtn) {
      suggestBtn.addEventListener('click', () => {
        const txt = suggestBtn.getAttribute('data-chat');
        sendDrawerMessage(txt);
      });
    }

    // Attach listener for TTS readout button inside bubble
    const ttsBtn = bubble.querySelector('.gad-bubble-tts-btn');
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        if (window.joshTTS) {
          if (ttsBtn.classList.contains('speaking')) {
            window.joshTTS.stop();
            ttsBtn.classList.remove('speaking');
          } else {
            document.querySelectorAll('.gad-bubble-tts-btn.speaking').forEach(b => b.classList.remove('speaking'));
            ttsBtn.classList.add('speaking');
            window.joshTTS.speak(htmlText, 'Guru AI Co-Pilot', ttsBtn);
          }
        }
      });
    }
  }

  // Voice toggle in drawer header
  const gadVoiceToggle = document.getElementById('gadVoiceToggle');
  let isAiVoiceAutoEnabled = true;
  if (gadVoiceToggle) {
    gadVoiceToggle.addEventListener('click', () => {
      isAiVoiceAutoEnabled = !isAiVoiceAutoEnabled;
      gadVoiceToggle.classList.toggle('active', isAiVoiceAutoEnabled);
      const textSpan = gadVoiceToggle.querySelector('.gvp-text') || gadVoiceToggle;
      textSpan.textContent = isAiVoiceAutoEnabled ? 'Voice: ON' : 'Voice: OFF';
      gadVoiceToggle.title = `Toggle AI Voice Auto-Readout: ${isAiVoiceAutoEnabled ? 'ON' : 'OFF'}`;
      playAudioEffect('click');
    });
  }

  function sendDrawerMessage(queryText) {
    if (!queryText || !queryText.trim()) return;
    const text = queryText.trim();

    // User Message
    appendDrawerMessage('user', text);
    if (isDrawerSoundEnabled) playAudioEffect('click');

    // Show Typing Indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'gad-bubble assistant typing-bubble';
    typingBubble.innerHTML = `
      <div class="gad-bubble-avatar">✦</div>
      <div class="gad-bubble-body">
        <div class="gad-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    gadMessages.appendChild(typingBubble);
    gadMessages.scrollTop = gadMessages.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
      typingBubble.remove();
      const resp = getAiResponse(text);
      appendDrawerMessage('assistant', resp.text, resp.suggest);
      if (isDrawerSoundEnabled) playAudioEffect('chord');

      // Auto-readout if AI voice is enabled
      if (isAiVoiceAutoEnabled && window.joshTTS) {
        window.joshTTS.speak(resp.text, 'Guru AI Co-Pilot');
      }
    }, 550);
  }

  if (gadForm && gadInput) {
    gadForm.addEventListener('submit', e => {
      e.preventDefault();
      const val = gadInput.value.trim();
      if (!val) return;
      sendDrawerMessage(val);
      gadInput.value = '';
      gadInput.style.height = 'auto';
    });

    gadInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        gadForm.dispatchEvent(new Event('submit'));
      }
    });

    // Auto-grow textarea
    gadInput.addEventListener('input', () => {
      gadInput.style.height = 'auto';
      gadInput.style.height = Math.min(gadInput.scrollHeight, 120) + 'px';
    });
  }

  // Drawer Chips
  drawerChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-chat') || chip.textContent;
      sendDrawerMessage(q);
    });
  });

  // Global suggestion delegation
  if (gadMessages) {
    gadMessages.addEventListener('click', e => {
      const btn = e.target.closest('.gsb-btn');
      if (btn) {
        const chatTxt = btn.getAttribute('data-chat');
        if (chatTxt) sendDrawerMessage(chatTxt);
      }
    });
  }

  // Clear chat history
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!gadMessages) return;
      gadMessages.innerHTML = `
        <div class="gad-bubble assistant">
          <div class="gad-bubble-avatar">✦</div>
          <div class="gad-bubble-body">
            <p><strong>Session reset.</strong> Guru AI Companion v2.5 is ready for fresh queries.</p>
            <div class="gad-suggest-box">
              <span class="gsb-label">Suggested query:</span>
              <button class="gsb-btn" data-chat="Who is Joshua and what are his core specialties?">"Who is Joshua and what are his core specialties?" →</button>
            </div>
          </div>
        </div>
      `;
      playAudioEffect('click');
    });
  }

  // Sound toggle button
  if (soundToggleBtn && soundIcon) {
    soundToggleBtn.addEventListener('click', () => {
      isDrawerSoundEnabled = !isDrawerSoundEnabled;
      soundIcon.innerHTML = isDrawerSoundEnabled 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
      soundToggleBtn.title = isDrawerSoundEnabled ? 'Audio Synthesizer: ON' : 'Audio Synthesizer: MUTED';
      playAudioEffect('click');
    });
  }
}

/* ════════════════════════════════════════════════════════
   Network Speed Telemetry & Low Bandwidth Advisory
   ════════════════════════════════════════════════════════ */

function initNetworkSpeedMonitor() {
  const badge = document.getElementById('netSpeedBadge');
  const dot = document.getElementById('netDot');
  const speedVal = document.getElementById('netSpeedVal');
  const banner = document.getElementById('netAdvisoryBanner');
  const speedReadout = document.getElementById('nabSpeedReadout');
  const retestBtn = document.getElementById('nabRetestBtn');
  const dismissBtn = document.getElementById('nabDismissBtn');

  if (!badge || !dot || !speedVal) return;

  let isTesting = false;

  async function measureNetworkSpeed() {
    if (isTesting) return;
    isTesting = true;

    const navConn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isOnline = navigator.onLine;

    if (!isOnline) {
      dot.className = 'net-dot slow';
      speedVal.textContent = 'Offline';
      badge.title = 'No active internet connection';
      showAdvisoryBanner('Offline');
      isTesting = false;
      return;
    }

    let downlink = navConn && navConn.downlink ? navConn.downlink : null;
    let rtt = navConn && navConn.rtt ? navConn.rtt : null;
    let effectiveType = navConn && navConn.effectiveType ? navConn.effectiveType : null;

    // Active speed probe using local favicon/asset
    try {
      const probeStart = performance.now();
      const probeUrl = `josh fav.png?_probe=${Date.now()}`;
      const res = await fetch(probeUrl, { cache: 'no-store' });
      const blob = await res.blob();
      const probeEnd = performance.now();
      
      const durationSec = (probeEnd - probeStart) / 1000;
      const sizeBits = blob.size * 8;
      const calculatedMbps = durationSec > 0 ? (sizeBits / durationSec / (1024 * 1024)) : 0;
      const measuredRtt = Math.round(probeEnd - probeStart);

      if (downlink === null || calculatedMbps > 0) {
        downlink = calculatedMbps > 0 ? Number(calculatedMbps.toFixed(1)) : downlink;
      }
      if (rtt === null) {
        rtt = measuredRtt;
      }
    } catch (e) {
      // Fallback to navigator.connection
    }

    let tier = 'fast';
    let displaySpeed = '';

    if (downlink !== null && downlink > 0) {
      if (downlink >= 1.8 && (!rtt || rtt < 350)) {
        tier = 'fast';
        displaySpeed = `${downlink >= 10 ? Math.round(downlink) : downlink} Mbps`;
      } else if (downlink >= 0.6 || (effectiveType === '3g' && (!rtt || rtt < 600))) {
        tier = 'moderate';
        displaySpeed = `${downlink} Mbps`;
      } else {
        tier = 'slow';
        displaySpeed = `${downlink} Mbps (Slow)`;
      }
    } else if (effectiveType) {
      if (effectiveType === '4g') {
        tier = 'fast';
        displaySpeed = '4G · Fast';
      } else if (effectiveType === '3g') {
        tier = 'moderate';
        displaySpeed = '3G · Moderate';
      } else {
        tier = 'slow';
        displaySpeed = `${effectiveType.toUpperCase()} · Slow`;
      }
    } else {
      tier = 'fast';
      displaySpeed = 'Online';
    }

    // Update UI badge
    dot.className = `net-dot ${tier}`;
    speedVal.textContent = displaySpeed;

    const rttText = rtt ? ` | Latency: ${rtt}ms` : '';
    badge.title = `Network Status: ${tier.toUpperCase()} (${displaySpeed}${rttText})`;

    if (tier === 'slow') {
      showAdvisoryBanner(displaySpeed);
    } else {
      hideAdvisoryBanner();
    }

    isTesting = false;
  }

  function showAdvisoryBanner(speedText) {
    if (!banner) return;
    const isDismissed = sessionStorage.getItem('josh_net_advisory_dismissed') === 'true';
    if (isDismissed) return;

    if (speedReadout) speedReadout.textContent = speedText || 'Limited Bandwidth';
    banner.classList.add('open');
  }

  function hideAdvisoryBanner() {
    if (!banner) return;
    banner.classList.remove('open');
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      hideAdvisoryBanner();
      sessionStorage.setItem('josh_net_advisory_dismissed', 'true');
      playAudioEffect('click');
    });
  }

  if (retestBtn) {
    retestBtn.addEventListener('click', () => {
      speedVal.textContent = 'Probing...';
      playAudioEffect('click');
      measureNetworkSpeed();
    });
  }

  if (badge) {
    badge.addEventListener('click', () => {
      speedVal.textContent = 'Probing...';
      playAudioEffect('click');
      measureNetworkSpeed();
    });
  }

  // Initial measurement & event listeners
  setTimeout(measureNetworkSpeed, 600);

  const navConn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (navConn) {
    navConn.addEventListener('change', measureNetworkSpeed);
  }
  window.addEventListener('online', measureNetworkSpeed);
  window.addEventListener('offline', measureNetworkSpeed);

  // Periodic background telemetry check every 25 seconds
  setInterval(measureNetworkSpeed, 25000);
}

/* ════════════════════════════════════════════════════════
   Neural Audio & Text-to-Speech (TTS) Engine
   ════════════════════════════════════════════════════════ */

const SECTION_NARRATIVES = {
  hero: "Greetings and welcome. I am Idowu Joshua Victor, also known as Josh_d_Guru — a software developer, creative designer, and data scientist based in Lagos, Nigeria. I bridge interactive user interface engineering, brand design, and statistical data pipelines into cohesive digital experiences.",
  about: "Joshua started his creative path in 2018 as a graphic designer, advancing into front-end engineering in 2023 and studying Statistics at Olabisi Onabanjo University. He architects responsive web applications, brand identities, and predictive data models that combine mathematical rigor with elegant user experiences.",
  skills: "Joshua's core technical toolkit spans modern JavaScript, React, and Python, complemented by graphic design mastery in CorelDraw, Figma, and Adobe Suite, plus statistical modeling with R, SPSS, and predictive machine learning algorithms.",
  services: "Explore bespoke services and scalable consulting plans, spanning custom front-end web applications, full brand identity packages, data science dashboards, and AI pipeline automations tailored to launch your next venture.",
  'guru-ai': "Guru AI Companion is Joshua's flagship developer and builder co-pilot. Engineered with autonomous cognitive architecture, client-side session caching, and cybernetic signal decryption protocols, it guides founders from ideation to production.",
  projects: "Explore Joshua's curated portfolio of production web applications, AI sandboxes, fintech engines, and creative branding cases built for clients and African innovators.",
  certifications: "Explore Joshua's accredited certifications and verified technical credentials spanning frontend engineering, data analytics, and computational systems.",
  startup: "GuruLabs is a parent tech ecosystem engineering next-generation software assets. Flagship ventures include Kudiflow, an intelligent financial tracker for youths, and ScholarLens, an AI academic research sandbox.",
  location: "Operating out of Lagos Core Node at coordinates 6.5244 degrees North, 3.3792 degrees East. Joshua is actively available for global remote contracts and technical consultations worldwide.",
  blog: "Dive into insights and technical writings covering frontend engineering, predictive data modeling, and modern web application architecture.",
  contact: "Direct communication transmission channels are active. Reach out via email, phone, or GitHub to initiate your next project collaboration or technical consultation."
};

const SECTION_TITLES = {
  hero: "Hero Introduction",
  about: "About Joshua",
  skills: "Technical Arsenal",
  services: "Services & Plans",
  'guru-ai': "Guru AI Architecture",
  projects: "Featured Projects",
  certifications: "Verified Credentials",
  startup: "GuruLabs Ecosystem",
  location: "Lagos Telemetry Node",
  blog: "Insights & Articles",
  contact: "Transmission Protocol"
};

let activeUtterance = null;
let currentVoice = null;
let activeVoiceBtn = null;
let isVoicePaused = false;

function initNeuralTTS() {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech Synthesis not supported by browser.');
    return;
  }

  const synth = window.speechSynthesis;
  const pill = document.getElementById('voiceWavePill');
  const pillTitle = document.getElementById('vwpTitle');
  const pauseBtn = document.getElementById('vwpPauseBtn');
  const stopBtn = document.getElementById('vwpStopBtn');

  // Load and pick premium natural voices
  function loadVoices() {
    const voices = synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prioritize natural English voices
    currentVoice = voices.find(v => v.lang.startsWith('en') && (
      v.name.includes('Natural') || 
      v.name.includes('Google') || 
      v.name.includes('Samantha') || 
      v.name.includes('Guy') || 
      v.name.includes('Ryan') || 
      v.name.includes('Male') || 
      v.name.includes('Daniel')
    )) || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function stopSpeech() {
    synth.cancel();
    if (activeVoiceBtn) {
      activeVoiceBtn.classList.remove('speaking');
      activeVoiceBtn = null;
    }
    document.querySelectorAll('.section-voice-btn.speaking, .gad-bubble-tts-btn.speaking').forEach(b => b.classList.remove('speaking'));
    if (pill) {
      pill.classList.remove('active', 'paused');
    }
    isVoicePaused = false;
    if (pauseBtn) pauseBtn.textContent = '❚❚';
    activeUtterance = null;
  }

  function speakText(text, title = 'Neural Voice', sourceBtn = null) {
    stopSpeech();

    // Clean text of markdown / html tags
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/[*_#`]/g, '').trim();
    if (!cleanText) return;

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 1.02;
    utter.pitch = 1.0;
    if (currentVoice) utter.voice = currentVoice;

    activeUtterance = utter;
    activeVoiceBtn = sourceBtn;

    if (sourceBtn) sourceBtn.classList.add('speaking');
    if (pill) {
      if (pillTitle) pillTitle.textContent = title;
      pill.classList.add('active');
      pill.classList.remove('paused');
    }

    utter.onend = () => {
      stopSpeech();
    };

    utter.onerror = () => {
      stopSpeech();
    };

    // Play subtle synth frequency cue
    if (typeof playAudioEffect === 'function') {
      playAudioEffect('click');
    }

    synth.speak(utter);
  }

  // Bind Section Voice Buttons
  const sectionBtns = document.querySelectorAll('.section-voice-btn');
  sectionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const secKey = btn.getAttribute('data-tts');
      const narrative = SECTION_NARRATIVES[secKey];
      const title = SECTION_TITLES[secKey] || 'Section Briefing';

      if (btn.classList.contains('speaking')) {
        stopSpeech();
      } else if (narrative) {
        speakText(narrative, title, btn);
      }
    });
  });

  // Floating Wave Pill Controls
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (!synth.speaking) return;
      if (isVoicePaused) {
        synth.resume();
        isVoicePaused = false;
        pauseBtn.textContent = '❚❚';
        if (pill) pill.classList.remove('paused');
      } else {
        synth.pause();
        isVoicePaused = true;
        pauseBtn.textContent = '▶';
        if (pill) pill.classList.add('paused');
      }
      playAudioEffect('click');
    });
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      stopSpeech();
      playAudioEffect('click');
    });
  }

  // Expose global methods
  window.joshTTS = {
    speak: speakText,
    stop: stopSpeech,
    isSpeaking: () => synth.speaking
  };
}



