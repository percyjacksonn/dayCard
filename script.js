
// ============================================================
// STATE
// ============================================================
const DEFAULT_STATE = {
  layout: 'compact',
  theme: 'violet',
  background: 'dots',
  accent: '#d9a441',
  borderStyle: 'gradient',
  radius: 16,
  sidebarOpen: true,
  options: { day: true, streak: true, focus: true, tasks: true, extra: true },
  fields: {
    dayCurrent: '24', dayTotal: '100',
    date: '24 June 2026',
    quote: "It's been a long day of coding. Started understanding complex React state patterns and implemented a new UI component. Progress feels slow but steady.",
    streakValue: '24', focusHours: '5', focusMinutes: '25',
    extraValue: '85', tasksDoneValue: '3',
    footerQuote: 'Discipline today, freedom tomorrow.',
    alertText: 'A productive day of learning and building.',
    progressName: 'Project Alpha',
    ringPercent: '75%',
  },
  tasks: [
    { id: 't1', text: 'Complete React component', checked: false },
    { id: 't2', text: 'Finish DSA practice', checked: true },
    { id: 't3', text: 'Push code to GitHub', checked: false },
    { id: 't4', text: 'Read 10 pages', checked: true },
    { id: 't5', text: 'Workout', checked: false },
  ],
  avatarSrc: null,
  snapPhotoSrc: null,
  codeBlocks: { codeBlock1: null, codeBlock2: null }
};

let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
let undoStack = [], redoStack = [], historySuppressed = false;

function snap() { return JSON.parse(JSON.stringify(state)); }
function pushHistory() { if (historySuppressed) return; undoStack.push(snap()); if (undoStack.length > 50) undoStack.shift(); redoStack = []; updateUndoRedoBtns(); }
function updateUndoRedoBtns() {
  const u = document.getElementById('undo-btn'), r = document.getElementById('redo-btn');
  if (u) u.disabled = undoStack.length === 0;
  if (r) r.disabled = redoStack.length === 0;
}

function undo() { if (!undoStack.length) { showToast('Nothing to undo'); return; } redoStack.push(snap()); state = undoStack.pop(); historySuppressed = true; renderAll(); historySuppressed = false; updateUndoRedoBtns(); showToast('Undone'); }
function redo() { if (!redoStack.length) { showToast('Nothing to redo'); return; } undoStack.push(snap()); state = redoStack.pop(); historySuppressed = true; renderAll(); historySuppressed = false; updateUndoRedoBtns(); showToast('Redone'); }

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ============================================================
// SIDEBAR TOGGLE (single function — works on desktop AND mobile)
// ============================================================
function isMobileViewport() { return window.innerWidth <= 768; }

function setSidebarOpen(open) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const hamburgerIcon = document.querySelector('#hamburger-btn svg');
  if (!sidebar) return;

  state.sidebarOpen = open;

  if (isMobileViewport()) {
    sidebar.classList.remove('collapsed');
    sidebar.classList.toggle('open', open);
    if (overlay) {
      if (open) { overlay.style.display = 'block'; requestAnimationFrame(() => overlay.classList.add('open')); }
      else { overlay.classList.remove('open'); setTimeout(() => { if (!overlay.classList.contains('open')) overlay.style.display = 'none'; }, 280); }
    }
  } else {
    sidebar.classList.remove('open');
    sidebar.classList.toggle('collapsed', !open);
    if (overlay) { overlay.classList.remove('open'); overlay.style.display = 'none'; }
  }

  if (hamburgerIcon) hamburgerIcon.style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
}

function toggleSidebar() { setSidebarOpen(!state.sidebarOpen); }

let lastViewportWasMobile = isMobileViewport();
function handleViewportChange() {
  const nowMobile = isMobileViewport();
  if (nowMobile === lastViewportWasMobile) return;
  lastViewportWasMobile = nowMobile;
  if (nowMobile) { setSidebarOpen(false); }
  else { setSidebarOpen(true); }
}

// ============================================================
// LAYOUT
// ============================================================
function setLayout(layout) { pushHistory(); state.layout = layout; applyLayout(); document.querySelectorAll('.layout-card').forEach(b => b.classList.toggle('active', b.dataset.layout === layout)); }
function applyLayout() {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
  const map = { compact: 'card-compact', checklist: 'card-checklist', snapshots: 'card-snapshots' };
  const el = document.getElementById(map[state.layout]);
  if (el) el.classList.add('active');
}

