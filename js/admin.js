/* ════════════════════════════════════════════════════════
   JoshFolio CMS — Admin Dashboard JavaScript
   Firebase Auth, Storage, and Firestore integrations.
   ════════════════════════════════════════════════════════ */

// Firebase References
function getDB() { return (window.joshFirebase || {}).db; }
function getAuth() { return (window.joshFirebase || {}).auth; }
function getStorage() { return (window.joshFirebase || {}).storage; }
function fbReady() { return !!(window.joshFirebase && window.joshFirebase.firebaseReady); }

// Global States
let activeView = 'overview';
let cachedProjects = [];
let cachedServices = [];
let cachedPlans = [];
let cachedTestimonials = [];
let cachedBlogs = [];
let cachedMessages = [];
let cachedGitHubRepos = [];
let deleteTarget = { id: null, type: null };

// Temporary upload blobs
let projectCoverBlob = null;
let testimonialAvatarBlob = null;
let aboutPhotoBlob = null;
let blogImgBlob = null;
let ghOverrideBlob = null;

// Initial Setup Check & Auth Listener
document.addEventListener('DOMContentLoaded', () => {
  if (!fbReady()) {
    showToast('⚠ Firebase not connected. Check console.', true);
    updateFirebaseStatus(false);
    return;
  }
  updateFirebaseStatus(true);
  
  // Auth state monitor
  getAuth().onAuthStateChanged(user => {
    if (user) {
      document.getElementById('userInitial').textContent = (user.email || 'A').substring(0, 2).toUpperCase();
      document.getElementById('userInitialSm').textContent = (user.email || 'A').substring(0, 2).toUpperCase();
      showDashboard();
    } else {
      showLogin();
    }
  });

  // Setup event triggers
  initEventTriggers();
});

function updateFirebaseStatus(ready) {
  const dot = document.getElementById('fbDot');
  const label = document.getElementById('fbLabel');
  if (ready) {
    dot.className = 'fb-dot connected';
    label.textContent = 'Firestore Connected';
  } else {
    dot.className = 'fb-dot error';
    label.textContent = 'Connection Offline';
  }
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}

async function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'flex';
  showToast('✓ Session verified.');
  switchView(activeView);
  await refreshDashboardData();
}

async function refreshDashboardData() {
  if (!fbReady()) return;
  try {
    await Promise.all([
      loadProjects(),
      loadServices(),
      loadPlans(),
      loadTestimonials(),
      loadBlogs(),
      loadMessages()
    ]);
    updateDashboardStats();
    loadActivityLogs();
  } catch (err) {
    console.error('Error refreshing data:', err);
  }
}

// ─── VIEW SWITCHING ────────────────────────────────────
function switchView(viewId) {
  activeView = viewId;
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.snav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.view === viewId);
  });

  const pageTitle = document.getElementById('pageTitle');
  const pageSub = document.getElementById('pageSub');

  const titles = {
    overview: 'Overview',
    projects: 'Project Showcase (CMS)',
    services: 'Services Catalog',
    pricing: 'Pricing Plans',
    testimonials: 'Client Feedback',
    about: 'About Profile Settings',
    blog: 'Blog Manager',
    messages: 'Inbox Messages',
    github: 'GitHub Repository Sync',
    email: 'Email Alert Settings'
  };

  const subtitles = {
    overview: 'Welcome to your central portfolio control panel.',
    projects: 'Create, modify, and feature your case studies.',
    services: 'Define your design and engineering service offerings.',
    pricing: 'Configure editable plan tiers and popular options.',
    testimonials: 'Manage client quotes, ratings, and avatars.',
    about: 'Update biography text, skills tags, timeline entries, and profile photo.',
    blog: 'Write and publish editorial insights with formatting.',
    messages: 'Review user contact queries in your email/inbox.',
    github: 'Sync public repositories and overlay customization links.',
    email: 'Enable dynamic EmailJS notifications for contact submissions.'
  };

  if (pageTitle) pageTitle.textContent = titles[viewId] || 'Dashboard';
  if (pageSub) pageSub.textContent = subtitles[viewId] || '';

  // View-specific loading hooks
  if (viewId === 'projects') renderProjectsList();
  if (viewId === 'services') renderServicesList();
  if (viewId === 'pricing') renderPlansList();
  if (viewId === 'testimonials') renderTestimonialsList();
  if (viewId === 'about') loadAboutForm();
  if (viewId === 'blog') renderBlogsList();
  if (viewId === 'messages') renderMessagesList();
  if (viewId === 'github') renderGitHubList();
  if (viewId === 'email') loadEmailSettingsForm();

  closeSidebar();
}

// Mobile sidebar controls
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarToggle.classList.add('open');
  sidebarOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarToggle.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

// ─── LOGIN & LOGOUT ────────────────────────────────────
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('lemail').value.trim();
    const pass = document.getElementById('lpass').value;

    if (!email || !pass) {
      loginError.textContent = '✕ Fill in both fields.';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Authenticating...';
    loginError.textContent = '';

    try {
      await getAuth().signInWithEmailAndPassword(email, pass);
      loginBtn.textContent = 'Entering...';
    } catch (err) {
      console.error(err);
      loginError.textContent = `✕ Auth Failed: ${err.message}`;
      loginBtn.disabled = false;
      loginBtn.textContent = 'Enter Dashboard →';
    }
  });
}

const passToggle = document.getElementById('passToggle');
if (passToggle) {
  passToggle.addEventListener('click', () => {
    const inp = document.getElementById('lpass');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await getAuth().signOut();
      showToast('Log out successful.');
    } catch (err) {
      showToast('Error during log out.', true);
    }
  });
}

// ─── STORAGE FILE UPLOAD HELPERS ───────────────────────
async function uploadFileToStorage(blob, folder, filename) {
  if (!blob || !fbReady()) return '';
  const ref = getStorage().ref().child(`${folder}/${filename}`);
  const snapshot = await ref.put(blob);
  return await snapshot.ref.getDownloadURL();
}

function resizeImageFile(file, maxW, maxH, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
      } else {
        if (h > maxH) {
          w = Math.round((w * maxH) / h);
          h = maxH;
        }
      }
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        callback(blob, canvas.toDataURL('image/jpeg', 0.8));
      }, 'image/jpeg', 0.8);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ─── SYSTEM LOGS ───────────────────────────────────────
async function logActivity(action, details) {
  if (!fbReady()) return;
  try {
    await getDB().collection('activity_logs').add({
      action,
      details,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      user: getAuth().currentUser.email
    });
  } catch (err) {
    console.warn('Logging activity failed:', err);
  }
}

