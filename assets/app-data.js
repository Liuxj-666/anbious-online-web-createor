/* ============================================================
   岸标 — data model, utilities, demo directory and public data
   ============================================================ */

const APP_VERSION = '2.0.0';
const SCHEMA_VERSION = 2;
const STORAGE_KEY = 'anbiao.state.v2';
const LEGACY_STORAGE_KEY = 'anbiao.state.v1';
const CONSENT_VERSION = '2026.10';
const CONSENT_TEXT = '我确认我是这个 web 的主人。我同意将上述内容展示在「岸标 · 指路」，并理解：公示后任何人可以浏览；我可以随时撤回；岸标不做推荐，只按专区提供检索与指路。';
const MAX_IMAGE_BYTES = 14 * 1024 * 1024;
const MAX_ASSET_BYTES = 0; // 0 = 不在应用层限制大小，由浏览器存储配额决定
const STORAGE_TARGET_BYTES = 5 * 1024 * 1024;
const ASSET_DB_NAME = 'anbiao.assets.v1';
const ASSET_STORE_NAME = 'assets';
const DEFAULT_ZONE_COLOR = '#bd5033';

const THEMES = {
  paper: {
    name: '纸白',
    bg: '#f7f2e7',
    ink: '#202b24',
    accent: '#bd5033',
    swatch: ['#f7f2e7', '#202b24', '#bd5033'],
    cover: 'assets/covers/paper-room.svg'
  },
  moss: {
    name: '苔绿',
    bg: '#e9ede3',
    ink: '#1f3023',
    accent: '#98602f',
    swatch: ['#e9ede3', '#1f3023', '#98602f'],
    cover: 'assets/covers/slow-links.svg'
  },
  dusk: {
    name: '暮橙',
    bg: '#f2e6d8',
    ink: '#36251e',
    accent: '#a8472e',
    swatch: ['#f2e6d8', '#36251e', '#a8472e'],
    cover: 'assets/covers/tide-archive.svg'
  },
  ink: {
    name: '夜墨',
    bg: '#18221d',
    ink: '#f1ebde',
    accent: '#df7a54',
    swatch: ['#18221d', '#f1ebde', '#df7a54'],
    cover: 'assets/covers/night-ink.svg'
  }
};

const CONTENT_TYPES = {
  article: {
    label: '文章',
    short: '字',
    desc: '标题、摘要与正文'
  },
  image: {
    label: '图片',
    short: '图',
    desc: '一张照片或一张图'
  },
  video: {
    label: '视频',
    short: '影',
    desc: '视频链接，或上传本地 MP4'
  },
  audio: {
    label: '音频',
    short: '音',
    desc: '上传音频，或添加音频链接'
  },
  file: {
    label: '文件',
    short: '档',
    desc: '文档、压缩包或其他文件'
  },
  link: {
    label: '链接',
    short: '链',
    desc: '去往别处的一扇门'
  },
  note: {
    label: '短句',
    short: '句',
    desc: '一段独立成页的话'
  }
};

const TYPE_ORDER = ['article', 'image', 'video', 'audio', 'file', 'link', 'note'];
const SEARCH_SCOPES = {
  site: '站点',
  owner: '主人',
  tag: '标签',
  all: '全局'
};

const LAYOUT_DEFAULTS = {
  columns: 1,
  density: 'standard'
};

const ICONS = {
  article: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="1.8"/><path d="M8 8h8M8 11.5h8M8 15h5"/></svg>',
  image: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="1.8"/><circle cx="9" cy="10" r="1.6"/><path d="m5.5 17 4.2-4.4 3.2 3 2.4-2.2 3.2 3.6"/></svg>',
  collection: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14M5 12h14M5 18.5h9"/><circle cx="3" cy="5.5" r=".7" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r=".7" fill="currentColor" stroke="none"/><circle cx="3" cy="18.5" r=".7" fill="currentColor" stroke="none"/></svg>',
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="1.8"/><path d="m10 9 5 3-5 3z"/></svg>',
  audio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-4M8 17.5v-11M12 15.5v-7M16 18v-12M20 13.5v-3"/></svg>',
  file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5V8h4M9 12h6M9 15.5h4"/></svg>',
  folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7.5h6l1.8 2H20.5v9.5h-17z"/><path d="M3.5 7.5V5.5h6.2l1.5 2"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 14.5 14.5 9"/><path d="M8 12.5 6.4 14a3.2 3.2 0 0 0 4.5 4.5l1.6-1.6"/><path d="M16 11.5 17.6 10a3.2 3.2 0 0 0-4.5-4.5L11.5 7"/></svg>',
  note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.5h15v10h-8l-4 3.5v-3.5H4.5z"/><path d="M8 9h8M8 12h5"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 19.5 1-4.2L16 4.8a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.7 18.5z"/><path d="m14.5 6.5 3 3"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7h15M9.5 7V4.5h5V7M7 7l.8 12.5h8.4L17 7M10 10.5v6M14 10.5v6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 12S6.4 5.8 12 5.8 21.2 12 21.2 12 17.6 18.2 12 18.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.8"/></svg>',
  eyeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M9.8 6.2A10.4 10.4 0 0 1 12 5.8c5.6 0 9.2 6.2 9.2 6.2a17 17 0 0 1-3 3.7M6.1 7.3A17.3 17.3 0 0 0 2.8 12S6.4 18.2 12 18.2a10 10 0 0 0 3.2-.5M10.4 10.4a2.3 2.3 0 0 0 3.2 3.2"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>',
  down: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5.5 12.5 12 19l6.5-6.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>',
  external: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 4h7v7M20 4l-9 9"/><path d="M18 14v5.5H4.5V6H10"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg>',
  warn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.8 20h18.4z"/><path d="M12 9v5M12 17.2v.2"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="1.8"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M13 5l7 7-7 7"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="1.6"/><path d="M15 9V5.5A1.5 1.5 0 0 0 13.5 4h-9A1.5 1.5 0 0 0 3 5.5v9A1.5 1.5 0 0 0 4.5 16H9"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M6.5 10.5 12 16l5.5-5.5M4 20h16"/></svg>',
  upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M6.5 9.5 12 4l5.5 5.5M4 20h16"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2.8v3M12 18.2v3M21.2 12h-3M5.8 12h-3M18.5 5.5 16.4 7.6M7.6 16.4l-2.1 2.1M18.5 18.5l-2.1-2.1M7.6 7.6 5.5 5.5"/></svg>',
  mark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M12 3.5 19 7l-7 3.5z"/><path d="M6 19c2-1.4 4-1.4 6 0s4 1.4 6 0"/></svg>'
};

/* ------------------------------ utilities ------------------------------ */