// ============================================================
// THEME / BG / ACCENT / BORDER / RADIUS
// ============================================================
const THEME_GRADIENTS = {
  violet: 'linear-gradient(150deg, rgba(217,164,65,0.4), rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.02))',
};

function setTheme(theme) { pushHistory(); state.theme = theme; applyTheme(); document.querySelectorAll('.theme-swatch').forEach(s => s.classList.toggle('active', s.dataset.theme === theme)); }
function applyTheme() {
  const g = THEME_GRADIENTS[state.theme] || THEME_GRADIENTS.violet;
  let st = document.getElementById('dynamic-theme-style');
  if (!st) { st = document.createElement('style'); st.id = 'dynamic-theme-style'; document.head.appendChild(st); }
  st.textContent = `.card::before { background: ${g}; }`;
}

function setBackground(bg) {
  pushHistory(); state.background = bg; applyBackground();
  document.querySelectorAll('.bg-opt').forEach(b => b.classList.toggle('active', b.dataset.bg === bg));
}
function applyBackground() {
  document.querySelectorAll('.card').forEach(card => { card.dataset.cardbg = state.background; });
}

function setAccent(color) {
  pushHistory(); state.accent = color; applyAccent();
  document.querySelectorAll('.accent-swatch[data-accent]').forEach(s => {
    const match = s.dataset.accent === color; s.classList.toggle('active', match);
    s.innerHTML = match ? '<svg viewBox="0 0 24 24" fill="none" stroke="#141118" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  });
}
function applyAccent() {
  document.documentElement.style.setProperty('--accent', state.accent);
  const hex = state.accent.replace('#','');
  if (hex.length === 6) {
    const r=parseInt(hex.substring(0,2),16),g=parseInt(hex.substring(2,4),16),b=parseInt(hex.substring(4,6),16);
    document.documentElement.style.setProperty('--accent-rgb',`${r},${g},${b}`);
    document.documentElement.style.setProperty('--accent-soft',`rgba(${r},${g},${b},0.12)`);
    document.documentElement.style.setProperty('--accent-line',`rgba(${r},${g},${b},0.35)`);
  }
  const ringFg = document.getElementById('ring-fg-snap');
  if (ringFg) ringFg.style.stroke = state.accent;
  applyBorder();
}

function setBorder(style) {
  state.borderStyle = style;
  applyBorder();
  document.querySelectorAll('.accent-swatch[data-border]').forEach(s => {
    const match = s.dataset.border === style; s.classList.toggle('active', match);
    s.innerHTML = match ? '<svg viewBox="0 0 24 24" fill="none" stroke="#141118" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  });
}
function applyBorder() {
  let st = document.getElementById('dynamic-border-style');
  if (!st) { st = document.createElement('style'); st.id = 'dynamic-border-style'; document.head.appendChild(st); }
  if (state.borderStyle === 'gradient') {
    st.textContent = `.card::before{background:linear-gradient(150deg, rgba(var(--accent-rgb),0.4), rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.02));opacity:1;}`;
  } else {
    st.textContent = `.card::before { background: ${state.borderStyle}; opacity: 0.85; }`;
  }
}

function setRadius(val) { state.radius = val; document.documentElement.style.setProperty('--radius', val+'px'); const el = document.getElementById('radius-value'); if (el) el.textContent = val+'px'; }

// ============================================================
// OPTIONS
// ============================================================
function setOption(key, val) { pushHistory(); state.options[key] = val; applyOptions(); }
function applyOptions() {
  const o = state.options;
  document.querySelectorAll('[data-show="day"]').forEach(el => el.style.display = o.day ? '' : 'none');
  updateMetricRow('metric-row-compact', ['streak','focus','extra']);
  updateMetricRow('metric-row-checklist', ['streak','focus','tasks']);
  updateMetricRow('metric-row-snap', ['streak','focus','extra']);
}
function updateMetricRow(rowId, keys) {
  const row = document.getElementById(rowId); if (!row) return;
  let count = 0;
  keys.forEach(k => {
    const box = row.querySelector(`[data-metric="${k}"]`); if (!box) return;
    const vis = !!state.options[k]; box.classList.toggle('hidden', !vis); if (vis) count++;
  });
  row.dataset.count = count || 1;
}

// ============================================================
// DOT PROGRESS
// ============================================================
function updateDotProgress() {
  const cur = parseInt(state.fields.dayCurrent) || 0;
  const tot = parseInt(state.fields.dayTotal) || 100;
  const filled = Math.ceil((cur / tot) * 4);
  ['dot-progress-compact','dot-progress-checklist','dot-progress-snap'].forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    el.querySelectorAll('.dot').forEach((d,i) => d.classList.toggle('filled', i < filled));
  });
}

// ============================================================
// FIELD SYNC
// ============================================================
function bindEditableFields() {
  document.querySelectorAll('[contenteditable="true"][data-field]').forEach(el => {
    if (el.dataset.field === 'ringPercent' || el.dataset.field === 'codeBlock1' || el.dataset.field === 'codeBlock2') return;
    el.addEventListener('focus', () => { el._before = snap(); });
    el.addEventListener('blur', () => {
      const field = el.dataset.field, val = el.textContent.trim();
      if (state.fields[field] !== val) {
        if (el._before) { undoStack.push(el._before); if (undoStack.length>50) undoStack.shift(); redoStack = []; updateUndoRedoBtns(); }
        state.fields[field] = val;
        syncField(field, val);
        if (field === 'dayCurrent' || field === 'dayTotal') updateDotProgress();
      }
    });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' && !el.classList.contains('blockquote-text')) { e.preventDefault(); el.blur(); } });
  });

  const ringLabel = document.getElementById('ring-label-snap');
  if (ringLabel) {
    ringLabel.addEventListener('focus', () => { ringLabel._before = snap(); });
    ringLabel.addEventListener('blur', () => {
      let val = ringLabel.textContent.trim();
      let num = parseInt(val.replace(/[^0-9]/g,'')) || 0;
      num = Math.max(0, Math.min(100, num));
      val = num + '%';
      if (state.fields.ringPercent !== val) {
        if (ringLabel._before) { undoStack.push(ringLabel._before); redoStack = []; updateUndoRedoBtns(); }
        state.fields.ringPercent = val;
      }
      ringLabel.textContent = val;
      applyRingPercent();
    });
    ringLabel.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ringLabel.blur(); } });
  }

  ['codeBlock1','codeBlock2'].forEach(field => {
    const el = document.querySelector(`[data-field="${field}"]`);
    if (!el) return;
    el.addEventListener('focus', () => { el._before = snap(); });
    el.addEventListener('blur', () => {
      const val = el.textContent;
      if (state.codeBlocks[field] !== val) {
        if (el._before) { undoStack.push(el._before); redoStack = []; updateUndoRedoBtns(); }
        state.codeBlocks[field] = val;
      }
    });
  });
}

