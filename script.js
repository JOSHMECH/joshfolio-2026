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
function closeMenu(){
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded','false');
  menuOvl.classList.remove('visible');
  document.body.style.overflow = '';
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
  let thumbHtml = '';
  if (project.isGitHubRepo && !project.image) {
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
          <span class="gh-preview-name">${project.title}</span>
          <span class="gh-preview-bracket">]</span>
        </div>
        <div class="gh-preview-footer">
          <span>github.com/JOSHMECH</span>
        </div>
      </div>`;
  } else {
    thumbHtml = project.image
      ? `<img src="${project.image}" alt="${project.title}" loading="lazy"/>`
      : `<div class="curated-preview-thumb">
          <div class="cp-grid"></div>
          <div class="cp-orb"></div>
          <div class="cp-header">
            <span class="cp-category">${project.categoryLabel || project.category || 'Project'}</span>
            <span class="cp-badge">${project.emoji || '✦'}</span>
          </div>
          <div class="cp-title-block">
            <span class="cp-bracket">❖</span>
            <span class="cp-name">${project.title}</span>
          </div>
          <div class="cp-footer">
            <span class="cp-stack">${(project.stack || []).slice(0, 3).join(' · ') || 'Curated Project'}</span>
          </div>
        </div>`;
  }

  const repoLink = project.isGitHubRepo
    ? `private.html?repo=${encodeURIComponent(project.title)}&live=${(project.isOverridden && project.liveUrl) ? encodeURIComponent(project.liveUrl) : ''}`
    : project.repoUrl;

  let liveBtnHtml = '';
  if (project.isGitHubRepo && !project.isOverridden) {
    liveBtnHtml = `<span class="overlay-btn disabled-btn">Demo Not Live</span>`;
  } else if (project.liveUrl) {
    liveBtnHtml = `<a href="${project.liveUrl}" class="overlay-btn" target="_blank" rel="noopener">Live ↗</a>`;
  }

  const overlayBtns = [
    liveBtnHtml,
    repoLink ? `<a href="${repoLink}" class="overlay-btn ghost" target="_blank" rel="noopener">Repo</a>` : ''
  ].filter(Boolean).join('');

  const stackHtml = (project.stack||[]).map(s=>`<span class="stack-tag">${s}</span>`).join('');
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
      <h3 class="project-title">${project.title}</h3>
      <p class="project-desc">${project.desc}</p>
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
  const { db, firebaseReady } = window.joshFirebase || {};

  let firebaseProjects = [];
  if(firebaseReady && db){
    try{
      const snap = await db.collection('projects')
        .orderBy('createdAt','desc').get();
      firebaseProjects = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    } catch(err){
      console.warn('Firestore read failed, using localStorage:', err);
      firebaseProjects = getLocalProjects();
    }
  } else {
    firebaseProjects = getLocalProjects();
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
  const localProjects = getLocalProjects();
  const mergedCurated = mergeProjects(firebaseProjects, localProjects);

  // Merge: Curated projects take precedence.
  const firebaseRepos = new Set(
    mergedCurated
      .map(p => normalizeRepoUrl(p.repoUrl))
      .filter(Boolean)
  );

  const filteredGitHub = githubProjects.filter(gh => {
    const url = normalizeRepoUrl(gh.repoUrl);
    return !firebaseRepos.has(url);
  });

  // Combine lists: curated projects first, then github repositories
  allAdminProjects = [...mergedCurated, ...filteredGitHub];

  if(loading) loading.style.display='none';
  renderProjects('all');
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

/* ─── Brand Identity Playground SVG Customizer ──────── */
/* ─── Brand Identity Playground SVG Customizer ──────── */
function initDesignPlayground() {
  const svgWrap = document.getElementById('svgWrap');
  if (!svgWrap) return;
  
  const symbolSelect = document.getElementById('pg-symbol');
  const frameSelect = document.getElementById('pg-frame');
  const textInput = document.getElementById('pg-text');
  
  const rotSlider = document.getElementById('pg-rotate');
  const rotVal = document.getElementById('pg-rotate-val');
  
  const scaleSlider = document.getElementById('pg-scale');
  const scaleVal = document.getElementById('pg-scale-val');
  
  const strokeSlider = document.getElementById('pg-stroke');
  const strokeVal = document.getElementById('pg-stroke-val');
  
  const glowSlider = document.getElementById('pg-glow');
  const glowVal = document.getElementById('pg-glow-val');
  
  const hueSlider = document.getElementById('pg-hue');
  const hueVal = document.getElementById('pg-hue-val');
  
  const exportBtn = document.getElementById('exportSvgBtn');
  
  // Presets
  const presets = {
    gold: {
      hue: 38,
      symbol: 'apex',
      frame: 'hexagon',
      scale: 1.0,
      rotate: 0,
      strokeWidth: 12,
      glowIntensity: 8,
      text: 'JOSH'
    },
    lagos: {
      hue: 155,
      symbol: 'hacker',
      frame: 'shield',
      scale: 1.1,
      rotate: 45,
      strokeWidth: 10,
      glowIntensity: 12,
      text: 'LGS'
    },
    ai: {
      hue: 280,
      symbol: 'star',
      frame: 'hexagon',
      scale: 0.95,
      rotate: 90,
      strokeWidth: 8,
      glowIntensity: 15,
      text: 'CORE'
    },
    minimal: {
      hue: 200,
      symbol: 'wave',
      frame: 'circle',
      scale: 1.0,
      rotate: -45,
      strokeWidth: 6,
      glowIntensity: 0,
      text: 'DEV'
    }
  };

  let rotate = 0;
  let scale = 1.0;
  let strokeWidth = 12;
  let glowIntensity = 8;
  let hue = 38;
  let symbol = 'apex';
  let frame = 'hexagon';
  let textInitials = 'JOSH';
  
  function updateSVG() {
    const colorStart = `hsl(${hue}, 85%, 60%)`;
    const colorEnd = `hsl(${(hue + 60) % 360}, 90%, 70%)`;
    
    // Frame markup
    let frameMarkup = '';
    if (frame === 'hexagon') {
      frameMarkup = `
      <polygon points="100,18 171,59 171,141 100,182 29,141 29,59" fill="none" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" stroke-linejoin="round" filter="url(#logoGlow)" />
      <polygon points="100,24 166,62 166,138 100,176 34,138 34,62" fill="none" stroke="url(#logoGrad)" stroke-width="1" opacity="0.3" />`;
    } else if (frame === 'circle') {
      frameMarkup = `
      <circle cx="100" cy="100" r="82" fill="none" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" filter="url(#logoGlow)" />
      <circle cx="100" cy="100" r="76" fill="none" stroke="url(#logoGrad)" stroke-width="1" stroke-dasharray="4 4" opacity="0.4" />`;
    } else if (frame === 'shield') {
      frameMarkup = `
      <path d="M 100,18 C 135,18 171,28 171,58 C 171,118 141,162 100,182 C 59,162 29,118 29,58 C 29,28 65,18 100,18 Z" fill="none" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" stroke-linejoin="round" filter="url(#logoGlow)" />
      <path d="M 100,24 C 131,24 165,33 165,60 C 165,114 137,155 100,174 C 63,155 35,114 35,60 C 35,33 69,24 100,24 Z" fill="none" stroke="url(#logoGrad)" stroke-width="1" opacity="0.3" />`;
    }

    // Symbol markup
    let symbolMarkup = '';
    if (symbol === 'apex') {
      symbolMarkup = `
      <g transform="translate(100, 95) rotate(${rotate}) scale(${scale})">
        <circle cx="0" cy="0" r="${strokeWidth * 1.5}" fill="url(#logoGrad)" opacity="0.15" />
        <circle cx="0" cy="0" r="${strokeWidth * 0.8}" fill="url(#logoGrad)" />
        <line x1="0" y1="0" x2="0" y2="-38" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" stroke-linecap="round" />
        <line x1="0" y1="0" x2="-33" y2="23" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" stroke-linecap="round" />
        <line x1="0" y1="0" x2="33" y2="23" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" stroke-linecap="round" />
        <circle cx="0" cy="-38" r="${strokeWidth * 0.6}" fill="#080808" stroke="url(#logoGrad)" stroke-width="2.5" />
        <circle cx="-33" cy="23" r="${strokeWidth * 0.6}" fill="#080808" stroke="url(#logoGrad)" stroke-width="2.5" />
        <circle cx="33" cy="23" r="${strokeWidth * 0.6}" fill="#080808" stroke="url(#logoGrad)" stroke-width="2.5" />
      </g>`;
    } else if (symbol === 'hacker') {
      symbolMarkup = `
      <g transform="translate(100, 95) rotate(${rotate}) scale(${scale})">
        <circle cx="0" cy="0" r="38" fill="none" stroke="url(#logoGrad)" stroke-width="${strokeWidth * 0.4}" stroke-dasharray="6 6" />
        <circle cx="0" cy="0" r="22" fill="none" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" />
        <circle cx="0" cy="0" r="${strokeWidth * 0.8}" fill="url(#logoGrad)" />
        <line x1="-45" y1="0" x2="-30" y2="0" stroke="url(#logoGrad)" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round" />
        <line x1="30" y1="0" x2="45" y2="0" stroke="url(#logoGrad)" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round" />
        <line x1="0" y1="-45" x2="0" y2="-30" stroke="url(#logoGrad)" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round" />
        <line x1="0" y1="30" x2="0" y2="45" stroke="url(#logoGrad)" stroke-width="${strokeWidth * 0.6}" stroke-linecap="round" />
      </g>`;
    } else if (symbol === 'star') {
      symbolMarkup = `
      <g transform="translate(100, 95) rotate(${rotate}) scale(${scale})">
        <path d="M 0,-42 Q 0,0 -42,0 Q 0,0 0,42 Q 0,0 42,0 Q 0,0 0,-42 Z" fill="url(#logoGrad)" />
        <circle cx="0" cy="0" r="${strokeWidth * 1.1}" fill="#080808" stroke="url(#logoGrad)" stroke-width="2.5" />
        <circle cx="0" cy="0" r="${strokeWidth * 0.6}" fill="url(#logoGrad)" />
      </g>`;
    } else if (symbol === 'wave') {
      symbolMarkup = `
      <g transform="translate(100, 95) rotate(${rotate}) scale(${scale})">
        <path d="M -38,-12 Q -19,15 0,-12 T 38,-12" fill="none" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" stroke-linecap="round" />
        <path d="M -38,12 Q -19,-15 0,12 T 38,12" fill="none" stroke="url(#logoGrad)" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="0.6" />
        <circle cx="-19" cy="0" r="${strokeWidth * 0.6}" fill="url(#logoGrad)" />
        <circle cx="19" cy="0" r="${strokeWidth * 0.6}" fill="url(#logoGrad)" />
      </g>`;
    }

    // Centered Initials Text at the bottom third
    const sanitizedText = (textInitials || '').trim().toUpperCase();
    const textMarkup = sanitizedText ? `
      <!-- Ribbon backdrop -->
      <rect x="50" y="146" width="100" height="24" rx="4" fill="#080808" opacity="0.8" />
      <text x="100" y="162" fill="var(--text)" font-family="var(--font-mono)" font-size="14" font-weight="700" letter-spacing="3" text-anchor="middle" filter="url(#logoGlow)">${sanitizedText}</text>
      <text x="100" y="162" fill="var(--text)" font-family="var(--font-mono)" font-size="14" font-weight="700" letter-spacing="3" text-anchor="middle">${sanitizedText}</text>
    ` : '';

    const svgCode = `
<svg id="playgroundSVG" width="220" height="220" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorStart}" id="gradStart" />
      <stop offset="100%" stop-color="${colorEnd}" id="gradEnd" />
    </linearGradient>
    <filter id="logoGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${glowIntensity}" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  
  <!-- Outer badge frame border -->
  ${frameMarkup}
  
  <!-- Central Symbol -->
  ${symbolMarkup}
  
  <!-- Initials Text -->
  ${textMarkup}
</svg>
    `;
    
    svgWrap.innerHTML = svgCode.trim();
  }
  
  // Custom Controls listeners
  if (symbolSelect) {
    symbolSelect.addEventListener('change', (e) => {
      symbol = e.target.value;
      updateSVG();
      playAudioEffect('click');
      // Deselect presets
      document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
    });
  }
  
  if (frameSelect) {
    frameSelect.addEventListener('change', (e) => {
      frame = e.target.value;
      updateSVG();
      playAudioEffect('click');
      // Deselect presets
      document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
    });
  }
  
  if (textInput) {
    textInput.addEventListener('input', (e) => {
      textInitials = e.target.value;
      updateSVG();
      if (textInitials.length > 0) {
        playAudioEffect('hover');
      }
      // Deselect presets
      document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
    });
  }
  
  if (rotSlider && rotVal) {
    rotSlider.addEventListener('input', (e) => {
      rotate = parseInt(e.target.value);
      rotVal.textContent = `${rotate}°`;
      updateSVG();
    });
  }
  
  if (scaleSlider && scaleVal) {
    scaleSlider.addEventListener('input', (e) => {
      scale = (parseInt(e.target.value) / 100).toFixed(2);
      scaleVal.textContent = `${parseFloat(scale).toFixed(1)}x`;
      updateSVG();
    });
  }
  
  if (strokeSlider && strokeVal) {
    strokeSlider.addEventListener('input', (e) => {
      strokeWidth = parseInt(e.target.value);
      strokeVal.textContent = `${strokeWidth}px`;
      updateSVG();
    });
  }
  
  if (glowSlider && glowVal) {
    glowSlider.addEventListener('input', (e) => {
      glowIntensity = parseInt(e.target.value);
      glowVal.textContent = `${glowIntensity}px`;
      updateSVG();
    });
  }
  
  if (hueSlider && hueVal) {
    hueSlider.addEventListener('input', (e) => {
      hue = parseInt(e.target.value);
      hueVal.textContent = `${hue}°`;
      updateSVG();
    });
  }
  
  // Preset Buttons
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const presetName = e.target.dataset.preset;
      const config = presets[presetName];
      if (!config) return;
      
      playAudioEffect('click');
      
      // Update state
      hue = config.hue;
      symbol = config.symbol;
      frame = config.frame;
      scale = config.scale;
      rotate = config.rotate;
      strokeWidth = config.strokeWidth;
      glowIntensity = config.glowIntensity;
      textInitials = config.text;
      
      // Update UI Controls
      if (symbolSelect) symbolSelect.value = symbol;
      if (frameSelect) frameSelect.value = frame;
      if (textInput) textInput.value = textInitials;
      
      if (rotSlider) rotSlider.value = rotate;
      if (rotVal) rotVal.textContent = `${rotate}°`;
      
      if (scaleSlider) scaleSlider.value = Math.round(scale * 100);
      if (scaleVal) scaleVal.textContent = `${scale}x`;
      
      if (strokeSlider) strokeSlider.value = strokeWidth;
      if (strokeVal) strokeVal.textContent = `${strokeWidth}px`;
      
      if (glowSlider) glowSlider.value = glowIntensity;
      if (glowVal) glowVal.textContent = `${glowIntensity}px`;
      
      if (hueSlider) hueSlider.value = hue;
      if (hueVal) hueVal.textContent = `${hue}°`;
      
      // Toggle active class
      document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      updateSVG();
    });
  });
  
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const svgElement = svgWrap.querySelector('svg');
      if (!svgElement) return;
      
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);
      
      if(!source.startsWith('<?xml')) {
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
      }
      
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `josh_badge_${textInitials.toLowerCase() || 'dev'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      playAudioEffect('chord');
    });
  }
  
  updateSVG();
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
      "INTEGRATIONS: Gemini AI, Supabase, Cloud Firestore"
    ],
    globe: () => [
      "LOCATION TELEMETRY SYSTEM:",
      "------------------------------------",
      "HEADQUARTERS: Lagos, Nigeria",
      "COORDINATES: 6.5244° N, 3.3792° E",
      "RADAR SCAN: 3D Holographic Canvas Active",
      "DOTTED GRID NODES: 852 landmass coordinates projected",
      "SPIN STATE: Drag interaction enabled"
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
      
      const dbStr = (window.joshFirebase && window.joshFirebase.firebaseReady) ? "Cloud Firestore (Connected)" : "Local Storage Fallback";
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

/* ─── 3D Dotted Location Globe ───────────────────────── */
function initLocationGlobe() {
  const canvas = document.getElementById('locationGlobe');
  const tooltip = document.getElementById('globeTooltip');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const radius = 110;
  const cameraDistance = 330;
  
  const dpr = window.devicePixelRatio || 1;
  const width = 360;
  const height = 360;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  
  const cx = width / 2;
  const cy = height / 2;
  
  function isLand(lat, lon) {
    if (lat >= -35 && lat <= 35 && lon >= -17 && lon <= 51) {
      if (lat < 5 && lon < 8) return false;
      if (lat > 18 && lon > 33 && lat < 30 && lon < 45) return false;
      return true;
    }
    if (lat >= 36 && lat <= 70 && lon >= -10 && lon <= 45) {
      if (lat > 60 && lon < 5) return false;
      if (lat < 42 && lon > 25 && lon < 35) return false;
      return true;
    }
    if (lat >= 5 && lat <= 75 && lon >= 45 && lon <= 180) {
      if (lat < 30 && lon < 60 && lat > 12) return true;
      if (lat < 8 && lon < 95) return false;
      return true;
    }
    if (lat >= -10 && lat <= 8 && lon >= 95 && lon <= 150) {
      return true;
    }
    if (lat >= -44 && lat <= -10 && lon >= 113 && lon <= 154) {
      return true;
    }
    if (lat >= 15 && lat <= 75 && lon >= -168 && lon <= -52) {
      if (lat < 25 && lon > -85) return false;
      return true;
    }
    if (lat >= 60 && lat <= 83 && lon >= -75 && lon <= -15) {
      return true;
    }
    if (lat >= -56 && lat <= 12 && lon >= -92 && lon <= -34) {
      if (lat > 5 && lon < -75) return false;
      if (lat < -20 && lon > -40) return false;
      return true;
    }
    if (lat <= -60) {
      return true;
    }
    return false;
  }
  
  const points = [];
  for (let lat = -80; lat <= 80; lat += 4.5) {
    const radLat = lat * Math.PI / 180;
    const cosLat = Math.cos(radLat);
    const lonStep = cosLat > 0.1 ? 4.5 / cosLat : 90;
    for (let lon = -180; lon < 180; lon += lonStep) {
      if (isLand(lat, lon)) {
        points.push({
          x: radius * Math.cos(radLat) * Math.sin(lon * Math.PI / 180),
          y: -radius * Math.sin(radLat),
          z: radius * Math.cos(radLat) * Math.cos(lon * Math.PI / 180)
        });
      }
    }
  }
  
  const lagosLat = 6.5244;
  const lagosLon = 3.3792;
  const lagosRadLat = lagosLat * Math.PI / 180;
  const lagosRadLon = lagosLon * Math.PI / 180;
  const lagosPt = {
    x: radius * Math.cos(lagosRadLat) * Math.sin(lagosRadLon),
    y: -radius * Math.sin(lagosRadLat),
    z: radius * Math.cos(lagosRadLat) * Math.cos(lagosRadLon)
  };
  
  let angleY = 1.6;
  let angleX = 0.25;
  
  let isDragging = false;
  let lastX = 0;
  let lastY = 0;
  let velY = 0;
  let velX = 0;
  
  function getEventPos(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }
  
  function handleStart(e) {
    isDragging = true;
    const pos = getEventPos(e);
    lastX = pos.x;
    lastY = pos.y;
    velX = 0;
    velY = 0;
    canvas.style.cursor = 'grabbing';
  }
  
  function handleMove(e) {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    const pos = getEventPos(e);
    const dx = pos.x - lastX;
    const dy = pos.y - lastY;
    
    velY = dx * 0.004;
    velX = dy * 0.004;
    
    angleY += velY;
    angleX += velX;
    angleX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angleX));
    
    lastX = pos.x;
    lastY = pos.y;
  }
  
  function handleEnd() {
    isDragging = false;
    canvas.style.cursor = 'grab';
  }
  
  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
  
  canvas.addEventListener('touchstart', handleStart, { passive: false });
  canvas.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
  
  function render() {
    ctx.clearRect(0, 0, width, height);
    
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.3);
    glow.addColorStop(0, 'rgba(200, 169, 110, 0.03)');
    glow.addColorStop(0.8, 'rgba(200, 169, 110, 0.005)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200, 169, 110, 0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    if (!isDragging) {
      velY *= 0.95;
      velX *= 0.95;
      angleY += 0.0018 + velY;
      angleX += velX;
      angleX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angleX));
    }
    
    const projected = [];
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    
    points.forEach(p => {
      const x1 = p.x * cosY - p.z * sinY;
      const z1 = p.x * sinY + p.z * cosY;
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;
      
      const scale = cameraDistance / (cameraDistance - z2);
      projected.push({
        x: cx + x1 * scale,
        y: cy + y2 * scale,
        z: z2,
        scale: scale
      });
    });
    
    projected.sort((a, b) => a.z - b.z);
    
    projected.forEach(p => {
      ctx.beginPath();
      const isFront = p.z > 0;
      const r = (isFront ? 1.1 : 0.75) * p.scale;
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      
      if (isFront) {
        const opacity = 0.15 + (p.z / radius) * 0.45;
        ctx.fillStyle = `rgba(200, 169, 110, ${opacity})`;
      } else {
        ctx.fillStyle = 'rgba(200, 169, 110, 0.05)';
      }
      ctx.fill();
    });
    
    const lx1 = lagosPt.x * cosY - lagosPt.z * sinY;
    const lz1 = lagosPt.x * sinY + lagosPt.z * cosY;
    const ly2 = lagosPt.y * cosX - lz1 * sinX;
    const lz2 = lagosPt.y * sinX + lz1 * cosX;
    
    const isLagosFront = lz2 > 0;
    if (isLagosFront) {
      const lScale = cameraDistance / (cameraDistance - lz2);
      const lpx = cx + lx1 * lScale;
      const lpy = cy + ly2 * lScale;
      
      const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.3;
      
      ctx.beginPath();
      ctx.arc(lpx, lpy, 8 * pulse * lScale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200, 169, 110, 0.8)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(lpx, lpy, 3.5 * lScale, 0, Math.PI * 2);
      ctx.fillStyle = '#FAF6EE';
      ctx.shadowColor = '#C8A96E';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      if (tooltip) {
        tooltip.innerHTML = `Lagos, Nigeria <span style="color:var(--gold); opacity:0.65; margin-left:6px;">[6.5° N, 3.4° E]</span>`;
        tooltip.style.opacity = '1';
      }
    } else {
      if (tooltip) {
        tooltip.innerHTML = `Lagos, Nigeria <span style="color:var(--text-muted); opacity:0.4; margin-left:6px;">(rotated behind)</span>`;
        tooltip.style.opacity = '0.5';
      }
    }
    
    requestAnimationFrame(render);
  }
  
  render();
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
      dbNode.innerHTML = '<span class="tel-dot pulsing"></span> CLOUD_FIREBASE';
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
initDesignPlayground();
initTerminalCLI();
initMagneticAndParallax();
loadAdminProjects();
initLocationGlobe();
initStartupWaitlist();
initStartupMetrics();
initInteractiveMockups();
initSocialSettings();

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