function escapeHTML(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const esc = escapeHTML;
const attr = escapeHTML;

function nowISO() {
  return new Date().toISOString();
}

function uid(prefix = 'id') {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return `${prefix}_${window.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function cleanText(value, max = 100000) {
  return String(value == null ? '' : value).replace(/\r\n/g, '\n').slice(0, max);
}

function trimText(value, max = 100000) {
  return cleanText(value, max).trim();
}

function clipText(value, length = 90) {
  const text = String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function normalizeSpace(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '—';
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '—';
  return `${formatDate(value)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(value, tokens) {
  const text = String(value == null ? '' : value);
  const usable = (tokens || []).filter(Boolean);
  if (!usable.length) return esc(text);
  const re = new RegExp(`(${usable.map(escapeRegExp).join('|')})`, 'gi');
  return text
    .split(re)
    .map((part, index) => (index % 2 === 1 ? `<mark>${esc(part)}</mark>` : esc(part)))
    .join('');
}

function hashString(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function slugify(value) {
  return String(value == null ? '' : value)
    .trim()
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function isValidSlug(value) {
  return /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(String(value || ''));
}

function normalizeHttpUrl(raw) {
  let value = String(raw == null ? '' : raw).trim();
  if (!value) return '';
  if (/^\/\//.test(value)) return `https:${value}`;
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (/^(www\.|[a-z0-9-]+\.[a-z]{2,})/i.test(value)) return `https://${value}`;
  return '';
}

function safeHref(raw) {
  const value = normalizeHttpUrl(raw);
  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) return value;
  return '';
}

function safeMediaSrc(raw) {
  const value = String(raw == null ? '' : raw).trim();
  if (!value) return '';
  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(value)) return value;
  if (/^data:image\/svg\+xml;base64,/i.test(value)) {
    const trusted = Object.values(window.ANBIAO_BUILTINS || {});
    return trusted.includes(value) ? value : '';
  }
  if (/^https?:\/\//i.test(value)) return value;
  if (/^assets\/covers\/[a-z0-9._-]+\.svg$/i.test(value)) return value;
  return '';
}

function builtinCoverFor(theme) {
  const selected = THEMES[theme] || THEMES.paper;
  return (window.ANBIAO_BUILTINS && window.ANBIAO_BUILTINS[selected.cover]) || selected.cover;
}

function themeClass(theme) {
  return Object.prototype.hasOwnProperty.call(THEMES, theme) ? `theme-${theme}` : 'theme-paper';
}

function themeBackground(theme) {
  return (THEMES[theme] || THEMES.paper).bg;
}

function getHostLabel(raw) {
  try {
    const url = new URL(normalizeHttpUrl(raw));
    return url.hostname.replace(/^www\./, '');
  } catch (error) {
    return '外部链接';
  }
}

function isDataUrl(value) {
  return /^data:/i.test(String(value || ''));
}

function debounce(fn, wait = 300) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

function escapeForInlineJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

function normalizeHexColor(value, fallback = DEFAULT_ZONE_COLOR) {
  let text = String(value || '').trim();
  if (/^[0-9a-f]{6}$/i.test(text)) text = `#${text}`;
  if (/^#[0-9a-f]{6}$/i.test(text)) return text.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(text)) {
    return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`.toLowerCase();
  }
  return fallback;
}

function colorLuminance(hex) {
  const value = normalizeHexColor(hex, '#ffffff').slice(1);
  const rgb = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const linear = rgb.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function normalizeAppearance(raw, theme) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const mode = ['theme', 'solid', 'gradient', 'image'].includes(source.mode) ? source.mode : 'theme';
  return {
    mode,
    color: normalizeHexColor(source.color, themeBackground(theme)),
    color2: normalizeHexColor(source.color2, '#e5d7c2'),
    angle: Number.isFinite(Number(source.angle)) ? Math.min(360, Math.max(0, Number(source.angle))) : 145,
    image: (() => {
      const rawImage = String(source.image || '').trim();
      if (!rawImage) return '';
      return isDataUrl(rawImage) ? safeMediaSrc(rawImage) : safeMediaSrc(normalizeHttpUrl(rawImage) || rawImage);
    })(),
    overlay: Number.isFinite(Number(source.overlay)) ? Math.min(0.85, Math.max(0, Number(source.overlay))) : 0.45
  };
}

function normalizeLayout(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const known = ['hero', 'browse', 'body'];
  const requested = Array.isArray(source.sections) ? source.sections.filter((id) => known.includes(id)) : [];
  const sections = [];
  requested.forEach((id) => { if (!sections.includes(id)) sections.push(id); });
  known.forEach((id) => { if (!sections.includes(id)) sections.push(id); });
  const defaultBlocks = [
    { id: 'hero', x: 0, y: 0, w: 12, h: 3 },
    { id: 'browse', x: 0, y: 3, w: 12, h: 1 },
    { id: 'body', x: 0, y: 4, w: 12, h: 5 }
  ];
  const rawBlocks = Array.isArray(source.blocks) ? source.blocks : [];
  const blocks = rawBlocks
    .map((block, index) => {
      if (!block || !known.includes(block.id)) return null;
      return {
        id: block.id,
        x: Math.min(11, Math.max(0, Number.isFinite(Number(block.x)) ? Number(block.x) : defaultBlocks[index]?.x || 0)),
        y: Math.min(40, Math.max(0, Number.isFinite(Number(block.y)) ? Number(block.y) : defaultBlocks[index]?.y || index * 2)),
        w: Math.min(12, Math.max(2, Number.isFinite(Number(block.w)) ? Number(block.w) : 12)),
        h: Math.min(12, Math.max(1, Number.isFinite(Number(block.h)) ? Number(block.h) : 3))
      };
    })
    .filter(Boolean);
  const seenBlocks = new Set();
  const normalizedBlocks = [];
  blocks.forEach((block) => {
    if (seenBlocks.has(block.id)) return;
    seenBlocks.add(block.id);
    normalizedBlocks.push(block);
  });
  defaultBlocks.forEach((block) => {
    if (!seenBlocks.has(block.id)) normalizedBlocks.push(block);
  });
  return {
    columns: Number(source.columns) === 2 ? 2 : 1,
    density: ['compact', 'standard', 'large'].includes(source.density) ? source.density : 'standard',
    sections,
    heroStyle: ['split', 'stacked', 'text'].includes(source.heroStyle) ? source.heroStyle : 'split',
    collectionOrder: Array.isArray(source.collectionOrder)
      ? source.collectionOrder.map((id) => trimText(id, 80)).filter(Boolean)
      : [],
    blocks: normalizedBlocks
  };
}

function suggestLayout(site) {
  const items = Array.isArray(site.items) ? site.items : [];
  const zones = Array.isArray(site.zones) ? site.zones : [];
  const media = items.filter((item) => ['image', 'video', 'audio'].includes(item.type)).length;
  const text = items.filter((item) => ['article', 'note', 'quote', 'link'].includes(item.type)).length;
  const collections = zones
    .map((zone) => ({ zone, count: items.filter((item) => item.zoneId === zone.id).length }))
    .filter((entry) => entry.count > 0);
  const hasCover = Boolean(site.cover);
  const longIntro = String(site.intro || '').length > 90 || String(site.title || '').length > 16;
  const sections = items.length > 10 && collections.length >= 3
    ? ['browse', 'hero', 'body']
    : items.length <= 3
      ? ['hero', 'body', 'browse']
      : ['hero', 'browse', 'body'];
  const heroStyle = !hasCover && text > media * 2
    ? 'text'
    : longIntro && collections.length >= 4
      ? 'stacked'
      : 'split';
  const collectionOrder = collections
    .slice()
    .sort((a, b) => b.count - a.count || String(a.zone.name).localeCompare(String(b.zone.name)))
    .map((entry) => entry.zone.id);
  const blocks = media >= 2 && items.length >= 4
    ? [
        { id: 'hero', x: 0, y: 0, w: 7, h: 3 },
        { id: 'browse', x: 7, y: 0, w: 5, h: 3 },
        { id: 'body', x: 0, y: 3, w: 12, h: 5 }
      ]
    : [
        { id: 'hero', x: 0, y: 0, w: 12, h: 3 },
        { id: 'browse', x: 0, y: 3, w: 12, h: 1 },
        { id: 'body', x: 0, y: 4, w: 12, h: 5 }
      ];
  return normalizeLayout({
    columns: media >= 2 && items.length >= 4 ? 2 : 1,
    density: items.length >= 9 ? 'compact' : items.length <= 2 && media ? 'large' : 'standard',
    sections,
    heroStyle,
    collectionOrder,
    blocks
  });
}

function appearancePresentation(appearance, theme) {
  const safe = normalizeAppearance(appearance, theme);
  const base = THEMES[theme] || THEMES.paper;
  if (safe.mode === 'theme') {
    return { className: '', style: '' };
  }
  if (safe.mode === 'image' && safe.image) {
    // Keep a readable scrim even when the author chooses a very low overlay.
    const overlay = Math.max(0.4, safe.overlay);
    const style = `--w-bg:#1b2922;--w-bg-deep:#121d17;background-color:#1b2922;background-image:linear-gradient(rgba(14,21,17,${overlay}), rgba(14,21,17,${overlay})),url("${safe.image}");background-size:cover;background-position:center;`;
    return { className: 'bg-custom bg-dark bg-image', style };
  }
  if (safe.mode === 'gradient') {
    const luminance = (colorLuminance(safe.color) + colorLuminance(safe.color2)) / 2;
    const dark = luminance < 0.38;
    const style = `--w-bg:${safe.color};--w-bg-deep:${safe.color2};background:linear-gradient(${safe.angle}deg, ${safe.color}, ${safe.color2});`;
    return { className: `bg-custom ${dark ? 'bg-dark' : 'bg-light'}`, style };
  }
  const dark = colorLuminance(safe.color) < 0.38;
  const style = `--w-bg:${safe.color};--w-bg-deep:${safe.color};background:${safe.color};`;
  return { className: `bg-custom ${dark ? 'bg-dark' : 'bg-light'}`, style };
}

function sanitizeHexList(value) {
  return normalizeHexColor(value, DEFAULT_ZONE_COLOR);
}

function buildZoneTree(zones) {
  const list = Array.isArray(zones) ? zones : [];
  const byId = new Map();
  list.forEach((zone) => {
    byId.set(zone.id, { ...zone, children: [] });
  });
  const roots = [];
  byId.forEach((node) => {
    const parent = node.parentId && byId.get(node.parentId);
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function flattenZoneTree(nodes, depth = 0, out = []) {
  (nodes || []).forEach((node) => {
    out.push({ zone: node, depth });
    flattenZoneTree(node.children, depth + 1, out);
  });
  return out;
}

function sanitizeZoneParents(zones) {
  const list = Array.isArray(zones) ? zones : [];
  const byId = new Map(list.map((zone) => [zone.id, zone]));
  list.forEach((zone) => {
    if (zone.parentId && (!byId.has(zone.parentId) || zone.parentId === zone.id)) zone.parentId = null;
  });
  list.forEach((zone) => {
    const seen = new Set([zone.id]);
    let parentId = zone.parentId;
    while (parentId) {
      if (seen.has(parentId)) {
        zone.parentId = null;
        break;
      }
      seen.add(parentId);
      const parent = byId.get(parentId);
      parentId = parent ? parent.parentId : null;
    }
  });
  return list;
}

function zoneDescendantIds(zones, zoneId) {
  const ids = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    zones.forEach((zone) => {
      if (zone.parentId === zoneId || ids.has(zone.parentId)) {
        if (!ids.has(zone.id) && zone.id !== zoneId) {
          ids.add(zone.id);
          changed = true;
        }
      }
    });
  }
  return ids;
}

function zoneDepthOf(zones, zoneId) {
  const byId = new Map(zones.map((zone) => [zone.id, zone]));
  let depth = 0;
  let current = byId.get(zoneId);
  const seen = new Set();
  while (current && current.parentId && !seen.has(current.parentId) && depth < 24) {
    seen.add(current.parentId);
    current = byId.get(current.parentId);
    depth += 1;
  }
  return depth;
}

function makeZone(name, desc = '', parentId = null, color = DEFAULT_ZONE_COLOR) {
  return {
    id: uid('zone'),
    name: trimText(name, 24),
    desc: trimText(desc, 80),
    parentId: parentId || null,
    color: normalizeHexColor(color, DEFAULT_ZONE_COLOR)
  };
}

function createDefaultZones() {
  return [
    {
      id: 'zone-daily',
      name: '日常',
      desc: '先放几块内容试试，之后可以继续添加、改名或细分成子专区。',
      parentId: null,
      color: DEFAULT_ZONE_COLOR
    }
  ];
}

function createDefaultSite() {
  const stamp = nowISO();
  const zones = createDefaultZones();
  const zoneId = zones[0].id;
  return {
    id: uid('site'),
    slug: 'my-shore',
    title: '我的岸标',
    owner: '你的名字',
    tags: ['生活', '记录'],
    tagline: '把喜欢的东西，放在自己的岸上。',
    intro: '这里是我自己设计的一小块地方。没有热门，没有推荐，只有我想留下的东西。\n你可以按专区逛一逛，也可以直接在主页里搜索。',
    cover: 'assets/covers/paper-room.svg',
    theme: 'paper',
    appearance: {
      mode: 'theme',
      color: '#f7f2e7',
      color2: '#e5d7c2',
      angle: 145,
      image: '',
      overlay: 0.45
    },
    layout: {
      columns: 1,
      density: 'standard'
    },
    zones,
    items: [
      {
        id: uid('item'),
        type: 'article',
        zoneId,
        title: '写在开始之前',
        excerpt: '这是你的第一篇文章草稿。可以改标题、换正文，也可以直接删掉。',
        body: '你好，这里是我自己的一小块地方。\n\n没有算法，没有热搜，也没有非看不可的内容。我只把想留下的东西放在这里：一些字、几张照片、几件舍不得丢的小事。\n\n你可以把这些文字换成自己的故事。写完之后，再决定要不要让「指路」把来者带到这里。',
        cover: '',
        hidden: false,
        starter: true,
        createdAt: stamp
      },
      {
        id: uid('item'),
        type: 'image',
        zoneId,
        title: '一块安静的光',
        src: 'assets/covers/paper-room.svg',
        caption: '先放一张默认图片。上传自己的照片，或换成图片链接。',
        hidden: false,
        starter: true,
        createdAt: stamp
      },
      {
        id: uid('item'),
        type: 'note',
        zoneId,
        title: '最近想留下的三样东西',
        content: '一本反复翻的书；一首适合傍晚听的歌；一个还没去的地方。',
        source: '先记在这里，等真的去了，再回来修改。',
        hidden: false,
        starter: true,
        createdAt: stamp
      },
      {
        id: uid('item'),
        type: 'link',
        zoneId,
        title: '一个可以发呆的地方',
        url: 'https://example.com',
        desc: '把常去的地方放进来。链接会显示域名，也不会被推荐算法放大。',
        hidden: false,
        starter: true,
        createdAt: stamp
      }
    ],
    createdAt: stamp,
    updatedAt: stamp
  };
}

const MAX_SITES = 5;

function createDefaultPublication() {
  return {
    active: false,
    consentVersion: null,
    consentedAt: null,
    consentText: '',
    ownerToken: '',
    remoteSiteId: '',
    publishedAt: null,
    sourceHash: null,
    snapshot: null,
    revokedAt: null,
    history: []
  };
}

function createDefaultState() {
  const site = createDefaultSite();
  const publication = createDefaultPublication();
  return {
    schema: SCHEMA_VERSION,
    activeSiteId: site.id,
    sites: [{ site, publication, comments: [], downloadRequests: [] }],
    site,
    publication,
    settings: {
      showDemo: true
    },
    downloadRequests: [],
    comments: [],
    ui: {
      guideQuery: '',
      guideZone: 'all',
      guideScope: 'all',
      starterNoteDismissed: false,
      lastContentType: 'article',
      studioQuery: '',
      studioZoneFilter: 'all',
      studioDensity: 'standard'
    }
  };
}

function syncActiveSiteRecord() {
  if (!Array.isArray(state.sites) || !state.site) return;
  let record = state.sites.find((entry) => entry && entry.site && entry.site.id === state.site.id);
  if (!record) {
    record = {
      site: state.site,
      publication: state.publication || createDefaultPublication(),
      comments: Array.isArray(state.comments) ? state.comments : [],
      downloadRequests: Array.isArray(state.downloadRequests) ? state.downloadRequests : []
    };
    state.sites.push(record);
  }
  record.site = state.site;
  record.publication = state.publication || createDefaultPublication();
  record.comments = Array.isArray(state.comments) ? state.comments : [];
  record.downloadRequests = Array.isArray(state.downloadRequests) ? state.downloadRequests : [];
  state.sites = state.sites.slice(0, MAX_SITES);
  state.activeSiteId = state.site.id;
}

function switchActiveSite(siteId) {
  syncActiveSiteRecord();
  const record = (state.sites || []).find((entry) => entry && entry.site && entry.site.id === siteId);
  if (!record) return false;
  state.activeSiteId = record.site.id;
  state.site = record.site;
  state.publication = record.publication || createDefaultPublication();
  state.comments = Array.isArray(record.comments) ? record.comments : [];
  state.downloadRequests = Array.isArray(record.downloadRequests) ? record.downloadRequests : [];
  saveStateToStorage();
  return true;
}

function createBlankSite(index) {
  const site = createDefaultSite();
  site.title = `新的网页 ${index}`;
  site.slug = `page-${index}`;
  site.tagline = '';
  site.intro = '';
  site.cover = 'assets/covers/paper-room.svg';
  site.items = [];
  site.layout = normalizeLayout({});
  return site;
}

function createAdditionalSite() {
  syncActiveSiteRecord();
  if (state.sites.length >= MAX_SITES) return null;
  const site = createBlankSite(state.sites.length + 1);
  site.owner = state.site.owner || site.owner;
  const record = { site, publication: createDefaultPublication(), comments: [], downloadRequests: [] };
  state.sites.push(record);
  switchActiveSite(site.id);
  return site;
}

function deleteSiteById(siteId) {
  syncActiveSiteRecord();
  if (state.sites.length <= 1) return false;
  const index = state.sites.findIndex((entry) => entry && entry.site && entry.site.id === siteId);
  if (index < 0) return false;
  const wasActive = state.activeSiteId === siteId;
  state.sites.splice(index, 1);
  if (wasActive) {
    state.activeSiteId = state.sites[0].site.id;
    state.site = state.sites[0].site;
    state.publication = state.sites[0].publication || createDefaultPublication();
    state.comments = state.sites[0].comments || [];
    state.downloadRequests = state.sites[0].downloadRequests || [];
  }
  saveStateToStorage();
  return true;
}

function normalizeZone(raw, index) {
  if (!raw || typeof raw !== 'object') return null;
  const name = trimText(raw.name, 24) || `专区 ${index + 1}`;
  return {
    id: trimText(raw.id, 60) || uid('zone'),
    name,
    desc: trimText(raw.desc, 80),
    parentId: raw.parentId ? trimText(raw.parentId, 60) : null,
    color: normalizeHexColor(raw.color, DEFAULT_ZONE_COLOR)
  };
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    title: trimText(raw.title, 120),
    url: normalizeHttpUrl(raw.url),
    note: trimText(raw.note, 160)
  };
}

function legacyCollectionText(raw) {
  if (!raw || !Array.isArray(raw.entries)) return '';
  return raw.entries
    .map((entry) => [entry && entry.title, entry && entry.note].filter(Boolean).join('：'))
    .filter(Boolean)
    .join('；')
    .slice(0, 600);
}

function normalizeImages(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((image) => ({
      id: trimText(image && image.id, 80) || uid('image'),
      src: safeMediaSrc(image && image.src),
      caption: trimText(image && image.caption, 240)
    }))
    .filter((image) => image.src);
}

function normalizeMediaPart(raw, prefix = 'episode') {
  if (!raw || typeof raw !== 'object') return null;
  const part = {
    id: trimText(raw.id, 80) || uid(prefix),
    title: trimText(raw.title, 120),
    note: trimText(raw.note, 160),
    url: normalizeHttpUrl(raw.url),
    assetId: trimText(raw.assetId, 120) || '',
    filename: trimText(raw.filename, 240),
    mime: trimText(raw.mime, 120),
    size: Math.max(0, Number(raw.size) || 0),
    group: Boolean(raw.group),
    parentId: raw.parentId ? trimText(raw.parentId, 80) : ''
  };
  if (part.group) return part;
  return part.assetId || part.url ? part : null;
}

function normalizeEpisodes(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => normalizeMediaPart(entry, 'episode')).filter(Boolean);
}

function normalizeFiles(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => normalizeMediaPart(entry, 'file')).filter(Boolean);
}

function normalizeChapters(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((chapter) => ({
      id: trimText(chapter && chapter.id, 80) || uid('chapter'),
      title: trimText(chapter && chapter.title, 120),
      body: cleanText(chapter && chapter.body, 40000).trim(),
      html: sanitizeRichHtml(chapter && chapter.html)
    }))
    .filter((chapter) => chapter.title || chapter.body || chapter.html)
    .slice(0, 40);
}

function sanitizeRichHtml(raw) {
  const source = String(raw || '').slice(0, 240000);
  if (!source) return '';
  if (typeof document === 'undefined') return '';
  const template = document.createElement('template');
  template.innerHTML = source;
  const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'STRIKE', 'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'IMG', 'A', 'SPAN', 'DIV', 'FONT']);
  const walk = (node) => {
    Array.from(node.children || []).forEach((child) => {
      if (!allowed.has(child.tagName)) {
        const text = document.createTextNode(child.textContent || '');
        child.replaceWith(text);
        return;
      }
      Array.from(child.attributes).forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        if (name === 'style') {
          const safe = attribute.value.replace(/expression|url\s*\(|javascript:/gi, '').slice(0, 300);
          child.setAttribute('style', safe);
          return;
        }
        if (name === 'href' && child.tagName === 'A') {
          if (!/^(https?:|\/|#)/i.test(attribute.value)) child.removeAttribute('href');
          return;
        }
        if (name === 'src' && child.tagName === 'IMG') {
          if (!/^(https?:|data:image\/)/i.test(attribute.value)) child.removeAttribute('src');
          return;
        }
        if (['alt', 'title', 'target', 'rel'].includes(name)) return;
        if (name === 'size' && child.tagName === 'FONT') return;
        child.removeAttribute(attribute.name);
      });
      if (child.tagName === 'A') { child.setAttribute('rel', 'noopener noreferrer'); child.setAttribute('target', '_blank'); }
      walk(child);
    });
  };
  walk(template.content);
  return template.innerHTML;
}

function richTextToPlain(raw) {
  if (!raw) return '';
  if (typeof document === 'undefined') return String(raw).replace(/<[^>]+>/g, ' ');
  const container = document.createElement('div');
  container.innerHTML = sanitizeRichHtml(raw);
  return (container.innerText || container.textContent || '').replace(/\u00a0/g, ' ').trim();
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const legacyCollection = raw.type === 'collection';
  const type = Object.prototype.hasOwnProperty.call(CONTENT_TYPES, raw.type) ? raw.type : legacyCollection ? 'note' : 'article';
  const item = {
    id: trimText(raw.id, 80) || uid('item'),
    type,
    zoneId: trimText(raw.zoneId, 80),
    title: trimText(raw.title, 120),
    hidden: Boolean(raw.hidden),
    starter: Boolean(raw.starter),
    createdAt: trimText(raw.createdAt, 40) || nowISO()
  };
  if (raw.updatedAt) item.updatedAt = trimText(raw.updatedAt, 40);
  switch (type) {
    case 'article':
      item.excerpt = trimText(raw.excerpt, 320);
      item.body = cleanText(raw.body, 40000).trim();
      item.bodyHtml = sanitizeRichHtml(raw.bodyHtml);
      item.cover = safeMediaSrc(raw.cover);
      item.chapters = normalizeChapters(raw.chapters);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      break;
    case 'image':
      item.src = safeMediaSrc(raw.src);
      item.caption = trimText(raw.caption, 240);
      item.images = normalizeImages(raw.images);
      item.downloadable = Boolean(raw.downloadable);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      break;
    case 'collection':
      item.desc = trimText(raw.desc, 400);
      item.entries = Array.isArray(raw.entries)
        ? raw.entries.map(normalizeEntry).filter((entry) => entry && (entry.title || entry.url || entry.note)).slice(0, 30)
        : [];
      break;
    case 'video':
      item.url = normalizeHttpUrl(raw.url);
      item.assetId = trimText(raw.assetId, 120) || '';
      item.filename = trimText(raw.filename, 240);
      item.mime = trimText(raw.mime, 120);
      item.size = Math.max(0, Number(raw.size) || 0);
      item.cover = safeMediaSrc(raw.cover);
      item.desc = trimText(raw.desc, 400);
      item.downloadable = Boolean(raw.downloadable);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      item.episodes = normalizeEpisodes(raw.episodes);
      break;
    case 'audio':
      item.url = normalizeHttpUrl(raw.url);
      item.assetId = trimText(raw.assetId, 120) || '';
      item.filename = trimText(raw.filename, 240);
      item.mime = trimText(raw.mime, 120);
      item.size = Math.max(0, Number(raw.size) || 0);
      item.desc = trimText(raw.desc, 400);
      item.downloadable = Boolean(raw.downloadable);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      item.episodes = normalizeEpisodes(raw.episodes);
      break;
    case 'file':
      item.url = normalizeHttpUrl(raw.url);
      item.assetId = trimText(raw.assetId, 120) || '';
      item.filename = trimText(raw.filename, 240);
      item.mime = trimText(raw.mime, 120);
      item.size = Math.max(0, Number(raw.size) || 0);
      item.desc = trimText(raw.desc, 400);
      item.downloadable = Boolean(raw.downloadable);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      item.episodes = normalizeEpisodes(raw.episodes);
      item.files = normalizeFiles(raw.files);
      break;
    case 'link':
      item.url = normalizeHttpUrl(raw.url);
      item.desc = trimText(raw.desc, 400);
      break;
    case 'note':
      item.content = legacyCollection ? legacyCollectionText(raw) : trimText(raw.content, 600);
      item.source = legacyCollection ? '原合集内容' : trimText(raw.source, 80);
      break;
    default:
      break;
  }
  return item;
}

function normalizeHistoryEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const action = ['publish', 'update', 'revoke'].includes(raw.action) ? raw.action : 'publish';
  return {
    action,
    at: trimText(raw.at, 40) || nowISO(),
    itemCount: Math.max(0, Number(raw.itemCount) || 0)
  };
}

function normalizePayload(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const zones = Array.isArray(raw.zones)
    ? sanitizeZoneParents(raw.zones.map(normalizeZone).filter(Boolean))
    : [];
  const zoneIds = new Set(zones.map((zone) => zone.id));
  const items = Array.isArray(raw.items)
    ? raw.items
        .map(normalizeItem)
        .filter((item) => item && zoneIds.has(item.zoneId))
        .slice(0, 1000)
    : [];
  const theme = Object.prototype.hasOwnProperty.call(THEMES, raw.theme) ? raw.theme : 'paper';
  return {
    siteId: trimText(raw.siteId, 80),
    slug: isValidSlug(raw.slug) ? raw.slug : 'my-web',
    title: trimText(raw.title, 60) || '未命名 web',
    owner: trimText(raw.owner, 40) || '未署名',
    tags: Array.isArray(raw.tags) ? raw.tags.map((tag) => trimText(tag, 20)).filter(Boolean).slice(0, 8) : [],
    tagline: trimText(raw.tagline, 100),
    intro: trimText(raw.intro, 300),
    cover: safeMediaSrc(normalizeHttpUrl(raw.cover) || raw.cover),
    theme,
    appearance: normalizeAppearance(raw.appearance, theme),
    layout: normalizeLayout(raw.layout),
    zones,
    items,
    publishedAt: raw.publishedAt ? trimText(raw.publishedAt, 40) : null,
    consentVersion: raw.consentVersion ? trimText(raw.consentVersion, 40) : null
  };
}

function normalizeSnapshot(raw) {
  const payload = normalizePayload(raw);
  if (!payload) return null;
  payload.publishedAt = trimText(raw.publishedAt, 40) || nowISO();
  return payload;
}

function normalizeState(raw) {
  const base = createDefaultState();
  if (!raw || typeof raw !== 'object') return base;

  const rawSite = raw.site && typeof raw.site === 'object' ? raw.site : {};
  const zones = Array.isArray(rawSite.zones)
    ? sanitizeZoneParents(rawSite.zones.map(normalizeZone).filter(Boolean))
    : base.site.zones;
  const usableZones = zones.length ? zones : base.site.zones;
  const zoneIds = new Set(usableZones.map((zone) => zone.id));
  const items = Array.isArray(rawSite.items)
    ? rawSite.items
        .map(normalizeItem)
        .filter(Boolean)
        .slice(0, 1000)
        .map((item) => (zoneIds.has(item.zoneId) ? item : { ...item, zoneId: usableZones[0].id }))
    : base.site.items;

  const rawPublication = raw.publication && typeof raw.publication === 'object' ? raw.publication : {};
  const snapshot = rawPublication.snapshot ? normalizeSnapshot(rawPublication.snapshot) : null;
  const publication = {
    active: Boolean(rawPublication.active),
    consentVersion: trimText(rawPublication.consentVersion, 40) || null,
    consentedAt: trimText(rawPublication.consentedAt, 40) || null,
    consentText: cleanText(rawPublication.consentText, 1200),
    ownerToken: trimText(rawPublication.ownerToken, 120) || '',
    remoteSiteId: trimText(rawPublication.remoteSiteId, 80) || '',
    publishedAt: trimText(rawPublication.publishedAt, 40) || (snapshot ? snapshot.publishedAt : null),
    sourceHash: trimText(rawPublication.sourceHash, 80) || null,
    snapshot,
    revokedAt: trimText(rawPublication.revokedAt, 40) || null,
    history: Array.isArray(rawPublication.history)
      ? rawPublication.history.map(normalizeHistoryEntry).filter(Boolean).slice(0, 20)
      : []
  };
  if (!snapshot) publication.active = false;

  const settings = {
    showDemo: raw.settings && typeof raw.settings.showDemo === 'boolean' ? raw.settings.showDemo : true
  };

  const downloadRequests = Array.isArray(raw.downloadRequests)
    ? raw.downloadRequests
        .filter((request) => request && typeof request === 'object')
        .map((request) => ({
          id: trimText(request.id, 80) || uid('dlreq'),
          siteId: trimText(request.siteId, 120),
          slug: trimText(request.slug, 80),
          itemId: trimText(request.itemId, 80),
          videoTitle: trimText(request.videoTitle, 160),
          requester: trimText(request.requester, 80),
          note: trimText(request.note, 300),
          status: ['pending', 'approved', 'denied', 'downloaded'].includes(request.status) ? request.status : 'pending',
          source: request.source === 'online' ? 'online' : 'local',
          visitorToken: trimText(request.visitorToken, 120),
          createdAt: trimText(request.createdAt, 40) || nowISO(),
          decidedAt: trimText(request.decidedAt, 40) || null,
          downloadedAt: trimText(request.downloadedAt, 40) || null
        }))
        .slice(0, 1000)
    : [];

  const comments = Array.isArray(raw.comments)
    ? raw.comments
        .filter((comment) => comment && typeof comment === 'object' && trimText(comment.text, 1000))
        .map((comment) => ({
          id: trimText(comment.id, 80) || uid('comment'),
          siteId: trimText(comment.siteId, 80),
          itemId: trimText(comment.itemId, 80),
          parentId: trimText(comment.parentId, 80),
          name: trimText(comment.name, 60) || '匿名访客',
          text: cleanText(comment.text, 1000).trim(),
          createdAt: trimText(comment.createdAt, 40) || nowISO()
        }))
        .slice(0, 2000)
    : [];

  const ui = {
    guideQuery: raw.ui && typeof raw.ui.guideQuery === 'string' ? raw.ui.guideQuery.slice(0, 120) : '',
    guideZone: raw.ui && typeof raw.ui.guideZone === 'string' ? raw.ui.guideZone.slice(0, 40) : 'all',
    guideScope: raw.ui && ['site', 'owner', 'tag', 'all'].includes(raw.ui.guideScope) ? raw.ui.guideScope : 'all',
    starterNoteDismissed: Boolean(raw.ui && raw.ui.starterNoteDismissed),
    lastContentType: raw.ui && Object.prototype.hasOwnProperty.call(CONTENT_TYPES, raw.ui.lastContentType)
      ? raw.ui.lastContentType
      : 'article',
    studioQuery: raw.ui && typeof raw.ui.studioQuery === 'string' ? raw.ui.studioQuery.slice(0, 120) : '',
    studioZoneFilter: raw.ui && typeof raw.ui.studioZoneFilter === 'string' ? raw.ui.studioZoneFilter.slice(0, 80) : 'all',
    studioDensity: raw.ui && ['compact', 'standard', 'large'].includes(raw.ui.studioDensity)
      ? raw.ui.studioDensity
      : 'standard'
  };

  const theme = Object.prototype.hasOwnProperty.call(THEMES, rawSite.theme) ? rawSite.theme : 'paper';
  const currentSite = {
    id: trimText(rawSite.id, 80) || uid('site'),
    slug: trimText(rawSite.slug, 40) || 'my-shore',
    title: trimText(rawSite.title, 60) || '我的岸标',
    owner: trimText(rawSite.owner, 40) || '你的名字',
    tags: Array.isArray(rawSite.tags) ? rawSite.tags.map((tag) => trimText(tag, 20)).filter(Boolean).slice(0, 8) : [],
    tagline: trimText(rawSite.tagline, 100),
    intro: trimText(rawSite.intro, 300),
    cover: safeMediaSrc(normalizeHttpUrl(rawSite.cover) || rawSite.cover),
    theme,
    appearance: normalizeAppearance(rawSite.appearance, theme),
    layout: normalizeLayout(rawSite.layout),
    zones: usableZones,
    items,
    createdAt: trimText(rawSite.createdAt, 40) || nowISO(),
    updatedAt: trimText(rawSite.updatedAt, 40) || nowISO()
  };
  const currentRecord = { site: currentSite, publication, comments, downloadRequests };
  let sites = [];
  if (Array.isArray(raw.sites) && raw.sites.length) {
    sites = raw.sites.slice(0, MAX_SITES).map((entry) => normalizeSiteRecord(entry)).filter(Boolean);
  }
  if (!sites.length) sites = [currentRecord];
  const seenSiteIds = new Set();
  const seenRemoteIds = new Set();
  sites = sites.filter((entry) => {
    if (!entry || !entry.site) return false;
    const remoteId = entry.publication && entry.publication.remoteSiteId;
    if (seenSiteIds.has(entry.site.id)) return false;
    if (remoteId && seenRemoteIds.has(remoteId)) return false;
    seenSiteIds.add(entry.site.id);
    if (remoteId) seenRemoteIds.add(remoteId);
    return true;
  });
  const requestedActive = trimText(raw.activeSiteId, 80);
  let active = sites.find((entry) => entry.site.id === requestedActive)
    || sites.find((entry) => entry.site.id === currentSite.id)
    || sites[0];
  if (!active) active = { site: createDefaultSite(), publication: createDefaultPublication(), comments: [], downloadRequests: [] };
  return {
    schema: SCHEMA_VERSION,
    activeSiteId: active.site.id,
    sites,
    site: active.site,
    publication: active.publication,
    settings,
    downloadRequests: Array.isArray(active.downloadRequests) ? active.downloadRequests : [],
    comments: Array.isArray(active.comments) ? active.comments : [],
    ui
  };
}

function normalizeSiteRecord(entry) {
  if (!entry || typeof entry !== 'object' || !entry.site) return null;
  const normalized = normalizeState({
    site: entry.site,
    publication: entry.publication,
    comments: entry.comments,
    downloadRequests: entry.downloadRequests,
    settings: { showDemo: true },
    ui: {}
  });
  return {
    site: normalized.site,
    publication: normalized.publication,
    comments: normalized.comments,
    downloadRequests: normalized.downloadRequests
  };
}

/* ------------------------------ demo directory ------------------------------ */

function makeDemoItem(type, zoneId, title, extra = {}) {
  return {
    id: uid('demoitem'),
    type,
    zoneId,
    title,
    hidden: false,
    createdAt: extra.createdAt || '2026-08-12T09:00:00.000Z',
    ...extra
  };
}

function buildDemoSites() {
  const paperZones = [
    { id: 'paper-writing', name: '写作', desc: '长一点的字，和没说完的话。' },
    { id: 'paper-images', name: '影像', desc: '光落下来的地方。' },
    { id: 'paper-things', name: '收藏', desc: '想把它们留在手边。' }
  ];
  const tideZones = [
    { id: 'tide-images', name: '影像', desc: '海边的画面。' },
    { id: 'tide-sound', name: '声音', desc: '听过的和录下的。' },
    { id: 'tide-things', name: '收藏', desc: '旧磁带与票根。' }
  ];
  const slowZones = [
    { id: 'slow-links', name: '链接', desc: '会反复打开的地方。' },
    { id: 'slow-reading', name: '阅读', desc: '值得慢慢读的字。' },
    { id: 'slow-tools', name: '工具', desc: '安静好用的小东西。' }
  ];

  return [
    {
      id: 'demo-paper-room',
      isDemo: true,
      publishedAt: '2026-09-18T10:20:00.000Z',
      consentedAt: '2026-09-18T10:18:00.000Z',
      snapshot: {
        slug: 'paper-room',
        title: '纸上客厅',
        owner: '林见鹿',
        tags: ['写作', '生活'],
        tagline: '写字、煮茶，以及一些不赶时间的事。',
        intro: '一间开在纸上的客厅。这里放着我写下的字、拍下的光和舍不得丢掉的旧物。',
        cover: 'assets/covers/paper-room.svg',
        theme: 'paper',
        zones: paperZones,
        items: [
          makeDemoItem('article', 'paper-writing', '把桌子搬到窗边之后', {
            excerpt: '一张旧木桌、两盆薄荷，以及一个下午的光。',
            body: '桌子原来是靠墙的。搬动它花了整整一个下午，因为每一条桌腿下面都压着一些没有丢掉的纸。\n\n搬到窗边以后，下午四点的光会先落在左手边，再慢慢移到摊开的书上。薄荷的影子被拉得很长，像另一种字。\n\n我没有因此写出什么了不起的东西，只是坐得更久了一点。',
            createdAt: '2026-09-02T08:30:00.000Z'
          }),
          makeDemoItem('image', 'paper-images', '十一月的下午四点', {
            src: 'assets/covers/paper-room.svg',
            caption: '窗帘被风推起来的时候，光正好落在桌角。',
            createdAt: '2026-09-06T15:10:00.000Z'
          }),
          makeDemoItem('note', 'paper-things', '今年反复翻的几本书', {
            content: '《山茶文具店》《观看之道》，还有一本没有封面的旧诗集。',
            source: '不是书单，只是今年确实被翻旧了的几本。',
            createdAt: '2026-09-10T11:00:00.000Z'
          }),
          makeDemoItem('note', 'paper-writing', '慢一点也没关系', {
            content: '慢一点也没关系，反正路是自己走的。',
            source: '写在便签上，贴在书架第二层。',
            createdAt: '2026-09-14T09:40:00.000Z'
          })
        ]
      }
    },
    {
      id: 'demo-tide-archive',
      isDemo: true,
      publishedAt: '2026-08-02T07:45:00.000Z',
      consentedAt: '2026-08-02T07:40:00.000Z',
      snapshot: {
        slug: 'tide-archive',
        title: '潮汐档案',
        owner: '阿屿',
        tags: ['影像', '声音'],
        tagline: '关于海、声音与旧磁带。',
        intro: '我住在离海四十分钟的地方。这里收集潮汐、风声，和一些听过的歌。',
        cover: 'assets/covers/tide-archive.svg',
        theme: 'ink',
        zones: tideZones,
        items: [
          makeDemoItem('video', 'tide-images', '退潮之后的十七分钟', {
            url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            cover: 'assets/covers/tide-archive.svg',
            desc: '一段没有对白的短片。风声比画面更响。',
            createdAt: '2026-07-28T16:20:00.000Z'
          }),
          makeDemoItem('image', 'tide-images', '礁石与月相', {
            src: 'assets/covers/tide-archive.svg',
            caption: '月亮很低的时候，礁石看起来像一群睡着的动物。',
            createdAt: '2026-07-12T20:30:00.000Z'
          }),
          makeDemoItem('note', 'tide-things', '今年留下的三张票根', {
            content: '海边小影院夜场、旧货市场磁带摊、一张渡轮单程票。',
            source: '纸片比记忆更耐放一点。',
            createdAt: '2026-07-20T13:00:00.000Z'
          }),
          makeDemoItem('note', 'tide-sound', 'B 面还在响', {
            content: '磁带转到 B 面，海还在响。',
            source: '录于七月的一个傍晚。',
            createdAt: '2026-08-01T18:30:00.000Z'
          })
        ]
      }
    },
    {
      id: 'demo-slow-links',
      isDemo: true,
      publishedAt: '2026-06-21T09:15:00.000Z',
      consentedAt: '2026-06-21T09:10:00.000Z',
      snapshot: {
        slug: 'slow-links',
        title: '慢速链接',
        owner: '周迟',
        tags: ['链接', '工具'],
        tagline: '一个只放链接的安静角落。',
        intro: '不追热点，只收一些会反复打开的地方：工具、文章、电台，和别人的小站。',
        cover: 'assets/covers/slow-links.svg',
        theme: 'moss',
        zones: slowZones,
        items: [
          makeDemoItem('link', 'slow-links', 'The Marginalian', {
            url: 'https://www.themarginalian.org',
            desc: '关于书、艺术和如何继续做一个好奇的人。',
            createdAt: '2026-06-01T08:00:00.000Z'
          }),
          makeDemoItem('link', 'slow-links', 'Are.na', {
            url: 'https://www.are.na',
            desc: '一个不催促你发布的地方，适合把想法慢慢连起来。',
            createdAt: '2026-06-04T09:10:00.000Z'
          }),
          makeDemoItem('link', 'slow-links', 'Radio Garden', {
            url: 'https://radio.garden',
            desc: '转动地球，听一个陌生城市此刻的电台。',
            createdAt: '2026-06-07T10:20:00.000Z'
          }),
          makeDemoItem('note', 'slow-tools', '三个离线工具', {
            content: '一个本地笔记应用、一个纯文本编辑器、一个离线词典。',
            source: '不用登录，打开就能用。',
            createdAt: '2026-06-12T14:00:00.000Z'
          })
        ]
      }
    }
  ];
}

const DEMO_SITES = buildDemoSites().map((demo) => ({
  ...demo,
  snapshot: {
    ...demo.snapshot,
    publishedAt: demo.publishedAt,
    consentVersion: CONSENT_VERSION
  }
}));
const DEMO_SLUGS = new Set(DEMO_SITES.map((demo) => demo.snapshot.slug));

/* ------------------------------ online discovery (optional server) ------------------------------ */

let networkOnline = false;
let networkSites = [];
let networkOwnerRequests = [];
let networkInfo = { server: false, online: 0 };
let networkSitesHash = '';
let authToken = '';
let authUser = null;

function authHeaders() {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

async function restoreAuth() {
  try {
    authToken = window.localStorage.getItem('anbiao.auth.v1') || '';
  } catch (error) {
    authToken = '';
  }
  if (!authToken || !networkOnline) {
    authUser = null;
    return null;
  }
  try {
    const response = await fetch('/api/me', { headers: authHeaders(), cache: 'no-store' });
    if (!response.ok) throw new Error('not logged in');
    const data = await response.json();
    authUser = data.user;
    return authUser;
  } catch (error) {
    authToken = '';
    authUser = null;
    try { window.localStorage.removeItem('anbiao.auth.v1'); } catch (e) { /* ignore */ }
    return null;
  }
}

async function authLogin(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '登录失败');
  authToken = data.token;
  authUser = data.user;
  window.localStorage.setItem('anbiao.auth.v1', authToken);
  return authUser;
}

async function authRegister(username, password, name) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, name })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '注册失败');
  authToken = data.token;
  authUser = data.user;
  window.localStorage.setItem('anbiao.auth.v1', authToken);
  return authUser;
}