function applyRingPercent() {
  const num = parseInt((state.fields.ringPercent || '75%').replace(/[^0-9]/g,'')) || 0;
  const ringFg = document.getElementById('ring-fg-snap');
  if (ringFg) {
    const circumference = 251.2;
    const offset = circumference - (circumference * num / 100);
    ringFg.style.strokeDashoffset = offset;
  }
}

function syncField(field, val) {
  document.querySelectorAll(`[data-field="${field}"]`).forEach(el => {
    if (el.getAttribute('contenteditable') === 'true') { if (el.textContent !== val) el.textContent = val; }
    else el.textContent = val;
  });
}

function applyFields() {
  Object.entries(state.fields).forEach(([k,v]) => syncField(k,v));
  updateDotProgress();
  applyRingPercent();
  Object.entries(state.codeBlocks).forEach(([field, val]) => {
    if (val !== null && val !== undefined) {
      const el = document.querySelector(`[data-field="${field}"]`);
      if (el && el.textContent !== val) el.textContent = val;
    }
  });
}

// ============================================================
// AVATAR (profile photo — Compact / Checklist / Snapshots header)
// ============================================================
function bindAvatarUploads() {
  document.querySelectorAll('.avatar-input').forEach(input => {
    input.addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        pushHistory();
        state.avatarSrc = ev.target.result;
        applyAvatar();
        showToast('Profile image updated ✓');
      };
      reader.readAsDataURL(file);
    });
  });
}

