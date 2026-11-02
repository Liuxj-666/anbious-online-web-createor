/* ============================================================
   岸标 — interactions, routing, consent flow and export
   ============================================================ */

(function () {
  'use strict';

  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastStack = document.getElementById('toast-stack');

  let route = { name: 'guide', slug: '', query: new URLSearchParams() };
  let currentRouteKey = '';
  let saveTimer = null;
  let previewFrame = null;
  let modalLastFocus = null;
  let modalOnClose = null;
  let pendingConfirm = null;
  let saveErrorShown = false;
  let modalDraftAssets = new Set();
  let exporting = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  /* ---------------------------- boot & routing ---------------------------- */

  function injectWebStyles() {
    if (document.getElementById('anbiao-web-styles')) return;
    const style = document.createElement('style');
    style.id = 'anbiao-web-styles';
    style.textContent = window.ANBIAO_WEB_CSS || '';
    document.head.appendChild(style);
  }

  function parseRoute() {
    const rawHash = window.location.hash || '#/guide';
    const raw = rawHash.replace(/^#\/?/, '') || 'guide';
    const [pathPart, queryString = ''] = raw.split('?');
    const segments = pathPart.split('/').filter(Boolean);
    const query = new URLSearchParams(queryString);
    if (segments[0] === 'site' && segments[1]) {
      let slug = segments[1];
      try { slug = decodeURIComponent(slug); } catch (error) { /* keep raw */ }
      return { name: 'site', slug, query };
    }
    if (segments[0] === 'collection' && segments[1] && segments[2]) {
      let slug = segments[1];
      let zoneId = segments[2];
      try {
        slug = decodeURIComponent(slug);
        zoneId = decodeURIComponent(zoneId);
      } catch (error) { /* keep raw */ }
      return { name: 'collection', slug, zoneId, query };
    }
    if (segments[0] === 'item' && segments[1] && segments[2]) {
      let slug = segments[1];
      let itemId = segments[2];
      try {
        slug = decodeURIComponent(slug);
        itemId = decodeURIComponent(itemId);
      } catch (error) { /* keep raw */ }
      return { name: 'item', slug, itemId, query };
    }
    if (segments[0] === 'read' && segments[1] && segments[2]) {
      let slug = segments[1];
      let itemId = segments[2];
      try {
        slug = decodeURIComponent(slug);
        itemId = decodeURIComponent(itemId);
      } catch (error) { /* keep raw */ }
      return { name: 'read', slug, itemId, query };
    }
    if (segments[0] === 'studio') return { name: 'studio', slug: '', query };
    if (segments[0] === 'settings') return { name: 'settings', slug: '', query };
    if (segments[0] === 'login') return { name: 'login', slug: '', query };
    if (segments[0] === 'layout') return { name: 'layout', slug: '', query };
    if (segments[0] === 'sites') return { name: 'sites', slug: '', query };
    if (segments[0] === 'write' && segments[1]) {
      let itemId = segments[1];
      try { itemId = decodeURIComponent(itemId); } catch (error) { /* keep raw */ }
      return { name: 'write', slug: '', itemId, query };
    }
    return { name: 'guide', slug: '', query };
  }

  function updateAuthNav() {
    const label = document.getElementById('auth-nav-label');
    const link = document.getElementById('auth-nav-link');
    if (label) label.textContent = authUser ? (authUser.name || authUser.username) : '登录';
    if (link) link.setAttribute('aria-label', authUser ? `已登录：${authUser.name || authUser.username}` : '登录或注册');
  }

  function setActiveNav(name) {
    $$('[data-nav]').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.nav === name);
      if (link.dataset.nav === name) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function renderRoute(options = {}) {
    route = parseRoute();
    const nextKey = `${route.name}:${route.slug || ''}:${route.itemId || ''}:${route.zoneId || ''}:${route.query.get('preview') || ''}:${route.query.get('chapter') || ''}`;
    const changed = nextKey !== currentRouteKey;
    currentRouteKey = nextKey;

    document.body.classList.toggle('route-site', route.name === 'site' || route.name === 'collection');
    document.body.classList.toggle('route-read', route.name === 'read' || route.name === 'item');
    setActiveNav(route.name);
    updateAuthNav();

    if (route.name === 'guide') {
      document.title = '指路 · 岸标 ANBIAO';
      app.innerHTML = renderGuidePage();
    } else if (route.name === 'studio') {
      document.title = '我的 Web · 岸标 ANBIAO';
      app.innerHTML = renderStudioPage();
      updateSaveStatus();
    } else if (route.name === 'settings') {
      document.title = '设置 · 岸标 ANBIAO';
      app.innerHTML = renderSettingsPage();
    } else if (route.name === 'login') {
      document.title = '登录 · 岸标 ANBIAO';
      app.innerHTML = renderAuthPage();
    } else if (route.name === 'layout') {
      document.title = '页面布局 · 岸标 ANBIAO';
      app.innerHTML = renderLayoutPage(route);
    } else if (route.name === 'sites') {
      document.title = '管理我的网页 · 岸标 ANBIAO';
      app.innerHTML = renderSitesPage();
    } else if (route.name === 'write') {
      document.title = '写作 · 岸标 ANBIAO';
      app.innerHTML = renderWritingPage(route);
    } else if (route.name === 'read') {
      const reader = renderReadRoute(route);
      document.title = reader.title;
      app.innerHTML = reader.html;
    } else if (route.name === 'item') {
      const detail = renderItemRoute(route);
      document.title = detail.title;
      app.innerHTML = detail.html;
    } else if (route.name === 'collection') {
      const collection = renderCollectionRoute(route);
      document.title = collection.title;
      app.innerHTML = collection.html;
    } else {
      const siteView = renderSiteRoute(route, route.query);
      document.title = siteView.title;
      app.innerHTML = siteView.html;
    }

    if (changed && options.scroll !== false) {
      window.scrollTo(0, 0);
    }
    if (options.focus) {
      app.focus({ preventScroll: true });
    }
    if (route.name === 'read' || route.name === 'item') setTimeout(hydrateComments, 0);
    if (['site', 'collection', 'read', 'item'].includes(route.name)) setTimeout(trackVisit, 0);
  }

  function refreshView() {
    const scrollY = window.scrollY;
    renderRoute({ scroll: false });
    window.scrollTo(0, scrollY);
  }

  /* ---------------------------- feedback ---------------------------- */

  function toast(message, tone = '') {
    if (!toastStack) return;
    const node = document.createElement('div');
    node.className = `toast${tone ? ` toast--${tone}` : ''}`;
    node.textContent = message;
    toastStack.appendChild(node);
    while (toastStack.children.length > 3) toastStack.removeChild(toastStack.firstElementChild);
    window.setTimeout(() => {
      node.classList.add('is-leaving');
      window.setTimeout(() => node.remove(), 240);
    }, 3600);
  }

  function updateSaveStatus() {
    const el = document.getElementById('save-status');
    if (!el) return;
    if (storageOK) {
      el.classList.remove('is-error');
      el.textContent = `已保存到本机${lastSavedAt ? ` · ${formatTime(lastSavedAt)}` : ''}`;
    } else {
      el.classList.add('is-error');
      el.textContent = '本地保存失败，请导出备份';
    }
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const ok = saveStateToStorage();
      updateSaveStatus();
      if (!ok && !saveErrorShown) {
        saveErrorShown = true;
        toast('浏览器本地空间不足，保存失败。请先导出 JSON 备份。', 'error');
      }
    }, 420);
  }

  function saveNow() {
    window.clearTimeout(saveTimer);
    const ok = saveStateToStorage();
    updateSaveStatus();
    if (!ok && !saveErrorShown) {
      saveErrorShown = true;
      toast('浏览器本地空间不足，保存失败。请先导出 JSON 备份。', 'error');
    }
    return ok;
  }

  function touchSite() {
    state.site.updatedAt = nowISO();
  }

  function schedulePreview() {
    if (previewFrame) window.cancelAnimationFrame(previewFrame);
    previewFrame = window.requestAnimationFrame(() => {
      previewFrame = null;
      updatePreview();
      updatePublishPanelLive();
    });
  }

  function updatePublishPanelLive() {
    const panel = document.getElementById('panel-publish');
    if (!panel) return;
    const holder = document.createElement('div');
    holder.innerHTML = renderPublishPanel();
    const next = holder.firstElementChild;
    if (next) panel.replaceWith(next);
  }

  function updatePreview() {
    const canvas = document.getElementById('preview-canvas');
    if (!canvas) return;
    const scrollTop = canvas.scrollTop;
    const payload = buildPublicPayload(state.site);
    canvas.innerHTML = renderWebSite(payload);
    canvas.scrollTop = scrollTop;
    const caption = document.querySelector('.preview-caption');
    if (caption) {
      const hidden = hiddenItemCount(state.site);
      const first = caption.querySelector('span:first-child');
      const last = caption.querySelector('span:last-child');
      if (first) first.textContent = `访客视角 · 仅显示公开内容${hidden ? ` · ${hidden} 块仅本机内容已隐藏` : ''}`;
      if (last) last.textContent = `${payload.items.length} 块`;
    }
  }

  function updateLiveStatus() {
    const dot = document.getElementById('studio-status-dot');
    const headline = document.getElementById('studio-status-headline');
    const detail = document.getElementById('studio-status-detail');
    if (!dot || !headline || !detail) return;
    const status = getPublishStatus();
    dot.className = `status-dot${status.kind === 'live' ? ' status-dot--live' : status.kind === 'stale' ? ' status-dot--stale' : ''}`;
    headline.textContent = status.label;
    detail.textContent = status.detail;
    detail.classList.toggle('warn', status.kind === 'stale');
  }

  function updateSlugHint() {
    const hint = document.getElementById('slug-hint');
    if (!hint) return;
    const slug = state.site.slug;
    if (!isValidSlug(slug)) {
      hint.textContent = '只能用小写字母、数字和连字符。';
      hint.classList.add('is-warn');
    } else if (DEMO_SLUGS.has(slug)) {
      hint.textContent = '这个路径与平台示例冲突，请换一个。';
      hint.classList.add('is-warn');
    } else {
      hint.textContent = `访客会通过 #/site/${slug} 找到这里。`;
      hint.classList.remove('is-warn');
    }
  }

  /* ---------------------------- visitor tracking ---------------------------- */

  let lastVisitKey = '';

  async function trackVisit() {
    if (!networkOnline) return;
    const current = parseRoute();
    if (!['site', 'collection', 'read', 'item'].includes(current.name)) return;
    const remote = networkSites.find((site) => site.snapshot && site.snapshot.slug === current.slug);
    const own = state.publication.active && state.publication.snapshot && state.publication.snapshot.slug === current.slug;
    const siteId = remote ? remote.siteId : own ? (state.publication.remoteSiteId || state.site.id) : '';
    if (!siteId) return;
    const key = `${siteId}:${current.name}:${current.itemId || current.zoneId || ''}`;
    if (key === lastVisitKey) return;
    lastVisitKey = key;
    try {
      await recordVisit({ siteId, path: window.location.hash });
    } catch (error) { /* best effort */ }
  }

  /* ---------------------------- guide interactions ---------------------------- */

  function updateGuideResults() {
    if (route.name !== 'guide') return;
    const entries = getDirectoryEntries();
    const scope = ['site', 'owner', 'tag', 'all'].includes(state.ui.guideScope) ? state.ui.guideScope : 'all';
    state.ui.guideScope = scope;
    const results = searchDirectory(entries, state.ui.guideQuery, scope);
    document.querySelectorAll('[data-action="set-search-scope"]').forEach((button) => {
      const active = button.dataset.scope === scope;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const list = document.getElementById('guide-results');
    if (list) list.innerHTML = guideResultsMarkup(results, state.ui.guideQuery, scope);
    const count = document.getElementById('result-count');
    if (count) count.textContent = String(results.length);
    const scopeLabel = document.getElementById('search-scope-label');
    if (scopeLabel) scopeLabel.textContent = SEARCH_SCOPES[scope] || '全局';
    const directoryCount = document.getElementById('directory-count');
    if (directoryCount) directoryCount.textContent = String(entries.length);
    const note = document.getElementById('directory-note');
    if (note) {
      note.textContent = entries.some((entry) => entry.isDemo)
        ? '带「平台示例」标记的是岸标制作的演示内容，并非真实用户站点。真实站点均由主人同意后公示。'
        : '所有真实站点均在主人同意后公示，并可以随时撤回。';
    }
    const clear = document.querySelector('.search-clear');
    if (clear) clear.classList.toggle('is-visible', Boolean(state.ui.guideQuery));
    const toggle = document.querySelector('[data-action="toggle-demo"]');
    if (toggle) toggle.textContent = state.settings.showDemo ? '隐藏平台示例' : '显示平台示例';
    scheduleSave();
  }

  function clearSearch() {
    state.ui.guideQuery = '';
    const input = document.getElementById('guide-search');
    if (input) {
      input.value = '';
      input.focus();
    }
    updateGuideResults();
  }

  function clearFilters() {
    state.ui.guideQuery = '';
    state.ui.guideZone = 'all';
    state.ui.guideScope = 'all';
    const input = document.getElementById('guide-search');
    if (input) input.value = '';
    updateGuideResults();
    scheduleSave();
  }

  function toggleDemos() {
    state.settings.showDemo = !state.settings.showDemo;
    saveNow();
    if (route.name === 'guide') refreshView();
    else if (route.name === 'settings') {
      const toggle = document.getElementById('settings-show-demo');
      if (toggle) toggle.checked = state.settings.showDemo;
    }
    toast(state.settings.showDemo ? '已显示平台示例。' : '已隐藏平台示例，导览区只显示真实站点。');
  }

  /* ---------------------------- content modal ---------------------------- */

  function mediaFieldMarkup(config) {
    const value = safeMediaSrc(config.value);
    const dataUrl = isDataUrl(value) ? value : '';
    const display = dataUrl ? '' : value;
    return `<div class="field">
      <label>${esc(config.label)} ${config.optional ? '<span>可选</span>' : ''}</label>
      <input id="${attr(config.inputId)}" type="text" value="${attr(display)}" placeholder="${attr(config.placeholder || 'https://... 或上传图片')}" aria-label="${attr(config.label)}">
      <input type="hidden" name="${attr(config.hiddenName)}" value="${attr(dataUrl)}">
      <div class="inline-upload">
        <label class="file-button">${ICONS.upload} 上传图片<input type="file" accept="image/*" data-upload="content-image" data-media-url-id="${attr(config.inputId)}" data-media-data-name="${attr(config.hiddenName)}" data-media-preview="${attr(config.previewId)}" aria-label="上传${attr(config.label)}"></label>
        <img id="${attr(config.previewId)}" class="upload-preview${value ? ' is-visible' : ''}"${value ? ` src="${attr(value)}"` : ''} alt="图片预览">
      </div>
      <span class="hint">${esc(config.hint || '支持 http(s) 图片地址，或上传一张本地图片。上传后会自动压缩。')}</span>
    </div>`;
  }

  function collectionRowMarkup(entry = {}) {
    return `<div class="collection-edit-row">
      <input class="coll-title" type="text" maxlength="120" value="${attr(entry.title || '')}" placeholder="条目名称" aria-label="条目名称">
      <input class="coll-url" type="text" maxlength="400" value="${attr(entry.url || '')}" placeholder="链接（可选）" aria-label="条目链接">
      <input class="coll-note" type="text" maxlength="160" value="${attr(entry.note || '')}" placeholder="一句备注（可选）" aria-label="条目备注">
      <button type="button" class="icon-btn icon-btn--danger" data-action="remove-collection-entry" aria-label="删除这个条目" title="删除条目">${ICONS.trash}</button>
    </div>`;
  }

  function assetSourceMarkup(kind, label, accept, item, hint) {
    const it = item || {};
    const hasAsset = Boolean(it.assetId);
    const hasUrl = Boolean(it.url);
    const source = hasAsset || !hasUrl ? 'file' : 'url';
    const info = hasAsset
      ? `<strong>${esc(it.filename || '已选择本地文件')}</strong><span>${esc(fileKindLabel(it.mime, it.filename))}${it.size ? ` · ${esc(formatBytes(it.size))}` : ''}</span>`
      : '<span>还没有选择本地文件</span>';
    return `<div class="asset-source" data-asset-source="${attr(kind)}">
      <div class="source-tabs" role="radiogroup" aria-label="${attr(label)}来源">
        <label><input type="radio" name="${attr(kind)}-source" value="url"${source === 'url' ? ' checked' : ''}> 外部链接</label>
        <label><input type="radio" name="${attr(kind)}-source" value="file"${source === 'file' ? ' checked' : ''}> 上传本地${esc(label)}</label>
      </div>
      <div class="field source-panel" data-source-panel="url">
        <label for="${attr(kind)}-url">${esc(label)}链接</label>
        <input id="${attr(kind)}-url" type="text" value="${attr(hasAsset ? '' : (it.url || ''))}" placeholder="https://..." inputmode="url">
      </div>
      <div class="field source-panel" data-source-panel="file">
        <label>本地${esc(label)} <span>${kind === 'video' ? '推荐 MP4；文件较大时导出也会较慢' : kind === 'audio' ? '支持常见音频格式' : '文档、压缩包、音频、视频等'}</span></label>
        <div class="asset-picker">
          <label class="file-button">${ICONS.upload} 选择文件<input type="file" accept="${attr(accept)}" data-upload="local-asset" data-asset-kind="${attr(kind)}" aria-label="上传本地${attr(label)}"></label>
          <div class="asset-info" id="${attr(kind)}-asset-info">${info}</div>
        </div>
        <input type="hidden" name="${attr(kind)}-asset-id" value="${attr(it.assetId || '')}">
        <input type="hidden" name="${attr(kind)}-filename" value="${attr(it.filename || '')}">
        <input type="hidden" name="${attr(kind)}-mime" value="${attr(it.mime || '')}">
        <input type="hidden" name="${attr(kind)}-size" value="${attr(it.size || '')}">
      </div>
      <span class="hint">${esc(hint || `可以填写外部${label}链接，也可以上传本地文件。只使用下方合集时，这里可以不填。`)}</span>
    </div>`;
  }

  function chapterRowMarkup(chapter = {}) {
    return `<div class="chapter-row" data-chapter-id="${attr(chapter.id || '')}">
      <div class="chapter-row-head">
        <span class="chapter-row-index">章节</span>
        <input type="text" name="chapter-title" maxlength="120" value="${attr(chapter.title || '')}" placeholder="章节标题">
        <button type="button" class="icon-button" data-action="remove-article-chapter" aria-label="删除这一章">${ICONS.trash}</button>
      </div>
      <textarea name="chapter-body" rows="5" maxlength="40000" placeholder="这一章的正文。空一行会分段。">${esc(chapter.body || '')}</textarea>
      <div class="chapter-row-foot"><span>每章最多 4 万汉字</span><span><strong data-chapter-count>${(chapter.body || '').length}</strong> / 40,000 字</span></div>
    </div>`;
  }

  function itemOptionsMarkup(it, options = {}) {
    return `<div class="item-options">
      ${options.downloadable ? `<label class="check-line"><input type="checkbox" name="downloadable"${it.downloadable ? ' checked' : ''}><span>允许访客直接下载这份媒体 <small>在设置页还可以批量修改</small></span></label>` : ''}
      <label class="check-line"><input type="checkbox" name="comments-enabled"${it.commentsEnabled ? ' checked' : ''}><span>开启评论块区 <small>文字与符号；支持回复，不需要点赞</small></span></label>
    </div>`;
  }

  function imageRowMarkup(image = {}) {
    return `<div class="image-part-row" data-image-id="${attr(image.id || '')}">
      <div class="image-part-preview">${image.src ? `<img src="${attr(image.src)}" alt="">` : '<span>图片</span>'}</div>
      <div class="image-part-copy">
        <input type="file" accept="image/*" data-upload="image-part">
        <input type="text" name="image-part-caption" maxlength="240" value="${attr(image.caption || '')}" placeholder="图片说明（可选）">
        <input type="hidden" name="image-part-src" value="${attr(image.src || '')}">
      </div>
      <button type="button" class="icon-button" data-action="remove-image-part" aria-label="删除这张图片">${ICONS.trash}</button>
    </div>`;
  }

  function imageEditorMarkup(it) {
    return `<div class="image-editor">
      <div class="image-editor-head"><div><strong>更多图片 <span>可选</span></strong><p>主图之外，还可以继续添加多张图片；详情页会以图集展示。</p></div><button type="button" class="btn btn--sm" data-action="add-image-part">+ 添加图片</button></div>
      <div class="image-part-list" id="item-images">${(it.images || []).map(imageRowMarkup).join('')}</div>
    </div>`;
  }

  function episodeParentOptions(groups, parentId) {
    return `<option value="">顶层</option>${groups.map((group) => `<option value="${attr(group.id)}"${group.id === parentId ? ' selected' : ''}>${esc(group.title || '未命名合集')}</option>`).join('')}`;
  }

  function episodeRowMarkup(episode = {}, kind = 'video', groups = []) {
    const accept = kind === 'video' ? 'video/*' : kind === 'audio' ? 'audio/*' : '*/*';
    const label = episode.group ? '视频合集' : kind === 'file' ? '文件' : '选集';
    const parent = kind === 'video' ? `<label class="episode-parent">所属合集<select name="episode-parent">${episodeParentOptions(groups, episode.parentId)}</select></label>` : '';
    if (episode.group) {
      return `<div class="episode-row is-group" data-episode-id="${attr(episode.id || '')}">
        <div class="episode-row-head"><span>${label}</span><input type="text" name="episode-title" maxlength="120" value="${attr(episode.title || '')}" placeholder="合集名称"><button type="button" class="icon-button" data-action="remove-episode" aria-label="删除这个合集">${ICONS.trash}</button></div>
        ${parent}
        <input type="hidden" name="episode-group" value="1">
        <input type="text" name="episode-note" maxlength="160" value="${attr(episode.note || '')}" placeholder="合集说明（可选）">
      </div>`;
    }
    return `<div class="episode-row" data-episode-id="${attr(episode.id || '')}">
      <div class="episode-row-head"><span>${label}</span><input type="text" name="episode-title" maxlength="120" value="${attr(episode.title || '')}" placeholder="${label}标题"><button type="button" class="icon-button" data-action="remove-episode" aria-label="删除这一项">${ICONS.trash}</button></div>
      ${parent}
      <div class="part-file-row">
        <input type="file" accept="${attr(accept)}" data-upload="part" data-kind="${attr(kind)}">
        <span class="part-file-name">${esc(episode.filename || (episode.assetId ? '已上传文件' : '选择文件'))}</span>
      </div>
      <input type="hidden" name="episode-asset-id" value="${attr(episode.assetId || '')}">
      <input type="hidden" name="episode-filename" value="${attr(episode.filename || '')}">
      <input type="hidden" name="episode-mime" value="${attr(episode.mime || '')}">
      <input type="hidden" name="episode-size" value="${attr(episode.size || '')}">
      <input type="hidden" name="episode-group" value="">
      <input type="text" name="episode-note" maxlength="160" value="${attr(episode.note || '')}" placeholder="一句备注（可选）">
    </div>`;
  }

  function episodeEditorMarkup(it, kind = 'video') {
    const title = kind === 'file' ? '文件列表 / 分区' : kind === 'video' ? '视频合集 / 子合集' : '选集 / 分区';
    const hint = kind === 'file' ? '继续添加更多文件；每一行都必须上传一个文件，访客可以直接打开。' : kind === 'video' ? '可以先建视频合集，再在合集里添加视频；也可以继续套子合集。只有视频文件会出现在播放列表中。' : '为长音频添加选集；每一集都必须上传文件，访客可以直接播放。';
    const source = kind === 'file' ? (it.files || []) : (it.episodes || []);
    const groups = kind === 'video' ? source.filter((part) => part.group) : [];
    return `<div class="episode-editor">
      <div class="episode-editor-head"><div><strong>${title} <span>可选</span></strong><p>${hint}</p></div><div class="episode-editor-buttons">${kind === 'video' ? `<button type="button" class="btn btn--sm" data-action="add-episode-group" data-kind="video">+ 添加视频合集</button>` : ''}<button type="button" class="btn btn--sm" data-action="add-episode" data-kind="${attr(kind)}">+ 添加${kind === 'video' ? '视频' : '一项'}</button></div></div>
      <div class="episode-list" id="item-episodes">${source.map((episode) => episodeRowMarkup(episode, kind, groups)).join('')}</div>
    </div>`;
  }

  function typePanelMarkup(type, item) {
    const it = item || {};
    if (type === 'article') {
      return `<div class="type-panel" data-panel="article">
        <div class="field">
          <label for="content-excerpt">摘要 <span>显示在标题下方，可留空</span></label>
          <textarea id="content-excerpt" name="excerpt" maxlength="320" placeholder="一两句话，告诉来者这篇文章在讲什么。">${esc(it.excerpt || '')}</textarea>
        </div>
        <div class="field">
          <label for="content-body">正文 <span>空一行会分段</span></label>
          <textarea id="content-body" name="body" rows="7" placeholder="把文章写在这里。">${esc(it.body || '')}</textarea>
        </div>
        ${mediaFieldMarkup({
          label: '文章配图',
          optional: true,
          inputId: 'article-cover-src',
          hiddenName: 'article-cover-data',
          previewId: 'article-cover-preview',
          value: it.cover || '',
          placeholder: 'https://...（可选）',
          hint: '可选。配图会出现在正文上方。'
        })}
        <div class="chapter-editor">
          <div class="chapter-editor-head">
            <div><strong>章节选择 <span>可选</span></strong><p>需要长篇或多章节时，再添加章节。每章最多 4 万汉字，超出部分无法输入。阅读页会自动出现章节选择；不添加就保持普通文章。</p></div>
            <button type="button" class="btn btn--sm" data-action="add-article-chapter">+ 添加章节</button>
          </div>
          <div class="chapter-list" id="article-chapter-list">${(it.chapters || []).map(chapterRowMarkup).join('')}</div>
        </div>
        ${itemOptionsMarkup(it)}
      </div>`;
    }
    if (type === 'image') {
      return `<div class="type-panel" data-panel="image">
        ${mediaFieldMarkup({
          label: '图片（可选）',
          optional: true,
          inputId: 'image-src',
          hiddenName: 'image-data',
          previewId: 'image-preview',
          value: it.src || '',
          placeholder: 'https://... 或上传图片',
          hint: '主图可选；如果添加多张图片，会自动以图片合集呈现。'
        })}
        <div class="field">
          <label for="image-caption">图片说明 <span>可选</span></label>
          <textarea id="image-caption" name="caption" maxlength="240" placeholder="写一句图片背后的故事。">${esc(it.caption || '')}</textarea>
        </div>
        ${itemOptionsMarkup(it, { downloadable: true })}
        ${imageEditorMarkup(it)}
      </div>`;
    }
    if (type === 'collection') {
      const entries = Array.isArray(it.entries) && it.entries.length ? it.entries : [{}];
      return `<div class="type-panel" data-panel="collection">
        <div class="field">
          <label for="collection-desc">合集介绍 <span>可选</span></label>
          <textarea id="collection-desc" name="desc" maxlength="400" placeholder="这批条目为什么被放在一起？">${esc(it.desc || '')}</textarea>
        </div>
        <div class="field">
          <label>条目 <span>名称是必填的；链接可以留空</span></label>
          <div class="collection-editor" id="collection-entries">${entries.map(collectionRowMarkup).join('')}</div>
          <button type="button" class="btn btn--sm" data-action="add-collection-entry" style="justify-self:start;margin-top:3px">${ICONS.plus} 添加条目</button>
        </div>
      </div>`;
    }
    if (type === 'video') {
      return `<div class="type-panel" data-panel="video">
        ${assetSourceMarkup('video', '视频', 'video/mp4,video/webm,video/quicktime,video/*', it, '可以上传本地 MP4 直接播放，也可以填写 Bilibili、YouTube、Vimeo 或 mp4 链接。')}
        <div class="field">
          <label for="video-desc">视频说明 <span>可选</span></label>
          <textarea id="video-desc" name="desc" maxlength="400" placeholder="这段视频是什么？">${esc(it.desc || '')}</textarea>
        </div>
        ${mediaFieldMarkup({
          label: '视频封面',
          optional: true,
          inputId: 'video-cover-src',
          hiddenName: 'video-cover-data',
          previewId: 'video-cover-preview',
          value: it.cover || '',
          placeholder: 'https://...（可选）',
          hint: '可选。上传本地视频时，封面会显示在播放器上。'
        })}
        ${itemOptionsMarkup(it, { downloadable: true })}
        ${episodeEditorMarkup(it, type)}
      </div>`;
    }
    if (type === 'audio') {
      return `<div class="type-panel" data-panel="audio">
        ${assetSourceMarkup('audio', '音频', 'audio/*', it, '可以上传本地音频，也可以填写音频链接。')}
        <div class="field">
          <label for="audio-desc">音频说明 <span>可选</span></label>
          <textarea id="audio-desc" name="desc" maxlength="400" placeholder="这段声音是什么？">${esc(it.desc || '')}</textarea>
        </div>
        ${itemOptionsMarkup(it, { downloadable: true })}
        ${episodeEditorMarkup(it, type)}
      </div>`;
    }
    if (type === 'file') {
      return `<div class="type-panel" data-panel="file">
        ${assetSourceMarkup('file', '文件', '*/*', it, '支持文档、压缩包、PDF、音频、视频等任意文件。访客可以直接下载；浏览器支持的媒体会直接播放。')}
        <div class="field">
          <label for="file-desc">文件说明 <span>可选</span></label>
          <textarea id="file-desc" name="desc" maxlength="400" placeholder="这个文件里有什么？">${esc(it.desc || '')}</textarea>
        </div>
        ${itemOptionsMarkup(it)}
        ${episodeEditorMarkup(it, type)}
      </div>`;
    }
    if (type === 'link') {
      return `<div class="type-panel" data-panel="link">
        <div class="field">
          <label for="link-url">去向地址 <span>必需</span></label>
          <input id="link-url" type="text" name="url" value="${attr(it.url || '')}" placeholder="https://..." inputmode="url">
        </div>
        <div class="field">
          <label for="link-desc">链接说明 <span>可选</span></label>
          <textarea id="link-desc" name="desc" maxlength="400" placeholder="为什么想把这个地方留在这里？">${esc(it.desc || '')}</textarea>
        </div>
      </div>`;
    }
    return `<div class="type-panel" data-panel="note">
      <div class="field">
        <label for="note-content">短句 <span>会以独立引文的形式出现</span></label>
        <textarea id="note-content" name="content" maxlength="600" rows="4" placeholder="一句想留下的话。">${esc(it.content || '')}</textarea>
      </div>
      <div class="field">
        <label for="note-source">出处 <span>可选</span></label>
        <input id="note-source" type="text" name="source" maxlength="80" value="${attr(it.source || '')}" placeholder="例如：写在便签上">
      </div>
    </div>`;
  }

  function startNewArticle() {
    const form = document.getElementById('content-form');
    if (!form || form.dataset.editing === 'true') return;
    const zoneId = form.querySelector('[name="zone"]')?.value || state.site.zones[0]?.id;
    if (!zoneId) {
      toast('请先创建一个专区，再添加文章。', 'error');
      return;
    }
    const item = {
      id: uid('item'),
      type: 'article',
      zoneId,
      title: '未命名文章',
      excerpt: '',
      body: '',
      bodyHtml: '',
      chapters: [],
      hidden: false,
      starter: false,
      createdAt: nowISO(),
      updatedAt: nowISO()
    };
    state.site.items.unshift(item);
    state.ui.lastContentType = 'article';
    touchSite();
    saveNow();
    closeModal({ restoreFocus: false });
    window.location.hash = `#/write/${encodeURIComponent(item.id)}`;
  }

  function openContentModal(item) {
    const isEdit = Boolean(item);
    const type = item && CONTENT_TYPES[item.type] ? item.type : (CONTENT_TYPES[state.ui.lastContentType] ? state.ui.lastContentType : 'article');
    const zones = state.site.zones;
    const flatZones = flattenZoneTree(buildZoneTree(zones));
    modalDraftAssets = new Set();
    const typePicker = isEdit
      ? `<div class="edit-type-note">${ICONS[item.type] || ICONS.article} 内容类型：<strong>${esc(itemTypeLabel(type))}</strong><span>· 编辑时不可更改类型</span><input type="hidden" name="content-type" value="${attr(type)}"></div>`
      : `<div class="type-picker" role="radiogroup" aria-label="选择内容类型">
          ${TYPE_ORDER.map((key) => `<label class="type-choice"${key === 'article' ? ' data-article-choice="1"' : ''}>
            <input type="radio" name="content-type" value="${attr(key)}"${type === key ? ' checked' : ''}>
            ${ICONS[key] || ICONS.article}
            <span>${esc(CONTENT_TYPES[key].label)}</span>
          </label>`).join('')}
        </div>`;

    const body = `<form id="content-form" novalidate data-item-id="${attr(item ? item.id : '')}" data-editing="${isEdit}">
      <div class="form-error" id="content-error" role="alert"></div>
      ${typePicker}
      <div class="form-row">
        <div class="field">
          <label for="content-zone">专区 <span>决定它出现在哪里</span></label>
          <select id="content-zone" name="zone">${flatZones.map((entry) => `<option value="${attr(entry.zone.id)}"${item && item.zoneId === entry.zone.id ? ' selected' : !item && flatZones[0] && flatZones[0].zone.id === entry.zone.id ? ' selected' : ''}>${'— '.repeat(entry.depth)}${esc(entry.zone.name)}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label for="content-title">标题 <span>${CONTENT_TYPES[type].desc}</span></label>
          <input id="content-title" type="text" name="title" maxlength="120" value="${attr(item ? item.title : '')}" placeholder="给这块内容一个名字" data-autofocus>
        </div>
      </div>
      ${TYPE_ORDER.map((key) => typePanelMarkup(key, item && item.type === key ? item : null)).join('')}
      <label class="hidden-check">
        <input type="checkbox" name="hidden"${item && item.hidden ? ' checked' : ''}>
        <span>仅本机可见 <span>勾选后，这块内容不会进入公开快照，也不会出现在导览区。</span></span>
      </label>
    </form>`;

    const footer = `<button type="button" class="btn" data-action="close-modal">取消</button>
      <button type="submit" form="content-form" class="btn btn--primary">${isEdit ? '保存修改' : '添加内容'}</button>`;

    openModal({
      title: isEdit ? '编辑内容' : '添加内容',
      subtitle: isEdit ? '修改会保存在本地草稿；已公示的版本需要再次确认才会同步。' : '选择一种内容类型，把它放进一个专区。',
      body,
      footer,
      size: 'wide',
      onMount: (modal) => {
        const form = modal.querySelector('#content-form');
        syncContentPanels(form);
        const titleInput = modal.querySelector('#content-title');
        if (titleInput) {
          window.setTimeout(() => {
            titleInput.focus();
            titleInput.select();
          }, 30);
        }
      },
      onClose: () => {
        const drafts = Array.from(modalDraftAssets);
        modalDraftAssets = new Set();
        drafts.forEach((id) => deleteAssetRecord(id));
      }
    });
  }

  function currentContentType(form) {
    if (!form) return 'article';
    const checked = form.querySelector('input[name="content-type"]:checked');
    if (checked) return checked.value;
    const hidden = form.querySelector('input[name="content-type"][type="hidden"]');
    return hidden ? hidden.value : 'article';
  }

  function syncAssetSource(container) {
    if (!container) return;
    const kind = container.dataset.assetSource;
    const checked = container.querySelector(`input[name="${kind}-source"]:checked`);
    const selected = checked ? checked.value : 'url';
    $$('[data-source-panel]', container).forEach((panel) => {
      const active = panel.dataset.sourcePanel === selected;
      panel.hidden = !active;
      $$('input, textarea, select, button', panel).forEach((field) => {
        if (field.type === 'hidden') return;
        field.disabled = !active;
      });
    });
  }

  function syncContentPanels(form) {
    if (!form) return;
    const type = currentContentType(form);
    $$('.type-panel', form).forEach((panel) => {
      const active = panel.dataset.panel === type;
      panel.hidden = !active;
      $$('input, textarea, select, button', panel).forEach((field) => {
        field.disabled = !active;
      });
      if (active) $$('[data-asset-source]', panel).forEach(syncAssetSource);
    });
    const title = form.querySelector('#content-title');
    if (title) {
      const placeholders = {
        article: '给这篇文章一个名字',
        image: '给这张图片一个名字',
        collection: '给这份合集一个名字',
        video: '给这段视频一个名字',
        audio: '给这段声音一个名字',
        file: '给这个文件一个名字',
        link: '给这个链接一个名字',
        note: '给这句话一个名字'
      };
      title.placeholder = placeholders[type] || '给这块内容一个名字';
    }
  }

  function showFormError(form, message) {
    const box = form.querySelector('.form-error');
    if (!box) return;
    box.textContent = message;
    box.classList.add('is-visible');
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideFormError(form) {
    const box = form && form.querySelector('.form-error');
    if (box) {
      box.classList.remove('is-visible');
      box.textContent = '';
    }
  }

  function readMediaValue(form, inputId, hiddenName) {
    const direct = form.querySelector(`#${inputId}`);
    const hidden = form.querySelector(`[name="${hiddenName}"]`);
    const raw = trimText(direct ? direct.value : '', 4000000) || trimText(hidden ? hidden.value : '', 4000000);
    if (!raw) return { value: '', raw: '' };
    if (isDataUrl(raw)) return { value: safeMediaSrc(raw), raw };
    const normalized = normalizeHttpUrl(raw) || raw;
    return { value: safeMediaSrc(normalized), raw };
  }

  function readAssetSource(form, kind, optional = false) {
    const checked = form.querySelector(`input[name="${kind}-source"]:checked`);
    const source = checked ? checked.value : 'url';
    const empty = { url: '', assetId: '', filename: '', mime: '', size: 0 };
    if (source === 'url') {
      const raw = trimText(form.querySelector(`#${kind}-url`)?.value, 900);
      if (!raw && optional) return { fields: empty, usedAssetId: '' };
      if (!normalizeHttpUrl(raw)) {
        return { error: `请填写有效的${CONTENT_TYPES[kind]?.label || '媒体'}链接，或切换到上传本地文件。` };
      }
      return {
        fields: {
          url: normalizeHttpUrl(raw),
          assetId: '',
          filename: '',
          mime: '',
          size: 0
        },
        usedAssetId: ''
      };
    }
    const assetId = trimText(form.querySelector(`[name="${kind}-asset-id"]`)?.value, 120);
    if (!assetId) {
      if (optional) return { fields: empty, usedAssetId: '' };
      return { error: `还没有选择本地${CONTENT_TYPES[kind]?.label || '文件'}。` };
    }
    return {
      fields: {
        url: '',
        assetId,
        filename: trimText(form.querySelector(`[name="${kind}-filename"]`)?.value, 240),
        mime: trimText(form.querySelector(`[name="${kind}-mime"]`)?.value, 120),
        size: Math.max(0, Number(form.querySelector(`[name="${kind}-size"]`)?.value) || 0)
      },
      usedAssetId: assetId
    };
  }

  function finalizeDraftAssets(usedAssetIds) {
    const keep = usedAssetIds instanceof Set
      ? usedAssetIds
      : new Set([usedAssetIds].filter(Boolean));
    const drafts = Array.from(modalDraftAssets);
    modalDraftAssets = new Set();
    drafts
      .filter((id) => !keep.has(id))
      .forEach((id) => deleteAssetRecord(id));
  }

  function activeTypePanel(form, type) {
    return form.querySelector(`.type-panel[data-panel="${type}"]`) || form;
  }

  function readItemOptions(form, type) {
    const panel = activeTypePanel(form, type);
    return {
      commentsEnabled: Boolean(panel.querySelector('[name="comments-enabled"]')?.checked),
      downloadable: Boolean(panel.querySelector('[name="downloadable"]')?.checked)
    };
  }

  function readImageParts(form) {
    return $$('#item-images .image-part-row', form).map((row) => ({
      id: row.dataset.imageId,
      src: row.querySelector('[name="image-part-src"]')?.value || '',
      caption: row.querySelector('[name="image-part-caption"]')?.value || ''
    })).filter((image) => image.src);
  }

  function readEpisodes(form, type) {
    const panel = activeTypePanel(form, type);
    return normalizeEpisodes($$('#item-episodes .episode-row', panel).map((row) => ({
      id: row.dataset.episodeId,
      title: row.querySelector('[name="episode-title"]').value,
      note: row.querySelector('[name="episode-note"]').value,
      assetId: row.querySelector('[name="episode-asset-id"]')?.value || '',
      filename: row.querySelector('[name="episode-filename"]')?.value || '',
      mime: row.querySelector('[name="episode-mime"]')?.value || '',
      size: row.querySelector('[name="episode-size"]')?.value || 0,
      group: row.querySelector('[name="episode-group"]')?.value === '1',
      parentId: row.querySelector('[name="episode-parent"]')?.value || ''
    })));
  }

  function saveContentForm(form) {
    hideFormError(form);
    const type = currentContentType(form);
    const itemId = form.dataset.itemId;
    const existingIndex = state.site.items.findIndex((item) => item.id === itemId);
    const existing = existingIndex >= 0 ? state.site.items[existingIndex] : null;
    const zoneId = form.querySelector('[name="zone"]').value;
    const title = trimText(form.querySelector('[name="title"]').value, 120);
    const hidden = Boolean(form.querySelector('[name="hidden"]').checked);

    if (!title) {
      showFormError(form, '请先给这块内容一个标题。');
      return;
    }
    if (!state.site.zones.some((zone) => zone.id === zoneId)) {
      showFormError(form, '请选择一个有效的专区。');
      return;
    }

    const base = {
      id: existing ? existing.id : uid('item'),
      type,
      zoneId,
      title,
      hidden,
      starter: false,
      createdAt: existing ? existing.createdAt : nowISO(),
      updatedAt: nowISO()
    };
    let next = null;
    let usedAssetId = '';

    if (type === 'article') {
      const body = cleanText(form.querySelector('#content-body').value, 40000).trim();
      const excerpt = trimText(form.querySelector('#content-excerpt').value, 320);
      const cover = readMediaValue(form, 'article-cover-src', 'article-cover-data');
      const chapters = normalizeChapters($$('#article-chapter-list .chapter-row', form).map((row) => ({
        id: row.dataset.chapterId,
        title: row.querySelector('[name="chapter-title"]').value,
        body: row.querySelector('[name="chapter-body"]').value
      })));
      if (!body && !excerpt && !chapters.length) {
        showFormError(form, '文章至少需要一段正文、摘要或一个章节。');
        return;
      }
      if (cover.raw && !cover.value) {
        showFormError(form, '文章配图需要一个有效的 http(s) 地址，或一张上传的图片。');
        return;
      }
      next = { ...base, body, excerpt, cover: cover.value, chapters, ...readItemOptions(form, 'article'), episodes: [] };
    } else if (type === 'image') {
      const image = readMediaValue(form, 'image-src', 'image-data');
      const images = readImageParts(form);
      if (!image.value && !images.length) {
        showFormError(form, '请至少上传一张图片，或添加一个图集条目。');
        return;
      }
      next = {
        ...base,
        src: image.value,
        caption: trimText(form.querySelector('#image-caption').value, 240),
        ...readItemOptions(form, 'image'),
        images
      };
    } else if (type === 'collection') {
      const desc = trimText(form.querySelector('#collection-desc').value, 400);
      const rows = $$('#collection-entries .collection-edit-row', form);
      const entries = [];
      for (const row of rows) {
        const entryTitle = trimText(row.querySelector('.coll-title').value, 120);
        const rawUrl = trimText(row.querySelector('.coll-url').value, 400);
        const note = trimText(row.querySelector('.coll-note').value, 160);
        if (!entryTitle && !rawUrl && !note) continue;
        if (rawUrl && !normalizeHttpUrl(rawUrl)) {
          showFormError(form, `合集条目「${entryTitle || '未命名'}」的链接不是有效的 http(s) 地址。`);
          return;
        }
        entries.push({ title: entryTitle, url: normalizeHttpUrl(rawUrl), note });
      }
      if (!entries.length) {
        showFormError(form, '合集至少需要一个有条目名称或链接的条目。');
        return;
      }
      next = { ...base, desc, entries };
    } else if (type === 'video') {
      const episodes = readEpisodes(form, 'video');
      const media = readAssetSource(form, 'video', true);
      if (media.error) {
        showFormError(form, media.error);
        return;
      }
      if (!media.fields.url && !media.fields.assetId && !episodes.some((episode) => !episode.group)) {
        showFormError(form, '请上传一个视频，或至少添加一个视频文件。');
        return;
      }
      const cover = readMediaValue(form, 'video-cover-src', 'video-cover-data');
      if (cover.raw && !cover.value) {
        showFormError(form, '视频封面需要一个有效的图片地址，或一张上传的图片。');
        return;
      }
      usedAssetId = media.usedAssetId;
      next = {
        ...base,
        ...media.fields,
        desc: trimText(form.querySelector('#video-desc').value, 400),
        cover: cover.value,
        ...readItemOptions(form, 'video'),
        episodes
      };
    } else if (type === 'audio') {
      const episodes = readEpisodes(form, 'audio');
      const media = readAssetSource(form, 'audio', true);
      if (media.error) {
        showFormError(form, media.error);
        return;
      }
      if (!media.fields.url && !media.fields.assetId && !episodes.length) {
        showFormError(form, '请上传一个音频，或至少添加一个音频合集项。');
        return;
      }
      usedAssetId = media.usedAssetId;
      next = {
        ...base,
        ...media.fields,
        desc: trimText(form.querySelector('#audio-desc').value, 400),
        ...readItemOptions(form, 'audio'),
        episodes
      };
    } else if (type === 'file') {
      const files = readEpisodes(form, 'file');
      const media = readAssetSource(form, 'file', true);
      if (media.error) {
        showFormError(form, media.error);
        return;
      }
      if (!media.fields.url && !media.fields.assetId && !files.length) {
        showFormError(form, '请上传一个文件，或至少添加一个文件合集项。');
        return;
      }
      usedAssetId = media.usedAssetId;
      next = {
        ...base,
        ...media.fields,
        desc: trimText(form.querySelector('#file-desc').value, 400),
        ...readItemOptions(form, 'file'),
        files
      };
    } else if (type === 'link') {
      const rawUrl = trimText(form.querySelector('#link-url').value, 800);
      if (!normalizeHttpUrl(rawUrl)) {
        showFormError(form, '请填写一个有效的链接（http 或 https）。');
        return;
      }
      next = {
        ...base,
        url: normalizeHttpUrl(rawUrl),
        desc: trimText(form.querySelector('#link-desc').value, 400)
      };
    } else if (type === 'note') {
      const content = trimText(form.querySelector('#note-content').value, 600);
      if (!content) {
        showFormError(form, '短句还是空的。');
        return;
      }
      next = {
        ...base,
        content,
        source: trimText(form.querySelector('#note-source').value, 80)
      };
    }

    if (!next) {
      showFormError(form, '这块内容还缺少一点必要的信息。');
      return;
    }

    state.ui.lastContentType = type;
    if (existing) {
      state.site.items[existingIndex] = next;
    } else {
      state.site.items.unshift(next);
    }
    touchSite();
    saveNow();
    const usedAssets = new Set();
    if (usedAssetId) usedAssets.add(usedAssetId);
    [...(next.episodes || []), ...(next.files || [])].forEach((part) => {
      if (part && part.assetId) usedAssets.add(part.assetId);
    });
    finalizeDraftAssets(usedAssets);
    closeModal({ restoreFocus: false });
    if (type === 'article') {
      window.location.hash = `#/write/${encodeURIComponent(next.id)}`;
      toast(existing ? '文章已保存。' : '文章已创建，进入写作页。');
      return;
    }
    refreshView();
    toast(existing ? '内容已保存。' : '内容已添加。');
  }

  let activeWriteEditor = null;

  function writingEditor() {
    if (activeWriteEditor && document.contains(activeWriteEditor)) return activeWriteEditor;
    return document.querySelector('[data-write-editor="body"]');
  }

  function addWritingChapter(title = '', html = '') {
    const list = document.querySelector('[data-writing-chapters]');
    if (!list) return null;
    const section = document.createElement('section');
    section.className = 'writing-chapter';
    section.dataset.chapterId = uid('chapter');
    section.innerHTML = `<div class="writing-chapter-head"><span>章节</span><input data-chapter-title value="${attr(title)}" placeholder="章节标题"><button type="button" class="icon-button" data-action="writing-remove-chapter" aria-label="删除章节">${ICONS.trash}</button></div><div class="writing-chapter-body" contenteditable="true" data-write-editor="chapter">${sanitizeRichHtml(html)}</div>`;
    list.appendChild(section);
    list.querySelectorAll('.writing-chapter').forEach((item, index) => {
      const label = item.querySelector('.writing-chapter-head > span');
      if (label) label.textContent = `章节 ${String(index + 1).padStart(2, '0')}`;
    });
    const editor = section.querySelector('[data-write-editor]');
    if (editor) editor.focus();
    return section;
  }

  function writingBlocks(html) {
    const text = String(html || '').trim();
    if (!text) return '';
    if (/<[a-z][\s\S]*>/i.test(text)) return sanitizeRichHtml(text);
    return text.split(/\n{2,}/).map((part) => `<p>${esc(part.replace(/\n/g, '<br>'))}</p>`).join('');
  }

  function headingOfLine(line) {
    const value = String(line || '').trim();
    if (!value || value.length > 120) return null;
    const markdown = /^(#{1,6})\s+(.+)$/.exec(value);
    if (markdown) return { level: markdown[1].length, text: markdown[2].trim() };
    const chinese = /^第([一二三四五六七八九十百零〇0-9]+)(章|节|篇)\s*(.*)$/.exec(value);
    if (chinese) return { level: chinese[2] === '节' ? 2 : 1, text: value };
    const numbered = /^(\d+(?:\.\d+){0,2})[、.．\s]\s*(.+)$/.exec(value);
    if (numbered) return { level: Math.min(4, numbered[1].split('.').length), text: value };
    const cnNumber = /^[一二三四五六七八九十]+、\s*(.+)$/.exec(value);
    if (cnNumber) return { level: 2, text: value };
    return null;
  }

  function textToBlocks(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const blocks = [];
    let paragraph = [];
    const flush = () => {
      if (!paragraph.length) return;
      blocks.push({ text: paragraph.join(' ').trim(), level: 0 });
      paragraph = [];
    };
    lines.forEach((line) => {
      const heading = headingOfLine(line);
      if (heading) {
        flush();
        blocks.push({ text: heading.text, level: heading.level, heading: true });
      } else if (!line.trim()) {
        flush();
      } else {
        paragraph.push(line.trim());
      }
    });
    flush();
    return blocks;
  }

  function blocksToHtml(blocks, chapterLevel) {
    return blocks.map((block) => {
      if (block.heading) {
        const level = Math.min(4, Math.max(2, Number(block.level || 2) - chapterLevel + 1));
        return `<h${level}>${esc(block.text)}</h${level}>`;
      }
      return block.text ? `<p>${esc(block.text)}</p>` : '';
    }).join('');
  }

  function parseImportedDocument(source) {
    const blocks = Array.isArray(source) ? source : textToBlocks(source);
    const headings = blocks.filter((block) => block.heading);
    if (!headings.length) {
      return {
        title: '',
        introHtml: '',
        chapters: [{ title: '导入内容', html: blocksToHtml(blocks, 1) }]
      };
    }
    const levels = [...new Set(headings.map((block) => Number(block.level) || 1))].sort((a, b) => a - b);
    const levelOne = headings.filter((block) => Number(block.level) === 1);
    const levelTwo = headings.filter((block) => Number(block.level) === 2);
    let chapterLevel = levels[0];
    let documentTitle = '';
    if (levelOne.length === 1 && levelTwo.length > 0) {
      chapterLevel = 2;
      documentTitle = levelOne[0].text;
    }
    const intro = [];
    const chapters = [];
    let current = null;
    blocks.forEach((block) => {
      if (block.heading && Number(block.level) === chapterLevel) {
        current = { title: block.text, blocks: [] };
        chapters.push(current);
      } else if (current) {
        current.blocks.push(block);
      } else {
        intro.push(block);
      }
    });
    const filtered = chapters.filter((chapter) => chapter.title || chapter.blocks.length);
    if (!filtered.length) {
      filtered.push({ title: '导入内容', blocks });
    }
    return {
      title: documentTitle,
      introHtml: intro.length ? blocksToHtml(intro, chapterLevel) : '',
      chapters: filtered.map((chapter) => ({
        title: chapter.title,
        html: blocksToHtml(chapter.blocks, chapterLevel)
      }))
    };
  }

  function saveWritingPage() {
    const form = document.getElementById('writing-form');
    if (!form) return;
    const item = state.site.items.find((entry) => entry.id === form.dataset.itemId && entry.type === 'article');
    if (!item) return;
    const title = trimText(form.querySelector('[name="title"]').value, 120);
    if (!title) {
      toast('请先填写文章标题。', 'error');
      return;
    }
    const bodyEditor = form.querySelector('[data-write-editor="body"]');
    const bodyHtml = sanitizeRichHtml(bodyEditor ? bodyEditor.innerHTML : '');
    const body = richTextToPlain(bodyHtml);
    const chapters = normalizeChapters(Array.from(form.querySelectorAll('.writing-chapter')).map((section) => ({
      id: section.dataset.chapterId,
      title: section.querySelector('[data-chapter-title]')?.value || '',
      html: sanitizeRichHtml(section.querySelector('[data-write-editor]')?.innerHTML || '')
    })));
    const zoneId = form.querySelector('[name="zone"]')?.value;
    if (zoneId && state.site.zones.some((zone) => zone.id === zoneId)) item.zoneId = zoneId;
    item.title = title;
    item.excerpt = trimText(form.querySelector('[name="excerpt"]').value, 320);
    item.bodyHtml = bodyHtml;
    item.body = body;
    item.chapters = chapters;
    item.updatedAt = nowISO();
    touchSite();
    saveNow();
    window.location.hash = '#/studio';
    toast('文章已保存。');
  }

  function applyWritingCommand(command) {
    const editor = writingEditor();
    if (!editor) return;
    editor.focus();
    try { document.execCommand('styleWithCSS', false, true); } catch (error) { /* older browser */ }
    if (command === 'indent') {
      let block = window.getSelection()?.anchorNode;
      while (block && block !== editor && !/^(P|DIV|LI|H1|H2|H3|H4|BLOCKQUOTE)$/.test(block.nodeName)) block = block.parentNode;
      if (block && block !== editor) block.style.textIndent = block.style.textIndent ? '' : '2em';
      return;
    }
    document.execCommand(command, false, null);
  }

  function smartFormatWriting() {
    const editor = writingEditor();
    if (!editor) return;
    const blocks = Array.from(editor.children);
    if (!blocks.length && editor.textContent.trim()) {
      editor.innerHTML = writingBlocks(editor.textContent);
    }
    editor.querySelectorAll('p').forEach((node) => {
      if (!node.textContent.trim() && !node.querySelector('img')) node.remove();
    });
    editor.querySelectorAll('p, div, li, blockquote').forEach((node) => {
      if (!node.style.lineHeight) node.style.lineHeight = '1.8';
    });
    toast('已整理段落和行距，可继续手动修改。', 'accent');
  }

  async function readDocxPlainText(file) {
    if (typeof DecompressionStream === 'undefined') throw new Error('当前浏览器不支持读取 Word 文档，请另存为 TXT。');
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    let eocd = -1;
    for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65558); i -= 1) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('Word 文档结构无法识别。');
    const centralOffset = view.getUint32(eocd + 16, true);
    let offset = centralOffset;
    let documentEntry = null;
    while (offset + 46 <= buffer.byteLength && view.getUint32(offset, true) === 0x02014b50) {
      const method = view.getUint16(offset + 10, true);
      const compressedSize = view.getUint32(offset + 20, true);
      const nameLength = view.getUint16(offset + 28, true);
      const extraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const localOffset = view.getUint32(offset + 42, true);
      const name = new TextDecoder().decode(new Uint8Array(buffer, offset + 46, nameLength));
      if (name === 'word/document.xml') {
        documentEntry = { method, compressedSize, localOffset };
        break;
      }
      offset += 46 + nameLength + extraLength + commentLength;
    }
    if (!documentEntry) throw new Error('Word 文档中没有正文。');
    const local = documentEntry.localOffset;
    const nameLength = view.getUint16(local + 26, true);
    const extraLength = view.getUint16(local + 28, true);
    const dataStart = local + 30 + nameLength + extraLength;
    const compressed = new Uint8Array(buffer, dataStart, documentEntry.compressedSize);
    let xmlBytes;
    if (documentEntry.method === 0) {
      xmlBytes = compressed;
    } else {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      xmlBytes = new Uint8Array(await new Response(stream).arrayBuffer());
    }
    const xml = new TextDecoder().decode(xmlBytes);
    const xmlDoc = new DOMParser().parseFromString(xml, 'application/xml');
    const namespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    return Array.from(xmlDoc.getElementsByTagNameNS(namespace, 'p')).map((para) => {
      const parts = Array.from(para.getElementsByTagNameNS(namespace, 't')).map((node) => node.textContent || '');
      const styleNode = para.getElementsByTagNameNS(namespace, 'pStyle')[0];
      const style = styleNode ? styleNode.getAttribute('w:val') || '' : '';
      const headingMatch = /(?:Heading|标题)\s*([1-6])/i.exec(style);
      const level = headingMatch ? Number(headingMatch[1]) : (/^[1-6]$/.test(style) ? Number(style) : 0);
      return { text: parts.join('').trim(), level, heading: level > 0 };
    }).filter((block) => block.text);
  }

  async function importWritingDocument(file) {
    if (!file) return;
    const isText = /\.(txt|md|markdown)$/i.test(file.name) || /^text\//i.test(file.type);
    const isDocx = /\.docx$/i.test(file.name);
    if (!isText && !isDocx) {
      toast('支持 TXT、Markdown 或 DOCX 文档。', 'error');
      return;
    }
    try {
      const source = isDocx ? await readDocxPlainText(file) : textToBlocks(await file.text());
      const imported = parseImportedDocument(source);
      if (!imported.chapters.length) {
        toast('没有读到可用的章节内容。', 'error');
        return;
      }
      const titleInput = document.querySelector('#writing-form [name="title"]');
      if (titleInput && imported.title && (!titleInput.value || titleInput.value === '未命名文章')) {
        titleInput.value = imported.title;
      }
      const bodyEditor = document.querySelector('[data-write-editor="body"]');
      if (bodyEditor && imported.introHtml && !richTextToPlain(bodyEditor.innerHTML)) {
        bodyEditor.innerHTML = imported.introHtml;
      }
      imported.chapters.forEach((chapter) => addWritingChapter(chapter.title, chapter.html));
      toast(`已读取文档，并新增 ${imported.chapters.length} 个章节；标题和正文已填入写作页。`, 'accent');
    } catch (error) {
      toast(error.message || '文档读取失败。', 'error');
    }
  }

  function addCollectionEntry() {
    const container = document.getElementById('collection-entries');
    if (!container) return;
    container.insertAdjacentHTML('beforeend', collectionRowMarkup());
    const rows = container.querySelectorAll('.collection-edit-row');
    const last = rows[rows.length - 1];
    if (last) last.querySelector('.coll-title').focus();
  }

  function removeCollectionEntry(button) {
    const row = button.closest('.collection-edit-row');
    if (row) row.remove();
  }

  /* ---------------------------- content actions ---------------------------- */

  function toggleHidden(itemId) {
    const item = state.site.items.find((entry) => entry.id === itemId);
    if (!item) return;
    item.hidden = !item.hidden;
    touchSite();
    saveNow();
    refreshView();
    toast(item.hidden ? '已设为仅本机可见。公开页面需要更新后才会改变。' : '已恢复为公开内容。公开页面需要更新后才会改变。');
  }

  function moveItem(itemId, direction) {
    const index = state.site.items.findIndex((item) => item.id === itemId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= state.site.items.length) return;
    const [item] = state.site.items.splice(index, 1);
    state.site.items.splice(target, 0, item);
    touchSite();
    saveNow();
    refreshView();
  }

  function deleteItem(itemId) {
    const item = state.site.items.find((entry) => entry.id === itemId);
    if (!item) return;
    const active = state.publication.active;
    openConfirm({
      title: '删除这块内容？',
      message: `<p>将从草稿中删除 <strong>「${esc(item.title || '未命名内容')}」</strong>。删除后无法恢复。</p>${active ? '<p>指路中已公示的旧快照不会立即改变；确认更新公示后才会同步删除。</p>' : ''}`,
      confirmLabel: '删除内容',
      danger: true,
      onConfirm: () => {
        state.site.items = state.site.items.filter((entry) => entry.id !== itemId);
        touchSite();
        saveNow();
        refreshView();
        toast('内容已删除。');
      }
    });
  }

  function clearStarters() {
    const count = state.site.items.filter((item) => item.starter).length;
    if (!count) return;
    openConfirm({
      title: '清空起始示例？',
      message: `<p>会删除 ${count} 块标记为示例的草稿。你自己后来编辑过的内容不会被当成示例删除。</p>`,
      confirmLabel: '清空示例',
      onConfirm: () => {
        state.site.items = state.site.items.filter((item) => !item.starter);
        state.ui.starterNoteDismissed = true;
        touchSite();
        saveNow();
        refreshView();
        toast('起始示例已清空。');
      }
    });
  }

  function dismissStarterNote() {
    state.ui.starterNoteDismissed = true;
    saveNow();
    refreshView();
  }

  /* ---------------------------- zones ---------------------------- */

  function addZoneFromForm(form) {
    const input = form.querySelector('#new-zone-name');
    const parentSelect = form.querySelector('#new-zone-parent');
    const name = trimText(input ? input.value : '', 24);
    const parentId = parentSelect ? (parentSelect.value || null) : null;
    if (!name) {
      toast('给专区起一个名字。', 'error');
      if (input) input.focus();
      return;
    }
    const siblings = state.site.zones.filter((zone) => (zone.parentId || null) === parentId);
    if (siblings.some((zone) => zone.name.toLowerCase() === name.toLowerCase())) {
      toast('同一个上级下已经有同名专区了。', 'error');
      if (input) input.focus();
      return;
    }
    state.site.zones.push(makeZone(name, '', parentId));
    touchSite();
    saveNow();
    refreshView();
    toast(`已添加${parentId ? '子' : ''}专区「${name}」。`);
  }

  function moveZone(zoneId, direction) {
    const zone = state.site.zones.find((entry) => entry.id === zoneId);
    if (!zone) return;
    const siblings = state.site.zones.filter((entry) => (entry.parentId || null) === (zone.parentId || null));
    const siblingIndex = siblings.findIndex((entry) => entry.id === zoneId);
    const targetZone = siblings[siblingIndex + direction];
    if (!targetZone) return;
    const index = state.site.zones.findIndex((entry) => entry.id === zoneId);
    const targetIndex = state.site.zones.findIndex((entry) => entry.id === targetZone.id);
    if (index < 0 || targetIndex < 0) return;
    [state.site.zones[index], state.site.zones[targetIndex]] = [state.site.zones[targetIndex], state.site.zones[index]];
    touchSite();
    saveNow();
    refreshView();
  }

  function changeZoneParent(zoneId, parentId) {
    const zone = state.site.zones.find((entry) => entry.id === zoneId);
    if (!zone) return;
    if (parentId && zoneDescendantIds(state.site.zones, zoneId).has(parentId)) {
      toast('不能把一个专区移动到它自己的子专区下面。', 'error');
      refreshView();
      return;
    }
    if (parentId) {
      const siblings = state.site.zones.filter((entry) => (entry.parentId || null) === parentId && entry.id !== zoneId);
      if (siblings.some((entry) => entry.name.toLowerCase() === zone.name.toLowerCase())) {
        toast('这个上级下已经有同名专区了。', 'error');
        refreshView();
        return;
      }
    }
    zone.parentId = parentId || null;
    touchSite();
    saveNow();
    refreshView();
  }

  function deleteZone(zoneId) {
    const zone = state.site.zones.find((entry) => entry.id === zoneId);
    if (!zone) return;
    const count = state.site.items.filter((item) => item.zoneId === zoneId).length;
    const children = state.site.zones.filter((entry) => entry.parentId === zoneId);
    if (state.site.zones.length <= 1) {
      toast('至少保留一个专区。', 'error');
      return;
    }
    if (count > 0 || children.length) {
      toast(children.length ? '这个专区里还有子专区，请先处理它们。' : '这个专区里还有内容，请先移动或删除它们。', 'error');
      return;
    }
    openConfirm({
      title: '删除这个专区？',
      message: `<p>专区 <strong>「${esc(zone.name)}」</strong>会被删除。它现在没有内容或子专区，所以不会影响其他内容块。</p>`,
      confirmLabel: '删除专区',
      danger: true,
      onConfirm: () => {
        state.site.zones = state.site.zones.filter((entry) => entry.id !== zoneId);
        touchSite();
        saveNow();
        refreshView();
        toast('专区已删除。');
      }
    });
  }

  /* ---------------------------- video download requests ---------------------------- */

  async function refreshNetworkView() {
    if (!networkInfo.server) {
      toast('现在是本地模式。运行 python server.py 后，才能发现同一服务上的其他主页。', 'error');
      return;
    }
    await refreshNetworkSites();
    await heartbeatNetwork();
    if (state.publication.active) await fetchOwnerNetworkRequests();
    refreshView();
    toast('联机导览已刷新。', 'accent');
  }

  function normalizeComment(comment) {
    return {
      ...comment,
      createdAt: typeof comment.createdAt === 'number' ? new Date(comment.createdAt * 1000).toISOString() : comment.createdAt
    };
  }

  async function hydrateComments() {
    const blocks = Array.from(document.querySelectorAll('[data-comments]'));
    for (const block of blocks) {
      const online = block.dataset.online === '1';
      const siteId = block.dataset.siteId;
      const itemId = block.dataset.itemId;
      const list = block.querySelector('[data-comment-list]');
      if (!list) continue;
      if (online) {
        try {
          const rows = await loadCommentsFor(siteId, itemId);
          const comments = rows.map((comment) => normalizeComment({
            id: comment.id,
            parentId: comment.parent_id || '',
            name: comment.author_name,
            text: comment.body,
            createdAt: comment.created_at
          }));
          list.innerHTML = commentListMarkup(comments) || '<p class="comment-empty">还没有评论，留下第一句。</p>';
        } catch (error) {
          list.innerHTML = '<p class="comment-empty">评论暂时没有载入。</p>';
        }
      } else {
        const comments = (state.comments || []).filter((comment) => comment.siteId === siteId && comment.itemId === itemId);
        list.innerHTML = commentListMarkup(comments) || '<p class="comment-empty">还没有评论，留下第一句。</p>';
      }
    }
  }

  async function submitAuthForm(form) {
    const isRegister = form.id === 'auth-register-form';
    const email = trimText(form.querySelector('[name="email"]').value, 120);
    const password = form.querySelector('[name="password"]').value;
    const username = isRegister ? trimText(form.querySelector('[name="username"]').value, 40) : '';
    const name = isRegister ? trimText(form.querySelector('[name="name"]').value, 60) : '';
    const errorBox = form.querySelector('.form-error');
    if (errorBox) { errorBox.textContent = ''; errorBox.classList.remove('is-visible'); }
    try {
      if (isRegister) {
        const result = await authRegister(email, password, username, name);
        if (result && result.pending) {
          form.reset();
          toast('注册成功，请先到邮箱点击确认链接，然后再登录。', 'accent');
          return;
        }
      } else {
        await authLogin(email, password);
      }
      await switchAccountState(authUser && authUser.id ? authUser.id : '');
      if (typeof syncCloudSiteForAccount === 'function') await syncCloudSiteForAccount();
      toast('已登录。', 'accent');
      refreshView();
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = error.message || '操作失败。';
        errorBox.classList.add('is-visible');
      }
    }
  }

  async function submitComment(form) {
    const siteId = form.dataset.siteId;
    const itemId = form.dataset.itemId;
    const online = form.dataset.online === '1';
    const text = cleanText(form.querySelector('[name="text"]').value, 1000).trim();
    const name = authUser ? (authUser.name || authUser.username) : '匿名访客';
    const parentId = form.querySelector('[name="parentId"]').value || '';
    if (!text) return;
    if (online) {
      if (!authUser) {
        toast('请先登录后再评论。', 'error');
        return;
      }
      try {
        await postComment({ siteId, itemId, text, parentId });
      } catch (error) {
        toast(error.message || '评论发送失败。', 'error');
        return;
      }
    } else {
      state.comments = state.comments || [];
      state.comments.push({
        id: uid('comment'),
        siteId,
        itemId,
        parentId,
        name,
        text,
        createdAt: nowISO()
      });
      saveNow();
    }
    form.reset();
    const target = form.querySelector('.comment-reply-target');
    if (target) target.hidden = true;
    await hydrateComments();
    toast('评论已留下。', 'accent');
  }

  function openMediaDownloadRequest(siteId, itemId, title, kind = 'video', network = false) {
    if (!siteId || !itemId) return;
    const label = kind === 'audio' ? '音频' : '视频';
    openModal({
      title: `申请下载这个${label}`,
      subtitle: '主页主人会看到你的申请。每次下载都需要单独申请，同意后只能下载一次。',
      size: 'narrow',
      body: `<form id="media-download-form" data-site-id="${attr(siteId)}" data-item-id="${attr(itemId)}" data-title="${attr(title)}" data-kind="${attr(kind)}" data-network="${network ? '1' : '0'}">
        <div class="video-request-target">${kind === 'audio' ? ICONS.audio : ICONS.video}<span>${esc(title || label)}</span></div>
        <div class="field">
          <label for="download-requester">你的称呼或联系方式 <span>方便主人认出你</span></label>
          <input id="download-requester" name="requester" type="text" maxlength="80" required placeholder="例如：小林 / xiaolin@example.com" data-autofocus>
        </div>
        <div class="field">
          <label for="download-note">给主人的话 <span>可选</span></label>
          <textarea id="download-note" name="note" maxlength="300" placeholder="说明你为什么想下载这个${label}。"></textarea>
        </div>
        <div class="form-error" id="download-request-error" role="alert"></div>
      </form>`,
      footer: `<button type="button" class="btn" data-action="close-modal">取消</button><button type="submit" form="media-download-form" class="btn btn--primary">发送下载申请</button>`
    });
  }

  async function submitMediaDownloadRequest(form) {
    const requester = trimText(form.querySelector('[name="requester"]').value, 80);
    const note = trimText(form.querySelector('[name="note"]').value, 300);
    if (!requester) {
      const error = form.querySelector('.form-error');
      if (error) {
        error.textContent = '请留下一个称呼或联系方式，方便主人处理申请。';
        error.classList.add('is-visible');
      }
      return;
    }
    const siteId = form.dataset.siteId;
    const itemId = form.dataset.itemId;
    const kind = form.dataset.kind || 'video';
    const network = form.dataset.network === '1';
    if (network) {
      try {
        await requestNetworkVideoDownload(siteId, itemId, requester, note);
        closeModal({ restoreFocus: false });
        refreshView();
        toast('下载申请已发送到联机主人那边，等待处理。', 'accent');
      } catch (error) {
        toast(error.message || '发送下载申请失败。', 'error');
      }
      return;
    }
    const item = state.site.items.find((entry) => entry.id === itemId);
    state.downloadRequests.unshift({
      id: uid('dlreq'),
      siteId,
      slug: state.site.slug,
      itemId,
      videoTitle: form.dataset.title || item?.title || (kind === 'audio' ? '音频' : '视频'),
      requester,
      note,
      status: 'pending',
      source: 'local',
      visitorToken: '',
      createdAt: nowISO(),
      decidedAt: null,
      downloadedAt: null
    });
    saveNow();
    closeModal({ restoreFocus: false });
    refreshView();
    toast('下载申请已发送。主人同意后，你可以在内容下方下载一次。', 'accent');
  }

  async function decideMediaRequest(requestId, approve, source = 'local') {
    if (source === 'online') {
      try {
        await decideNetworkRequest(requestId, approve);
        await fetchOwnerNetworkRequests();
        refreshView();
        toast(approve ? '已同意一次联机下载。' : '已拒绝联机下载申请。', approve ? 'accent' : '');
      } catch (error) {
        toast(error.message || '处理下载申请失败。', 'error');
      }
      return;
    }
    const request = state.downloadRequests.find((entry) => entry.id === requestId);
    if (!request) return;
    request.status = approve ? 'approved' : 'denied';
    request.decidedAt = nowISO();
    saveNow();
    refreshView();
    toast(approve ? '已同意一次下载。访客下载一次后需要重新申请。' : '已拒绝这次下载申请。', approve ? 'accent' : '');
  }

  function downloadLocalMedia(requestId) {
    const request = state.downloadRequests.find((entry) => entry.id === requestId);
    if (!request || request.status !== 'approved') {
      toast('这次下载还没有获得主人同意。', 'error');
      return;
    }
    const item = state.site.items.find((entry) => entry.id === request.itemId);
    const url = item ? itemMediaUrl(item) : '';
    if (!item || !url) {
      toast('媒体文件没有找到，可能已被移动或删除。', 'error');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = item.filename || `${item.title || 'media'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    request.status = 'downloaded';
    request.downloadedAt = nowISO();
    saveNow();
    refreshView();
    toast('下载已开始。本次授权已用完，下次下载需要重新申请。', 'accent');
  }

  async function downloadNetworkMedia(url, siteId, itemId, filename = '') {
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('下载失败。');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'anbiao-media';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      const cached = getNetworkDownloadRecord(siteId, itemId);
      if (cached) {
        cached.status = 'downloaded';
        cached.updatedAt = Date.now();
        setNetworkDownloadRecord(siteId, itemId, cached);
      }
      refreshView();
      toast('下载已开始。本次授权已用完，下次下载需要重新申请。', 'accent');
    } catch (error) {
      toast(error.message || '下载失败。', 'error');
    }
  }

  /* ---------------------------- publication ---------------------------- */

  function openPublishModal() {
    const issues = validatePublish(state.site);
    if (issues.length) {
      openModal({
        title: '还不能公示',
        subtitle: '先补齐这几件事。公示清单必须完整，来者才不会走进一条断掉的路。',
        body: `<ul class="review-issues">${issues.map((issue) => `<li>${esc(issue)}</li>`).join('')}</ul>
          <p class="review-note">这里只是检查，不会发布任何内容。补齐后可以再次点击「公示」。</p>`,
        footer: '<button type="button" class="btn btn--primary" data-action="close-modal">返回修改</button>',
        size: 'narrow'
      });
      return;
    }

    const payload = buildPublicPayload(state.site);
    const hidden = hiddenItemCount(state.site);
    const isUpdate = Boolean(state.publication.active);
    const cover = safeMediaSrc(payload.cover) || builtinCoverFor(payload.theme);
    const zoneMap = new Map(payload.zones.map((zone) => [zone.id, zone.name]));
    const itemList = payload.items;
    const visibleList = itemList.slice(0, 8);
    const more = itemList.length - visibleList.length;

    const body = `<div class="publish-review">
      <div class="review-site">
        <div class="review-cover"><img src="${attr(cover)}" alt=""></div>
        <div>
          <h3>${esc(payload.title)}</h3>
          <p>${esc(payload.owner)} · ${payload.zones.length} 个专区 · ${itemList.length} 块公开内容</p>
        </div>
      </div>
      <div class="review-facts">
        <div><span>将被公开</span><strong>${itemList.length} 块内容</strong></div>
        <div><span>仅本机保留</span><strong>${hidden} 块</strong></div>
        <div><span>公示协议</span><strong>${esc(CONSENT_VERSION)}</strong></div>
      </div>
      <ul class="review-list">
        ${visibleList.map((item) => `<li><span>${esc(item.title)}${item.filename ? ` · ${esc(item.filename)}` : ''}</span><span>${esc(zoneMap.get(item.zoneId) || '未分类')} · ${esc(itemTypeLabel(item.type))}</span></li>`).join('')}
      </ul>
      ${more > 0 ? `<p class="review-note">还有 ${more} 块内容，也会包含在这次公开快照中。</p>` : ''}
      <p class="review-note"><strong>公开的只是你确认的这一份快照。</strong> 以后修改草稿、隐藏内容或更换封面，都不会自动改变指路中的页面；需要你再次确认。</p>
    </div>
    <label class="consent-check">
      <input type="checkbox" id="consent-checkbox">
      <span><strong>${esc(CONSENT_TEXT)}</strong></span>
    </label>
    <ul class="consent-rules">
      <li>带「仅本机可见」标记的 ${hidden} 块内容不会被公开，也不会出现在导览区。</li>
      <li>你可以随时在「我的 Web → 公开展示」撤回，撤回后立即从指路消失。</li>
      <li>岸标不会基于你或访客的浏览行为做推荐；搜索只按专区与关键词过滤。</li>
      <li>本次同意会记录时间与协议版本，并保存在本机。</li>
    </ul>`;

    openModal({
      title: isUpdate ? '更新公示内容' : '把这座 web 放进指路？',
      subtitle: isUpdate ? '再次确认后，新的快照才会替换指路中的旧版本。' : '这是最后一次确认。只有勾选同意，内容才会公开。',
      body,
      footer: `<button type="button" class="btn" data-action="close-modal">取消</button>
        <button type="button" class="btn btn--primary" id="publish-confirm" data-action="confirm-publish" disabled>${isUpdate ? '同意并更新' : '同意并公示'}</button>`,
      size: 'wide'
    });
  }

  async function confirmPublish() {
    if (networkOnline && !authUser) {
      closeModal({ restoreFocus: false });
      toast('请先登录；登录后公示的网页会绑定到你的账号。', 'error');
      location.hash = '#/login';
      return;
    }
    const consent = document.getElementById('consent-checkbox');
    if (!consent || !consent.checked) {
      toast('请先阅读并勾选同意，才会公示。', 'error');
      return;
    }
    const issues = validatePublish(state.site);
    if (issues.length) {
      closeModal();
      openPublishModal();
      return;
    }
    const isUpdate = Boolean(state.publication.active);
    const stamp = nowISO();
    const payload = buildPublicPayload(state.site);
    const snapshot = {
      ...payload,
      publishedAt: stamp,
      consentVersion: CONSENT_VERSION
    };
    let publishedSnapshot = snapshot;
    if (networkOnline) {
      toast('正在上传内容并同步到联机导览…');
      try {
        const result = await publishToNetwork(snapshot);
        if (result && result.snapshot) publishedSnapshot = result.snapshot;
      } catch (error) {
        toast(error.message || '发布失败：内容还没有同步到联机导览。请检查图片/文件大小后重试。', 'error');
        return;
      }
    }
    state.publication.active = true;
    state.publication.consentVersion = CONSENT_VERSION;
    state.publication.consentedAt = stamp;
    state.publication.consentText = CONSENT_TEXT;
    state.publication.publishedAt = publishedSnapshot.publishedAt || stamp;
    state.publication.sourceHash = publicPayloadHash(buildPublicPayload(state.site));
    state.publication.snapshot = publishedSnapshot;
    state.publication.revokedAt = null;
    state.publication.history.unshift({
      action: isUpdate ? 'update' : 'publish',
      at: stamp,
      itemCount: publishedSnapshot.items.length
    });
    state.publication.history = state.publication.history.slice(0, 20);
    saveNow();
    closeModal({ restoreFocus: false });
    refreshView();
    toast(isUpdate ? '指路中的公示内容已更新。' : '已出现在指路。你随时可以撤回。', 'accent');
    if (networkOnline) {
      await heartbeatNetwork();
      await fetchOwnerNetworkRequests();
      refreshView();
      toast('已同步到联机导览，其他正在使用的人可以发现你的主页。', 'accent');
    }
  }

  function revokePublication() {
    if (!state.publication.active) return;
    openConfirm({
      title: '撤回公示？',
      message: `<p>撤回后，这座 web 会<strong>立即从「指路」消失</strong>，也不会再被搜索到。</p><p>本地草稿和内容不会被删除。以后仍然可以重新同意并公示。</p>`,
      confirmLabel: '撤回公示',
      danger: true,
      onConfirm: async () => {
        const stamp = nowISO();
        if (networkOnline && state.publication.remoteSiteId && typeof unpublishRemoteSite === 'function') {
          try {
            await unpublishRemoteSite(state.publication.remoteSiteId);
          } catch (error) {
            toast(error.message || '云端撤销失败，本地网页未变更。', 'error');
            return;
          }
        }
        state.publication.active = false;
        state.publication.revokedAt = stamp;
        state.publication.snapshot = null;
        state.publication.sourceHash = null;
        state.publication.publishedAt = null;
        state.publication.history.unshift({
          action: 'revoke',
          at: stamp,
          itemCount: 0
        });
        state.publication.history = state.publication.history.slice(0, 20);
        saveNow();
        refreshView();
        toast('已撤回。站点已从指路移除。', 'accent');
      }
    });
  }

  /* ---------------------------- export / import ---------------------------- */

  function safeFilename(value, fallback = 'anbiao') {
    const base = String(value || '')
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    return base || fallback;
  }

  function dateStamp() {
    const date = new Date();
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}`;
  }

  function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function exportStandalone() {
    if (exporting) return;
    exporting = true;
    try {
      await hydrateAssetUrls(state);
      const payload = buildPublicPayload(state.site);
      let html = buildStandaloneHTML(payload);
      const inlined = await inlineAssetUrls(html);
      html = inlined.html;
      const filename = `${safeFilename(slugify(payload.title) || payload.slug || 'my-web')}.html`;
      downloadBlob(filename, html, 'text/html;charset=utf-8');
      toast(
        inlined.bytes > 24 * 1024 * 1024
          ? '独立网页已导出，其中内嵌了较大的本地媒体文件，打开可能较慢。'
          : '已导出当前草稿的独立网页，可直接双击打开；这不影响指路快照。',
        'accent'
      );
    } catch (error) {
      toast(error.message || '导出失败。', 'error');
    } finally {
      exporting = false;
    }
  }

  async function exportData() {
    try {
      const ids = collectAssetIds(state.site, new Set());
      if (state.publication.snapshot) collectAssetIds(state.publication.snapshot, ids);
      const assets = {};
      for (const id of ids) {
        const record = await getAssetRecord(id);
        if (!record || !record.blob) continue;
        assets[id] = {
          name: record.name,
          type: record.type,
          size: record.size,
          dataUrl: await blobToDataUrl(record.blob)
        };
      }
      const bundle = {
        app: 'anbiao',
        schema: SCHEMA_VERSION,
        version: APP_VERSION,
        exportedAt: nowISO(),
        consentVersion: CONSENT_VERSION,
        state,
        assets
      };
      const json = JSON.stringify(bundle, null, 2);
      downloadBlob(`anbiao-backup-${dateStamp()}.json`, json, 'application/json;charset=utf-8');
      toast(
        Object.keys(assets).length
          ? `JSON 备份已导出，包含 ${Object.keys(assets).length} 个本地文件。`
          : 'JSON 备份已导出。',
        'accent'
      );
    } catch (error) {
      toast(error.message || '备份导出失败。', 'error');
    }
  }

  async function restoreIncomingAssets(assets) {
    if (!assets || typeof assets !== 'object') return 0;
    let restored = 0;
    for (const [id, record] of Object.entries(assets)) {
      if (!record || typeof record.dataUrl !== 'string') continue;
      const blob = await fetch(record.dataUrl).then((response) => response.blob());
      await putAssetRecord({
        id,
        blob,
        name: record.name || '本地文件',
        type: record.type || blob.type || 'application/octet-stream',
        size: Number(record.size) || blob.size,
        createdAt: nowISO()
      });
      restored += 1;
    }
    return restored;
  }

  async function readImportFile(file) {
    if (!file) return;
    if (file.size > 450 * 1024 * 1024) {
      toast('备份文件太大，无法导入。', 'error');
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const candidate = parsed && parsed.state && parsed.state.site ? parsed.state : parsed;
      if (!candidate || typeof candidate !== 'object' || !candidate.site || !Array.isArray(candidate.site.items)) {
        throw new Error('这不是岸标的备份文件。');
      }
      const normalized = normalizeState(candidate);
      const incomingAssets = parsed && parsed.assets && typeof parsed.assets === 'object' ? parsed.assets : {};
      const assetCount = Object.keys(incomingAssets).length;
      openConfirm({
        title: '导入这份备份？',
        message: `<p>将用 <strong>「${esc(normalized.site.title)}」</strong>（${normalized.site.items.length} 块内容${assetCount ? `，${assetCount} 个本地文件` : ''}）替换当前草稿。</p><p>当前数据会被覆盖。如果还没备份，建议先取消并导出一份 JSON。</p>`,
        confirmLabel: '导入并替换',
        danger: true,
        onConfirm: async () => {
          await restoreIncomingAssets(incomingAssets);
          state = normalized;
          await hydrateAssetUrls(state);
          touchSite();
          saveNow();
          refreshView();
          toast('备份已导入。', 'accent');
        }
      });
    } catch (error) {
      toast(error.message || '备份文件无法解析。', 'error');
    }
  }

  function resetAll() {
    openConfirm({
      title: '清空全部数据？',
      message: `<p>会删除这个浏览器里的站点、内容、图片和公示记录，并恢复一份新的起始草稿。</p><p>这个操作<strong>无法撤销</strong>。建议先导出 JSON 备份。</p>`,
      confirmLabel: '清空并重置',
      danger: true,
      onConfirm: async () => {
        try {
          Object.keys(window.localStorage)
            .filter((key) => key.startsWith(STORAGE_KEY))
            .forEach((key) => window.localStorage.removeItem(key));
          window.localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch (error) { /* ignore */ }
        await clearAssetStore();
        state = createDefaultState();
        lastSavedAt = null;
        saveNow();
        window.location.hash = '#/studio';
        if (route.name === 'studio') refreshView();
        toast('已重置为新的草稿。', 'accent');
      }
    });
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      /* fall through to the legacy path */
    }
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch (error) {
      return false;
    }
  }

  async function copyPublicLink(slug) {
    const target = slug || (state.publication.snapshot && state.publication.snapshot.slug) || state.site.slug;
    const url = `${window.location.href.split('#')[0]}#/site/${encodeURIComponent(target)}`;
    const ok = await copyText(url);
    toast(ok ? '公开链接已复制。' : '复制失败，请手动复制地址栏链接。', ok ? '' : 'error');
  }

  /* ---------------------------- image uploads ---------------------------- */

  async function handleUploadInput(input) {
    const kind = input.dataset.upload;
    const file = input.files && input.files[0];
    if (!file) return;
    if (kind === 'import-data') {
      await readImportFile(file);
      input.value = '';
      return;
    }
    if (kind === 'writing-ai-file') {
      importWritingDocument(file);
      input.value = '';
      return;
    }
    if (kind === 'writing-image') {
      try {
        const dataUrl = await imageFileToDataUrl(file, 1600);
        const editor = writingEditor();
        if (editor) {
          editor.focus();
          document.execCommand('insertImage', false, dataUrl);
        }
        toast('图片已插入文章。');
      } catch (error) {
        toast(error.message || '图片插入失败。', 'error');
      }
      input.value = '';
      return;
    }
    try {
      if (kind === 'cover') {
        const dataUrl = await imageFileToDataUrl(file, 1800);
        state.site.cover = dataUrl;
        touchSite();
        saveNow();
        refreshView();
        toast('封面已更新。');
      } else if (kind === 'content-image') {
        const dataUrl = await imageFileToDataUrl(file, 1800);
        const urlInput = document.getElementById(input.dataset.mediaUrlId);
        const dataInput = document.querySelector(`[name="${input.dataset.mediaDataName}"]`);
        const preview = document.getElementById(input.dataset.mediaPreview);
        if (urlInput) urlInput.value = '';
        if (dataInput) dataInput.value = dataUrl;
        if (preview) {
          preview.src = dataUrl;
          preview.classList.add('is-visible');
        }
        toast('图片已上传，会自动压缩后保存在本地。');
      } else if (kind === 'background-image') {
        const dataUrl = await imageFileToDataUrl(file, 2200);
        state.site.appearance = normalizeAppearance(state.site.appearance, state.site.theme);
        state.site.appearance.mode = 'image';
        state.site.appearance.image = dataUrl;
        touchSite();
        saveNow();
        refreshView();
        toast('页面背景图已更新。');
      } else if (kind === 'image-part') {
        const dataUrl = await imageFileToDataUrl(file, 1800);
        const row = input.closest('.image-part-row');
        if (row) {
          row.querySelector('[name="image-part-src"]').value = dataUrl;
          const preview = row.querySelector('.image-part-preview');
          if (preview) preview.innerHTML = `<img src="${attr(dataUrl)}" alt="">`;
        }
        toast('图片已加入图集。');
      } else if (kind === 'part') {
        const meta = await createAssetFromFile(file);
        modalDraftAssets.add(meta.assetId);
        const row = input.closest('.episode-row');
        if (row) {
          row.querySelector('[name="episode-asset-id"]').value = meta.assetId;
          row.querySelector('[name="episode-filename"]').value = meta.filename;
          row.querySelector('[name="episode-mime"]').value = meta.mime;
          row.querySelector('[name="episode-size"]').value = String(meta.size);
          const name = row.querySelector('.part-file-name');
          if (name) name.textContent = meta.filename;
          const titleInput = row.querySelector('[name="episode-title"]');
          if (titleInput && !titleInput.value) titleInput.value = meta.filename.replace(/\.[^.]+$/, '');
        }
        toast('文件已加入选集。');
      } else if (kind === 'local-asset') {
        const assetKind = input.dataset.assetKind || 'file';
        const meta = await createAssetFromFile(file);
        modalDraftAssets.add(meta.assetId);
        const form = input.closest('form');
        const info = document.getElementById(`${assetKind}-asset-info`);
        if (form) {
          const setValue = (name, value) => {
            const field = form.querySelector(`[name="${name}"]`);
            if (field) field.value = value;
          };
          setValue(`${assetKind}-asset-id`, meta.assetId);
          setValue(`${assetKind}-filename`, meta.filename);
          setValue(`${assetKind}-mime`, meta.mime);
          setValue(`${assetKind}-size`, meta.size);
          const fileSource = form.querySelector(`input[name="${assetKind}-source"][value="file"]`);
          if (fileSource) {
            fileSource.checked = true;
            syncAssetSource(input.closest('[data-asset-source]'));
          }
        }
        if (info) {
          info.innerHTML = `<strong>${esc(meta.filename)}</strong><span>${esc(fileKindLabel(meta.mime, meta.filename))} · ${esc(formatBytes(meta.size))}</span>`;
        }
        toast(`已选择本地文件：${meta.filename}`, 'accent');
      }
    } catch (error) {
      toast(error.message || '文件处理失败。', 'error');
    } finally {
      input.value = '';
    }
  }

  /* ---------------------------- modal ---------------------------- */

  function focusableInModal(modal) {
    return $$('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
      .filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  const LAYOUT_SECTION_META = [
    { id: 'hero', label: '主视觉', hint: '标题、简介、标签与封面' },
    { id: 'browse', label: '搜索与视图', hint: '搜索框、单双栏与内容大小' },
    { id: 'body', label: '合集 / 内容区', hint: '合集卡片或导出的专区内容' }
  ];

  function layoutEditorMarkup(layout, options = {}) {
    const safe = normalizeLayout(layout);
    const collections = siteCollections(buildPublicPayload(state.site)).filter((entry) => entry.count > 0);
    const order = new Map(safe.collectionOrder.map((id, index) => [id, index]));
    collections.sort((a, b) => (order.has(a.zone.id) ? order.get(a.zone.id) : 999) - (order.has(b.zone.id) ? order.get(b.zone.id) : 999));
    const sectionRows = safe.sections.map((id, index) => {
      const meta = LAYOUT_SECTION_META.find((entry) => entry.id === id);
      return `<div class="layout-editor-row" draggable="true" data-section-id="${attr(id)}">
        <span class="layout-editor-grip" aria-hidden="true">⠿</span>
        <div class="layout-editor-copy"><strong>${esc(meta ? meta.label : id)}</strong><small>${esc(meta ? meta.hint : '')}</small></div>
        <div class="layout-editor-order"><button type="button" data-layout-move="up" data-layout-target="section" aria-label="上移">↑</button><button type="button" data-layout-move="down" data-layout-target="section" aria-label="下移">↓</button></div>
      </div>`;
    }).join('');
    const collectionRows = collections.map((entry) => `<div class="layout-editor-row" draggable="true" data-collection-id="${attr(entry.zone.id)}">
      <span class="layout-editor-grip" aria-hidden="true">⠿</span>
      <div class="layout-editor-copy"><strong>${esc(entry.zone.name)}</strong><small>${entry.count} 项内容 · ${esc(entry.zone.desc || '没有说明')}</small></div>
      <div class="layout-editor-order"><button type="button" data-layout-move="up" data-layout-target="collection" aria-label="上移">↑</button><button type="button" data-layout-move="down" data-layout-target="collection" aria-label="下移">↓</button></div>
    </div>`).join('');
    const heroButton = (value, label) => `<button type="button" data-layout-hero="${value}" class="${safe.heroStyle === value ? 'is-active' : ''}">${label}</button>`;
    const columnsButton = (value, label) => `<button type="button" data-layout-columns="${value}" class="${safe.columns === value ? 'is-active' : ''}">${label}</button>`;
    const densityButton = (value, label) => `<button type="button" data-layout-density="${value}" class="${safe.density === value ? 'is-active' : ''}">${label}</button>`;
    return `<form id="layout-editor-form">
      ${options.ai ? '<div class="layout-ai-note">AI 已根据当前内容数量、类型、封面和合集规模生成一版布局。你可以继续拖动、调整，确认后保存。</div>' : ''}
      <div class="layout-editor-block">
        <h3>页面区块顺序</h3>
        <div class="layout-editor-section-list" data-layout-sections>${sectionRows}</div>
        <p class="layout-editor-note">拖动左侧 ⠿ 调整顺序，也可以用 ↑ ↓ 按钮。区块会从上到下排列。</p>
      </div>
      <div class="layout-editor-block">
        <h3>主视觉样式</h3>
        <div class="layout-editor-options" data-layout-hero-options>${heroButton('split', '左右分栏')}${heroButton('stacked', '上图下文')}${heroButton('text', '纯文字，隐藏封面')}</div>
      </div>
      <div class="layout-editor-block">
        <h3>合集排列</h3>
        <div class="layout-editor-collection-list" data-layout-collections>${collectionRows || '<div class="layout-editor-note">还没有合集；添加内容后再来调整。</div>'}</div>
      </div>
      <div class="layout-editor-block">
        <h3>基础排版</h3>
        <div class="layout-editor-options" data-layout-columns-options>${columnsButton(1, '单栏')}${columnsButton(2, '双栏')}</div>
        <div class="layout-editor-options" data-layout-density-options style="margin-top:6px">${densityButton('compact', '小')}${densityButton('standard', '中')}${densityButton('large', '大')}</div>
      </div>
    </form>`;
  }

  function setLayoutOption(button, selector) {
    const group = button.closest(selector);
    if (!group) return;
    group.querySelectorAll('button').forEach((item) => item.classList.toggle('is-active', item === button));
  }

  function moveLayoutRow(button) {
    const row = button.closest('[data-section-id], [data-collection-id]');
    if (!row) return;
    const direction = button.getAttribute('data-layout-move') === 'up' ? -1 : 1;
    const sibling = direction < 0 ? row.previousElementSibling : row.nextElementSibling;
    if (!sibling) return;
    if (direction < 0) row.parentNode.insertBefore(row, sibling);
    else row.parentNode.insertBefore(sibling, row);
  }

  function initLayoutEditor(modal) {
    modal.querySelectorAll('[data-layout-move]').forEach((button) => {
      button.addEventListener('click', () => moveLayoutRow(button));
    });
    modal.querySelectorAll('[data-layout-hero]').forEach((button) => {
      button.addEventListener('click', () => setLayoutOption(button, '[data-layout-hero-options]'));
    });
    modal.querySelectorAll('[data-layout-columns]').forEach((button) => {
      button.addEventListener('click', () => setLayoutOption(button, '[data-layout-columns-options]'));
    });
    modal.querySelectorAll('[data-layout-density]').forEach((button) => {
      button.addEventListener('click', () => setLayoutOption(button, '[data-layout-density-options]'));
    });
    modal.querySelectorAll('[draggable="true"], [data-layout-sections], [data-layout-collections]').forEach((node) => {
      if (node.matches('div[draggable="true"]')) {
        node.addEventListener('dragstart', (event) => {
          node.classList.add('is-dragging');
          node.parentNode.dataset.dragSource = node.dataset.sectionId || node.dataset.collectionId;
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', node.dataset.sectionId || node.dataset.collectionId || '');
          }
        });
        node.addEventListener('dragend', () => node.classList.remove('is-dragging'));
        node.addEventListener('dragover', (event) => { event.preventDefault(); node.classList.add('is-drop-target'); });
        node.addEventListener('dragleave', () => node.classList.remove('is-drop-target'));
        node.addEventListener('drop', (event) => {
          event.preventDefault();
          node.classList.remove('is-drop-target');
          const sourceId = node.parentNode.dataset.dragSource;
          const source = sourceId ? node.parentNode.querySelector(`[data-section-id="${sourceId}"], [data-collection-id="${sourceId}"]`) : null;
          if (!source || source === node) return;
          node.parentNode.insertBefore(source, node);
        });
      }
    });
  }

  function openLayoutPage(layout, ai = false) {
    layoutDraft = normalizeLayout(layout || state.site.layout);
    window.location.hash = `#/layout${ai ? '?ai=1' : ''}`;
  }

  function saveLayoutPage() {
    state.site.layout = normalizeLayout(layoutDraft || state.site.layout);
    layoutDraft = null;
    saveNow();
    toast('页面布局已保存。', 'accent');
    window.location.hash = '#/studio';
  }

  function nudgeLayoutBlock(dir) {
    if (!layoutDraft) return;
    const block = layoutDraft.blocks.find((entry) => entry.id === selectedLayoutBlockId);
    if (!block) return;
    if (dir === 'left') block.x = Math.max(0, block.x - 1);
    if (dir === 'right') block.x = Math.min(12 - block.w, block.x + 1);
    if (dir === 'up') block.y = Math.max(0, block.y - 1);
    if (dir === 'down') block.y = Math.min(40, block.y + 1);
    refreshView();
  }

  function resizeLayoutBlock(kind, delta) {
    if (!layoutDraft) return;
    const block = layoutDraft.blocks.find((entry) => entry.id === selectedLayoutBlockId);
    if (!block) return;
    if (kind === 'width') block.w = Math.min(12, Math.max(2, block.w + Number(delta)));
    if (kind === 'height') block.h = Math.min(12, Math.max(1, block.h + Number(delta)));
    block.x = Math.min(block.x, 12 - block.w);
    refreshView();
  }

  function layoutDrop(event) {
    const canvas = event.target.closest('[data-layout-canvas]');
    if (!canvas || !layoutDraft) return;
    const id = event.dataTransfer && event.dataTransfer.getData('text/plain');
    const block = layoutDraft.blocks.find((entry) => entry.id === id);
    if (!block) return;
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    block.x = Math.min(12 - block.w, Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * 12)));
    block.y = Math.min(40, Math.max(0, Math.floor((event.clientY - rect.top) / 96)));
    selectedLayoutBlockId = block.id;
    refreshView();
  }

  function openLayoutEditor(layout, options = {}) {
    openModal({
      title: options.ai ? 'AI 辅助页面布局' : '自定义页面布局',
      subtitle: '调整区块顺序、主视觉、合集排列和基础分栏；保存后立即反映在本地主页，对外展示需更新公示。',
      size: 'wide',
      body: layoutEditorMarkup(layout, options),
      footer: `<button type="button" class="btn" data-action="close-modal">取消</button><button type="button" class="btn btn--primary" data-action="save-layout">保存布局</button>`,
      onMount: initLayoutEditor
    });
  }

  function saveLayoutEditor() {
    const form = document.getElementById('layout-editor-form');
    if (!form) return;
    const sections = Array.from(form.querySelectorAll('[data-layout-sections] [data-section-id]')).map((row) => row.getAttribute('data-section-id'));
    const collections = Array.from(form.querySelectorAll('[data-layout-collections] [data-collection-id]')).map((row) => row.getAttribute('data-collection-id'));
    const heroStyle = form.querySelector('[data-layout-hero].is-active')?.getAttribute('data-layout-hero') || 'split';
    const columns = Number(form.querySelector('[data-layout-columns].is-active')?.getAttribute('data-layout-columns')) === 2 ? 2 : 1;
    const density = form.querySelector('[data-layout-density].is-active')?.getAttribute('data-layout-density') || 'standard';
    state.site.layout = normalizeLayout({ columns, density, sections, heroStyle, collectionOrder: collections });
    saveNow();
    closeModal({ restoreFocus: false });
    refreshView();
    toast('页面布局已保存。', 'accent');
  }

  function openModal(options) {
    if (!modalRoot) return;
    if (!modalRoot.classList.contains('is-open')) {
      modalLastFocus = document.activeElement;
    } else if (modalOnClose) {
      const previous = modalOnClose;
      modalOnClose = null;
      previous();
    }
    modalOnClose = typeof options.onClose === 'function' ? options.onClose : null;
    const titleId = `modal-title-${Date.now()}`;
    const size = options.size === 'wide' ? ' modal--wide' : options.size === 'narrow' ? ' modal--narrow' : '';
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"></div>
      <div class="modal${size}" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <header class="modal-head">
          <div class="modal-head-copy">
            <h2 id="${titleId}">${esc(options.title || '')}</h2>
            ${options.subtitle ? `<p>${esc(options.subtitle)}</p>` : ''}
          </div>
          <button type="button" class="modal-close" data-action="close-modal" aria-label="关闭">${ICONS.close}</button>
        </header>
        <div class="modal-body">${options.body || ''}</div>
        <footer class="modal-foot">${options.footer || `<button type="button" class="btn" data-action="close-modal">关闭</button>`}</footer>
      </div>`;
    modalRoot.classList.add('is-open');
    document.body.classList.add('modal-open');
    const modal = modalRoot.querySelector('.modal');
    if (typeof options.onMount === 'function') options.onMount(modal);
    window.setTimeout(() => {
      const preferred = modal.querySelector('[data-autofocus]') || modal.querySelector('.modal-close');
      if (preferred) preferred.focus({ preventScroll: true });
    }, 20);
  }

  function closeModal(options = {}) {
    if (!modalRoot || !modalRoot.classList.contains('is-open')) return;
    const shouldRestore = options.restoreFocus !== false;
    const onClose = modalOnClose;
    modalOnClose = null;
    modalRoot.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    modalRoot.innerHTML = '';
    pendingConfirm = null;
    if (shouldRestore && modalLastFocus && document.contains(modalLastFocus)) {
      modalLastFocus.focus({ preventScroll: true });
    }
    modalLastFocus = null;
    if (onClose) {
      try { onClose(); } catch (error) { console.warn('[岸标] 弹窗清理失败。', error); }
    }
  }

  function openConfirm(options) {
    openModal({
      title: options.title,
      size: 'narrow',
      body: `<div class="confirm-copy">${options.message || ''}</div>`,
      footer: `<button type="button" class="btn" data-action="close-modal">取消</button>
        <button type="button" class="btn ${options.danger ? 'btn--danger' : 'btn--primary'}" data-action="confirm-dialog">${esc(options.confirmLabel || '确认')}</button>`
    });
    pendingConfirm = options.onConfirm;
  }

  function runConfirm() {
    const callback = pendingConfirm;
    pendingConfirm = null;
    closeModal({ restoreFocus: false });
    if (typeof callback === 'function') {
      Promise.resolve()
        .then(callback)
        .catch((error) => {
          console.error(error);
          toast(error.message || '操作失败。', 'error');
        });
    }
  }

  /* ---------------------------- field updates ---------------------------- */

  function updateSiteField(field, value) {
    if (!Object.prototype.hasOwnProperty.call(state.site, field) && field !== 'cover') return;
    state.site[field] = field === 'tags'
      ? String(value || '').split(/[,，]/).map((tag) => trimText(tag, 20)).filter(Boolean).slice(0, 8)
      : value;
    touchSite();
    if (field === 'slug') updateSlugHint();
    schedulePreview();
    updateLiveStatus();
    scheduleSave();
  }

  function updateZoneField(zoneId, field, value) {
    const zone = state.site.zones.find((entry) => entry.id === zoneId);
    if (!zone) return;
    zone[field] = field === 'color' ? normalizeHexColor(value, DEFAULT_ZONE_COLOR) : value;
    touchSite();
    schedulePreview();
    updateLiveStatus();
    scheduleSave();
  }

  function updateAppearanceField(field, value) {
    const appearance = normalizeAppearance(state.site.appearance, state.site.theme);
    appearance[field] = field === 'overlay'
      ? Math.min(0.85, Math.max(0, Number(value) / 100))
      : field === 'angle'
        ? Math.min(360, Math.max(0, Number(value)))
        : field === 'color' || field === 'color2'
          ? value
          : value;
    state.site.appearance = appearance;
    touchSite();
    schedulePreview();
    updateLiveStatus();
    scheduleSave();
  }

  function applyStudioContentFilter() {
    const input = document.getElementById('studio-content-search');
    const select = document.getElementById('studio-zone-filter');
    if (!input || !select) return;
    state.ui.studioQuery = input.value.slice(0, 120);
    state.ui.studioZoneFilter = select.value || 'all';
    const query = normalizeSpace(input.value).toLowerCase();
    const zone = select.value || 'all';
    const descendants = zone === 'all' ? null : zoneDescendantIds(state.site.zones, zone);
    const rows = $$('#studio-item-list .item-row');
    let count = 0;
    rows.forEach((row) => {
      const zoneMatch = zone === 'all' || row.dataset.zoneId === zone || (descendants && descendants.has(row.dataset.zoneId));
      const queryMatch = !query || String(row.dataset.itemSearch || '').includes(query);
      const visible = zoneMatch && queryMatch;
      row.hidden = !visible;
      if (visible) count += 1;
    });
    const countEl = document.getElementById('studio-content-visible');
    if (countEl) countEl.textContent = String(count);
    const noMatch = document.getElementById('studio-content-no-match');
    if (noMatch) noMatch.hidden = count !== 0;
    scheduleSave();
  }

  function setBackgroundMode(mode) {
    const appearance = normalizeAppearance(state.site.appearance, state.site.theme);
    appearance.mode = ['theme', 'solid', 'gradient', 'image'].includes(mode) ? mode : 'theme';
    if (appearance.mode === 'solid' && appearance.color === themeBackground(state.site.theme)) {
      appearance.color = state.site.theme === 'ink' ? '#24352b' : '#f7f2e7';
    }
    state.site.appearance = appearance;
    touchSite();
    saveNow();
    refreshView();
  }

  function setSiteLayout(columns) {
    state.site.layout = normalizeLayout({ ...state.site.layout, columns: Number(columns) === 2 ? 2 : 1 });
    touchSite();
    saveNow();
    updateLiveStatus();
    refreshView();
  }

  function setSiteDensity(density) {
    state.site.layout = normalizeLayout({ ...state.site.layout, density });
    touchSite();
    saveNow();
    updateLiveStatus();
    refreshView();
  }

  function setStudioDensity(density) {
    state.ui.studioDensity = ['compact', 'standard', 'large'].includes(density) ? density : 'standard';
    saveNow();
    refreshView();
  }

  function addSubzone(zoneId) {
    const select = document.getElementById('new-zone-parent');
    const input = document.getElementById('new-zone-name');
    if (select) select.value = zoneId;
    if (input) {
      input.placeholder = '子专区名称，例如：旅行照片、录音、文档';
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function copySiteAddress(slug) {
    const target = slug || state.site.slug || 'draft';
    const listed = publicationIsListed() && state.publication.snapshot && state.publication.snapshot.slug === target;
    const suffix = listed ? '' : '?preview=1';
    const url = `${window.location.href.split('#')[0]}#/site/${encodeURIComponent(target)}${suffix}`;
    copyText(url).then((ok) => {
      toast(ok ? (listed ? '公开主页链接已复制。' : '草稿主页链接已复制（仅本机可预览）。') : '复制失败，请手动复制地址栏链接。', ok ? '' : 'error');
    });
  }

  function openHomepage() {
    const slug = state.site.slug || 'draft';
    const listed = publicationIsListed() && state.publication.snapshot && state.publication.snapshot.slug === slug;
    window.location.hash = `#/site/${encodeURIComponent(slug)}${listed ? '' : '?preview=1'}`;
  }

  function finalizeSlug(input) {
    let next = slugify(input.value);
    if (!next) next = slugify(state.site.title) || 'my-web';
    if (DEMO_SLUGS.has(next)) next = `${next}-web`;
    input.value = next;
    state.site.slug = next;
    touchSite();
    updateSlugHint();
    schedulePreview();
    updateLiveStatus();
    saveNow();
  }

  function finalizeZoneName(input) {
    if (!trimText(input.value, 24)) {
      input.value = '未命名专区';
      const zone = state.site.zones.find((entry) => entry.id === input.dataset.zoneId);
      if (zone) zone.name = '未命名专区';
      touchSite();
      schedulePreview();
      scheduleSave();
    }
  }

  function handleDocumentInput(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.matches('[name="chapter-body"]')) {
      const count = target.closest('.chapter-row')?.querySelector('[data-chapter-count]');
      if (count) count.textContent = String(target.value.length);
      return;
    }

    if (target.matches('[data-role="guide-search"]')) {
      state.ui.guideQuery = target.value.slice(0, 120);
      updateGuideResults();
      return;
    }

    if (target.matches('[data-role="studio-content-search"]')) {
      applyStudioContentFilter();
      return;
    }

    if (target.matches('[data-scope="site"][data-field]') && !target.matches('input[type="radio"]')) {
      updateSiteField(target.dataset.field, target.value);
      return;
    }

    if (target.matches('[data-scope="appearance"][data-field]')) {
      updateAppearanceField(target.dataset.field, target.value);
      const output = target.parentElement ? target.parentElement.querySelector('output') : null;
      if (output) {
        output.textContent = target.dataset.field === 'overlay' ? `${target.value}%` : `${target.value}°`;
      }
      return;
    }

    if (target.matches('[data-scope="zone"][data-field]')) {
      updateZoneField(target.dataset.zoneId, target.dataset.field, target.value);
      if (target.dataset.field === 'color') {
        const dot = target.closest('.zone-row')?.querySelector('.zone-dot');
        if (dot) dot.style.background = normalizeHexColor(target.value, DEFAULT_ZONE_COLOR);
      }
    }
  }

  function setDownloadable(itemId, value) {
    const item = state.site.items.find((entry) => entry.id === itemId);
    if (!item || !['video', 'audio', 'image'].includes(item.type)) return;
    item.downloadable = Boolean(value);
    touchSite();
    saveNow();
    refreshView();
    toast(item.downloadable ? '已允许下载。' : '已禁止下载。');
  }

  function setZoneDownloadable(zoneId, value) {
    const zones = zoneDescendantIds(state.site.zones, zoneId);
    zones.add(zoneId);
    state.site.items.forEach((item) => {
      if (['video', 'audio', 'image'].includes(item.type) && zones.has(item.zoneId)) item.downloadable = Boolean(value);
    });
    touchSite();
    saveNow();
    refreshView();
    toast(value ? '这个专区的媒体已允许下载。' : '这个专区的媒体已禁止下载。');
  }

  function setAllDownloadable(value) {
    state.site.items.forEach((item) => {
      if (['video', 'audio', 'image'].includes(item.type)) item.downloadable = Boolean(value);
    });
    touchSite();
    saveNow();
    refreshView();
    toast(value ? '全部媒体已允许下载。' : '全部媒体已禁止下载。');
  }

  function handleDocumentChange(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.matches('[data-download-toggle]')) {
      setDownloadable(target.dataset.id, target.checked);
      return;
    }

    if (target.matches('input[type="file"]')) {
      handleUploadInput(target);
      return;
    }

    if (target.matches('input[name="content-type"]')) {
      const form = target.closest('form');
      if (target.value === 'article' && form && form.dataset.editing !== 'true') {
        startNewArticle();
        return;
      }
      syncContentPanels(form);
      return;
    }

    if (target.matches('input[name$="-source"]') && target.closest('[data-asset-source]')) {
      syncAssetSource(target.closest('[data-asset-source]'));
      return;
    }

    if (target.matches('[data-zone-parent]')) {
      changeZoneParent(target.dataset.zoneId, target.value || null);
      return;
    }

    if (target.id === 'studio-zone-filter') {
      applyStudioContentFilter();
      return;
    }

    if (target.id === 'consent-checkbox') {
      const button = document.getElementById('publish-confirm');
      if (button) button.disabled = !target.checked;
      return;
    }

    if (target.matches('[data-scope="site"][data-field="theme"]')) {
      state.site.theme = target.value;
      touchSite();
      schedulePreview();
      updateLiveStatus();
      scheduleSave();
      return;
    }

    if (target.id === 'settings-show-demo') {
      state.settings.showDemo = target.checked;
      saveNow();
      toast(target.checked ? '已显示平台示例。' : '已隐藏平台示例。');
    }
  }

  function handleDocumentSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (form.id === 'zone-add-form') {
      event.preventDefault();
      addZoneFromForm(form);
      return;
    }
    if (form.id === 'content-form') {
      event.preventDefault();
      saveContentForm(form);
    }
    if (form.id === 'media-download-form') {
      event.preventDefault();
      submitMediaDownloadRequest(form);
    }
    if (form.id === 'comment-form') {
      event.preventDefault();
      submitComment(form);
    }
    if (form.id === 'auth-login-form' || form.id === 'auth-register-form') {
      event.preventDefault();
      submitAuthForm(form);
    }
  }

  function handleDocumentBlur(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.matches('[data-scope="site"][data-field="slug"]')) {
      finalizeSlug(target);
    } else if (target.matches('[data-scope="zone"][data-field="name"]')) {
      finalizeZoneName(target);
    } else if (target.matches('[data-scope="appearance"][data-field="color"], [data-scope="appearance"][data-field="color2"]')) {
      const fallback = target.dataset.field === 'color2' ? '#e5d7c2' : themeBackground(state.site.theme);
      const clean = normalizeHexColor(target.value, fallback);
      target.value = clean;
      updateAppearanceField(target.dataset.field, clean);
    }
  }

  /* ---------------------------- click actions ---------------------------- */

  function handleDocumentClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (target.closest('[data-article-choice]')) {
      event.preventDefault();
      startNewArticle();
      return;
    }
    const writeCmd = target.closest('[data-write-cmd]');
    if (writeCmd) {
      event.preventDefault();
      applyWritingCommand(writeCmd.getAttribute('data-write-cmd'));
      return;
    }
    const writeBlock = target.closest('[data-write-block]');
    if (writeBlock) {
      event.preventDefault();
      applyWritingCommand(writeBlock.getAttribute('data-write-block'));
      return;
    }
    if (target.closest('[data-write-image]')) {
      event.preventDefault();
      document.querySelector('[data-upload="writing-image"]')?.click();
      return;
    }
    if (target.closest('[data-write-ai]')) {
      event.preventDefault();
      document.querySelector('[data-upload="writing-ai-file"]')?.click();
      return;
    }

    const zoneLink = target.closest('.web-zone-link');
    if (zoneLink && (document.body.classList.contains('route-site') || zoneLink.closest('#preview-canvas'))) {
      event.preventDefault();
      const href = zoneLink.getAttribute('href') || '';
      const section = href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
      if (section) {
        section.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }
      return;
    }

    const actionEl = target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (!action) return;
    event.preventDefault();

    switch (action) {
      case 'close-modal':
        closeModal();
        break;
      case 'confirm-dialog':
        runConfirm();
        break;
      case 'open-layout-editor':
        openLayoutPage(state.site.layout);
        break;
      case 'ai-layout':
        openLayoutPage(suggestLayout(state.site), true);
        break;
      case 'layout-cancel':
        layoutDraft = null;
        window.location.hash = '#/studio';
        break;
      case 'layout-save':
        saveLayoutPage();
        break;
      case 'layout-reset':
        layoutDraft = normalizeLayout({});
        refreshView();
        break;
      case 'layout-ai':
        layoutDraft = suggestLayout(state.site);
        window.location.hash = '#/layout?ai=1';
        refreshView();
        break;
      case 'layout-select': {
        const block = actionEl.closest('[data-layout-block-id]');
        if (!block) break;
        selectedLayoutBlockId = block.getAttribute('data-layout-block-id') || 'hero';
        document.querySelectorAll('.layout-canvas-block').forEach((node) => node.classList.toggle('is-selected', node === block));
        break;
      }
      case 'layout-nudge':
        nudgeLayoutBlock(actionEl.dataset.dir);
        break;
      case 'layout-width':
        resizeLayoutBlock('width', actionEl.dataset.delta);
        break;
      case 'layout-height':
        resizeLayoutBlock('height', actionEl.dataset.delta);
        break;
      case 'open-site-manager':
        window.location.hash = '#/sites';
        break;
      case 'create-site': {
        const site = createAdditionalSite();
        if (!site) {
          toast(`最多只能创建 ${MAX_SITES} 个网页。`, 'error');
          break;
        }
        layoutDraft = null;
        window.location.hash = '#/studio';
        toast('已创建新网页。', 'accent');
        break;
      }
      case 'switch-site': {
        const siteId = actionEl.dataset.siteId;
        if (switchActiveSite(siteId)) {
          layoutDraft = null;
          window.location.hash = '#/studio';
          refreshView();
        }
        break;
      }
      case 'view-site': {
        const siteId = actionEl.dataset.siteId;
        const record = (state.sites || []).find((entry) => entry.site.id === siteId);
        if (!record) break;
        if (switchActiveSite(siteId)) {
          layoutDraft = null;
          const slug = encodeURIComponent(record.site.slug || '');
          window.location.hash = `#/site/${slug}?preview=1`;
          refreshView();
        }
        break;
      }
      case 'unpublish-site': {
        const siteId = actionEl.dataset.siteId;
        const target = (state.sites || []).find((entry) => entry.site.id === siteId);
        if (!target) break;
        openConfirm({
          title: '撤销这个网页的公示？',
          message: `<p>「${esc(target.site.title)}」会从指路中消失，其他用户将无法再看到它。</p><p>网页内容和本地草稿都会保留，之后可以重新公示。</p>`,
          confirmLabel: '确认撤销公示',
          danger: true,
          onConfirm: async () => {
            if (target.publication && target.publication.remoteSiteId && typeof unpublishRemoteSite === 'function') {
              await unpublishRemoteSite(target.publication.remoteSiteId);
            }
            const publication = target.publication || createDefaultPublication();
            const stamp = nowISO();
            publication.active = false;
            publication.snapshot = null;
            publication.sourceHash = null;
            publication.publishedAt = null;
            publication.revokedAt = stamp;
            target.publication = publication;
            if (state.site.id === target.site.id) state.publication = publication;
            saveNow();
            refreshView();
            toast('网页已撤销公示。');
          }
        });
        break;
      }
      case 'delete-cloud-site': {
        const siteId = actionEl.dataset.siteId;
        if (!siteId) break;
        openConfirm({
          title: '删除云端旧记录？',
          message: '<p>这条记录只在云端存在，可能是之前重复发布留下的。删除后它会从指路中消失。</p><p>操作不可撤销。</p>',
          confirmLabel: '删除云端记录',
          danger: true,
          onConfirm: async () => {
            try {
              await deleteRemoteSite(siteId);
            } catch (error) {
              toast(error.message || '删除云端记录失败。', 'error');
              return;
            }
            refreshView();
            toast('云端旧记录已删除。');
          }
        });
        break;
      }
      case 'delete-site': {
        const siteId = actionEl.dataset.siteId;
        const target = (state.sites || []).find((entry) => entry.site.id === siteId);
        if (!target) break;
        openConfirm({
          title: '删除这个网页？',
          message: `<p>会删除「${esc(target.site.title)}」的本地内容、专区和公示记录。</p><p>这个操作无法撤销；建议先导出 JSON 备份。</p>`,
          confirmLabel: '删除网页',
          danger: true,
          onConfirm: async () => {
            if (target.publication && target.publication.remoteSiteId && typeof deleteRemoteSite === 'function') {
              try {
                await deleteRemoteSite(target.publication.remoteSiteId);
              } catch (error) {
                toast(error.message || '删除云端网页失败，本地网页未删除。', 'error');
                return;
              }
            }
            if (!deleteSiteById(siteId)) {
              toast('至少要保留一个网页。', 'error');
              return;
            }
            layoutDraft = null;
            if (window.location.hash !== '#/sites') window.location.hash = '#/sites';
            refreshView();
            toast('网页已删除。');
          }
        });
        break;
      }
      case 'save-layout':
        saveLayoutEditor();
        break;
      case 'auth-tab': {
        const tab = actionEl.dataset.tab;
        document.querySelectorAll('.auth-tab').forEach((button) => button.classList.toggle('is-active', button.dataset.tab === tab));
        const loginForm = document.getElementById('auth-login-form');
        const registerForm = document.getElementById('auth-register-form');
        if (loginForm) loginForm.hidden = tab !== 'login';
        if (registerForm) registerForm.hidden = tab !== 'register';
        break;
      }
      case 'logout':
        authLogout().then(async () => {
          await switchAccountState('');
          toast('已退出登录。');
          refreshView();
        });
        break;
      case 'set-search-scope':
        state.ui.guideScope = ['site', 'owner', 'tag', 'all'].includes(actionEl.dataset.scope) ? actionEl.dataset.scope : 'all';
        updateGuideResults();
        scheduleSave();
        break;
      case 'filter-zone':
        state.ui.guideZone = actionEl.dataset.zone || 'all';
        updateGuideResults();
        break;
      case 'clear-search':
        clearSearch();
        break;
      case 'clear-filters':
        clearFilters();
        break;
      case 'toggle-demo':
        toggleDemos();
        break;
      case 'dismiss-starter':
        dismissStarterNote();
        break;
      case 'clear-starters':
        clearStarters();
        break;
      case 'add-content':
        openContentModal(null);
        break;
      case 'edit-item': {
        const item = state.site.items.find((entry) => entry.id === actionEl.dataset.id);
        if (item && item.type === 'article') {
          window.location.hash = `#/write/${encodeURIComponent(item.id)}`;
        } else if (item) {
          openContentModal(item);
        }
        break;
      }
      case 'writing-back':
        window.location.hash = '#/studio';
        break;
      case 'writing-save':
        saveWritingPage();
        break;
      case 'writing-add-chapter':
        addWritingChapter('', '');
        break;
      case 'writing-remove-chapter':
        actionEl.closest('.writing-chapter')?.remove();
        break;
      case 'writing-ai':
        document.querySelector('[data-upload="writing-ai-file"]')?.click();
        break;
      case 'writing-smart':
        smartFormatWriting();
        break;
      case 'delete-item':
        deleteItem(actionEl.dataset.id);
        break;
      case 'move-item':
        moveItem(actionEl.dataset.id, Number(actionEl.dataset.dir) || 0);
        break;
      case 'toggle-hidden':
        toggleHidden(actionEl.dataset.id);
        break;
      case 'move-zone':
        moveZone(actionEl.dataset.id, Number(actionEl.dataset.dir) || 0);
        break;
      case 'delete-zone':
        deleteZone(actionEl.dataset.id);
        break;
      case 'add-subzone':
        addSubzone(actionEl.dataset.id);
        break;
      case 'request-media-download':
        openMediaDownloadRequest(actionEl.dataset.siteId, actionEl.dataset.itemId, actionEl.dataset.title, actionEl.dataset.kind || 'video', actionEl.dataset.network === '1');
        break;
      case 'approve-media-request':
        decideMediaRequest(actionEl.dataset.id, true, actionEl.dataset.source || 'local');
        break;
      case 'deny-media-request':
        decideMediaRequest(actionEl.dataset.id, false, actionEl.dataset.source || 'local');
        break;
      case 'download-local-media':
        downloadLocalMedia(actionEl.dataset.requestId);
        break;
      case 'download-network-media':
        downloadNetworkMedia(actionEl.dataset.url, actionEl.dataset.siteId, actionEl.dataset.itemId, actionEl.dataset.filename);
        break;
      case 'set-bg-mode':
        setBackgroundMode(actionEl.dataset.mode);
        break;
      case 'clear-background-image':
        state.site.appearance = normalizeAppearance(state.site.appearance, state.site.theme);
        state.site.appearance.image = '';
        state.site.appearance.mode = 'theme';
        touchSite();
        saveNow();
        refreshView();
        toast('页面背景图已移除，恢复主题底色。');
        break;
      case 'set-site-layout':
        setSiteLayout(actionEl.dataset.columns);
        break;
      case 'set-site-density':
        setSiteDensity(actionEl.dataset.density);
        break;
      case 'set-studio-density':
        setStudioDensity(actionEl.dataset.density);
        break;
      case 'copy-site-address':
        copySiteAddress();
        break;
      case 'open-homepage':
        openHomepage();
        break;
      case 'remove-cover':
        state.site.cover = '';
        touchSite();
        saveNow();
        refreshView();
        toast('封面已移除，将使用默认纸张纹理。');
        break;
      case 'open-publish':
        openPublishModal();
        break;
      case 'confirm-publish':
        confirmPublish();
        break;
      case 'revoke-publish':
        revokePublication();
        break;
      case 'copy-public-link':
        copyPublicLink();
        break;
      case 'copy-site-link':
        copyPublicLink(actionEl.dataset.slug);
        break;
      case 'export-site':
        exportStandalone();
        break;
      case 'export-data':
        exportData();
        break;
      case 'reset-all':
        resetAll();
        break;
      case 'add-collection-entry':
        addCollectionEntry();
        break;
      case 'remove-collection-entry':
        removeCollectionEntry(actionEl);
        break;
      case 'refresh-network':
        refreshNetworkView();
        break;
      case 'refresh-visits':
        fetchNetworkVisits().then(() => refreshView());
        break;
      case 'reply-comment': {
        const block = actionEl.closest('[data-comments]');
        const form = block && block.querySelector('#comment-form');
        if (!form) break;
        form.querySelector('[name="parentId"]').value = actionEl.dataset.id;
        const target = form.querySelector('.comment-reply-target');
        if (target) {
          target.hidden = false;
          target.querySelector('[data-reply-name]').textContent = actionEl.dataset.name || '这条评论';
        }
        form.querySelector('[name="text"]').focus();
        break;
      }
      case 'cancel-comment-reply': {
        const form = actionEl.closest('#comment-form');
        if (!form) break;
        form.querySelector('[name="parentId"]').value = '';
        const target = form.querySelector('.comment-reply-target');
        if (target) target.hidden = true;
        break;
      }
      case 'set-all-download':
        setAllDownloadable(actionEl.dataset.value === '1');
        break;
      case 'set-zone-download':
        setZoneDownloadable(actionEl.dataset.zoneId, actionEl.dataset.value === '1');
        break;
      case 'add-image-part': {
        const list = document.getElementById('item-images');
        if (list) {
          list.insertAdjacentHTML('beforeend', imageRowMarkup({}));
          list.lastElementChild?.querySelector('input[type=file]')?.click();
        }
        break;
      }
      case 'remove-image-part':
        actionEl.closest('.image-part-row')?.remove();
        break;
      case 'add-episode': {
        const panel = actionEl.closest('.type-panel');
        const list = panel && panel.querySelector('.episode-list');
        if (list) {
          const groups = Array.from(list.querySelectorAll('.episode-row.is-group')).map((row) => ({ id: row.dataset.episodeId, title: row.querySelector('[name="episode-title"]')?.value || '未命名合集' }));
          list.insertAdjacentHTML('beforeend', episodeRowMarkup({}, actionEl.dataset.kind || 'video', groups));
          const input = list.lastElementChild?.querySelector('[name="episode-title"]');
          if (input) input.focus();
        }
        break;
      }
      case 'add-episode-group': {
        const panel = actionEl.closest('.type-panel');
        const list = panel && panel.querySelector('.episode-list');
        if (!list) break;
        const groups = Array.from(list.querySelectorAll('.episode-row.is-group')).map((row) => ({ id: row.dataset.episodeId, title: row.querySelector('[name="episode-title"]')?.value || '未命名合集' }));
        list.insertAdjacentHTML('beforeend', episodeRowMarkup({ group: true, id: uid('episode') }, 'video', groups));
        const input = list.lastElementChild?.querySelector('[name="episode-title"]');
        if (input) input.focus();
        break;
      }
      case 'remove-episode':
        actionEl.closest('.episode-row')?.remove();
        break;
      case 'add-article-chapter': {
        const list = document.getElementById('article-chapter-list');
        if (list) {
          list.insertAdjacentHTML('beforeend', chapterRowMarkup({}));
          const added = list.lastElementChild;
          const input = added && added.querySelector('[name="chapter-title"]');
          if (input) input.focus();
        }
        break;
      }
      case 'remove-article-chapter':
        actionEl.closest('.chapter-row')?.remove();
        break;
      default:
        break;
    }
  }

  function handleKeydown(event) {
    if (!modalRoot.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const modal = modalRoot.querySelector('.modal');
    if (!modal) return;
    const focusable = focusableInModal(modal);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------------------------- init ---------------------------- */

  async function init() {
    injectWebStyles();
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/guide');
    }
    await detectNetwork();
    if (networkOnline) {
      await restoreAuth();
      if (typeof subscribeNetworkRealtime === 'function') subscribeNetworkRealtime();
    }
    loadStateFromStorage(authUser && authUser.id ? authUser.id : '');
    if (authUser && typeof syncCloudSiteForAccount === 'function') {
      await syncCloudSiteForAccount();
    }
    try {
      await hydrateAssetUrls(state);
    } catch (error) {
      console.warn('[岸标] 本地文件载入失败。', error);
    }
    if (typeof window.ANBIAO_SITE_RUNTIME === 'function') {
      window.ANBIAO_SITE_RUNTIME();
    }
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('input', handleDocumentInput);
    document.addEventListener('change', handleDocumentChange);
    document.addEventListener('submit', handleDocumentSubmit);
    document.addEventListener('dragstart', (event) => {
      const block = event.target.closest('[data-layout-canvas] [data-layout-block-id]');
      if (!block) return;
      selectedLayoutBlockId = block.getAttribute('data-layout-block-id') || 'hero';
      block.classList.add('is-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', selectedLayoutBlockId);
      }
    });
    document.addEventListener('dragend', (event) => {
      const block = event.target.closest('[data-layout-block-id]');
      if (block) block.classList.remove('is-dragging');
    });
    document.addEventListener('dragover', (event) => {
      if (event.target.closest('[data-layout-canvas]')) event.preventDefault();
    });
    document.addEventListener('drop', layoutDrop);
    document.addEventListener('focusin', (event) => {
      const editor = event.target.closest && event.target.closest('[data-write-editor]');
      if (editor) activeWriteEditor = editor;
    });
    document.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.matches('[data-write-size]')) {
        const editor = writingEditor();
        if (!editor) return;
        editor.focus();
        try { document.execCommand('styleWithCSS', false, true); } catch (error) { /* ignore */ }
        document.execCommand('fontSize', false, target.value);
      }
      if (target.matches('[data-write-line]')) {
        const editor = writingEditor();
        if (editor) {
          editor.style.lineHeight = target.value;
          editor.querySelectorAll('p, div, li, blockquote, h1, h2, h3, h4').forEach((node) => { node.style.lineHeight = target.value; });
        }
      }
    });
    document.addEventListener('blur', handleDocumentBlur, true);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('hashchange', () => {
      closeModal({ restoreFocus: false });
      document.querySelectorAll('.web-detail-overlay').forEach((node) => node.remove());
      document.body.classList.remove('web-detail-open');
      renderRoute({ scroll: true, focus: true });
    });
    window.addEventListener('anbiao:sites-updated', () => {
      if (['guide', 'studio', 'site', 'collection', 'read', 'item'].includes(parseRoute().name)) refreshView();
    });
    window.addEventListener('beforeunload', () => {
      if (saveTimer) {
        window.clearTimeout(saveTimer);
        saveStateToStorage();
      }
      revokeAllAssetUrls();
    });
    renderRoute({ scroll: false });
    if (networkOnline) {
      refreshNetworkSites().then(() => {
        if (['guide', 'studio'].includes(parseRoute().name)) refreshView();
      });
      heartbeatNetwork();
      setTimeout(async () => {
        if (!networkOnline) return;
        await fetchOwnerNetworkRequests();
        if (state.publication.active) await fetchNetworkVisits();
        if (parseRoute().name === 'studio') refreshView();
      }, 900);
      setInterval(async () => {
        if (!networkOnline) return;
        const changed = await refreshNetworkSites();
        const focused = document.activeElement;
        const typing = focused && /INPUT|TEXTAREA|SELECT/.test(focused.tagName);
        if (changed && parseRoute().name === 'guide' && !typing) renderRoute({ scroll: false });
        if (state.publication.active) {
          const before = networkOwnerRequests.filter((request) => request.status === 'pending').length;
          await fetchOwnerNetworkRequests();
          await fetchNetworkVisits();
          const after = networkOwnerRequests.filter((request) => request.status === 'pending').length;
          if (after !== before && parseRoute().name === 'studio' && !typing) refreshView();
        }
      }, 15000);
      setInterval(heartbeatNetwork, 25000);
      setInterval(async () => {
        if (parseRoute().name !== 'site') return;
        const gates = Array.from(document.querySelectorAll('[data-download-gate][data-network="1"]'));
        if (!gates.length) return;
        let changed = false;
        for (const gate of gates) {
          const before = getNetworkDownloadRecord(gate.dataset.siteId, gate.dataset.itemId);
          const after = await refreshNetworkDownloadRecord(gate.dataset.siteId, gate.dataset.itemId);
          if (before && after && (before.status !== after.status || before.downloadUrl !== after.downloadUrl)) changed = true;
        }
        if (changed) refreshView();
      }, 7000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