async function authLogout() {
  try {
    await fetch('/api/logout', { method: 'POST', headers: authHeaders() });
  } catch (error) { /* ignore */ }
  authToken = '';
  authUser = null;
  window.localStorage.removeItem('anbiao.auth.v1');
}

let networkVisits = [];

async function fetchNetworkVisits() {
  if (!networkOnline || !state.publication.ownerToken) return [];
  try {
    const query = new URLSearchParams({ siteId: state.site.id, token: state.publication.ownerToken });
    const response = await fetch(`/api/visits?${query.toString()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('无法读取访客记录');
    const data = await response.json();
    networkVisits = Array.isArray(data.visits) ? data.visits : [];
    return networkVisits;
  } catch (error) {
    return networkVisits;
  }
}

function visitorId() {
  try {
    let id = window.localStorage.getItem('anbiao.visitor.v1');
    if (!id) {
      id = uid('visitor');
      window.localStorage.setItem('anbiao.visitor.v1', id);
    }
    return id;
  } catch (error) {
    return 'anonymous';
  }
}

async function detectNetwork() {
  networkOnline = false;
  if (!/^https?:$/.test(window.location.protocol)) return false;
  try {
    const response = await fetch('/api/health', { cache: 'no-store' });
    if (!response.ok) return false;
    const data = await response.json();
    networkOnline = Boolean(data && data.online);
    networkInfo.server = networkOnline;
    return networkOnline;
  } catch (error) {
    return false;
  }
}

async function refreshNetworkSites() {
  if (!networkOnline) return false;
  try {
    const response = await fetch('/api/sites', { cache: 'no-store' });
    if (!response.ok) throw new Error('无法读取联机导览');
    const data = await response.json();
    networkSites = Array.isArray(data.sites) ? data.sites : [];
    networkInfo = {
      server: true,
      online: networkSites.filter((site) => site.online).length
    };
    const hash = JSON.stringify(networkSites.map((site) => [site.siteId, site.online, site.publishedAt]));
    const changed = hash !== networkSitesHash;
    networkSitesHash = hash;
    return changed;
  } catch (error) {
    networkOnline = false;
    networkInfo = { server: false, online: 0 };
    return false;
  }
}

function findNetworkSite(slug) {
  return networkSites.find((site) => site.snapshot && site.snapshot.slug === slug) || null;
}

function downloadCacheKey(siteId, itemId) {
  return `anbiao.download.${siteId}.${itemId}`;
}

function getNetworkDownloadRecord(siteId, itemId) {
  try {
    const raw = window.localStorage.getItem(downloadCacheKey(siteId, itemId));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function setNetworkDownloadRecord(siteId, itemId, record) {
  try {
    window.localStorage.setItem(downloadCacheKey(siteId, itemId), JSON.stringify(record));
  } catch (error) {
    /* ignore storage errors */
  }
}

async function publishToNetwork(snapshot) {
  if (!networkOnline) return { skipped: true };
  const publication = state.publication;
  publication.ownerToken = publication.ownerToken || uid('owner');
  saveStateToStorage();
  const siteId = state.site.id;
  const response = await fetch('/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteId,
      ownerToken: publication.ownerToken,
      slug: snapshot.slug,
      snapshot,
      consentedAt: publication.consentedAt
    })
  });
  if (!response.ok) throw new Error('联机公示失败，请确认服务正在运行。');
  const assetIds = collectAssetIds({ items: snapshot.items }, new Set());
  for (const assetId of assetIds) {
    const record = await getAssetRecord(assetId);
    if (!record || !record.blob) continue;
    const query = new URLSearchParams({
      token: publication.ownerToken,
      name: record.name || 'file',
      mime: record.type || 'application/octet-stream'
    });
    const upload = await fetch(`/api/asset/${encodeURIComponent(siteId)}/${encodeURIComponent(assetId)}?${query.toString()}`, {
      method: 'PUT',
      body: record.blob
    });
    if (!upload.ok) throw new Error('本地媒体同步失败。');
  }
  publication.networkSyncedAt = nowISO();
  publication.networkSiteId = siteId;
  saveStateToStorage();
  await refreshNetworkSites();
  return { skipped: false, siteId };
}

async function revokeFromNetwork() {
  if (!networkOnline) return;
  const publication = state.publication;
  if (!publication.ownerToken) return;
  try {
    await fetch('/api/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId: state.site.id, ownerToken: publication.ownerToken })
    });
  } catch (error) {
    /* local revoke still wins */
  }
  networkSites = networkSites.filter((site) => site.siteId !== state.site.id);
  networkSitesHash = '';
}

async function heartbeatNetwork() {
  if (!networkOnline || !state.publication.active || !state.publication.ownerToken) return;
  try {
    await fetch('/api/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId: state.site.id, slug: state.site.slug, title: state.site.title })
    });
  } catch (error) {
    /* presence is best effort */
  }
}

async function fetchOwnerNetworkRequests() {
  if (!networkOnline || !state.publication.ownerToken) return [];
  try {
    const query = new URLSearchParams({ siteId: state.site.id, token: state.publication.ownerToken });
    const response = await fetch(`/api/owner/requests?${query.toString()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('无法读取联机下载请求');
    const data = await response.json();
    networkOwnerRequests = Array.isArray(data.requests) ? data.requests : [];
    return networkOwnerRequests;
  } catch (error) {
    return networkOwnerRequests;
  }
}

async function decideNetworkRequest(requestId, approve) {
  if (!networkOnline || !state.publication.ownerToken) throw new Error('需要联机模式。');
  const response = await fetch('/api/owner/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      siteId: state.site.id,
      token: state.publication.ownerToken,
      requestId,
      approve
    })
  });
  if (!response.ok) throw new Error('处理下载申请失败。');
  return response.json();
}

