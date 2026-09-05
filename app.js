'use strict';

/* VS Code 扩展看板 —— 官方市场 API 实时数据 + 自动刷新 */
const API_URL = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery?api-version=7.1-preview.1';
const MARKET_URL = id => `https://marketplace.visualstudio.com/items?itemName=${id}`;

const state = {
  items: [],            // { id, cat, note, name, publisher, desc, version, installs, rating, ratingCount, updated, icon }
  category: 'all',
  query: '',
  sort: 'installs',
  lastFetch: 0,
  loading: false,
  refreshTimer: null,
};

const $ = sel => document.querySelector(sel);
const grid = $('#grid'), chipsEl = $('#chips'), toastEl = $('#toast');

/* ── 数据获取 ─────────────────────────────── */
// 优先走 server.py 同源代理（换常规 UA，绕过市场对 Electron UA 的 403 封锁）；
// 若页面由纯静态服务器托管（无 /api 代理），回退到浏览器直连市场 API。
async function postQuery(body) {
  const init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json;api-version=7.1-preview.1' },
    body: JSON.stringify(body),
  };
  try {
    const res = await fetch('/api/extensionquery', init);
    if (!res.ok) throw new Error(`proxy HTTP ${res.status}`);
    return await res.json();
  } catch {
    const res = await fetch(API_URL, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }
}

async function queryMarket() {
  const CHUNK = 50; // 单次查询的扩展数上限，超出分块并行
  const chunks = [];
  for (let i = 0; i < CATALOG.length; i += CHUNK) chunks.push(CATALOG.slice(i, i + CHUNK));
  const parts = await Promise.all(chunks.map(chunk => postQuery({
    filters: [{
      criteria: chunk.map(e => ({ filterType: 7, value: e.id })),
      pageNumber: 1, pageSize: CHUNK, sortBy: 0, sortOrder: 0,
    }],
    flags: 914, // 含统计信息 + 文件清单（图标）
  })));
  return { results: [{ extensions: parts.flatMap(p => p.results[0].extensions) }] };
}

async function fetchStats(manual = false) {
  if (state.loading) return;
  state.loading = true;
  $('#refreshBtn').classList.add('spinning');
  try {
    const data = await queryMarket();
    const byId = new Map();
    for (const ext of data.results[0].extensions) {
      byId.set(`${ext.publisher.publisherName}.${ext.extensionName}`.toLowerCase(), ext);
    }
    state.items = CATALOG.map(c => {
      const ext = byId.get(c.id.toLowerCase());
      if (!ext) return { ...c, missing: true, name: c.id.split('.')[1], publisher: c.id.split('.')[0] };
      const stat = Object.fromEntries((ext.statistics || []).map(s => [s.statisticName, s.value]));
      const ver = ext.versions?.[0] || {};
      const iconFile = (ver.files || []).find(f => f.assetType === 'Microsoft.VisualStudio.Services.Icons.Default');
      return {
        ...c,
        name: ext.displayName || c.id,
        publisher: ext.publisher.displayName || ext.publisher.publisherName,
        desc: ext.shortDescription || '',
        version: ver.version || '',
        installs: stat.install ?? 0,
        rating: stat.averagerating ?? 0,
        ratingCount: stat.ratingcount ?? 0,
        updated: ext.lastUpdated || '',
        published: ext.publishedDate || '',
        icon: iconFile?.source || (ver.assetUri ? `${ver.assetUri}/Microsoft.VisualStudio.Services.Icons.Default` : ''),
      };
    });
    state.lastFetch = Date.now();
    renderAll();
    if (manual) toast('数据已刷新 ✨');
    const missing = state.items.filter(i => i.missing);
    if (missing.length) console.warn('未在市场找到:', missing.map(i => i.id));
  } catch (err) {
    console.error(err);
    toast(`刷新失败：${err.message}，将按计划重试`, true);
  } finally {
    state.loading = false;
    $('#refreshBtn').classList.remove('spinning');
    scheduleNext();
  }
}

/* ── 自动刷新调度：每天 02:00 定点一次 ────── */
function next2AM(now = new Date()) {
  const t = new Date(now);
  t.setHours(2, 0, 0, 0);
  if (t <= now) t.setDate(t.getDate() + 1);
  return t.getTime();
}

function scheduleNext() {
  clearTimeout(state.refreshTimer);
  if (document.hidden) return;
  state.refreshTimer = setTimeout(() => fetchStats(), next2AM() - Date.now());
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearTimeout(state.refreshTimer);
  } else {
    const lastSlot = next2AM() - 86400000;  // 最近一次 02:00
    if (state.lastFetch && state.lastFetch >= lastSlot) scheduleNext();
    else fetchStats();                       // 错过了就补刷
  }
});

/* ── 渲染 ─────────────────────────────────── */
const fmtInstalls = n =>
  n >= 1e8 ? (n / 1e8).toFixed(1) + ' 亿'
  : n >= 1e4 ? (n / 1e4).toFixed(1) + ' 万'
  : String(Math.round(n));