function applyAvatar() {
  if (!state.avatarSrc) return;
  ['compact','checklist','snap'].forEach(id => {
    const img = document.getElementById(`avatar-img-${id}`);
    const ph = document.getElementById(`avatar-placeholder-${id}`);
    if (img) { img.src = state.avatarSrc; img.style.display = 'block'; }
    if (ph) ph.style.display = 'none';
  });
}

// ============================================================
// SNAPSHOT PHOTO
// ============================================================
function bindSnapPhotoUpload() {
  const input = document.getElementById('snap-photo-input');
  if (!input) return;
  input.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pushHistory();
      state.snapPhotoSrc = ev.target.result;
      applySnapPhoto();
      showToast('Snapshot photo updated ✓');
    };
    reader.readAsDataURL(file);
  });
}

function applySnapPhoto() {
  const wrap = document.getElementById('snap-photo-wrap');
  const img = document.getElementById('snap-photo-img');
  const ph = document.getElementById('snap-photo-placeholder');
  const overlayText = document.getElementById('snap-photo-overlay-text');
  if (!wrap || !img || !ph) return;
  if (state.snapPhotoSrc) {
    img.src = state.snapPhotoSrc; img.style.display = 'block';
    ph.style.display = 'none';
    wrap.classList.add('has-image');
    if (overlayText) overlayText.textContent = 'Replace photo';
  } else {
    img.style.display = 'none';
    ph.style.display = 'flex';
    wrap.classList.remove('has-image');
    if (overlayText) overlayText.textContent = 'Upload photo';
  }
}

// ============================================================
// CHECKLIST
// ============================================================
function renderChecklist() {
  const box = document.getElementById('checklist-box'); if (!box) return;
  box.innerHTML = '';
  state.tasks.forEach(task => {
    const row = document.createElement('div');
    row.className = 'checklist-item' + (task.checked ? ' checked' : '');
    row.dataset.id = task.id;

    const toggle = document.createElement('button');
    toggle.className = 'check-toggle';
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    toggle.addEventListener('click', () => toggleTask(task.id));

    const text = document.createElement('div');
    text.className = 'checklist-item-text';
    text.contentEditable = 'true';
    text.textContent = task.text;
    text.addEventListener('focus', () => text._before = snap());
    text.addEventListener('blur', () => {
      const v = text.textContent.trim();
      if (v !== task.text) { if (text._before) { undoStack.push(text._before); redoStack = []; updateUndoRedoBtns(); } task.text = v; }
    });
    text.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); text.blur(); } });

    const del = document.createElement('button');
    del.className = 'task-delete';
    del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    del.addEventListener('click', () => deleteTask(task.id));

    row.appendChild(toggle); row.appendChild(text); row.appendChild(del);
    box.appendChild(row);
  });
  updateTaskCount();
}

function toggleTask(id) { pushHistory(); const t = state.tasks.find(x => x.id === id); if (t) t.checked = !t.checked; renderChecklist(); }
function deleteTask(id) { pushHistory(); state.tasks = state.tasks.filter(x => x.id !== id); renderChecklist(); }
function addTask() {
  pushHistory(); const id = 't' + Date.now();
  state.tasks.push({ id, text: 'New task', checked: false }); renderChecklist();
  requestAnimationFrame(() => {
    const el = document.querySelector(`.checklist-item[data-id="${id}"] .checklist-item-text`);
    if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); el.focus(); }
  });
}
function updateTaskCount() {
  const done = state.tasks.filter(t => t.checked).length;
  state.fields.tasksDoneValue = String(done); syncField('tasksDoneValue', String(done));
}

// ============================================================
// HEADER UTIL BUTTONS (Edit / Delete)
// ============================================================
function bindHeaderUtilButtons() {
  document.querySelectorAll('[data-action-btn="edit"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card'); if (!card) return;
      const target = card.querySelector('[data-field="dayCurrent"]') || card.querySelector('.blockquote-text');
      if (target) {
        target.focus();
        const r = document.createRange(); r.selectNodeContents(target);
        const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      }
      showToast('Click any value to edit it');
    });
  });
  document.querySelectorAll('[data-action-btn="delete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      pushHistory();
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      renderAll();
      showToast('Card reset to defaults');
    });
  });
}