async function requestNetworkVideoDownload(siteId, itemId, requester, note) {
  const response = await fetch('/api/download-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteId, itemId, requester, note })
  });
  if (!response.ok) throw new Error('发送下载申请失败。');
  const data = await response.json();
  setNetworkDownloadRecord(siteId, itemId, {
    requestId: data.requestId,
    visitorToken: data.visitorToken,
    status: data.status || 'pending',
    downloadUrl: '',
    updatedAt: Date.now()
  });
  return data;
}

async function refreshNetworkDownloadRecord(siteId, itemId) {
  const cached = getNetworkDownloadRecord(siteId, itemId);
  if (!cached || !cached.requestId || !cached.visitorToken) return null;
  try {
    const query = new URLSearchParams({ token: cached.visitorToken });
    const response = await fetch(`/api/download-status/${cached.requestId}?${query.toString()}`, { cache: 'no-store' });
    if (!response.ok) return cached;
    const data = await response.json();
    const next = { ...cached, ...data, updatedAt: Date.now() };
    setNetworkDownloadRecord(siteId, itemId, next);
    return next;
  } catch (error) {
    return cached;
  }
}

/* ------------------------------ state & storage ------------------------------ */

let state = createDefaultState();
let layoutDraft = null;
let selectedLayoutBlockId = 'hero';
let storageOK = true;
let lastSavedAt = null;
let currentAccountId = '';
let stateLoadedFromStorage = false;
let stateLoadedForAccount = false;