const fmtUpdated = iso => {
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso)) / 864e5);
  return days <= 0 ? '今天更新' : days === 1 ? '昨天更新' : days < 30 ? `${days} 天前更新` : new Date(iso).toLocaleDateString('zh-CN') + ' 更新';
};

function filtered() {
  let list = state.items;
  if (state.category !== 'all') list = list.filter(i => i.cat === state.category);
  if (state.query) {
    const q = state.query.toLowerCase();
    list = list.filter(i => [i.name, i.publisher, i.desc, i.note, i.id].some(t => t && t.toLowerCase().includes(q)));
  }
  const sorters = {
    installs: (a, b) => (b.installs ?? -1) - (a.installs ?? -1),
    rating:   (a, b) => (b.rating || 0) - (a.rating || 0) || (b.ratingCount || 0) - (a.ratingCount || 0),
    updated:  (a, b) => new Date(b.updated || 0) - new Date(a.updated || 0),
    name:     (a, b) => (a.name || '').localeCompare(b.name || '', 'zh-CN'),
  };
  return [...list].sort(sorters[state.sort]);
}

function renderChips() {
  chipsEl.textContent = '';
  const counts = CATEGORIES.map(c => ({ ...c, n: state.items.filter(i => i.cat === c.id && !i.missing).length }));
  const all = [{ id: 'all', name: '全部', icon: '🗂️', n: state.items.filter(i => !i.missing).length }, ...counts];
  for (const c of all) {
    const btn = document.createElement('button');
    btn.className = 'chip' + (state.category === c.id ? ' active' : '');
    btn.setAttribute('role', 'tab');
    btn.innerHTML = `<span class="chip-icon">${c.icon}</span>${c.name}<span class="chip-count">${c.n}</span>`;
    btn.addEventListener('click', () => { state.category = c.id; renderAll(); });
    chipsEl.appendChild(btn);
  }
}

function starIcon() {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', '13'); s.setAttribute('height', '13');
  s.innerHTML = '<path fill="currentColor" d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.3l7.1-.7z"/>';
  return s;
}

