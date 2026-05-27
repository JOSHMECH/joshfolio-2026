/* ════════════════════════════════════════════════════════
   Josh_d_Guru — Admin Panel Script
   Firebase Firestore integration + localStorage fallback
   ════════════════════════════════════════════════════════ */

/* ─── Auth Config ─────────────────────────────────────── */
const CREDENTIALS = { username:'josh_d_guru', password:'josh2026' };
const AUTH_KEY    = 'josh_admin_auth';
const LS_KEY      = 'josh_admin_projects';

/* ─── State ───────────────────────────────────────────── */
let projects     = [];
let messages     = [];
let deleteTarget = null;
let pendingImageBase64 = null;

/* ─── Firebase / localStorage helpers ──────────────────── */
function getDB(){ return (window.joshFirebase||{}).db; }
function fbReady(){ return !!(window.joshFirebase||{}).firebaseReady; }

/* Firestore helpers */
async function fbGetAll(){
  const snap = await getDB().collection('projects').orderBy('createdAt','desc').get();
  return snap.docs.map(d=>({ id:d.id, ...d.data() }));
}
async function fbGetAllMessages(){
    const snap = await getDB().collection('messages').orderBy('createdAt','desc').get();
    return snap.docs.map(d=>({ id:d.id, ...d.data() }));
}
async function fbAdd(data){
  const ref = await getDB().collection('projects').add({
    ...data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  return ref.id;
}
async function fbUpdate(id, data){
  await getDB().collection('projects').doc(id).update({
    ...data,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}
async function fbDelete(id){
  await getDB().collection('projects').doc(id).delete();
}

/* localStorage helpers */
function lsGet(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch{ return []; } }
function lsSet(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

/* ─── Auth ────────────────────────────────────────────── */
function isLoggedIn(){ return sessionStorage.getItem(AUTH_KEY)==='1'; }
function setLoggedIn(){ sessionStorage.setItem(AUTH_KEY,'1'); }
function logout(){ sessionStorage.removeItem(AUTH_KEY); showLogin(); }

function showLogin(){
  document.getElementById('loginScreen').style.display='flex';
  document.getElementById('dashboard').style.display='none';
}
async function showDashboard(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('dashboard').style.display='flex';
  updateFirebaseStatus();
  await loadProjects();
  await loadMessages();
  refreshAll();
}

/* ─── Firebase Status Indicator ─────────────────────────── */
function updateFirebaseStatus(){
  const dot   = document.getElementById('fbDot');
  const label = document.getElementById('fbLabel');
  if(!dot||!label) return;
  if(fbReady()){
    dot.className = 'fb-dot connected';
    label.textContent = 'Firebase connected';
  } else {
    dot.className = 'fb-dot error';
    label.textContent = 'Using localStorage';
  }
}

/* ─── Load Projects ──────────────────────────────────────── */
async function loadProjects(){
  try{
    if(fbReady()){ projects = await fbGetAll(); }
    else { projects = lsGet(); }
  } catch(err){
    console.warn('Load failed, falling back:', err);
    projects = lsGet();
  }
}

/* ─── Load Messages ──────────────────────────────────────── */
async function loadMessages(){
    try{
        if(fbReady()){ messages = await fbGetAllMessages(); }
    } catch(err){
        console.warn('Load failed, falling back:', err);
    }
}

/* ─── Login Form ─────────────────────────────────────────── */
const loginForm  = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn   = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const user = document.getElementById('luser').value.trim();
  const pass = document.getElementById('lpass').value;
  if(user===CREDENTIALS.username && pass===CREDENTIALS.password){
    loginBtn.textContent='Loading…';
    loginBtn.disabled=true;
    setLoggedIn();
    await showDashboard();
  } else {
    loginError.textContent='✕ Invalid username or password.';
    document.getElementById('lpass').value='';
    setTimeout(()=>loginError.textContent='', 3000);
  }
});

document.getElementById('passToggle').addEventListener('click',()=>{
  const inp = document.getElementById('lpass');
  inp.type = inp.type==='password' ? 'text' : 'password';
});
document.getElementById('logoutBtn').addEventListener('click', logout);

/* ─── Sidebar Toggle (mobile) ────────────────────────────── */
const sidebar        = document.getElementById('sidebar');
const sidebarToggle  = document.getElementById('sidebarToggle');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar(){
  sidebar.classList.add('open');
  sidebarToggle.classList.add('open');
  sidebarOverlay.classList.add('visible');
  document.body.style.overflow='hidden';
}
function closeSidebar(){
  sidebar.classList.remove('open');
  sidebarToggle.classList.remove('open');
  sidebarOverlay.classList.remove('visible');
  document.body.style.overflow='';
}

sidebarToggle.addEventListener('click',()=>{
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarOverlay.addEventListener('click', closeSidebar);

/* ─── Sidebar Nav ─────────────────────────────────────────── */
const snavLinks = document.querySelectorAll('.snav-link');
const views     = document.querySelectorAll('.view');
const pageTitles = { overview:'Overview', add:'Add Project', manage:'Manage Projects', github:'GitHub Repos', messages: 'Messages' };
const pageSubs   = { overview:'Welcome back, Josh.', add:'Upload and publish new work.', manage:'Edit or delete existing projects.', github:'Manage the visibility of your public GitHub repositories.', messages: 'View all your messages.' };

function switchView(viewId){
  views.forEach(v=>v.style.display='none');
  const target = document.getElementById(`view-${viewId}`);
  if(target) target.style.display='block';
  snavLinks.forEach(l=>l.classList.toggle('active', l.dataset.view===viewId));
  const t = document.getElementById('pageTitle');
  const s = document.getElementById('pageSub');
  if(t) t.textContent = pageTitles[viewId]||viewId;
  if(s) s.textContent = pageSubs[viewId]||'';
  if(viewId==='manage') renderManageGrid();
  if(viewId==='overview') renderRecent();
  if(viewId==='messages') renderMessagesGrid();
  if(viewId==='github') renderGitHubGrid();
  closeSidebar();
}

snavLinks.forEach(l=>l.addEventListener('click',e=>{e.preventDefault();switchView(l.dataset.view);}));
document.addEventListener('click',e=>{
  const gt = e.target.closest('[data-goto]');
  if(gt){e.preventDefault();switchView(gt.dataset.goto);}
});

/* ─── Project Form ────────────────────────────────────────── */
const projectForm = document.getElementById('projectForm');
const pfStatus    = document.getElementById('pfStatus');

projectForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const id      = document.getElementById('editId').value;
  const title   = document.getElementById('pTitle').value.trim();
  const cat     = document.getElementById('pCategory').value;
  const catLbl  = document.getElementById('pCatLabel').value.trim();
  const desc    = document.getElementById('pDesc').value.trim();
  const stackRaw= document.getElementById('pStack').value;
  const emoji   = document.getElementById('pEmoji').value.trim()||'🚀';
  const liveUrl = document.getElementById('pLive').value.trim();
  const repoUrl = document.getElementById('pRepo').value.trim();

  if(!title||!cat||!desc){
    setPFStatus('⚠ Fill in all required fields (*).','error'); return;
  }

  const catLabels={dev:'Development',design:'Creative Design',data:'Data Science'};
  const stack = stackRaw.split(',').map(s=>s.trim()).filter(Boolean);

  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled=true; saveBtn.textContent='Saving…';

  const payload = {
    title, category:cat,
    categoryLabel: catLbl||catLabels[cat]||cat,
    desc, stack, emoji,
    liveUrl:liveUrl||null, repoUrl:repoUrl||null,
    image: pendingImageBase64||null
  };

  try{
    if(id){
      /* UPDATE */
      const existing = projects.find(p=>p.id===id);
      if(!pendingImageBase64 && existing?.image) payload.image = existing.image;

      if(fbReady()){
        await fbUpdate(id, payload);
      } else {
        const idx = projects.findIndex(p=>p.id===id);
        if(idx>-1){ projects[idx]={...projects[idx],...payload}; lsSet(projects); }
      }
      showToast('✦ Project updated!');
    } else {
      /* ADD */
      if(fbReady()){
        const newId = await fbAdd(payload);
        payload.id = newId;
        payload.createdAt = new Date().toISOString();
      } else {
        payload.id = 'local-'+Date.now();
        payload.createdAt = new Date().toISOString();
        projects.unshift(payload);
        lsSet(projects);
      }
      showToast('✦ Project added!');
    }
    await loadProjects();
    refreshAll();
    resetForm();
    switchView('manage');
  } catch(err){
    console.error('Save error:', err);
    setPFStatus('⚠ Save failed: '+err.message,'error');
  } finally{
    saveBtn.disabled=false;
    saveBtn.textContent = document.getElementById('editId').value ? 'Update Project →' : 'Save Project →';
  }
});

function setPFStatus(msg, type){
  pfStatus.textContent=msg;
  pfStatus.className='pf-status'+(type?' '+type:'');
  if(msg) setTimeout(()=>{pfStatus.textContent='';pfStatus.className='pf-status';},4000);
}

function resetForm(){
  projectForm.reset();
  document.getElementById('editId').value='';
  document.getElementById('formPanelTitle').textContent='New Project';
  document.getElementById('saveBtn').textContent='Save Project →';
  document.getElementById('cancelEdit').style.display='none';
  pendingImageBase64=null;
  document.getElementById('imgPreviewWrap').style.display='none';
  document.getElementById('dropZone').style.display='block';
  pfStatus.textContent='';
}
document.getElementById('cancelEdit').addEventListener('click', resetForm);

/* ─── Image Upload ────────────────────────────────────────── */
const dropZone       = document.getElementById('dropZone');
const imgFile        = document.getElementById('imgFile');
const imgPreview     = document.getElementById('imgPreview');
const imgPreviewWrap = document.getElementById('imgPreviewWrap');
const imgRemove      = document.getElementById('imgRemove');

dropZone.addEventListener('click',()=>imgFile.click());
dropZone.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' ') imgFile.click(); });
dropZone.addEventListener('dragover',e=>{ e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop',e=>{
  e.preventDefault(); dropZone.classList.remove('drag-over');
  if(e.dataTransfer.files[0]) processImageFile(e.dataTransfer.files[0]);
});
imgFile.addEventListener('change',()=>{ if(imgFile.files[0]) processImageFile(imgFile.files[0]); });
imgRemove.addEventListener('click',()=>{
  pendingImageBase64=null;
  imgPreviewWrap.style.display='none';
  dropZone.style.display='block';
  imgFile.value='';
});