function stateStorageKey(accountId = currentAccountId) {
  return accountId ? `${STORAGE_KEY}.user.${accountId}` : `${STORAGE_KEY}.guest`;
}

function loadStateFromStorage(accountId = currentAccountId) {
  const key = stateStorageKey(accountId);
  try {
    let raw = window.localStorage.getItem(key);
    stateLoadedForAccount = Boolean(raw);
    let imported = false;
    if (!raw && accountId) {
      raw = window.localStorage.getItem(stateStorageKey('')) || window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
      imported = Boolean(raw);
    } else if (!raw) {
      raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
      imported = false;
    }
    currentAccountId = accountId || '';
    if (!raw) {
      state = createDefaultState();
      stateLoadedFromStorage = false;
      stateLoadedForAccount = false;
      return;
    }
    state = normalizeState(JSON.parse(raw));
    stateLoadedFromStorage = true;
    stateLoadedForAccount = Boolean(window.localStorage.getItem(key));
    if (imported) {
      saveStateToStorage();
      if (accountId) {
        try {
          window.localStorage.removeItem(stateStorageKey(''));
          window.localStorage.removeItem(STORAGE_KEY);
          window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch (error) { /* ignore */ }
      }
    }
  } catch (error) {
    console.warn('[岸标] 读取本地数据失败，已使用新的草稿。', error);
    state = createDefaultState();
    stateLoadedFromStorage = false;
    stateLoadedForAccount = false;
    storageOK = false;
  }
}

async function switchAccountState(accountId = '') {
  const next = accountId || '';
  if (next === currentAccountId) return;
  saveStateToStorage();
  loadStateFromStorage(next);
  try {
    await hydrateAssetUrls(state);
  } catch (error) {
    console.warn('[岸标] 账号草稿的本地文件载入失败。', error);
  }
}

function stateToJSON() {
  syncActiveSiteRecord();
  return JSON.stringify(state);
}

function saveStateToStorage() {
  try {
    syncActiveSiteRecord();
    window.localStorage.setItem(stateStorageKey(), stateToJSON());
    storageOK = true;
    lastSavedAt = nowISO();
    return true;
  } catch (error) {
    console.warn('[岸标] 保存失败。', error);
    storageOK = false;
    return false;
  }
}

function storageSizeBytes() {
  try {
    return new Blob([stateToJSON()]).size;
  } catch (error) {
    return new TextEncoder().encode(stateToJSON()).length;
  }
}

/* ------------------------------ local asset store (IndexedDB) ------------------------------ */

let assetDbPromise = null;
let assetStoreAvailable = Boolean(window.indexedDB);
const assetObjectUrls = new Map();

function openAssetDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('当前浏览器不支持本地文件存储。'));
      return;
    }
    const request = window.indexedDB.open(ASSET_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ASSET_STORE_NAME)) {
        db.createObjectStore(ASSET_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('无法打开本地文件库。'));
  });
}