// ============================================================
// CAT
// ============================================================
let catPos = 30, catDir = 1, catPaused = false, catInterval = null;
function startCat() {
  const cat = document.getElementById('cat'); if (!cat) return;
  if (catInterval) clearInterval(catInterval);
  catInterval = setInterval(() => {
    if (catPaused) return;
    catPos += catDir * 0.3;
    if (catPos >= 85) { catPos = 85; catDir = -1; cat.classList.add('flipped'); }
    else if (catPos <= 2) { catPos = 2; catDir = 1; cat.classList.remove('flipped'); }
    cat.style.left = catPos + '%';
  }, 40);
  cat.addEventListener('dblclick', () => {
    catPaused = true; cat.classList.remove('jump');
    requestAnimationFrame(() => cat.classList.add('jump'));
    const bubble = document.getElementById('meow-bubble');
    if (bubble) { bubble.classList.remove('show'); requestAnimationFrame(() => bubble.classList.add('show')); }
    setTimeout(() => { cat.classList.remove('jump'); if (bubble) bubble.classList.remove('show'); catPaused = false; }, 1500);
  });
}

// ============================================================
// EXPORT
// ============================================================
function getActiveCard() { return document.querySelector('.card.active'); }

async function exportImg(format) {
  const el = getActiveCard();
  if (!el || typeof html2canvas === 'undefined') { showToast('Export unavailable'); return null; }
  return await html2canvas(el, { backgroundColor: '#0a0a0c', scale: 3, useCORS: true, logging: false });
}

async function downloadCard(format) {
  showToast('Generating…');
  try {
    const canvas = await exportImg(format); if (!canvas) return;
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.download = `day-card-${state.fields.dayCurrent}.${format}`;
    link.href = canvas.toDataURL(mime, 0.95);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    showToast(`Downloaded ${format.toUpperCase()} ✓`);
  } catch(e) { console.error(e); showToast('Export failed'); }
}

async function copyCard() {
  showToast('Copying…');
  try {
    const canvas = await exportImg('png'); if (!canvas) return;
    canvas.toBlob(async blob => {
      try { await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]); showToast('Copied to clipboard ✓'); }
      catch { showToast('Clipboard not supported here'); }
    }, 'image/png');
  } catch(e) { showToast('Copy failed'); }
}

function buildShareLink() {
  const day = state.fields.dayCurrent || '0';
  const encoded = btoa(encodeURIComponent(JSON.stringify(state)));
  return `${location.origin}${location.pathname}?day=${encodeURIComponent(day)}#${encoded}`;
}

function openShare() {
  const overlay = document.getElementById('share-modal-overlay');
  const input = document.getElementById('share-link-input');
  if (!overlay || !input) return;
  input.value = buildShareLink();
  overlay.classList.add('open');
}

function loadSharedStateFromHash() {
  if (!location.hash || location.hash.length < 2) return false;
  try {
    const json = decodeURIComponent(atob(location.hash.slice(1)));
    const shared = JSON.parse(json);
    if (shared && typeof shared === 'object' && shared.fields) {
      state = Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)), shared);
      return true;
    }
  } catch (e) { /* malformed hash — ignore and fall back to defaults */ }
  return false;
}

function handleExportAction(action) {
  switch (action) {
    case 'png': downloadCard('png'); break;
    case 'jpg': downloadCard('jpg'); break;
    case 'download': downloadCard('png'); break;
    case 'copy': copyCard(); break;
    case 'share': openShare(); break;
  }
}

// ============================================================
// RENDER ALL
// ============================================================
function renderAll() {
  applyLayout();
  document.querySelectorAll('.layout-card').forEach(b => b.classList.toggle('active', b.dataset.layout === state.layout));
  applyTheme();
  document.querySelectorAll('.theme-swatch').forEach(s => s.classList.toggle('active', s.dataset.theme === state.theme));
  applyBackground();
  document.querySelectorAll('.bg-opt').forEach(b => b.classList.toggle('active', b.dataset.bg === state.background));
  applyAccent();
  document.querySelectorAll('.accent-swatch[data-accent]').forEach(s => {
    const match = s.dataset.accent === state.accent; s.classList.toggle('active', match);
    s.innerHTML = match ? '<svg viewBox="0 0 24 24" fill="none" stroke="#141118" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '';
  });
  applyBorder();
  const rs = document.getElementById('radius-slider'); if (rs) rs.value = state.radius;
  setRadius(state.radius);
  document.querySelectorAll('.opt-toggle').forEach(inp => inp.checked = state.options[inp.dataset.target]);
  applyOptions();
  applyFields();
  renderChecklist();
  applyAvatar();
  applySnapPhoto();
  updateUndoRedoBtns();
  updateDotProgress();
}