async function loadActivityLogs() {
  const container = document.getElementById('recentActivityList');
  if (!container || !fbReady()) return;
  try {
    const snap = await getDB().collection('activity_logs')
      .orderBy('timestamp', 'desc')
      .limit(6)
      .get();
    container.innerHTML = '';
    
    if (snap.empty) {
      container.innerHTML = '<p class="empty-msg" style="padding:0;">No system logs available.</p>';
      return;
    }
    
    snap.forEach(doc => {
      const log = doc.data();
      const time = log.timestamp ? log.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';
      const div = document.createElement('div');
      div.className = 'activity-log';
      div.innerHTML = `<span class="act-time">[${time}]</span> <span class="act-desc">${log.action}: ${log.details}</span>`;
      container.appendChild(div);
    });
  } catch (err) {
    console.warn('Could not load activity logs:', err);
  }
}

// ─── STATS COUNTER ─────────────────────────────────────
function updateDashboardStats() {
  document.getElementById('statTotalProjects').textContent = cachedProjects.length;
  document.getElementById('statTotalServices').textContent = cachedServices.length;
  document.getElementById('statTotalTestimonials').textContent = cachedTestimonials.length;
  document.getElementById('statTotalBlog').textContent = cachedBlogs.length;
  
  const unreadMessages = cachedMessages.filter(m => !m.read).length;
  document.getElementById('statTotalMessages').textContent = unreadMessages;
}

// ─── PROJECTS CRUD IMPLEMENTATION ──────────────────────
async function loadProjects() {
  const snap = await getDB().collection('projects').orderBy('order', 'asc').get();
  cachedProjects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderProjectsList(search = '') {
  const grid = document.getElementById('projectsGrid');
  const emptyMsg = document.getElementById('projectsEmptyMsg');
  const sub = document.getElementById('projectsCountSub');
  
  grid.innerHTML = '';
  const filtered = cachedProjects.filter(p => 
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.categoryLabel.toLowerCase().includes(search.toLowerCase())
  );

  sub.textContent = `${filtered.length} project${filtered.length !== 1 ? 's' : ''} configured.`;

  if (filtered.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    const imagePreview = p.coverImage 
      ? `<img src="${p.coverImage}" alt="${p.title}" />` 
      : `<div style="font-size:2.5rem;">📁</div>`;
      
    card.innerHTML = `
      <div class="mc-thumb">${imagePreview}</div>
      <div class="mc-body">
        <p class="mc-cat">${p.categoryLabel} ${p.featured ? '<span style="color:var(--gold); font-size:0.6rem; border:1px solid var(--border); padding:0.05rem 0.2rem; border-radius:3px; margin-left:4px;">★ Featured</span>' : ''}</p>
        <h3 class="mc-title">${p.title}</h3>
        <p class="mc-desc">${p.description}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-proj-btn" data-id="${p.id}">Edit</button>
          <button class="btn-danger btn-sm del-proj-btn" data-id="${p.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-proj-btn').forEach(btn => {
    btn.addEventListener('click', () => editProjectForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-proj-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'project'));
  });
}

function editProjectForm(id) {
  const p = cachedProjects.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('projectFormPanel').style.display = 'block';
  document.getElementById('projectFormTitle').textContent = 'Edit Project Case Study';
  
  document.getElementById('projectId').value = p.id;
  document.getElementById('projTitle').value = p.title;
  document.getElementById('projSlug').value = p.slug;
  document.getElementById('projCategory').value = p.category;
  document.getElementById('projCatLabel').value = p.categoryLabel || '';
  document.getElementById('projDesc').value = p.description;
  document.getElementById('projLongDesc').value = p.longDescription;
  document.getElementById('projClient').value = p.client || '';
  document.getElementById('projDate').value = p.completionDate || '';
  document.getElementById('projUrl').value = p.projectUrl || '';
  document.getElementById('projRepo').value = p.repoUrl || '';
  document.getElementById('projTech').value = (p.technologies || []).join(', ');
  document.getElementById('projFeatured').checked = !!p.featured;
  document.getElementById('projStatus').value = p.status || 'published';

  // Preview cover
  if (p.coverImage) {
    document.getElementById('projCoverPreview').src = p.coverImage;
    document.getElementById('projCoverPreviewWrap').style.display = 'block';
    document.getElementById('projCoverDropZone').style.display = 'none';
  } else {
    document.getElementById('projCoverPreviewWrap').style.display = 'none';
    document.getElementById('projCoverDropZone').style.display = 'block';
  }
  projectCoverBlob = null;
  document.getElementById('projectFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── SERVICES CRUD IMPLEMENTATION ──────────────────────
async function loadServices() {
  const snap = await getDB().collection('services').orderBy('order', 'asc').get();
  cachedServices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderServicesList() {
  const grid = document.getElementById('servicesGrid');
  const empty = document.getElementById('servicesEmptyMsg');
  
  grid.innerHTML = '';
  if (cachedServices.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  cachedServices.forEach(s => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    card.innerHTML = `
      <div class="mc-thumb" style="background:var(--surface-2); font-size:3rem;">${s.icon}</div>
      <div class="mc-body">
        <p class="mc-cat">Starting Price: ${s.price}</p>
        <h3 class="mc-title">${s.name}</h3>
        <p class="mc-desc">${s.description}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-serv-btn" data-id="${s.id}">Edit</button>
          <button class="btn-danger btn-sm del-serv-btn" data-id="${s.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-serv-btn').forEach(btn => {
    btn.addEventListener('click', () => editServiceForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-serv-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'service'));
  });
}

