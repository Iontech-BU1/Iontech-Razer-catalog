/* Iontech Razer Catalog — offline-capable product catalog */
(() => {
'use strict';
const C = window.CATALOG || { meta: {}, products: [] };
const P = C.products;
const BY = Object.fromEntries(P.map(p => [p.sku, p]));
const FAMILIES = ['Viper','Barracuda','DeathAdder','BlackShark','Cobra','Atlas','Basilisk','BlackWidow','Gigantus','Goliathus','Hammerhead','Huntsman','Kiyo','Kraken','Leviathan','Nommo','Ornata','Orochi','Seiren','Others'];
const TABS = [
  { id: 'all', label: 'All Products', test: () => true },
  { id: 'hot', label: 'Hot Items', test: p => p.hot, cls: 'hot' },
  { id: 'mouse', label: 'Mouse', test: p => p.category === 'Mouse' },
  { id: 'headset', label: 'Headset', test: p => p.category === 'Headset' },
  { id: 'keyboard', label: 'Keyboard', test: p => p.category === 'Keyboard' },
  { id: 'controller', label: 'Controller', test: p => p.category === 'Controller' },
  { id: 'streaming', label: 'Streaming', test: p => p.category === 'Streaming' },
  { id: 'promos', label: 'Promos', test: p => p.promo != null, cls: 'promo' },
];
const MULTI_CAT = new Set(['promos', 'all', 'hot']);
const BUILT = Date.parse((C.meta.built || '').replace(' ', 'T')) || Date.now();
const NEW_WINDOW = 90 * 864e5;

const $ = s => document.querySelector(s);
const short = n => String(n || '').replace(/^Razer(™)?\s+/i, '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const peso = n => n == null ? null : '₱' + Number(n).toLocaleString('en-PH', { maximumFractionDigits: 2 });
const effPrice = p => (p.promo != null && p.srp != null && p.promo < p.srp) ? p.promo : (p.srp ?? p.promo ?? 0);
const hasPromo = p => p.promo != null;
const isNew = p => !p.arrival_estimated && p.arrival && (BUILT - p.arrival * 1000) < NEW_WINDOW;
const store = {
  get(k, d) { try { const v = localStorage.getItem('rzcat:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('rzcat:' + k, JSON.stringify(v)); } catch {} },
};
const ICON = {
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  img: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>',
  ext: '<svg viewBox="0 0 24 24"><path d="M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg>',
};

/* ---------- search index ---------- */
for (const p of P) {
  const specVals = (p.sections || []).flatMap(s => s.rows.map(r => r[1])).join(' ');
  p._name = (p.name + ' ' + p.pricelist_name).toLowerCase();
  p._id = (p.sku + ' ' + p.sku.replace(/-/g, '') + ' ' + (p.upc || '') + ' ' + (p.material || '')).toLowerCase();
  p._all = [p._name, p._id, p.category, p.subcategory, p.family, p.subfamily, (p.ksp || []).join(' '), p.description, specVals].join(' ').toLowerCase().replace(/[™®]/g, '');
}
function score(p, toks) {
  let s = 0;
  for (const t of toks) {
    if (p._id.includes(t)) s += 6;
    else if (p._name.includes(t)) s += 3;
    else if (p._all.includes(t)) s += 1;
    else return 0;
  }
  return s;
}

/* ---------- state ---------- */
const st = {
  tab: store.get('tab', 'all'),
  q: '',
  fams: new Set(),
  subs: new Set(),
  cats: new Set(),
  sort: store.get('sort', 'new'),
  layout: store.get('layout', 'grid'),
  cmp: store.get('cmp', []).filter(s => BY[s]),
};
if (!TABS.some(t => t.id === st.tab)) st.tab = 'all';

/* ---------- filtering ---------- */
function matches(opts = {}) {
  const toks = st.q.toLowerCase().replace(/[™®]/g, '').split(/\s+/).filter(Boolean);
  const tab = TABS.find(t => t.id === (opts.tab || st.tab));
  const out = [];
  for (const p of P) {
    if (!tab.test(p)) continue;
    if (!opts.ignoreCat && st.cats.size && MULTI_CAT.has(tab.id) && !st.cats.has(p.category)) continue;
    if (!opts.ignoreFam && st.fams.size && !st.fams.has(p.family)) continue;
    if (!opts.ignoreSub && st.subs.size && !st.subs.has(groupKey(p, tab.id))) continue;
    let sc = 1;
    if (toks.length) { sc = score(p, toks); if (!sc) continue; }
    out.push([p, sc]);
  }
  return out;
}
function sorted(list) {
  const s = st.q && st.sort === 'relevance' ? 'relevance' : st.sort;
  const cmp = {
    relevance: (a, b) => b[1] - a[1] || b[0].arrival - a[0].arrival,
    new: (a, b) => b[0].arrival - a[0].arrival || a[0].name.localeCompare(b[0].name),
    'price-asc': (a, b) => effPrice(a[0]) - effPrice(b[0]) || a[0].name.localeCompare(b[0].name),
    'price-desc': (a, b) => effPrice(b[0]) - effPrice(a[0]) || a[0].name.localeCompare(b[0].name),
    family: (a, b) => (a[0].family === 'Others') - (b[0].family === 'Others') || famKey(a[0]).localeCompare(famKey(b[0])) || a[0].subfamily.localeCompare(b[0].subfamily) || effPrice(a[0]) - effPrice(b[0]),
  }[s] || ((a, b) => 0);
  return list.sort(cmp).map(x => x[0]);
}
const famKey = p => p.family === 'Others' ? (p.subfamily || '') : p.family;

/* ---------- render: tabs ---------- */
function renderTabs() {
  $('#tabs').innerHTML = TABS.map(t => {
    const n = matches({ tab: t.id, ignoreCat: true, ignoreFam: true, ignoreSub: true }).length;
    return `<button class="tab ${t.cls || ''}" role="tab" data-tab="${t.id}" aria-selected="${t.id === st.tab}">${esc(t.label)}<span class="n">${n}</span></button>`;
  }).join('');
}

/* ---------- render: filters ---------- */
function renderFilters() {
  const multi = MULTI_CAT.has(st.tab);
  $('#catGroup').hidden = !multi;
  if (multi) {
    const base = matches({ ignoreCat: true });
    const cnt = {};
    base.forEach(([p]) => cnt[p.category] = (cnt[p.category] || 0) + 1);
    const cats = [...new Set(P.filter(TABS.find(t => t.id === st.tab).test).map(p => p.category))].sort();
    $('#catChips').innerHTML = cats.map(c => chip('cat', c, cnt[c] || 0, st.cats.has(c))).join('');
  }
  const base = matches({ ignoreFam: true });
  const cnt = {};
  base.forEach(([p]) => cnt[p.family] = (cnt[p.family] || 0) + 1);
  const tot = base.length;
  $('#famChips').innerHTML = `<button class="fam ${st.fams.size ? '' : 'on'}" data-famall>All families<span>${tot}</span></button>` + FAMILIES.map(f => `<button class="fam ${st.fams.has(f) ? 'on' : ''}" data-fam="${esc(f)}" ${!cnt[f] && !st.fams.has(f) ? 'disabled' : ''}><i class="cb"></i>${esc(f)}<span>${cnt[f] || 0}</span></button>`).join('');
  const n = st.fams.size + (multi ? st.cats.size : 0);
  $('#filterCount').hidden = !n; $('#filterCount').textContent = n;
}
const chip = (kind, v, n, on) => `<button class="chip" data-${kind}="${esc(v)}" aria-pressed="${on}" ${!n && !on ? 'disabled' : ''}>${esc(v)}<small>${n}</small></button>`;

/* ---------- family strip (Razer-style pop-out) ---------- */
const CAT_REP = { Mouse: ['DeathAdder'], Headset: ['BlackShark'], Keyboard: ['BlackWidow', 'Huntsman'], Controller: ['Wolverine'], Streaming: ['Seiren'], Accessories: ['Base Station', 'Mouse Bungee'], Mousepad: ['Firefly', 'Goliathus'], Chair: ['Iskur'], Earbuds: ['Hammerhead'], Bag: ['Rogue'], Speakers: ['Nommo'] };
const icon = p => p.image ? p.image.replace('img/', 'img/thumb/') : '';
const groupKey = (p, tabId) => MULTI_CAT.has(tabId) ? p.category : (p.subfamily || p.family);
function renderStrip() {
  const tab = TABS.find(t => t.id === st.tab);
  const base = matches({ ignoreSub: true });
  const groups = new Map();
  for (const [p] of base) {
    const k = groupKey(p, st.tab);
    const g = groups.get(k) || { n: 0, img: '', imgDate: -1, isNew: false };
    g.n++; if (isNew(p)) g.isNew = true;
    const pref = MULTI_CAT.has(st.tab) ? (CAT_REP[p.category] || []).indexOf(p.subfamily) : 0;
    const score = (pref >= 0 ? 1e12 * (10 - pref) : 0) + (p.img_match === 'exact' ? 5e11 : 0) + (/black/i.test(p.name) || !/white|quartz|mercury|pink|green|edition|kuromi|hello kitty|minecraft|zzz|wuthering|niko|faker|cs2|counter/i.test(p.name) ? 2e11 : 0) + (p.hot ? 1e11 : 0) + (p.arrival || 0);
    if (p.image && score > g.imgDate) { g.img = icon(p); g.imgDate = score; }
    groups.set(k, g);
  }
  for (const k of st.subs) if (!groups.has(k)) groups.set(k, { n: 0, img: '', isNew: false });
  const items = [...groups.entries()].sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]));
  const label = MULTI_CAT.has(st.tab) ? 'categories' : 'families';
  $('#famstrip').innerHTML = `<div class="fs-inner">
    <button class="fs-item ${st.subs.size ? '' : 'on'}" data-suball><span class="fs-ic fs-all"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg></span><span class="fs-nm">All ${label}</span></button>
    ${items.map(([k, g]) => `<button class="fs-item ${st.subs.has(k) ? 'on' : ''}" data-sub="${esc(k)}" title="${esc(k)} · ${g.n} products">
      <span class="fs-ic fs-ph">${g.img ? `<img src="${esc(g.img)}" alt="" loading="lazy">` : (MULTI_CAT.has(st.tab) ? RZ_ICONS.category(k) : RZ_ICONS.family(k, tab.label))}</span>
      <span class="fs-nm">${esc(k)}</span>${g.isNew ? '<span class="fs-new">NEW</span>' : ''}</button>`).join('')}
  </div>`;
}

/* ---------- render: cards ---------- */
function hl(text) {
  const toks = st.q.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  let h = esc(text);
  if (!toks.length) return h;
  const re = new RegExp('(' + toks.map(t => esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
  return h.replace(re, '<mark>$1</mark>');
}
function imgTag(p, cls = '') {
  if (p.image) return `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" class="${cls}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'noimg',innerHTML:'<img src=&quot;assets/razer-logo.png&quot; alt=&quot;&quot;>Image unavailable offline'}))">`;
  return `<div class="noimg"><img src="assets/razer-logo.png" alt="">No photo available</div>`;
}
function priceCells(p) {
  const promo = hasPromo(p);
  const struck = promo && p.promo < p.srp;
  return `<div class="price srp ${struck ? 'struck' : ''}"><span>SRP</span><b>${peso(p.srp) ?? '<i class="na">—</i>'}</b></div>
    <div class="price pr"><span>Promo SRP</span><b>${promo ? peso(p.promo) : '<i class="na">—</i>'}</b></div>
    <div class="price dp"><span>DP</span><b>${peso(p.dp) ?? '<i class="na">—</i>'}</b></div>`;
}
function card(p) {
  const inCmp = st.cmp.includes(p.sku);
  const badges = [p.hot && '<span class="badge hot">Hot</span>', hasPromo(p) && '<span class="badge promo">Promo</span>', isNew(p) && '<span class="badge new">New</span>', p.discontinued && '<span class="badge disc">Specs N/A</span>'].filter(Boolean).join('');
  return `<article class="card ${inCmp ? 'sel' : ''}" data-sku="${esc(p.sku)}">
    <div class="thumb" data-open="${esc(p.sku)}">${imgTag(p)}<div class="badges">${badges}</div>
      <label class="cmp" onclick="event.stopPropagation()"><input type="checkbox" data-cmp="${esc(p.sku)}" ${inCmp ? 'checked' : ''}>Compare</label></div>
    <div class="body">
      <div class="meta"><span>${esc(p.category)}</span><span class="dot"></span><span>${esc(p.subfamily || p.family)}</span></div>
      <h3 class="pname" data-open="${esc(p.sku)}">${hl(short(p.name))}</h3>
      <dl class="ids">
        <dt>Model</dt><dd>${hl(p.sku)}<button class="cp" data-copy="${esc(p.sku)}" aria-label="Copy model number" title="Copy model number">${ICON.copy}</button></dd>
        <dt>UPC</dt><dd>${p.upc ? hl(p.upc) + `<button class="cp" data-copy="${esc(p.upc)}" aria-label="Copy UPC" title="Copy UPC">${ICON.copy}</button>` : '<span style="color:var(--dim)">Not available</span>'}</dd>
      </dl>
      <ul class="ksp">${(p.ksp || []).map(k => `<li>${esc(k)}</li>`).join('')}</ul>
      <div class="prices">${priceCells(p)}</div>
      <div class="actions">
        <button class="btn" data-copycard="${esc(p.sku)}">${ICON.copy}Copy info</button>
        <button class="btn" data-open="${esc(p.sku)}">Details${ICON.info}</button>
      </div>
    </div>
  </article>`;
}

let renderTimer;
function render() {
  const list = sorted(matches());
  const grid = $('#grid');
  grid.className = 'grid' + (st.layout === 'list' ? ' list' : '');
  grid.innerHTML = list.map(card).join('');
  $('#empty').hidden = list.length > 0;
  $('#count').textContent = list.length;
  $('#countLabel').textContent = list.length === 1 ? 'product' : 'products';
  let note = '';
  if (st.q) {
    note = ` for “${esc(st.q)}”`;
    if (!list.length) {
      const all = matches({ tab: 'all', ignoreCat: true, ignoreFam: true }).length;
      if (all) note += ` · <button class="btn link" data-tab="all">${all} found in All Products</button>`;
    }
  }
  $('#searchNote').innerHTML = note;
  renderTabs(); renderFilters(); renderStrip(); renderTray();
  if (!st.q && st.sort === 'relevance') st.sort = 'new';
  document.querySelectorAll('[data-sort]').forEach(b => b.classList.toggle('on', b.dataset.sort === st.sort));
  $('#sortBtn .lbl').textContent = { new: 'Newest', 'price-asc': 'Price ↑', 'price-desc': 'Price ↓', family: 'Family', relevance: 'Best match' }[st.sort];
  $('#expN').textContent = list.length;
  $('#gridBtn').classList.toggle('on', st.layout === 'grid');
  $('#listBtn').classList.toggle('on', st.layout === 'list');
}

/* ---------- copy ---------- */
async function copyText(t, msg = 'Copied') {
  try { await navigator.clipboard.writeText(t); }
  catch {
    const ta = Object.assign(document.createElement('textarea'), { value: t });
    ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch {} ta.remove();
  }
  toast(msg);
}
function cardText(p) {
  return [
    p.name,
    `Model Number: ${p.sku}`,
    `UPC: ${p.upc || 'N/A'}`,
    `Category: ${p.category}${p.subcategory ? ' – ' + p.subcategory : ''}`,
    p.ksp && p.ksp.length ? `Key Selling Points:\n${p.ksp.map(k => '• ' + k).join('\n')}` : '',
    `SRP: ${peso(p.srp) ?? 'N/A'}`,
    hasPromo(p) ? `Promo SRP: ${peso(p.promo)}` : '',
    `Dealer Price (DP): ${peso(p.dp) ?? 'N/A'}`,
  ].filter(Boolean).join('\n');
}
function fullText(p) {
  let t = cardText(p) + '\n';
  if (p.description) t += `\n${p.description}\n`;
  for (const s of p.sections || []) {
    if (s.title === 'Key Selling Points') continue;
    t += `\n${s.title.toUpperCase()}\n` + s.rows.map(r => `${r[0]}: ${r[1]}`).join('\n') + '\n';
  }
  return t.trim();
}
async function copyImage(p) {
  if (!p.image) return toast('No photo for this product');
  try {
    const blob = await (await fetch(p.image)).blob();
    const bmp = await createImageBitmap(blob);
    const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0);
    const png = await new Promise(r => c.toBlob(r, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    toast('Image copied');
  } catch {
    const a = Object.assign(document.createElement('a'), { href: p.image, download: p.sku + '.webp' });
    document.body.appendChild(a); a.click(); a.remove();
    toast('Image copy not supported here — saved instead');
  }
}
let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 1700); }

/* ---------- compare ---------- */
function toggleCmp(sku, on) {
  const p = BY[sku];
  if (on) {
    if (st.cmp.includes(sku)) return;
    const cat = st.cmp.length ? BY[st.cmp[0]].category : null;
    if (cat && cat !== p.category) { toast(`Compare works within one category (${cat}). Clear the tray first.`); return false; }
    if (st.cmp.length >= 4) { toast('You can compare up to 4 models'); return false; }
    st.cmp.push(sku);
  } else st.cmp = st.cmp.filter(s => s !== sku);
  store.set('cmp', st.cmp);
  document.querySelectorAll(`.card[data-sku="${CSS.escape(sku)}"]`).forEach(c => { c.classList.toggle('sel', st.cmp.includes(sku)); const i = c.querySelector('[data-cmp]'); if (i) i.checked = st.cmp.includes(sku); });
  renderTray();
  return true;
}
function renderTray() {
  const tray = $('#tray');
  tray.hidden = !st.cmp.length;
  if (!st.cmp.length) return;
  $('#trayItems').innerHTML = st.cmp.map(s => { const p = BY[s]; return `<div class="tray-item" title="${esc(p.name)}">${p.image ? `<img src="${esc(p.image)}" alt="">` : esc(p.subfamily)}<button data-uncmp="${esc(s)}" aria-label="Remove">×</button></div>`; }).join('')
    + `<div class="tray-cat">${esc(BY[st.cmp[0]].category)}</div>`;
  $('#trayN').textContent = st.cmp.length;
  $('#trayGo').disabled = st.cmp.length < 2;
  $('#trayGo').style.opacity = st.cmp.length < 2 ? .5 : 1;
}
function compareView() {
  const ps = st.cmp.map(s => BY[s]);
  if (ps.length < 2) { closeOverlay(); return; }
  const onlyDiff = store.get('onlyDiff', false);
  const rows = [];
  const add = (sec, key, vals) => rows.push({ sec, key, vals });
  const best = Math.min(...ps.map(effPrice));
  add('Pricing', 'SRP', ps.map(p => peso(p.srp) ?? '—'));
  add('Pricing', 'Promo SRP', ps.map(p => hasPromo(p) ? peso(p.promo) : '—'));
  add('Pricing', 'Dealer Price (DP)', ps.map(p => peso(p.dp) ?? '—'));
  add('Identification', 'Model Number', ps.map(p => p.sku));
  add('Identification', 'UPC', ps.map(p => p.upc || '—'));
  add('Identification', 'Sub-category', ps.map(p => p.subcategory || '—'));
  add('Identification', 'Product Family', ps.map(p => p.subfamily || p.family));
  add('Key Selling Points', 'Highlights', ps.map(p => (p.ksp || []).join(' • ') || '—'));
  const order = [];
  const map = {};
  for (const p of ps) for (const s of p.sections || []) {
    if (s.title === 'Key Selling Points') continue;
    for (const [k] of s.rows) { const id = s.title + '|' + k; if (!map[id]) { map[id] = 1; order.push([s.title, k]); } }
  }
  for (const [sec, k] of order) add(sec, k, ps.map(p => { const s = (p.sections || []).find(x => x.title === sec); const r = s && s.rows.find(r => r[0] === k); return r ? r[1] : '—'; }));
  let lastSec = '', body = '';
  for (const r of rows) {
    const diff = new Set(r.vals.map(v => String(v).toLowerCase())).size > 1;
    if (onlyDiff && !diff && r.sec !== 'Pricing') continue;
    if (r.sec !== lastSec) { body += `<tr class="sec"><th colspan="${ps.length + 1}">${esc(r.sec)}</th></tr>`; lastSec = r.sec; }
    body += `<tr class="${diff ? 'diff' : ''}"><th scope="row">${esc(r.key)}</th>${r.vals.map((v, i) => {
      const isBest = r.sec === 'Pricing' && r.key !== 'Dealer Price (DP)' && effPrice(ps[i]) === best && ((r.key === 'Promo SRP' && hasPromo(ps[i]) && ps[i].promo === best) || (r.key === 'SRP' && !(hasPromo(ps[i]) && ps[i].promo < ps[i].srp) && ps[i].srp === best));
      return `<td class="${isBest ? 'best' : ''}">${esc(v)}</td>`; }).join('')}</tr>`;
  }
  return `<button class="icon-btn sheet-close" data-close aria-label="Close">×</button>
  <div class="cmp-head"><h1>Compare ${esc(ps[0].category)}</h1><p>${ps.length} models side by side. Green rows differ; lowest selling price highlighted.</p>
    <label class="cmp-opts"><input type="checkbox" id="onlyDiff" ${onlyDiff ? 'checked' : ''}> Show only differences</label></div>
  <div class="cmp-wrap"><table class="ctable"><thead><tr><th></th>${ps.map(p => `<th class="ch"><div data-open="${esc(p.sku)}" style="cursor:pointer">${p.image ? `<img src="${esc(p.image)}" alt="">` : ''}<div class="n">${esc(short(p.name))}</div><div class="m">${esc(p.sku)}</div></div>
    <button class="btn link" data-uncmp="${esc(p.sku)}" style="margin-top:6px;font-size:12px">Remove</button></th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}

/* ---------- details ---------- */
function kv(rows, copy = []) {
  return `<div class="kv">${rows.map(([k, v]) => `<div>${esc(k)}</div><div class="v">${esc(v)}${copy.includes(k) && v ? `<button class="cp" data-copy="${esc(v)}" aria-label="Copy ${esc(k)}">${ICON.copy}</button>` : ''}</div>`).join('')}</div>`;
}
function detailView(p) {
  const inCmp = st.cmp.includes(p.sku);
  const idRows = [
    ['Model Number', p.sku], ['UPC', p.upc || 'Not available'], ['Material Code', p.material || '—'],
    ['Category', p.category], ['Sub-Category', p.subcategory || '—'], ['Product Family', p.subfamily || p.family],
    ['Pricelist Description', p.pricelist_name],
  ];
  const imgNote = p.img_match === 'same-model-other-color' ? 'Representative photo (colour may differ)' : '';
  const secs = (p.sections || []).filter(s => !(s.title === 'Key Selling Points' && p.ksp && p.ksp.length)).map(s => `<section class="spec-sec"><h2>${esc(s.title)}</h2>${kv(s.rows)}</section>`).join('');
  return `<button class="icon-btn sheet-close" data-close aria-label="Close">×</button>
  <div class="d-top">
    <div class="d-img">${imgTag(p)}${imgNote ? `<div class="note">${imgNote}</div>` : ''}</div>
    <div class="d-info">
      <div class="meta"><span>${esc(p.category)}</span><span class="dot"></span><span>${esc(p.subfamily || p.family)}</span>
        ${p.hot ? '<span class="badge hot">Hot</span>' : ''}${hasPromo(p) ? '<span class="badge promo">Promo</span>' : ''}${isNew(p) ? '<span class="badge new">New</span>' : ''}${p.discontinued ? '<span class="badge disc">Specs not available</span>' : ''}</div>
      <h1>${esc(short(p.name))}</h1>
      <p class="sub">${esc(p.pricelist_name)}</p>
      ${p.description ? `<p class="desc">${esc(p.description)}</p>` : ''}
      <div class="d-prices">${priceCells(p)}</div>
      ${p.ksp && p.ksp.length ? `<ul class="ksp" style="margin:0 0 14px">${p.ksp.map(k => `<li>${esc(k)}</li>`).join('')}</ul>` : ''}
      ${kv(idRows, ['Model Number', 'UPC', 'Material Code'])}
      <div class="d-actions">
        <button class="btn primary" data-copycard="${esc(p.sku)}">${ICON.copy}Copy info</button>
        <button class="btn" data-copyfull="${esc(p.sku)}">${ICON.copy}Copy full specs</button>
        <button class="btn" data-copyimg="${esc(p.sku)}">${ICON.img}Copy image</button>
        <button class="btn" data-cmptoggle="${esc(p.sku)}">${inCmp ? '✓ In compare' : '+ Add to compare'}</button>
        ${p.razer_url ? `<a class="btn ghost" href="${esc(p.razer_url)}" target="_blank" rel="noopener">razer.com${ICON.ext}</a>` : ''}
      </div>
    </div>
  </div>
  ${p.discontinued ? `<p class="disc-note">Specs not available — Razer no longer publishes an official product page for this model, so detailed specifications can't be shown. Pricing above is from the current Iontech price list.</p>` : `<div class="d-specs">${secs}</div>`}`;
}

/* ---------- overlay routing ---------- */
let pushed = false;
function openOverlay(html, cls = '') {
  const sh = $('#sheet'); sh.className = 'sheet ' + cls; sh.innerHTML = html;
  $('#overlay').hidden = false; document.body.classList.add('lock');
  $('#overlay').scrollTop = 0;
  sh.querySelector('[data-close]')?.focus({ preventScroll: true });
}
function closeOverlay() {
  $('#overlay').hidden = true; document.body.classList.remove('lock');
  if (location.hash) { if (pushed) { pushed = false; history.back(); } else history.replaceState(null, '', location.pathname + location.search); }
}
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('/p/') && BY[h.slice(3)]) { openOverlay(detailView(BY[h.slice(3)])); document.title = BY[h.slice(3)].name + ' | Razer Catalog'; return; }
  if (h === '/compare' && st.cmp.length >= 2) { openOverlay(compareView(), 'cmp-sheet'); document.title = 'Compare | Razer Catalog'; return; }
  $('#overlay').hidden = true; document.body.classList.remove('lock'); document.title = 'Razer Product Catalog | Iontech';
}
function go(hash) { pushed = true; location.hash = hash; }

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-sub],[data-suball],[data-sort],[data-export],[data-tab],[data-fam],[data-famall],[data-cat],[data-open],[data-copy],[data-copycard],[data-copyfull],[data-copyimg],[data-uncmp],[data-cmptoggle],[data-close]');
  if (!t) { if (e.target.id === 'overlay') closeOverlay(); return; }
  const d = t.dataset;
  if (d.sub) { st.subs.has(d.sub) ? st.subs.delete(d.sub) : st.subs.add(d.sub); render(); return; }
  if ('suball' in d) { st.subs.clear(); render(); return; }
  if (d.sort) { st.sort = d.sort; closeMenus(); render(); return; }
  if (d.export) { closeMenus(); const list = sorted(matches()); d.export === 'xlsx' ? exportXlsx(list) : exportPdf(list); return; }
  if (d.tab) { st.tab = d.tab; st.cats.clear(); st.subs.clear(); st.fams.clear(); store.set('tab', st.tab); render(); window.scrollTo({ top: 0 }); t.scrollIntoView?.({ inline: 'center', block: 'nearest' }); }
  else if (d.fam) { st.fams.has(d.fam) ? st.fams.delete(d.fam) : st.fams.add(d.fam); render(); }
  else if ('famall' in d) { st.fams.clear(); render(); }
  else if (d.cat) { st.cats.has(d.cat) ? st.cats.delete(d.cat) : st.cats.add(d.cat); render(); }
  else if (d.open) { e.preventDefault(); go('/p/' + encodeURIComponent(d.open)); }
  else if (d.copy) copyText(d.copy, 'Copied ' + d.copy);
  else if (d.copycard) copyText(cardText(BY[d.copycard]), 'Product info copied');
  else if (d.copyfull) copyText(fullText(BY[d.copyfull]), 'Full specs copied');
  else if (d.copyimg) copyImage(BY[d.copyimg]);
  else if (d.uncmp) { toggleCmp(d.uncmp, false); if (location.hash === '#/compare') st.cmp.length >= 2 ? openOverlay(compareView(), 'cmp-sheet') : closeOverlay(); }
  else if (d.cmptoggle) { const on = !st.cmp.includes(d.cmptoggle); if (toggleCmp(d.cmptoggle, on) !== false) t.textContent = on ? '✓ In compare' : '+ Add to compare'; }
  else if ('close' in d) closeOverlay();
});
document.addEventListener('change', e => {
  if (e.target.dataset.cmp) { const ok = toggleCmp(e.target.dataset.cmp, e.target.checked); if (ok === false) e.target.checked = false; }
  if (e.target.id === 'onlyDiff') { store.set('onlyDiff', e.target.checked); openOverlay(compareView(), 'cmp-sheet'); }
});
$('#q').addEventListener('input', e => {
  st.q = e.target.value.trim();
  $('#qClear').hidden = !st.q;
  if (st.q && st.sort === 'new') st.sort = 'relevance';
  cancelAnimationFrame(renderTimer); renderTimer = requestAnimationFrame(render);
});
$('#q').addEventListener('keydown', e => { if (e.key === 'Escape') { e.target.value = ''; e.target.dispatchEvent(new Event('input')); } });
$('#qClear').onclick = () => { $('#q').value = ''; $('#q').dispatchEvent(new Event('input')); $('#q').focus(); };
function closeMenus(){ document.querySelectorAll('.menu').forEach(m => m.hidden = true); }
for (const [b, m] of [['#sortBtn', '#sortMenu'], ['#exportBtn', '#exportMenu']]) $(b).onclick = e => { e.stopPropagation(); const open = $(m).hidden; closeMenus(); $(m).hidden = !open; };
document.addEventListener('click', e => { if (!e.target.closest('.dd')) closeMenus(); });
$('#gridBtn').onclick = () => { st.layout = 'grid'; store.set('layout', 'grid'); render(); };
$('#listBtn').onclick = () => { st.layout = 'list'; store.set('layout', 'list'); render(); };
const filtersEl = $('#filters');
const isPhone = () => matchMedia('(max-width:720px)').matches;
function setFilters(open) { filtersEl.classList.toggle('open', open); $('#filterBtn').setAttribute('aria-expanded', open); document.body.classList.toggle('lock', open && isPhone()); }
$('#filterBtn').onclick = () => setFilters(!filtersEl.classList.contains('open'));
$('#closeFilters').onclick = $('#applyFilters').onclick = () => setFilters(false);
$('#clearFilters').onclick = () => { st.fams.clear(); st.cats.clear(); render(); };
$('#trayClear').onclick = () => { [...st.cmp].forEach(s => toggleCmp(s, false)); };
$('#trayGo').onclick = () => { if (st.cmp.length >= 2) go('/compare'); };
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#overlay').hidden) closeOverlay();
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('#q').focus(); }
});
window.addEventListener('hashchange', route);