function getAssetDB() {
  if (!assetDbPromise) {
    assetDbPromise = openAssetDB().catch((error) => {
      assetStoreAvailable = false;
      throw error;
    });
  }
  return assetDbPromise;
}

async function putAssetRecord(record) {
  const db = await getAssetDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSET_STORE_NAME, 'readwrite');
    tx.objectStore(ASSET_STORE_NAME).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error || new Error('本地文件保存失败。'));
    tx.onabort = () => reject(tx.error || new Error('本地文件保存被中断。'));
  });
}

async function getAssetRecord(id) {
  if (!id) return null;
  try {
    const db = await getAssetDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, 'readonly');
      const request = tx.objectStore(ASSET_STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('无法读取本地文件。'));
    });
  } catch (error) {
    return null;
  }
}

async function deleteAssetRecord(id) {
  if (!id) return;
  try {
    const db = await getAssetDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, 'readwrite');
      tx.objectStore(ASSET_STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    /* deleting is best effort */
  }
  const url = assetObjectUrls.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    assetObjectUrls.delete(id);
  }
}

function assetUrl(id) {
  return (id && assetObjectUrls.get(id)) || '';
}

async function createAssetFromFile(file) {
  if (!file) throw new Error('没有选择文件。');
  if (!assetStoreAvailable) throw new Error('当前浏览器不支持本地文件存储。');
  if (MAX_ASSET_BYTES && file.size > MAX_ASSET_BYTES) throw new Error(`单个文件不能超过 ${formatBytes(MAX_ASSET_BYTES)}。`);
  if (!file.size) throw new Error('这个文件是空的。');
  const id = uid('asset');
  const record = {
    id,
    blob: file,
    name: file.name || '未命名文件',
    type: file.type || 'application/octet-stream',
    size: file.size,
    createdAt: nowISO()
  };
  await putAssetRecord(record);
  const url = URL.createObjectURL(file);
  assetObjectUrls.set(id, url);
  return {
    assetId: id,
    filename: record.name,
    mime: record.type,
    size: record.size
  };
}