function processImageFile(file){
  if(file.size > 5*1024*1024){ showToast('⚠ Image too large — max 5 MB', true); return; }
  if(!file.type.startsWith('image/')){ showToast('⚠ File must be an image.', true); return; }
  const reader = new FileReader();
  reader.onload = e=>{
    pendingImageBase64 = e.target.result;
    imgPreview.src = pendingImageBase64;
    imgPreviewWrap.style.display='block';
    dropZone.style.display='none';
  };
  reader.readAsDataURL(file);
}

/* ─── Edit (load into form) ──────────────────────────────── */
function openEditInline(id){
  const p = projects.find(x=>x.id===id);
  if(!p) return;
  switchView('add');
  document.getElementById('editId').value    = p.id;
  document.getElementById('pTitle').value    = p.title;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pCatLabel').value = p.categoryLabel||'';
  document.getElementById('pDesc').value     = p.desc;
  document.getElementById('pStack').value    = (p.stack||[]).join(', ');
  document.getElementById('pEmoji').value    = p.emoji||'';
  document.getElementById('pLive').value     = p.liveUrl||'';
  document.getElementById('pRepo').value     = p.repoUrl||'';
  document.getElementById('formPanelTitle').textContent = 'Edit Project';
  document.getElementById('saveBtn').textContent = 'Update Project →';
  document.getElementById('cancelEdit').style.display='inline-flex';
  if(p.image){
    pendingImageBase64=p.image; imgPreview.src=p.image;
    imgPreviewWrap.style.display='block'; dropZone.style.display='none';
  } else {
    pendingImageBase64=null; imgPreviewWrap.style.display='none'; dropZone.style.display='block';
  }
}