// ============================================================
// SIDEBAR TABS
// ============================================================
function wireTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.dataset.tab;
      document.querySelectorAll('.panel-section').forEach(p => p.classList.add('hidden'));
      const panel = document.getElementById('panel-' + name);
      if (panel) panel.classList.remove('hidden');
    });
  });
}

// ============================================================
// INIT & WIRE
// ============================================================
function init() {
  loadSharedStateFromHash();
  wireTabs();

  document.getElementById('hamburger-btn')?.addEventListener('click', toggleSidebar);
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => setSidebarOpen(false));

  document.querySelectorAll('.layout-card').forEach(b => b.addEventListener('click', () => setLayout(b.dataset.layout)));

  document.querySelectorAll('.theme-swatch').forEach(b => b.addEventListener('click', () => setTheme(b.dataset.theme)));
  document.getElementById('add-theme-btn')?.addEventListener('click', () => showToast('Custom gradient builder coming soon'));

  document.querySelectorAll('.bg-opt').forEach(b => b.addEventListener('click', () => setBackground(b.dataset.bg)));

  document.querySelectorAll('.accent-swatch[data-accent]').forEach(b => b.addEventListener('click', () => setAccent(b.dataset.accent)));
  document.getElementById('custom-accent-input')?.addEventListener('input', e => setAccent(e.target.value));

  document.querySelectorAll('.accent-swatch[data-border]').forEach(b => b.addEventListener('click', () => setBorder(b.dataset.border)));

  const rs = document.getElementById('radius-slider');
  if (rs) { rs.addEventListener('input', e => setRadius(parseInt(e.target.value))); rs.addEventListener('change', () => pushHistory()); }

  document.querySelectorAll('.opt-toggle').forEach(inp => inp.addEventListener('change', e => setOption(e.target.dataset.target, e.target.checked)));

  document.getElementById('reset-all-btn')?.addEventListener('click', () => { pushHistory(); state = JSON.parse(JSON.stringify(DEFAULT_STATE)); renderAll(); showToast('Reset to defaults'); });

  document.getElementById('undo-btn')?.addEventListener('click', undo);
  document.getElementById('redo-btn')?.addEventListener('click', redo);
  document.getElementById('preview-btn')?.addEventListener('click', () => { document.body.classList.toggle('preview-mode'); showToast(document.body.classList.contains('preview-mode') ? 'Preview mode on' : 'Preview mode off'); });
  document.getElementById('export-top-btn')?.addEventListener('click', () => downloadCard('png'));

  document.querySelectorAll('.tray-btn').forEach(b => b.addEventListener('click', () => handleExportAction(b.dataset.action)));

  bindHeaderUtilButtons();

  document.getElementById('modal-close-btn')?.addEventListener('click', () => document.getElementById('share-modal-overlay')?.classList.remove('open'));
  document.getElementById('share-modal-overlay')?.addEventListener('click', e => { if (e.target.id === 'share-modal-overlay') e.target.classList.remove('open'); });
  document.getElementById('copy-link-btn')?.addEventListener('click', async () => {
    const inp = document.getElementById('share-link-input'); if (!inp) return;
    try { await navigator.clipboard.writeText(inp.value); showToast('Link copied ✓'); } catch { inp.select(); showToast('Select & copy the link'); }
  });

  document.getElementById('add-task-btn')?.addEventListener('click', addTask);

  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    if (document.activeElement?.isContentEditable) return;
    if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
  });

  bindEditableFields();
  bindAvatarUploads();
  bindSnapPhotoUpload();

  document.getElementById('snap-photo-wrap')?.addEventListener('click', e => {
    if (e.target.id === 'snap-photo-input') return;
  });

  renderAll();
  startCat();

  setSidebarOpen(!isMobileViewport());
  window.addEventListener('resize', handleViewportChange);
}

document.addEventListener('DOMContentLoaded', init);