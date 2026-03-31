/* ════════════════════════════════════════════════════════
   Josh_d_Guru — Portfolio Script
   Firebase Firestore integration + localStorage fallback
   ════════════════════════════════════════════════════════ */

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
  });
  el.addEventListener('mouseleave',()=>{
    if(cursor){cursor.style.width='8px';cursor.style.height='8px';}
    if(cursorTrail){cursorTrail.style.width='32px';cursorTrail.style.height='32px';}
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
  const thumbHtml = project.image
    ? `<img src="${project.image}" alt="${project.title}" loading="lazy"/>`
    : `<div class="project-thumb-placeholder">${project.emoji||'🚀'}</div>`;

  const overlayBtns = [
    project.liveUrl ? `<a href="${project.liveUrl}" class="overlay-btn" target="_blank" rel="noopener">Live ↗</a>` : '',
    project.repoUrl ? `<a href="${project.repoUrl}" class="overlay-btn ghost" target="_blank" rel="noopener">Repo</a>` : ''
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
  return card;
}

/* ─── Render Projects ────────────────────────────────── */
let allAdminProjects = [];
function renderProjects(filter='all'){
  const grid = document.getElementById('projectsGrid');
  const note = document.getElementById('adminNote');
  if(!grid) return;
  grid.innerHTML = '';
  const combined = [...allAdminProjects]; // Only show admin projects after removing demos
  let shown = 0;
  combined.forEach(p=>{
    if(filter==='all' || p.category===filter){
      grid.appendChild(buildCard(p)); shown++;
    }
  });
  if(shown===0){
    grid.innerHTML='<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:3rem;font-family:var(--font-mono);font-size:.85rem;">No projects in this category yet.</p>';
  }
  if(note && allAdminProjects.length>0){
    note.textContent = `✦ ${allAdminProjects.length} project${allAdminProjects.length>1?'s':''} added via admin panel`;
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

/* ─── Load Projects from Firebase or localStorage ────── */
async function loadAdminProjects(){
  const loading = document.getElementById('projectsLoading');
  const { db, firebaseReady } = window.joshFirebase || {};

  if(firebaseReady && db){
    try{
      const snap = await db.collection('projects')
        .orderBy('createdAt','desc').get();
      allAdminProjects = snap.docs.map(d=>({ id:d.id, ...d.data() }));
    } catch(err){
      console.warn('Firestore read failed, using localStorage:', err);
      allAdminProjects = getLocalProjects();
    }
  } else {
    allAdminProjects = getLocalProjects();
  }

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
document.querySelectorAll('.about-card,.contact-link,.skill-item,.project-card').forEach(el=>{
  el.style.cssText += 'opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease;';
  fadeObs.observe(el);
});

/* ─── Init ───────────────────────────────────────────── */
loadAdminProjects();