function editServiceForm(id) {
  const s = cachedServices.find(x => x.id === id);
  if (!s) return;

  document.getElementById('serviceFormPanel').style.display = 'block';
  document.getElementById('serviceFormTitle').textContent = 'Edit Service Offering';
  document.getElementById('serviceId').value = s.id;
  document.getElementById('servName').value = s.name;
  document.getElementById('servIcon').value = s.icon;
  document.getElementById('servPrice').value = s.price;
  document.getElementById('servFeatures').value = (s.features || []).join(', ');
  document.getElementById('servDesc').value = s.description;

  document.getElementById('serviceFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── PRICING PLANS CRUD ────────────────────────────────
async function loadPlans() {
  const snap = await getDB().collection('plans').orderBy('order', 'asc').get();
  cachedPlans = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderPlansList() {
  const grid = document.getElementById('pricingGrid');
  const empty = document.getElementById('pricingEmptyMsg');
  
  grid.innerHTML = '';
  if (cachedPlans.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  cachedPlans.forEach(p => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    card.innerHTML = `
      <div class="mc-thumb" style="font-size:2rem; background:var(--surface-2);">💵</div>
      <div class="mc-body">
        <p class="mc-cat">Tier Tier Plan ${p.popular ? '<span style="color:var(--gold); border:1px solid var(--border); border-radius:3px; padding:0 3px; font-size:0.6rem; margin-left:4px;">Popular</span>' : ''}</p>
        <h3 class="mc-title">${p.name}</h3>
        <p class="mc-desc" style="font-family:var(--font-mono); color:var(--gold); font-size:1.1rem; font-weight:700;">${p.price}</p>
        <p class="mc-desc" style="-webkit-line-clamp:3;">Features: ${(p.features || []).join(' · ')}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-plan-btn" data-id="${p.id}">Edit</button>
          <button class="btn-danger btn-sm del-plan-btn" data-id="${p.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => editPlanForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'plan'));
  });
}

function editPlanForm(id) {
  const p = cachedPlans.find(x => x.id === id);
  if (!p) return;

  document.getElementById('planFormPanel').style.display = 'block';
  document.getElementById('planFormTitle').textContent = 'Edit Pricing Plan';
  document.getElementById('planId').value = p.id;
  document.getElementById('planName').value = p.name;
  document.getElementById('planPrice').value = p.price;
  document.getElementById('planCta').value = p.ctaText;
  document.getElementById('planFeatures').value = (p.features || []).join(', ');
  document.getElementById('planPopular').checked = !!p.popular;

  document.getElementById('planFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── TESTIMONIALS CRUD ─────────────────────────────────
async function loadTestimonials() {
  const snap = await getDB().collection('testimonials').orderBy('createdAt', 'desc').get();
  cachedTestimonials = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderTestimonialsList() {
  const grid = document.getElementById('testimonialsGrid');
  const empty = document.getElementById('testimonialsEmptyMsg');
  
  grid.innerHTML = '';
  if (cachedTestimonials.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  cachedTestimonials.forEach(t => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    const avatarImg = t.profileImage 
      ? `<img src="${t.profileImage}" alt="${t.clientName}" />` 
      : `<div style="font-size:2rem;">★</div>`;
      
    card.innerHTML = `
      <div class="mc-thumb">${avatarImg}</div>
      <div class="mc-body">
        <p class="mc-cat">${t.position} · ${t.company}</p>
        <h3 class="mc-title">${t.clientName}</h3>
        <p class="mc-desc" style="color:var(--gold); font-size:0.75rem;">${'★'.repeat(t.rating)}</p>
        <p class="mc-desc">${t.review}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-test-btn" data-id="${t.id}">Edit</button>
          <button class="btn-danger btn-sm del-test-btn" data-id="${t.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-test-btn').forEach(btn => {
    btn.addEventListener('click', () => editTestimonialForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-test-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'testimonial'));
  });
}

function editTestimonialForm(id) {
  const t = cachedTestimonials.find(x => x.id === id);
  if (!t) return;

  document.getElementById('testimonialFormPanel').style.display = 'block';
  document.getElementById('testimonialFormTitle').textContent = 'Edit Client Feedback';
  document.getElementById('testimonialId').value = t.id;
  document.getElementById('testName').value = t.clientName;
  document.getElementById('testRating').value = t.rating;
  document.getElementById('testPos').value = t.position;
  document.getElementById('testComp').value = t.company;
  document.getElementById('testReview').value = t.review;

  if (t.profileImage) {
    document.getElementById('testAvatarPreview').src = t.profileImage;
    document.getElementById('testAvatarPreviewWrap').style.display = 'block';
    document.getElementById('testAvatarDropZone').style.display = 'none';
  } else {
    document.getElementById('testAvatarPreviewWrap').style.display = 'none';
    document.getElementById('testAvatarDropZone').style.display = 'block';
  }
  testimonialAvatarBlob = null;
  document.getElementById('testimonialFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── ABOUT PROFILE SETTINGS ───────────────────────────
async function loadAboutForm() {
  if (!fbReady()) return;
  try {
    const doc = await getDB().collection('settings').doc('about').get();
    const data = doc.exists ? doc.data() : { bio: '', skills: [], certifications: [], experience: [], resumeUrl: '', profileImage: '' };
    
    document.getElementById('aboutBio').value = data.bio || '';
    document.getElementById('aboutSkills').value = (data.skills || []).join(', ');
    document.getElementById('aboutCerts').value = (data.certifications || []).join(', ');
    document.getElementById('aboutResumeUrl').value = data.resumeUrl || '';

    // Experience builder
    const timelineBuilder = document.getElementById('experienceTimelineBuilder');
    timelineBuilder.innerHTML = '';
    
    const experienceList = data.experience || [];
    experienceList.forEach(exp => {
      createExperienceRow(exp.period, exp.company, exp.role, exp.description);
    });

    if (data.profileImage) {
      document.getElementById('aboutPhotoPreview').src = data.profileImage;
      document.getElementById('aboutPhotoPreviewWrap').style.display = 'block';
      document.getElementById('aboutPhotoDropZone').style.display = 'none';
    } else {
      document.getElementById('aboutPhotoPreviewWrap').style.display = 'none';
      document.getElementById('aboutPhotoDropZone').style.display = 'block';
    }
    aboutPhotoBlob = null;
  } catch (err) {
    showToast('Failed to load profile details.', true);
  }
}

function createExperienceRow(period = '', company = '', role = '', desc = '') {
  const container = document.getElementById('experienceTimelineBuilder');
  const row = document.createElement('div');
  row.className = 'exp-row-inputs';
  row.innerHTML = `
    <input type="text" class="exp-period" placeholder="2024 - Present" value="${period}" required />
    <input type="text" class="exp-company" placeholder="GuruLabs" value="${company}" required />
    <input type="text" class="exp-role" placeholder="Frontend Developer" value="${role}" required />
    <input type="text" class="exp-desc" placeholder="Details of job role..." value="${desc}" required />
    <div class="exp-remove-row-btn">✕</div>
  `;
  row.querySelector('.exp-remove-row-btn').addEventListener('click', () => row.remove());
  container.appendChild(row);
}

// ─── BLOG CRUD IMPLEMENTATION ─────────────────────────
async function loadBlogs() {
  const snap = await getDB().collection('blog').orderBy('publishDate', 'desc').get();
  cachedBlogs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderBlogsList(search = '') {
  const grid = document.getElementById('blogGrid');
  const empty = document.getElementById('blogEmptyMsg');
  const sub = document.getElementById('blogCountSub');
  
  grid.innerHTML = '';
  const filtered = cachedBlogs.filter(b => 
    !search || b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  sub.textContent = `${filtered.length} article${filtered.length !== 1 ? 's' : ''} found.`;

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  filtered.forEach(b => {
    const card = document.createElement('div');
    card.className = 'manage-card';
    const thumb = b.featuredImage 
      ? `<img src="${b.featuredImage}" alt="${b.title}" />` 
      : `<div style="font-size:2.5rem;">📝</div>`;
      
    const dateStr = b.publishDate ? b.publishDate.toDate().toLocaleDateString() : '';
    
    card.innerHTML = `
      <div class="mc-thumb">${thumb}</div>
      <div class="mc-body">
        <p class="mc-cat">${dateStr} · Status: ${b.status}</p>
        <h3 class="mc-title">${b.title}</h3>
        <p class="mc-desc" style="-webkit-line-clamp: 2;">Tags: ${(b.tags || []).join(', ')}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-blog-btn" data-id="${b.id}">Edit</button>
          <button class="btn-danger btn-sm del-blog-btn" data-id="${b.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-blog-btn').forEach(btn => {
    btn.addEventListener('click', () => editBlogForm(btn.dataset.id));
  });
  grid.querySelectorAll('.del-blog-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'blog'));
  });
}

function editBlogForm(id) {
  const b = cachedBlogs.find(x => x.id === id);
  if (!b) return;

  document.getElementById('blogFormPanel').style.display = 'block';
  document.getElementById('blogFormTitle').textContent = 'Edit Blog Post';
  
  document.getElementById('blogId').value = b.id;
  document.getElementById('blogTitle').value = b.title;
  document.getElementById('blogSlug').value = b.slug;
  document.getElementById('blogAuthor').value = b.author;
  document.getElementById('blogTags').value = (b.tags || []).join(', ');
  document.getElementById('blogStatus').value = b.status || 'published';
  document.getElementById('blogContent').value = b.content;
  
  if (b.publishDate) {
    const d = b.publishDate.toDate();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    document.getElementById('blogDate').value = `${yyyy}-${mm}-${dd}`;
  }

  if (b.featuredImage) {
    document.getElementById('blogImgPreview').src = b.featuredImage;
    document.getElementById('blogImgPreviewWrap').style.display = 'block';
    document.getElementById('blogImgDropZone').style.display = 'none';
  } else {
    document.getElementById('blogImgPreviewWrap').style.display = 'none';
    document.getElementById('blogImgDropZone').style.display = 'block';
  }
  blogImgBlob = null;
  document.getElementById('blogFormPanel').scrollIntoView({ behavior: 'smooth' });
}

// ─── INBOX MESSAGES ────────────────────────────────────
async function loadMessages() {
  const snap = await getDB().collection('messages').orderBy('createdAt', 'desc').get();
  cachedMessages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderMessagesList(search = '') {
  const grid = document.getElementById('messageGrid');
  const empty = document.getElementById('messagesEmpty');
  const sub = document.getElementById('messagesSub');
  
  grid.innerHTML = '';
  const filtered = cachedMessages.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  sub.textContent = `${filtered.length} message${filtered.length !== 1 ? 's' : ''} found.`;

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  filtered.forEach(m => {
    const card = document.createElement('div');
    card.className = `message-card ${m.read ? '' : 'unread'}`;
    const dateStr = m.createdAt ? m.createdAt.toDate().toLocaleString() : '';
    
    card.innerHTML = `
      <div class="msg-header">
        <span class="msg-title">${m.subject || 'No Subject'}</span>
        <span class="msg-date">${dateStr}</span>
      </div>
      <div class="msg-body">
        <h4 style="font-size:0.9rem; margin-bottom:0.2rem;">${m.name}</h4>
        <p class="msg-email">${m.email}</p>
        <p class="msg-text">${m.message}</p>
      </div>
      <div class="msg-footer">
        ${!m.read ? `<button class="btn-gold btn-sm mark-read-btn" data-id="${m.id}">Mark Read</button>` : ''}
        <button class="btn-danger btn-sm del-msg-btn" data-id="${m.id}">Delete</button>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.mark-read-btn').forEach(btn => {
    btn.addEventListener('click', () => markMessageAsRead(btn.dataset.id));
  });
  grid.querySelectorAll('.del-msg-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerDelete(btn.dataset.id, 'message'));
  });
}

async function markMessageAsRead(id) {
  if (!fbReady()) return;
  try {
    await getDB().collection('messages').doc(id).update({ read: true });
    showToast('Message status: Read.');
    await loadMessages();
    renderMessagesList();
    updateDashboardStats();
  } catch (err) {
    showToast('Failed to update message.', true);
  }
}

// ─── DELETE ACTION CONTROLLER ──────────────────────────
function triggerDelete(id, type) {
  deleteTarget = { id, type };
  document.getElementById('deleteOverlay').style.display = 'flex';
}

const deleteOverlay = document.getElementById('deleteOverlay');
const delCancel = document.getElementById('delCancel');
const delConfirm = document.getElementById('delConfirm');

if (delCancel) delCancel.addEventListener('click', () => {
  deleteOverlay.style.display = 'none';
  deleteTarget = { id: null, type: null };
});

if (delConfirm) {
  delConfirm.addEventListener('click', async () => {
    const { id, type } = deleteTarget;
    if (!id || !fbReady()) return;
    
    delConfirm.disabled = true;
    delConfirm.textContent = 'Removing...';

    try {
      if (type === 'project') {
        await getDB().collection('projects').doc(id).delete();
        await loadProjects();
        renderProjectsList();
        logActivity('Delete Project', `ID: ${id}`);
        showToast('Project deleted successfully.');
      } else if (type === 'service') {
        await getDB().collection('services').doc(id).delete();
        await loadServices();
        renderServicesList();
        logActivity('Delete Service', `ID: ${id}`);
        showToast('Service deleted.');
      } else if (type === 'plan') {
        await getDB().collection('plans').doc(id).delete();
        await loadPlans();
        renderPlansList();
        logActivity('Delete Plan', `ID: ${id}`);
        showToast('Pricing Plan deleted.');
      } else if (type === 'testimonial') {
        await getDB().collection('testimonials').doc(id).delete();
        await loadTestimonials();
        renderTestimonialsList();
        logActivity('Delete Feedback', `ID: ${id}`);
        showToast('Feedback post deleted.');
      } else if (type === 'blog') {
        await getDB().collection('blog').doc(id).delete();
        await loadBlogs();
        renderBlogsList();
        logActivity('Delete Blog', `ID: ${id}`);
        showToast('Article deleted.');
      } else if (type === 'message') {
        await getDB().collection('messages').doc(id).delete();
        await loadMessages();
        renderMessagesList();
        showToast('Message deleted.');
      }
      updateDashboardStats();
    } catch (err) {
      console.error(err);
      showToast(`Delete failed: ${err.message}`, true);
    } finally {
      delConfirm.disabled = false;
      delConfirm.textContent = 'Yes, Delete';
      deleteOverlay.style.display = 'none';
      deleteTarget = { id: null, type: null };
    }
  });
}

// ─── GITHUB SYNC DASHBOARD ─────────────────────────────
async function loadGitHubReposFromAPI() {
  if (cachedGitHubRepos.length > 0) return cachedGitHubRepos;
  const res = await fetch('https://api.github.com/users/JOSHMECH/repos?sort=updated&per_page=100');
  if (!res.ok) throw new Error('GitHub limit exceeded or API error.');
  const repos = await res.json();
  cachedGitHubRepos = repos.filter(r => !r.fork);
  return cachedGitHubRepos;
}

async function getHiddenRepos() {
  const snap = await getDB().collection('hidden_repos').get();
  return snap.docs.map(d => String(d.id));
}

async function getGitHubOverrides() {
  const snap = await getDB().collection('github_overrides').get();
  const overrides = {};
  snap.forEach(doc => { overrides[doc.id] = doc.data(); });
  return overrides;
}

async function renderGitHubList(search = '') {
  const grid = document.getElementById('githubGrid');
  const loading = document.getElementById('githubLoading');
  const empty = document.getElementById('githubEmpty');
  const sub = document.getElementById('githubSub');
  
  grid.innerHTML = '';
  loading.style.display = 'block';
  empty.style.display = 'none';

  try {
    const repos = await loadGitHubReposFromAPI();
    const hiddenList = await getHiddenRepos();
    const hiddenSet = new Set(hiddenList.map(String));
    const overrides = await getGitHubOverrides();

    loading.style.display = 'none';
    
    const filtered = repos.filter(r => 
      !search || r.name.toLowerCase().includes(search.toLowerCase()) || 
      (r.language || '').toLowerCase().includes(search.toLowerCase())
    );

    sub.textContent = `${filtered.length} repository${filtered.length !== 1 ? 'ies' : ''} found.`;
    if (filtered.length === 0) {
      empty.style.display = 'block';
      return;
    }

    filtered.forEach(r => {
      const isHidden = hiddenSet.has(String(r.id));
      const override = overrides[String(r.id)] || {};
      const hasOverride = !!override.liveUrl || !!override.previewUrl;
      const card = document.createElement('div');
      card.className = 'manage-card';
      const lang = r.language || 'Code';
      
      card.innerHTML = `
        <div class="mc-thumb" style="font-size:2.5rem; background:var(--surface-2);">📁</div>
        <div class="mc-body">
          <p class="mc-cat">${lang} ${hasOverride ? '<span style="color:var(--gold); border:1px solid var(--border); border-radius:3px; padding:0 3px; font-size:0.6rem; margin-left:4px;">Overrides Active</span>' : ''}</p>
          <h3 class="mc-title">${r.name}</h3>
          <p class="mc-desc">${r.description || 'Public GitHub repository.'}</p>
          <div class="mc-actions">
            ${isHidden 
              ? `<button class="btn-gold btn-sm toggle-github-btn" data-id="${r.id}" data-action="show">Include</button>`
              : `<button class="btn-outline btn-sm toggle-github-btn" data-id="${r.id}" data-action="hide">Exclude</button>`
            }
            <button class="btn-outline btn-sm edit-github-btn" data-id="${r.id}" data-name="${r.name}">Configure Overrides</button>
          </div>
        </div>`;
      grid.appendChild(card);
    });

    grid.querySelectorAll('.toggle-github-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        btn.disabled = true;
        try {
          if (action === 'hide') {
            await getDB().collection('hidden_repos').doc(String(id)).set({ hiddenAt: firebase.firestore.FieldValue.serverTimestamp() });
            showToast('Repository hidden.');
          } else {
            await getDB().collection('hidden_repos').doc(String(id)).delete();
            showToast('Repository visible.');
          }
          await renderGitHubList(document.getElementById('githubSearch').value);
        } catch (err) {
          showToast('Failed to toggle repo.', true);
        }
      });
    });

    grid.querySelectorAll('.edit-github-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const override = overrides[String(id)] || {};
        
        document.getElementById('ghOverrideTitle').textContent = `Configure Overrides: ${name}`;
        document.getElementById('ghOverrideId').value = id;
        document.getElementById('ghLiveUrl').value = override.liveUrl || '';

        if (override.previewUrl) {
          document.getElementById('ghImgPreview').src = override.previewUrl;
          document.getElementById('ghImgPreviewWrap').style.display = 'block';
          document.getElementById('ghDropZone').style.display = 'none';
        } else {
          document.getElementById('ghImgPreviewWrap').style.display = 'none';
          document.getElementById('ghDropZone').style.display = 'block';
        }
        ghOverrideBlob = null;
        document.getElementById('githubOverrideOverlay').style.display = 'flex';
      });
    });

  } catch (err) {
    loading.style.display = 'none';
    showToast('Failed to load repositories.', true);
  }
}