/* ---------- online status + service worker ---------- */
function net() { const on = navigator.onLine; $('#netStatus').classList.toggle('off', !on); $('#netStatus span').textContent = on ? 'Online' : 'Offline'; }
addEventListener('online', net); addEventListener('offline', net); net();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw && nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) toast('Catalog updated — reload to see the latest prices'); });
    });
  }).catch(() => {});
  navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'cached') toast(`Ready for offline use (${e.data.n} files saved)`); });
}

$('#srcLine').textContent = `${C.meta.source || ''} · ${P.length} models · Updated ${C.meta.built ? C.meta.built.slice(0, 10) : ''}`;

/* ---------- export ---------- */
function scopeLabel() {
  const t = TABS.find(x => x.id === st.tab).label;
  const bits = [t];
  if (st.subs.size) bits.push([...st.subs].join(', '));
  if (st.fams.size) bits.push([...st.fams].join(', '));
  if (st.cats.size && MULTI_CAT.has(st.tab)) bits.push([...st.cats].join(', '));
  if (st.q) bits.push(`search “${st.q}”`);
  return bits.join(' · ');
}
const stamp = () => new Date().toISOString().slice(0, 10);
function fileBase() { return `Razer-Pricelist-${TABS.find(x => x.id === st.tab).label.replace(/\s+/g, '-')}-${stamp()}`; }
function download(blob, name) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
// minimal ZIP (stored, no compression) + CRC32 — keeps the site dependency-free and offline
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zip(files) {
  const enc = new TextEncoder(), parts = [], cen = []; let off = 0;
  for (const [name, text] of files) {
    const nm = enc.encode(name), data = enc.encode(text), crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 0, true);
    h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nm.length, true);
    parts.push(new Uint8Array(h.buffer), nm, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nm.length, true); c.setUint32(42, off, true);
    cen.push(new Uint8Array(c.buffer), nm);
    off += 30 + nm.length + data.length;
  }
  const csize = cen.reduce((s, x) => s + x.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csize, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cen, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
function exportXlsx(list) {
  if (!list.length) return toast('Nothing to export');
  const x = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  const col = i => String.fromCharCode(65 + i);
  const head = ['Category', 'Sub-Category', 'Product Family', 'Model Number', 'Product Name', 'UPC', 'Material Code', 'Key Selling Points', 'Regular SRP', 'Promo SRP', 'Dealer Price', 'Hot Item', 'Specs'];
  const widths = [13, 22, 16, 22, 52, 16, 15, 70, 13, 13, 13, 9, 20];
  const strCell = (r, i, v, s = 0) => `<c r="${col(i)}${r}" t="inlineStr"${s ? ` s="${s}"` : ''}><is><t xml:space="preserve">${x(v)}</t></is></c>`;
  const numCell = (r, i, v) => v == null ? '' : `<c r="${col(i)}${r}" s="2"><v>${v}</v></c>`;
  const rows = [`<row r="1">${head.map((h, i) => strCell(1, i, h, 1)).join('')}</row>`];
  list.forEach((p, k) => {
    const r = k + 2;
    rows.push(`<row r="${r}">` + [
      strCell(r, 0, p.category), strCell(r, 1, p.subcategory), strCell(r, 2, p.subfamily || p.family), strCell(r, 3, p.sku),
      strCell(r, 4, p.name), strCell(r, 5, p.upc), strCell(r, 6, p.material), strCell(r, 7, (p.ksp || []).join('; ')),
      numCell(r, 8, p.srp), numCell(r, 9, p.promo), numCell(r, 10, p.dp), strCell(r, 11, p.hot ? 'Yes' : ''),
      strCell(r, 12, p.discontinued ? 'Specs not available' : 'Available'),
    ].join('') + '</row>');
  });
  const last = `${col(head.length - 1)}${list.length + 1}`;
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols><sheetData>${rows.join('')}</sheetData><autoFilter ref="A1:${last}"/></worksheet>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;₱&quot;#,##0"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1B1F1B"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  const files = [
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Razer Pricelist" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">\'Razer Pricelist\'!$A$1:$' + col(head.length - 1) + '$' + (list.length + 1) + '</definedName></definedNames></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['xl/styles.xml', styles],
    ['xl/worksheets/sheet1.xml', sheet],
  ];
  download(zip(files), fileBase() + '.xlsx');
  toast(`Excel file saved (${list.length} products)`);
}
function exportPdf(list) {
  if (!list.length) return toast('Nothing to export');
  const pv = $('#printView');
  const rows = list.map(p => `<tr>
    <td class="pi">${p.image ? `<img src="${esc(p.image)}" alt="">` : ''}</td>
    <td><b>${esc(short(p.name))}</b>${p.hot ? ' <em class="ph">HOT</em>' : ''}${hasPromo(p) ? ' <em class="pp">PROMO</em>' : ''}<div class="pm">${esc(p.sku)}${p.upc ? ' · UPC ' + esc(p.upc) : ''}</div><div class="pk">${esc((p.ksp || []).join(' • '))}</div></td>
    <td>${esc(p.category)}<div class="pm">${esc(p.subfamily || p.family)}</div></td>
    <td class="n">${peso(p.srp) ?? '—'}</td><td class="n pr">${hasPromo(p) ? peso(p.promo) : '—'}</td><td class="n">${peso(p.dp) ?? '—'}</td></tr>`).join('');
  pv.innerHTML = `<header><img src="assets/iontech-logo-dark.png" alt="Iontech"><div><h1>Razer Pricelist</h1><p>${esc(scopeLabel())} · ${list.length} products · ${esc(C.meta.source || '')}</p></div><span>Printed ${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span></header>
  <table><thead><tr><th></th><th>Product</th><th>Category</th><th class="n">SRP</th><th class="n">Promo SRP</th><th class="n">DP</th></tr></thead><tbody>${rows}</tbody></table>`;
  const imgs = [...pv.querySelectorAll('img')];
  Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => {
    const old = document.title; document.title = fileBase();
    document.body.classList.add('printing');
    window.print();
    setTimeout(() => { document.body.classList.remove('printing'); document.title = old; }, 500);
  });
  toast('Choose “Save as PDF” in the print window');
}

render();
route();
})();