async function loadAssetUrl(id) {
  if (!id) return '';
  if (assetObjectUrls.has(id)) return assetObjectUrls.get(id);
  const record = await getAssetRecord(id);
  if (!record || !record.blob) return '';
  const url = URL.createObjectURL(record.blob);
  assetObjectUrls.set(id, url);
  return url;
}

function collectAssetIds(site, target = new Set()) {
  if (!site || !Array.isArray(site.items)) return target;
  site.items.forEach((item) => {
    if (!item) return;
    if (item.assetId) target.add(item.assetId);
    [...(item.episodes || []), ...(item.files || [])].forEach((part) => {
      if (part && part.assetId) target.add(part.assetId);
    });
  });
  return target;
}

async function hydrateAssetUrls(sourceState = state) {
  const ids = new Set();
  collectAssetIds(sourceState && sourceState.site, ids);
  if (sourceState && sourceState.publication && sourceState.publication.snapshot) {
    collectAssetIds(sourceState.publication.snapshot, ids);
  }
  await Promise.all(Array.from(ids).map((id) => loadAssetUrl(id).catch(() => '')));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('文件读取失败。'));
    reader.readAsDataURL(blob);
  });
}

async function inlineAssetUrls(html) {
  let output = String(html);
  let bytes = 0;
  for (const [id, url] of assetObjectUrls.entries()) {
    if (!url || !output.includes(url)) continue;
    const record = await getAssetRecord(id);
    if (!record || !record.blob) continue;
    const dataUrl = await blobToDataUrl(record.blob);
    bytes += dataUrl.length;
    output = output.split(url).join(dataUrl);
  }
  return { html: output, bytes };
}

function revokeAllAssetUrls() {
  assetObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  assetObjectUrls.clear();
}

async function clearAssetStore() {
  try {
    const db = await getAssetDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, 'readwrite');
      tx.objectStore(ASSET_STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    /* best effort */
  }
  revokeAllAssetUrls();
}

async function clearAssetStore() {
  try {
    const db = await getAssetDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_STORE_NAME, 'readwrite');
      tx.objectStore(ASSET_STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    /* best effort */
  }
  revokeAllAssetUrls();
}

/* ------------------------------ public payload ------------------------------ */

function itemForPublic(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const legacyCollection = raw.type === 'collection';
  const type = Object.prototype.hasOwnProperty.call(CONTENT_TYPES, raw.type) ? raw.type : legacyCollection ? 'note' : 'article';
  const item = {
    id: trimText(raw.id, 80) || uid('item'),
    type,
    zoneId: trimText(raw.zoneId, 80),
    title: trimText(raw.title, 120),
    createdAt: trimText(raw.createdAt, 40) || nowISO()
  };
  if (!item.title) item.title = '未命名内容';
  switch (type) {
    case 'article':
      item.excerpt = trimText(raw.excerpt, 320);
      item.body = cleanText(raw.body, 40000).trim();
      item.bodyHtml = sanitizeRichHtml(raw.bodyHtml);
      item.cover = safeMediaSrc(raw.cover);
      item.chapters = normalizeChapters(raw.chapters);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      break;
    case 'image':
      item.src = safeMediaSrc(raw.src);
      item.caption = trimText(raw.caption, 240);
      item.images = normalizeImages(raw.images);
      item.downloadable = Boolean(raw.downloadable);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      break;
    case 'collection':
      item.desc = trimText(raw.desc, 400);
      item.entries = Array.isArray(raw.entries)
        ? raw.entries
            .map((entry) => ({
              title: trimText(entry && entry.title, 120),
              url: normalizeHttpUrl(entry && entry.url),
              note: trimText(entry && entry.note, 160)
            }))
            .filter((entry) => entry.title || entry.url || entry.note)
            .slice(0, 30)
        : [];
      break;
    case 'video':
      item.url = normalizeHttpUrl(raw.url);
      item.assetId = trimText(raw.assetId, 120) || '';
      item.filename = trimText(raw.filename, 240);
      item.mime = trimText(raw.mime, 120);
      item.size = Math.max(0, Number(raw.size) || 0);
      item.cover = safeMediaSrc(raw.cover);
      item.desc = trimText(raw.desc, 400);
      item.downloadable = Boolean(raw.downloadable);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      item.episodes = normalizeEpisodes(raw.episodes);
      break;
    case 'audio':
      item.url = normalizeHttpUrl(raw.url);
      item.assetId = trimText(raw.assetId, 120) || '';
      item.filename = trimText(raw.filename, 240);
      item.mime = trimText(raw.mime, 120);
      item.size = Math.max(0, Number(raw.size) || 0);
      item.desc = trimText(raw.desc, 400);
      item.downloadable = Boolean(raw.downloadable);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      item.episodes = normalizeEpisodes(raw.episodes);
      break;
    case 'file':
      item.url = normalizeHttpUrl(raw.url);
      item.assetId = trimText(raw.assetId, 120) || '';
      item.filename = trimText(raw.filename, 240);
      item.mime = trimText(raw.mime, 120);
      item.size = Math.max(0, Number(raw.size) || 0);
      item.desc = trimText(raw.desc, 400);
      item.downloadable = Boolean(raw.downloadable);
      item.commentsEnabled = Boolean(raw.commentsEnabled);
      item.episodes = normalizeEpisodes(raw.episodes);
      item.files = normalizeFiles(raw.files);
      break;
    case 'link':
      item.url = normalizeHttpUrl(raw.url);
      item.desc = trimText(raw.desc, 400);
      break;
    case 'note':
      item.content = legacyCollection ? legacyCollectionText(raw) : trimText(raw.content, 600);
      item.source = legacyCollection ? '原合集内容' : trimText(raw.source, 80);
      break;
    default:
      return null;
  }
  return item;
}

function buildPublicPayload(site) {
  const source = site || state.site;
  const zoneList = Array.isArray(source.zones) ? source.zones : [];
  const zones = sanitizeZoneParents(zoneList.map((zone) => ({
    id: trimText(zone.id, 80) || uid('zone'),
    name: trimText(zone.name, 24) || '未命名专区',
    desc: trimText(zone.desc, 80),
    parentId: zone.parentId || null,
    color: normalizeHexColor(zone.color, DEFAULT_ZONE_COLOR)
  })));
  const zoneIds = new Set(zones.map((zone) => zone.id));
  const items = (Array.isArray(source.items) ? source.items : [])
    .filter((item) => item && !item.hidden && zoneIds.has(item.zoneId))
    .map(itemForPublic)
    .filter(Boolean);
  const theme = Object.prototype.hasOwnProperty.call(THEMES, source.theme) ? source.theme : 'paper';
  return {
    siteId: trimText(source.id, 80) || uid('site'),
    slug: trimText(source.slug, 40) || 'my-web',
    title: trimText(source.title, 60) || '未命名 web',
    owner: trimText(source.owner, 40) || '未署名',
    tags: Array.isArray(source.tags) ? source.tags.map((tag) => trimText(tag, 20)).filter(Boolean).slice(0, 8) : [],
    tagline: trimText(source.tagline, 100),
    intro: trimText(source.intro, 300),
    cover: safeMediaSrc(normalizeHttpUrl(source.cover) || source.cover),
    theme,
    appearance: normalizeAppearance(source.appearance, theme),
    layout: normalizeLayout(source.layout),
    zones,
    items
  };
}

function publicPayloadHash(payload) {
  return hashString(JSON.stringify(payload));
}