// ─── EMAIL ALERTS CONFIGURATION ────────────────────────
async function loadEmailSettingsForm() {
  if (!fbReady()) return;
  try {
    const doc = await getDB().collection('settings').doc('email').get();
    const data = doc.exists ? doc.data() : { enabled: false, publicJSKey: '', serviceID: '', templateID: '', autoReplyEnabled: false, autoReplyTemplateID: '' };
    
    document.getElementById('emailEnabled').checked = !!data.enabled;
    document.getElementById('emailJSKey').value = data.publicJSKey || '';
    document.getElementById('emailJSService').value = data.serviceID || '';
    document.getElementById('emailJSTemplate').value = data.templateID || '';
    document.getElementById('emailAutoReplyEnabled').checked = !!data.autoReplyEnabled;
    document.getElementById('emailJSAutoReplyTemplate').value = data.autoReplyTemplateID || '';

    document.getElementById('emailJSFields').style.display = data.enabled ? 'block' : 'none';
    document.getElementById('testEmailBtn').style.display = data.enabled ? 'block' : 'none';
    document.getElementById('emailJSAutoReplyFields').style.display = (data.enabled && data.autoReplyEnabled) ? 'block' : 'none';
  } catch (err) {
    showToast('Failed to fetch mail details.', true);
  }
}