// 单个扩展卡片（看板网格与惊喜弹窗共用）
function buildCard(item, rank = 0) {
  const cat = CATEGORIES.find(c => c.id === item.cat);
  const card = document.createElement('article');
  card.className = 'card' + (item.missing ? ' missing' : '');

  // 头部：图标 + 名称 + 发布者
  const head = document.createElement('div'); head.className = 'card-head';
  const icon = document.createElement('div'); icon.className = 'ext-icon';
  if (item.icon) {
    const img = document.createElement('img');
    img.src = item.icon; img.alt = ''; img.loading = 'lazy';
    img.onerror = () => { img.remove(); icon.textContent = (item.name || '?')[0].toUpperCase(); };
    icon.appendChild(img);
  } else {
    icon.textContent = (item.name || '?')[0].toUpperCase();
  }
  const titleBox = document.createElement('div'); titleBox.className = 'card-title';
  const name = document.createElement('a');
  name.className = 'ext-name'; name.href = MARKET_URL(item.id); name.target = '_blank'; name.rel = 'noopener';
  name.textContent = item.name; name.title = item.id;
  const nameRow = document.createElement('div'); nameRow.className = 'name-row';
  nameRow.appendChild(name);
  // 近 24 个月发布的扩展自动打 NEW 标
  const pubTs = Date.parse(item.published || '');
  if (pubTs && Date.now() - pubTs < 731 * 864e5) {
    const badge = document.createElement('span');
    badge.className = 'new-badge'; badge.textContent = 'NEW';
    badge.title = `${item.published.slice(0, 10)} 上架`;
    nameRow.appendChild(badge);
  }
  const pub = document.createElement('span'); pub.className = 'ext-pub'; pub.textContent = item.publisher || '';
  titleBox.append(nameRow, pub);
  if (rank) {
    const badge = document.createElement('span'); badge.className = `rank rank-${rank}`; badge.textContent = `#${rank}`;
    head.append(icon, titleBox, badge);
  } else head.append(icon, titleBox);

  // 推荐理由 + 描述
  const note = document.createElement('p'); note.className = 'ext-note'; note.textContent = item.note;
  const desc = document.createElement('p'); desc.className = 'ext-desc'; desc.textContent = item.desc || '该扩展暂未在市场找到，可能已下架或更名。';

  // 统计行
  const stats = document.createElement('div'); stats.className = 'card-stats';
  if (!item.missing) {
    const inst = document.createElement('span'); inst.className = 'stat'; inst.title = `${Math.round(item.installs).toLocaleString()} 次安装`;
    inst.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>${fmtInstalls(item.installs)}`;
    const rate = document.createElement('span'); rate.className = 'stat rating'; rate.title = `${item.ratingCount} 人评分`;
    rate.append(starIcon(), document.createTextNode(`${item.rating ? item.rating.toFixed(1) : '—'}${item.ratingCount ? ` (${item.ratingCount})` : ''}`));
    const ver = document.createElement('span'); ver.className = 'stat mono'; ver.textContent = 'v' + item.version;
    const upd = document.createElement('span'); upd.className = 'stat dim'; upd.textContent = fmtUpdated(item.updated);
    stats.append(inst, rate, ver, upd);
  }

  // 底部：分类标签 + 操作
  const foot = document.createElement('div'); foot.className = 'card-foot';
  const tag = document.createElement('button'); tag.className = 'cat-tag';
  tag.textContent = `${cat.icon} ${cat.name}`; tag.title = '筛选此分类';
  tag.addEventListener('click', () => {
    state.category = cat.id; renderAll(); scrollTo({ top: 0, behavior: 'smooth' });
    $('#surpriseModal').hidden = true; // 弹窗里点标签：关弹窗去看分类
  });
  const actions = document.createElement('div'); actions.className = 'card-actions';
  const copyBtn = document.createElement('button'); copyBtn.className = 'mini-btn'; copyBtn.textContent = '复制安装命令';
  copyBtn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(`code --install-extension ${item.id}`); toast(`已复制：code --install-extension ${item.id}`); }
    catch { toast('复制失败，请手动复制', true); }
  });
  const link = document.createElement('a'); link.className = 'mini-btn link'; link.textContent = '市场页面 ↗';
  link.href = MARKET_URL(item.id); link.target = '_blank'; link.rel = 'noopener';
  actions.append(copyBtn, link);
  foot.append(tag, actions);

  card.append(head, note, desc, stats, foot);
  return card;
}

function renderCards() {
  grid.classList.toggle('animate-in', !state.hasRendered); // 只有首次渲染播淡入动画
  grid.textContent = '';
  const list = filtered();
  $('#emptyState').hidden = list.length > 0;
  $('#resultLine').textContent = list.length ? `共 ${list.length} 个扩展` : '';
  const showRank = state.category === 'all' && !state.query && state.sort === 'installs';
  const frag = document.createDocumentFragment();
  list.forEach((item, idx) => frag.appendChild(buildCard(item, showRank && idx < 3 ? idx + 1 : 0)));
  grid.appendChild(frag);
  state.hasRendered = true;
}

/* ── 🎲 惊喜三连：只从惊喜池随机抽 3 个 ────── */
const surpriseModal = $('#surpriseModal'), surpriseGrid = $('#surpriseGrid');
const WOW = new Set(WOW_POOL.map(s => s.toLowerCase()));

function rollSurprise() {
  const pool = state.items.filter(i => WOW.has(i.id.toLowerCase()) && !i.missing);
  if (pool.length < 3) { toast('数据加载中，请稍后再掷～', true); return; }
  for (let i = pool.length - 1; i > 0; i--) { // Fisher-Yates 洗牌
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  surpriseGrid.textContent = '';
  pool.slice(0, 3).forEach((item, k) => {
    const card = buildCard(item);
    card.classList.add('pop');
    card.style.animationDelay = `${k * 90}ms`;
    surpriseGrid.appendChild(card);
  });
}

$('#surpriseBtn').addEventListener('click', () => { surpriseModal.hidden = false; rollSurprise(); });
$('#rerollBtn').addEventListener('click', rollSurprise);
$('#surpriseClose').addEventListener('click', () => { surpriseModal.hidden = true; });
surpriseModal.addEventListener('click', e => { if (e.target === surpriseModal) surpriseModal.hidden = true; });

function renderSkeleton() {
  grid.textContent = '';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('div'); s.className = 'card skeleton';
    s.innerHTML = '<div class="sk-head"><div class="sk-icon"></div><div class="sk-lines"><div></div><div></div></div></div><div class="sk-line"></div><div class="sk-line short"></div>';
    frag.appendChild(s);
  }
  grid.appendChild(frag);
}

function renderAll() { renderChips(); renderCards(); }

/* ── 交互 ─────────────────────────────────── */
let toastTimer;
function toast(msg, isErr = false) {
  toastEl.textContent = msg;
  toastEl.className = 'toast show' + (isErr ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}

$('#searchInput').addEventListener('input', e => { state.query = e.target.value.trim(); renderCards(); });
$('#sortSelect').addEventListener('change', e => { state.sort = e.target.value; renderCards(); });
$('#refreshBtn').addEventListener('click', () => fetchStats(true));
$('#clearFilterBtn').addEventListener('click', () => {
  state.category = 'all'; state.query = ''; $('#searchInput').value = ''; renderAll();
});
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== $('#searchInput')) { e.preventDefault(); $('#searchInput').focus(); }
  if (e.key === 'Escape' && !surpriseModal.hidden) surpriseModal.hidden = true;
});

/* ── 启动 ─────────────────────────────────── */
renderChips();
renderSkeleton();
fetchStats();