function validatePublish(site) {
  const source = site || state.site;
  const issues = [];
  const title = trimText(source.title, 60);
  const owner = trimText(source.owner, 40);
  const slug = trimText(source.slug, 40);
  const zones = Array.isArray(source.zones) ? source.zones : [];
  const zoneIds = new Set(zones.map((zone) => zone.id));
  const visibleItems = (Array.isArray(source.items) ? source.items : []).filter((item) => item && !item.hidden);

  if (!title) issues.push('还需要一个站点名称。');
  if (!owner) issues.push('还需要一个主人署名，让来者知道这座 web 是谁的。');
  if (!isValidSlug(slug)) {
    issues.push('站点路径只能使用小写英文字母、数字和连字符，例如 my-shore。');
  } else if (DEMO_SLUGS.has(slug)) {
    issues.push('这个站点路径已被平台示例使用，请换一个。');
  }
  if (!zones.length) issues.push('至少需要一个专区，访客才能按专区浏览与搜索。');
  if (zones.some((zone) => !trimText(zone.name, 24))) {
    issues.push('每个专区都需要一个名字。');
  }
  const siblingNames = new Map();
  zones.forEach((zone) => {
    const key = zone.parentId || 'root';
    const name = trimText(zone.name, 24).toLowerCase();
    if (!name) return;
    if (!siblingNames.has(key)) siblingNames.set(key, new Set());
    if (siblingNames.get(key).has(name)) {
      issues.push('同一个上级下的子专区不能重名，否则访客会分不清该走哪条路。');
    }
    siblingNames.get(key).add(name);
  });
  if (!visibleItems.length) {
    issues.push('至少需要一块公开内容。现在的内容都设为了仅本机可见，或者还没有内容。');
  }

  visibleItems.forEach((item) => {
    const label = trimText(item.title, 60) || '未命名内容';
    if (!trimText(item.title, 120)) issues.push(`有一块「${CONTENT_TYPES[item.type] ? CONTENT_TYPES[item.type].label : '内容'}」还没有标题。`);
    if (!zoneIds.has(item.zoneId)) issues.push(`「${label}」还没有归入有效的专区。`);
    if (item.type === 'image' && !safeMediaSrc(item.src)) {
      issues.push(`图片「${label}」还没有可用的图片地址或上传文件。`);
    }
    if (item.type === 'video' && !item.assetId && !normalizeHttpUrl(item.url)) {
      issues.push(`视频「${label}」需要上传本地视频，或填写有效的 http(s) 链接。`);
    }
    if (item.type === 'audio' && !item.assetId && !normalizeHttpUrl(item.url)) {
      issues.push(`音频「${label}」需要上传本地音频，或填写有效的 http(s) 链接。`);
    }
    if (item.type === 'file' && !item.assetId && !normalizeHttpUrl(item.url)) {
      issues.push(`文件「${label}」需要上传本地文件，或填写有效的 http(s) 链接。`);
    }
    if (item.type === 'link' && !normalizeHttpUrl(item.url)) {
      issues.push(`链接「${label}」的地址不是有效的 http(s) 地址。`);
    }
    if (item.type === 'article' && !trimText(item.body, 40000) && !trimText(item.excerpt, 320)) {
      issues.push(`文章「${label}」需要有正文或摘要。`);
    }
    if (item.type === 'note' && !trimText(item.content, 600)) {
      issues.push(`短句「${label}」还是空的。`);
    }
    if (item.type === 'collection') {
      const entries = Array.isArray(item.entries) ? item.entries : [];
      if (!entries.some((entry) => trimText(entry.title, 120) || normalizeHttpUrl(entry.url))) {
        issues.push(`合集「${label}」至少需要一个有条目名称或链接的条目。`);
      }
      entries.forEach((entry) => {
        if (trimText(entry.url, 300) && !normalizeHttpUrl(entry.url)) {
          issues.push(`合集「${label}」里有一条链接不是有效的 http(s) 地址。`);
        }
      });
    }
  });

  return Array.from(new Set(issues)).slice(0, 12);
}

function publicationIsListed() {
  const publication = state.publication;
  return Boolean(
    publication &&
    publication.active &&
    publication.snapshot &&
    publication.consentVersion === CONSENT_VERSION
  );
}

function publicationIsStale() {
  if (!publicationIsListed()) return false;
  return state.publication.sourceHash !== publicPayloadHash(buildPublicPayload(state.site));
}

function getPublishStatus() {
  const publication = state.publication;
  if (!publication.active) {
    return {
      kind: 'draft',
      label: '草稿 · 仅本机可见',
      detail: '未经你的同意，不会出现在指路中'
    };
  }
  if (!publicationIsListed()) {
    return {
      kind: 'stale',
      label: '需要重新确认公示',
      detail: '公示协议已更新，确认后才会重新出现'
    };
  }
  if (publicationIsStale()) {
    return {
      kind: 'stale',
      label: '已公示 · 有修改待同步',
      detail: '指路仍显示上次确认的版本'
    };
  }
  return {
    kind: 'live',
    label: '已在指路公示',
    detail: `公示于 ${formatDate(publication.publishedAt || publication.consentedAt)}`
  };
}

function getDirectoryEntries() {
  const entries = [];
  const remoteIds = new Set();
  if (networkOnline) {
    networkSites.forEach((site) => {
      if (!site || !site.snapshot) return;
      remoteIds.add(site.siteId);
      entries.push({
        id: `net-${site.siteId}`,
        isMine: site.siteId === state.publication.remoteSiteId || Boolean(authUser && site.ownerId === authUser.id),
        isDemo: false,
        isRemote: true,
        online: Boolean(site.online),
        siteId: site.siteId,
        snapshot: site.snapshot,
        publishedAt: site.publishedAt
      });
    });
  }
  // When logged in, the cloud row is the source of truth for published pages.
  // Never mix a local draft snapshot into the network directory; that was the
  // cause of duplicate "half-finished" cards after a publish attempt.
  const cloudOwnsDirectory = networkOnline && Boolean(authUser);
  if (!cloudOwnsDirectory && publicationIsListed() && (!networkOnline || !remoteIds.has(state.publication.remoteSiteId || state.site.id))) {
    entries.push({
      id: 'my-publication',
      isMine: true,
      isDemo: false,
      isRemote: false,
      online: false,
      siteId: state.site.id,
      snapshot: state.publication.snapshot,
      publishedAt: state.publication.publishedAt || state.publication.consentedAt
    });
  }
  if (state.settings.showDemo) {
    DEMO_SITES.forEach((demo) => {
      entries.push({
        id: demo.id,
        isMine: false,
        isDemo: true,
        isRemote: false,
        online: false,
        snapshot: demo.snapshot,
        publishedAt: demo.publishedAt,
        consentedAt: demo.consentedAt
      });
    });
  }
  return entries;
}

function directoryZones(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    const seen = new Set();
    (entry.snapshot.zones || []).forEach((zone) => {
      const name = trimText(zone.name, 24);
      if (!name || seen.has(name)) return;
      seen.add(name);
      map.set(name, (map.get(name) || 0) + 1);
    });
  });
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
}

function searchDirectory(entries, query, scope = 'all') {
  const tokens = normalizeSpace(query).toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = entries.filter((entry) => {
    const snapshot = entry.snapshot;
    if (!tokens.length) return true;
    const fields = {
      site: [snapshot.title],
      owner: [snapshot.owner],
      tag: snapshot.tags || [],
      all: [
        snapshot.title,
        snapshot.owner,
        ...(snapshot.tags || []),
        snapshot.tagline,
        snapshot.intro,
        ...(snapshot.items || []).flatMap((item) => [item.title, item.filename, item.desc, item.excerpt])
      ]
    };
    const haystack = (fields[scope] || fields.all).join(' ').toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
  return filtered.sort((a, b) => {
    const byTitle = String(a.snapshot.title || '').localeCompare(String(b.snapshot.title || ''), 'zh-Hans-CN', { sensitivity: 'base' });
    if (byTitle !== 0) return byTitle;
    return String(a.snapshot.slug || '').localeCompare(String(b.snapshot.slug || ''));
  });
}

function searchTokens(query) {
  return normalizeSpace(query).toLowerCase().split(/\s+/).filter(Boolean).slice(0, 6);
}

/* ------------------------------ item helpers ------------------------------ */

function zoneNameById(zoneId) {
  const zone = (state.site.zones || []).find((item) => item.id === zoneId);
  return zone ? zone.name : '未分类';
}

function itemTypeLabel(type) {
  return CONTENT_TYPES[type] ? CONTENT_TYPES[type].label : '内容';
}

function itemSummary(item) {
  if (!item) return '';
  switch (item.type) {
    case 'article':
      return item.chapters && item.chapters.length
        ? `${item.chapters.length} 个章节 · ${clipText(item.excerpt || item.body || '多章节文章', 60)}`
        : clipText(item.excerpt || item.body || '还没有正文', 80);
    case 'image':
      return clipText(item.caption || item.src || '还没有图片', 80);
    case 'collection': {
      const count = Array.isArray(item.entries) ? item.entries.length : 0;
      return clipText(item.desc || `${count} 个条目`, 80);
    }
    case 'video':
      return clipText(item.desc || item.filename || getHostLabel(item.url), 80);
    case 'audio':
      return clipText(item.desc || item.filename || getHostLabel(item.url), 80);
    case 'file':
      return clipText(item.desc || item.filename || getHostLabel(item.url), 80);
    case 'link':
      return clipText(item.desc || getHostLabel(item.url), 80);
    case 'note':
      return clipText(item.content || '还没有内容', 80);
    default:
      return '';
  }
}

function itemMediaUrl(item) {
  if (!item) return '';
  if (item.assetId) {
    const local = assetUrl(item.assetId);
    if (local) return local;
  }
  if (/^\/api\/media\/[a-z0-9_-]+\/[a-z0-9_-]+$/i.test(String(item.url || ''))) {
    return item.url;
  }
  return safeHref(item.url);
}

function latestDownloadRequest(siteId, itemId) {
  const requests = (state.downloadRequests || [])
    .filter((request) => request.siteId === siteId && request.itemId === itemId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return requests[0] || null;
}

function fileKindLabel(mime, filename) {
  const type = String(mime || '');
  const ext = String(filename || '').split('.').pop().toLowerCase();
  if (type.startsWith('audio/')) return '音频';
  if (type.startsWith('video/')) return '视频';
  if (type.startsWith('image/')) return '图片';
  if (type === 'application/pdf' || ext === 'pdf') return 'PDF';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) return '压缩包';
  if (['doc', 'docx', 'odt', 'rtf', 'txt', 'md'].includes(ext)) return '文档';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return '表格';
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) return '演示';
  return '文件';
}

function fileExtension(filename) {
  const parts = String(filename || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase().slice(0, 8) : '';
}

function visibleItemCount(site) {
  return (Array.isArray(site.items) ? site.items : []).filter((item) => item && !item.hidden).length;
}

function hiddenItemCount(site) {
  return (Array.isArray(site.items) ? site.items : []).filter((item) => item && item.hidden).length;
}

function keepItemsInZones() {
  const valid = new Set((state.site.zones || []).map((zone) => zone.id));
  if (!state.site.zones.length) {
    state.site.zones.push(makeZone('未分类', '还没有归类的零碎。'));
    valid.add(state.site.zones[0].id);
  }
  state.site.items = state.site.items.map((item) =>
    valid.has(item.zoneId) ? item : { ...item, zoneId: state.site.zones[0].id }
  );
}

/* ------------------------------ image handling ------------------------------ */

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片无法识别'));
    image.src = src;
  });
}

async function imageFileToDataUrl(file, maxDimension = 1800) {
  if (!file || !/^image\//i.test(file.type || '')) {
    throw new Error('请选择图片文件。');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('图片不能超过 14MB。');
  }
  const original = await readFileAsDataUrl(file);
  const image = await loadImageElement(original);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) throw new Error('图片尺寸无法读取。');
  const ratio = Math.min(1, maxDimension / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const context = canvas.getContext('2d');
  context.fillStyle = '#faf6ec';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let dataUrl = canvas.toDataURL('image/jpeg', 0.84);
  if (dataUrl.length > 1800000) dataUrl = canvas.toDataURL('image/jpeg', 0.68);
  if (dataUrl.length > 2800000) dataUrl = canvas.toDataURL('image/jpeg', 0.52);
  return dataUrl;
}