/* ─── Delete ─────────────────────────────────────────────── */
const deleteOverlay = document.getElementById('deleteOverlay');
const delConfirm    = document.getElementById('delConfirm');
const delCancel     = document.getElementById('delCancel');

function openDeleteModal(id){ deleteTarget=id; deleteOverlay.style.display='flex'; }
delCancel.addEventListener('click',()=>{ deleteOverlay.style.display='none'; deleteTarget=null; });
delConfirm.addEventListener('click', async()=>{
  if(!deleteTarget){ deleteOverlay.style.display='none'; return; }
  delConfirm.disabled=true; delConfirm.textContent='Deleting…';
  try{
    if(fbReady()){ await fbDelete(deleteTarget); }
    else { projects=projects.filter(p=>p.id!==deleteTarget); lsSet(projects); }
    await loadProjects();
    refreshAll();
    renderManageGrid();
    showToast('Project deleted.');
  } catch(err){
    showToast('⚠ Delete failed: '+err.message, true);
  } finally{
    delConfirm.disabled=false; delConfirm.textContent='Yes, Delete';
    deleteOverlay.style.display='none'; deleteTarget=null;
  }
});

/* ─── Manage Grid ─────────────────────────────────────────── */
function renderManageGrid(search=''){
  const grid  = document.getElementById('manageGrid');
  const empty = document.getElementById('manageEmpty');
  const sub   = document.getElementById('manageSub');
  if(!grid) return;
  grid.innerHTML='';

  const filtered = projects.filter(p=>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.category||'').toLowerCase().includes(search.toLowerCase())
  );

  if(sub) sub.textContent=`${filtered.length} project${filtered.length!==1?'s':''} found`;
  if(filtered.length===0){ if(empty) empty.style.display='block'; return; }
  if(empty) empty.style.display='none';

  filtered.forEach(p=>{
    const card = document.createElement('div');
    card.className='manage-card';
    const thumb = p.image
      ? `<img src="${p.image}" alt="${p.title}" loading="lazy"/>`
      : `<div style="font-size:2.5rem;">${p.emoji||'🚀'}</div>`;
    card.innerHTML=`
      <div class="mc-thumb">${thumb}</div>
      <div class="mc-body">
        <p class="mc-cat">${p.categoryLabel||p.category}</p>
        <h3 class="mc-title">${p.title}</h3>
        <p class="mc-desc">${p.desc}</p>
        <div class="mc-actions">
          <button class="btn-outline btn-sm edit-btn" data-id="${p.id}">Edit</button>
          <button class="btn-danger btn-sm del-btn" data-id="${p.id}">Delete</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.edit-btn').forEach(btn=>btn.addEventListener('click',()=>openEditInline(btn.dataset.id)));
  grid.querySelectorAll('.del-btn').forEach(btn=>btn.addEventListener('click',()=>openDeleteModal(btn.dataset.id)));
}

document.getElementById('manageSearch').addEventListener('input',e=>renderManageGrid(e.target.value));

/* ─── Messages Grid ─────────────────────────────────────────── */
function renderMessagesGrid(search=''){
    const grid  = document.getElementById('messageGrid');
    const empty = document.getElementById('messagesEmpty');
    const sub   = document.getElementById('messagesSub');
    if(!grid) return;
    grid.innerHTML='';

    const filtered = messages.filter(m=>
        !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase())
    );

    if(sub) sub.textContent=`${filtered.length} message${filtered.length!==1?'s':''} found`;
    if(filtered.length===0){ if(empty) empty.style.display='block'; return; }
    if(empty) empty.style.display='none';

    filtered.forEach(m=>{
        const card = document.createElement('div');
        card.className='message-card';
        card.innerHTML=`
            <div class="mc-body">
                <h3 class="mc-title">${m.name}</h3>
                <p class="mc-cat">${m.email}</p>
                <p class="mc-desc">${m.message}</p>
            </div>`;
        grid.appendChild(card);
    });
}

document.getElementById('messagesSearch').addEventListener('input',e=>renderMessagesGrid(e.target.value));

/* ─── Recent ─────────────────────────────────────────────── */
function renderRecent(){
  const list = document.getElementById('recentProjects');
  if(!list) return;
  list.innerHTML='';
  const recent = projects.slice(0,5);
  if(recent.length===0){
    list.innerHTML='<p style="color:var(--text-muted);font-family:var(--font-mono);font-size:.82rem;">No projects yet. <a href="#" data-goto="add" style="color:var(--gold)">Add one →</a></p>';
    return;
  }
  recent.forEach(p=>{
    const item=document.createElement('div');
    item.className='recent-item';
    item.innerHTML=`
      <div class="ri-emoji">${p.emoji||'🚀'}</div>
      <div class="ri-info">
        <p class="ri-title">${p.title}</p>
        <p class="ri-cat">${p.categoryLabel||p.category}</p>
      </div>
      <button class="btn-outline btn-sm edit-btn" data-id="${p.id}">Edit</button>`;
    list.appendChild(item);
  });
  list.querySelectorAll('.edit-btn').forEach(btn=>btn.addEventListener('click',()=>openEditInline(btn.dataset.id)));
}

/* ─── Stats ──────────────────────────────────────────────── */
function updateStats(){
  const set = (id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  set('statTotal',projects.length);
  set('statDev',   projects.filter(p=>p.category==='dev').length);
  set('statDesign',projects.filter(p=>p.category==='design').length);
  set('statData',  projects.filter(p=>p.category==='data').length);
}

function refreshAll(){ updateStats(); renderRecent(); }

/* ─── Toast ──────────────────────────────────────────────── */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg, isError=false){
  clearTimeout(toastTimer);
  toast.textContent=msg;
  toast.style.color = isError ? '#FF6B6B' : 'var(--gold)';
  toast.classList.add('show');
  toastTimer = setTimeout(()=>toast.classList.remove('show'), 3200);
}

/* ─── GitHub Repos Dashboard Sync ─────────────────────────── */
let adminGitHubRepos = [];

async function getHiddenRepos() {
  if (fbReady()) {
    try {
      const snap = await getDB().collection('hidden_repos').get();
      return snap.docs.map(d => String(d.id));
    } catch (err) {
      console.warn('Failed to fetch hidden repos from Firestore, using localStorage:', err);
      return lsGetHiddenRepos();
    }
  } else {
    return lsGetHiddenRepos();
  }
}

async function hideRepo(repoId) {
  if (fbReady()) {
    await getDB().collection('hidden_repos').doc(String(repoId)).set({
      hiddenAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } else {
    const arr = lsGetHiddenRepos();
    if (!arr.includes(String(repoId))) {
      arr.push(String(repoId));
      localStorage.setItem('josh_hidden_repos', JSON.stringify(arr));
    }
  }
}

async function showRepo(repoId) {
  if (fbReady()) {
    await getDB().collection('hidden_repos').doc(String(repoId)).delete();
  } else {
    const arr = lsGetHiddenRepos();
    const filtered = arr.filter(id => id !== String(repoId));
    localStorage.setItem('josh_hidden_repos', JSON.stringify(filtered));
  }
}

function lsGetHiddenRepos() {
  try { return JSON.parse(localStorage.getItem('josh_hidden_repos') || '[]'); }
  catch { return []; }
}

async function renderGitHubGrid(search = '') {
  const grid = document.getElementById('githubGrid');
  const loading = document.getElementById('githubLoading');
  const empty = document.getElementById('githubEmpty');
  const sub = document.getElementById('githubSub');
  
  if (!grid) return;
  grid.innerHTML = '';
  
  if (loading) loading.style.display = 'block';
  if (empty) empty.style.display = 'none';
  
  try {
    if (adminGitHubRepos.length === 0) {
      const res = await fetch('https://api.github.com/users/JOSHMECH/repos?sort=updated&per_page=100');
      if (!res.ok) throw new Error('GitHub API request failed');
      const data = await res.json();
      adminGitHubRepos = data.filter(r => !r.fork);
    }
    
    const hiddenIds = await getHiddenRepos();
    const hiddenSet = new Set(hiddenIds.map(String));
    
    if (loading) loading.style.display = 'none';
    
    const filtered = adminGitHubRepos.filter(r =>
      !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.language || '').toLowerCase().includes(search.toLowerCase())
    );
    
    if (sub) sub.textContent = `${filtered.length} repository${filtered.length !== 1 ? 'ies' : ''} found`;
    if (filtered.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }
    
    filtered.forEach(r => {
      const isHidden = hiddenSet.has(String(r.id));
      const card = document.createElement('div');
      card.className = 'manage-card';
      
      const lang = r.language || 'Code';
      let emoji = '🚀';
      if (lang === 'JavaScript' || lang === 'TypeScript') emoji = '🟨';
      else if (lang === 'Python') emoji = '🐍';
      else if (lang === 'HTML' || lang === 'CSS') emoji = '💻';
      
      card.innerHTML = `
        <div class="mc-thumb" style="font-size:2.5rem;">${emoji}</div>
        <div class="mc-body">
          <p class="mc-cat">${lang}</p>
          <h3 class="mc-title">${r.name}</h3>
          <p class="mc-desc">${r.description || 'Public GitHub repository.'}</p>
          <div class="mc-actions">
            ${isHidden
              ? `<button class="btn-gold btn-sm toggle-github-btn" data-id="${r.id}" data-action="show">Include</button>`
              : `<button class="btn-outline btn-sm toggle-github-btn" data-id="${r.id}" data-action="hide">Exclude</button>`
            }
          </div>
        </div>`;
      grid.appendChild(card);
    });
    
    grid.querySelectorAll('.toggle-github-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        
        btn.disabled = true;
        btn.textContent = 'Saving…';
        
        try {
          if (action === 'hide') {
            await hideRepo(id);
            showToast('Repository hidden from portfolio.');
          } else {
            await showRepo(id);
            showToast('Repository added back to portfolio.');
          }
          await renderGitHubGrid(document.getElementById('githubSearch').value);
        } catch (err) {
          console.error(err);
          showToast('⚠ Failed to save: ' + err.message, true);
        }
      });
    });
    
  } catch (err) {
    if (loading) loading.style.display = 'none';
    console.error('Error rendering GitHub repos:', err);
    grid.innerHTML = `<p style="color:var(--accent-r);text-align:center;grid-column:1/-1;padding:3rem;font-family:var(--font-mono);font-size:.85rem;">Failed to load GitHub repositories: ${err.message}</p>`;
  }
}

const ghSearch = document.getElementById('githubSearch');
if (ghSearch) {
  ghSearch.addEventListener('input', e => renderGitHubGrid(e.target.value));
}

/* ─── Init ───────────────────────────────────────────────── */
if(isLoggedIn()){ showDashboard(); }
else { showLogin(); }