// ─── TRIGGERS AND FORM HANDLERS BINDINGS ───────────────
function initEventTriggers() {
  // Navigation sidebar switcher
  document.querySelectorAll('.snav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchView(link.dataset.view);
    });
  });

  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.goto);
    });
  });

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Forms Toggle Displays
  document.getElementById('openAddProjectBtn').addEventListener('click', () => {
    const f = document.getElementById('projectFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetProjectForm();
  });
  document.getElementById('cancelProjFormBtn').addEventListener('click', () => {
    document.getElementById('projectFormPanel').style.display = 'none';
    resetProjectForm();
  });

  document.getElementById('openAddServiceBtn').addEventListener('click', () => {
    const f = document.getElementById('serviceFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetServiceForm();
  });
  document.getElementById('cancelServFormBtn').addEventListener('click', () => {
    document.getElementById('serviceFormPanel').style.display = 'none';
    resetServiceForm();
  });

  document.getElementById('openAddPlanBtn').addEventListener('click', () => {
    const f = document.getElementById('planFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetPlanForm();
  });
  document.getElementById('cancelPlanFormBtn').addEventListener('click', () => {
    document.getElementById('planFormPanel').style.display = 'none';
    resetPlanForm();
  });

  document.getElementById('openAddTestBtn').addEventListener('click', () => {
    const f = document.getElementById('testimonialFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetTestimonialForm();
  });
  document.getElementById('cancelTestFormBtn').addEventListener('click', () => {
    document.getElementById('testimonialFormPanel').style.display = 'none';
    resetTestimonialForm();
  });

  document.getElementById('openAddBlogBtn').addEventListener('click', () => {
    const f = document.getElementById('blogFormPanel');
    const display = f.style.display === 'none';
    f.style.display = display ? 'block' : 'none';
    if (display) resetBlogForm();
  });
  document.getElementById('cancelBlogFormBtn').addEventListener('click', () => {
    document.getElementById('blogFormPanel').style.display = 'none';
    resetBlogForm();
  });

  // Image Upload Bindings
  setupImageDropZone('projCoverDropZone', 'projCoverFile', 'projCoverPreview', 'projCoverPreviewWrap', 'projCoverRemove', blob => {
    projectCoverBlob = blob;
  });
  setupImageDropZone('testAvatarDropZone', 'testAvatarFile', 'testAvatarPreview', 'testAvatarPreviewWrap', 'testAvatarRemove', blob => {
    testimonialAvatarBlob = blob;
  });
  setupImageDropZone('aboutPhotoDropZone', 'aboutPhotoFile', 'aboutPhotoPreview', 'aboutPhotoPreviewWrap', 'aboutPhotoRemove', blob => {
    aboutPhotoBlob = blob;
  });
  setupImageDropZone('blogImgDropZone', 'blogImgFile', 'blogImgPreview', 'blogImgPreviewWrap', 'blogImgRemove', blob => {
    blogImgBlob = blob;
  });
  setupImageDropZone('ghDropZone', 'ghImgFile', 'ghImgPreview', 'ghImgPreviewWrap', 'ghImgRemove', blob => {
    ghOverrideBlob = blob;
  });

  // Submit Operations
  document.getElementById('projectForm').addEventListener('submit', handleProjectSubmit);
  document.getElementById('serviceForm').addEventListener('submit', handleServiceSubmit);
  document.getElementById('planForm').addEventListener('submit', handlePlanSubmit);
  document.getElementById('testimonialForm').addEventListener('submit', handleTestimonialSubmit);
  document.getElementById('aboutSettingsForm').addEventListener('submit', handleAboutSubmit);
  document.getElementById('blogForm').addEventListener('submit', handleBlogSubmit);
  document.getElementById('emailSettingsForm').addEventListener('submit', handleEmailSettingsSubmit);
  document.getElementById('githubOverrideForm').addEventListener('submit', handleGitHubOverrideSubmit);
  
  // Experience timeline row add
  document.getElementById('addExpRowBtn').addEventListener('click', () => createExperienceRow());

  // Toggle checks for inputs displays
  document.getElementById('emailEnabled').addEventListener('change', e => {
    document.getElementById('emailJSFields').style.display = e.target.checked ? 'block' : 'none';
    document.getElementById('testEmailBtn').style.display = e.target.checked ? 'block' : 'none';
  });
  document.getElementById('emailAutoReplyEnabled').addEventListener('change', e => {
    document.getElementById('emailJSAutoReplyFields').style.display = e.target.checked ? 'block' : 'none';
  });

  // Search filter key bindings
  document.getElementById('projectsSearch').addEventListener('input', e => renderProjectsList(e.target.value));
  document.getElementById('blogSearch').addEventListener('input', e => renderBlogsList(e.target.value));
  document.getElementById('messagesSearch').addEventListener('input', e => renderMessagesList(e.target.value));
  document.getElementById('githubSearch').addEventListener('input', e => renderGitHubList(e.target.value));
}

function setupImageDropZone(zoneId, fileId, previewId, wrapId, removeId, blobSetter) {
  const zone = document.getElementById(zoneId);
  const file = document.getElementById(fileId);
  const preview = document.getElementById(previewId);
  const wrap = document.getElementById(wrapId);
  const remove = document.getElementById(removeId);

  if (!zone) return;

  zone.addEventListener('click', () => file.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  });
  file.addEventListener('change', () => { if (file.files[0]) processFile(file.files[0]); });

  remove.addEventListener('click', () => {
    blobSetter(null);
    wrap.style.display = 'none';
    zone.style.display = 'block';
    file.value = '';
  });

  function processFile(f) {
    if (f.size > 10 * 1024 * 1024) { showToast('Image must be under 10MB.', true); return; }
    if (!f.type.startsWith('image/')) { showToast('File type not supported.', true); return; }
    resizeImageFile(f, 960, 540, (blob, url) => {
      blobSetter(blob);
      preview.src = url;
      wrap.style.display = 'block';
      zone.style.display = 'none';
    });
  }
}

// ─── FORM SUBMIT CONTROLLERS ───────────────────────────
async function handleProjectSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('projectId').value;
  const title = document.getElementById('projTitle').value.trim();
  const slug = document.getElementById('projSlug').value.trim();
  const category = document.getElementById('projCategory').value;
  const customLabel = document.getElementById('projCatLabel').value.trim();
  const shortDesc = document.getElementById('projDesc').value.trim();
  const longDesc = document.getElementById('projLongDesc').value.trim();
  const client = document.getElementById('projClient').value.trim();
  const dateStr = document.getElementById('projDate').value.trim();
  const liveUrl = document.getElementById('projUrl').value.trim();
  const repoUrl = document.getElementById('projRepo').value.trim();
  const techRaw = document.getElementById('projTech').value;
  const featured = document.getElementById('projFeatured').checked;
  const status = document.getElementById('projStatus').value;
  
  if (!title || !slug || !category || !shortDesc || !longDesc) {
    showToast('⚠ Please fill in all required fields.', true);
    return;
  }

  const saveBtn = document.getElementById('saveProjBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const defaultLabels = { dev: 'Development', design: 'Creative Design', data: 'Data Science' };
  const techArr = techRaw.split(',').map(t => t.trim()).filter(Boolean);

  try {
    let coverUrl = '';
    const docId = id || getDB().collection('projects').doc().id;

    if (projectCoverBlob) {
      coverUrl = await uploadFileToStorage(projectCoverBlob, 'projects', `cover_${docId}.jpg`);
    } else if (id) {
      const existing = cachedProjects.find(x => x.id === id);
      coverUrl = existing ? existing.coverImage : '';
    }

    const payload = {
      title, slug, category,
      categoryLabel: customLabel || defaultLabels[category] || category,
      description: shortDesc,
      longDescription: longDesc,
      client: client || null,
      completionDate: dateStr || null,
      projectUrl: liveUrl || null,
      repoUrl: repoUrl || null,
      technologies: techArr,
      featured,
      status,
      coverImage: coverUrl,
      galleryImages: [],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!id) {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      payload.order = cachedProjects.length;
      await getDB().collection('projects').doc(docId).set(payload);
      showToast('✓ Project created successfully!');
      logActivity('Create Project', title);
    } else {
      await getDB().collection('projects').doc(id).update(payload);
      showToast('✓ Project details updated!');
      logActivity('Edit Project', title);
    }

    resetProjectForm();
    document.getElementById('projectFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    console.error(err);
    showToast(`CMS Save failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Case Study';
  }
}

async function handleServiceSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('serviceId').value;
  const name = document.getElementById('servName').value.trim();
  const icon = document.getElementById('servIcon').value.trim();
  const price = document.getElementById('servPrice').value.trim();
  const featuresRaw = document.getElementById('servFeatures').value;
  const description = document.getElementById('servDesc').value.trim();

  if (!name || !icon || !price || !featuresRaw || !description) {
    showToast('⚠ Please fill in all service fields.', true);
    return;
  }

  const saveBtn = document.getElementById('saveServBtn');
  saveBtn.disabled = true;
  
  const features = featuresRaw.split(',').map(f => f.trim()).filter(Boolean);

  try {
    const payload = {
      name, icon, price, features, description,
      order: cachedServices.length
    };

    if (!id) {
      await getDB().collection('services').add(payload);
      showToast('✓ Service added.');
      logActivity('Create Service', name);
    } else {
      await getDB().collection('services').doc(id).set(payload, { merge: true });
      showToast('✓ Service updated.');
      logActivity('Edit Service', name);
    }

    resetServiceForm();
    document.getElementById('serviceFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    showToast(`Service failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handlePlanSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('planId').value;
  const name = document.getElementById('planName').value.trim();
  const price = document.getElementById('planPrice').value.trim();
  const ctaText = document.getElementById('planCta').value.trim();
  const featuresRaw = document.getElementById('planFeatures').value;
  const popular = document.getElementById('planPopular').checked;

  if (!name || !price || !ctaText || !featuresRaw) {
    showToast('⚠ Missing plan fields.', true);
    return;
  }

  const saveBtn = document.getElementById('savePlanBtn');
  saveBtn.disabled = true;

  const features = featuresRaw.split(',').map(f => f.trim()).filter(Boolean);

  try {
    const payload = {
      name, price, ctaText, features, popular,
      order: cachedPlans.length
    };

    if (!id) {
      await getDB().collection('plans').add(payload);
      showToast('✓ Plan added.');
      logActivity('Create Plan', name);
    } else {
      await getDB().collection('plans').doc(id).set(payload, { merge: true });
      showToast('✓ Plan updated.');
      logActivity('Edit Plan', name);
    }

    resetPlanForm();
    document.getElementById('planFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    showToast(`Plan failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handleTestimonialSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('testimonialId').value;
  const clientName = document.getElementById('testName').value.trim();
  const rating = parseInt(document.getElementById('testRating').value);
  const position = document.getElementById('testPos').value.trim();
  const company = document.getElementById('testComp').value.trim();
  const review = document.getElementById('testReview').value.trim();

  if (!clientName || isNaN(rating) || !position || !company || !review) {
    showToast('⚠ Please complete required fields.', true);
    return;
  }

  const saveBtn = document.getElementById('saveTestBtn');
  saveBtn.disabled = true;

  try {
    let profileImage = '';
    const docId = id || getDB().collection('testimonials').doc().id;

    if (testimonialAvatarBlob) {
      profileImage = await uploadFileToStorage(testimonialAvatarBlob, 'testimonials', `avatar_${docId}.jpg`);
    } else if (id) {
      const existing = cachedTestimonials.find(x => x.id === id);
      profileImage = existing ? existing.profileImage : '';
    }

    const payload = {
      clientName, rating, position, company, review, profileImage,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!id) {
      await getDB().collection('testimonials').doc(docId).set(payload);
      showToast('✓ Feedback added.');
      logActivity('Create Testimonial', clientName);
    } else {
      await getDB().collection('testimonials').doc(id).update(payload);
      showToast('✓ Feedback updated.');
      logActivity('Edit Testimonial', clientName);
    }

    resetTestimonialForm();
    document.getElementById('testimonialFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    showToast(`Testimonial failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handleAboutSubmit(e) {
  e.preventDefault();
  const bio = document.getElementById('aboutBio').value.trim();
  const skillsRaw = document.getElementById('aboutSkills').value;
  const certsRaw = document.getElementById('aboutCerts').value;
  const resumeUrl = document.getElementById('aboutResumeUrl').value.trim();

  if (!bio || !skillsRaw) {
    showToast('Biography and skills list are mandatory.', true);
    return;
  }

  const saveBtn = document.getElementById('saveAboutBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const skills = skillsRaw.split(',').map(s => s.trim()).filter(Boolean);
  const certifications = certsRaw.split(',').map(c => c.trim()).filter(Boolean);

  // Extract experience timeline entries
  const experience = [];
  document.querySelectorAll('.exp-row-inputs').forEach(row => {
    const period = row.querySelector('.exp-period').value.trim();
    const company = row.querySelector('.exp-company').value.trim();
    const role = row.querySelector('.exp-role').value.trim();
    const description = row.querySelector('.exp-desc').value.trim();
    if (period && company && role) {
      experience.push({ period, company, role, description });
    }
  });

  try {
    let profileImage = '';
    
    // Check if new photo was uploaded
    if (aboutPhotoBlob) {
      profileImage = await uploadFileToStorage(aboutPhotoBlob, 'profile', 'profile.jpg');
    } else {
      const doc = await getDB().collection('settings').doc('about').get();
      profileImage = doc.exists ? doc.data().profileImage : '';
    }

    const payload = {
      bio, skills, certifications, experience, resumeUrl, profileImage,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    await getDB().collection('settings').doc('about').set(payload, { merge: true });
    showToast('✓ Profile updated successfully!');
    logActivity('Edit About', 'Bio & experience profile modified');
  } catch (err) {
    showToast(`Profile failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save About Settings';
  }
}

async function handleBlogSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('blogId').value;
  const title = document.getElementById('blogTitle').value.trim();
  const slug = document.getElementById('blogSlug').value.trim();
  const author = document.getElementById('blogAuthor').value.trim();
  const tagsRaw = document.getElementById('blogTags').value;
  const status = document.getElementById('blogStatus').value;
  const dateInput = document.getElementById('blogDate').value;
  const content = document.getElementById('blogContent').value.trim();

  if (!title || !slug || !author || !content) {
    showToast('Please fill in required fields (*).', true);
    return;
  }

  const saveBtn = document.getElementById('saveBlogBtn');
  saveBtn.disabled = true;

  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const publishDate = dateInput ? new Date(dateInput) : new Date();

  try {
    let featuredImage = '';
    const docId = id || getDB().collection('blog').doc().id;

    if (blogImgBlob) {
      featuredImage = await uploadFileToStorage(blogImgBlob, 'blog', `cover_${docId}.jpg`);
    } else if (id) {
      const existing = cachedBlogs.find(x => x.id === id);
      featuredImage = existing ? existing.featuredImage : '';
    }

    const payload = {
      title, slug, author, tags, status, content, featuredImage,
      publishDate: firebase.firestore.Timestamp.fromDate(publishDate),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (!id) {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await getDB().collection('blog').doc(docId).set(payload);
      showToast('✓ Article published.');
      logActivity('Publish Blog', title);
    } else {
      await getDB().collection('blog').doc(id).update(payload);
      showToast('✓ Article updated.');
      logActivity('Edit Blog', title);
    }

    resetBlogForm();
    document.getElementById('blogFormPanel').style.display = 'none';
    await refreshDashboardData();
  } catch (err) {
    showToast(`Blog failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handleEmailSettingsSubmit(e) {
  e.preventDefault();
  const enabled = document.getElementById('emailEnabled').checked;
  const publicJSKey = document.getElementById('emailJSKey').value.trim();
  const serviceID = document.getElementById('emailJSService').value.trim();
  const templateID = document.getElementById('emailJSTemplate').value.trim();
  const autoReplyEnabled = document.getElementById('emailAutoReplyEnabled').checked;
  const autoReplyTemplateID = document.getElementById('emailJSAutoReplyTemplate').value.trim();

  if (enabled && (!publicJSKey || !serviceID || !templateID)) {
    showToast('Missing EmailJS parameters.', true);
    return;
  }

  const saveBtn = document.getElementById('saveEmailSettingsBtn');
  saveBtn.disabled = true;

  try {
    const payload = { enabled, publicJSKey, serviceID, templateID, autoReplyEnabled, autoReplyTemplateID };
    await getDB().collection('settings').doc('email').set(payload);
    showToast('✓ Email alerts configurations saved.');
    logActivity('Edit SMTP', 'Email notifications modified');
  } catch (err) {
    showToast(`Email settings failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

async function handleGitHubOverrideSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('ghOverrideId').value;
  const liveUrl = document.getElementById('ghLiveUrl').value.trim();
  
  const saveBtn = document.getElementById('ghOverrideSave');
  saveBtn.disabled = true;

  try {
    let previewUrl = '';
    
    if (ghOverrideBlob) {
      previewUrl = await uploadFileToStorage(ghOverrideBlob, 'projects', `override_${id}.jpg`);
    } else {
      const snap = await getDB().collection('github_overrides').doc(String(id)).get();
      previewUrl = snap.exists ? snap.data().previewUrl : '';
    }

    await getDB().collection('github_overrides').doc(String(id)).set({
      liveUrl, previewUrl,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showToast('✓ GitHub overrides saved!');
    logActivity('Edit GitHub', `Overrode settings on Repo ID: ${id}`);
    document.getElementById('githubOverrideOverlay').style.display = 'none';
    await renderGitHubList(document.getElementById('githubSearch').value);
  } catch (err) {
    showToast(`Overrides failed: ${err.message}`, true);
  } finally {
    saveBtn.disabled = false;
  }
}

// ─── FORM RESET HELPERS ────────────────────────────────
function resetProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  document.getElementById('projectFormTitle').textContent = 'Add New Project';
  document.getElementById('projCoverPreviewWrap').style.display = 'none';
  document.getElementById('projCoverDropZone').style.display = 'block';
  projectCoverBlob = null;
}

function resetServiceForm() {
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';
  document.getElementById('serviceFormTitle').textContent = 'Add New Service';
}

function resetPlanForm() {
  document.getElementById('planForm').reset();
  document.getElementById('planId').value = '';
  document.getElementById('planFormTitle').textContent = 'Add New Plan';
}

function resetTestimonialForm() {
  document.getElementById('testimonialForm').reset();
  document.getElementById('testimonialId').value = '';
  document.getElementById('testimonialFormTitle').textContent = 'Add New Recommendation';
  document.getElementById('testAvatarPreviewWrap').style.display = 'none';
  document.getElementById('testAvatarDropZone').style.display = 'block';
  testimonialAvatarBlob = null;
}

function resetBlogForm() {
  document.getElementById('blogForm').reset();
  document.getElementById('blogId').value = '';
  document.getElementById('blogFormTitle').textContent = 'Add New Article';
  document.getElementById('blogImgPreviewWrap').style.display = 'none';
  document.getElementById('blogImgDropZone').style.display = 'block';
  blogImgBlob = null;
}

// ─── TOAST NOTIFICATION UTILITY ────────────────────────
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg, isError = false) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.style.color = isError ? '#FF6B6B' : 'var(--gold)';
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
