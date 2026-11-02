/* ============================================================
   岸标 — view templates
   ============================================================ */

/* ------------------------------ public web ------------------------------ */

function renderCoverFrame(payload) {
  const cover = safeMediaSrc(payload.cover);
  if (cover) {
    return `<img class="web-cover" src="${attr(cover)}" alt="${attr(payload.title)} 的封面">`;
  }
  return `<div class="web-cover-fallback" aria-hidden="true">${ICONS.mark}</div>`;
}

function renderParagraphs(text) {
  return String(text || '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${esc(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function videoDirectSource(url) {
  const clean = String(url || '').split('?')[0].toLowerCase();
  return /\.(mp4|webm|ogv|ogg|mov)$/.test(clean);
}

function videoEmbedMarkup(item) {
  const localUrl = item.assetId ? assetUrl(item.assetId) : '';
  const serverMedia = /^\/api\/media\//.test(String(item.url || ''));
  const url = itemMediaUrl(item);
  const poster = safeMediaSrc(item.cover);
  if (!url) {
    return `<div class="web-video-fallback"><span class="play">${ICONS.video}</span><span>${item.assetId ? '视频还没有载入，刷新页面后再试。' : '这段视频暂时没有可用链接'}</span></div>`;
  }
  if (localUrl || serverMedia || videoDirectSource(url)) {
    const noDownload = item.downloadable ? '' : ' controlsList="nodownload"';
    return `<div class="web-video"><video controls${noDownload} disablePictureInPicture preload="metadata" playsinline${poster ? ` poster="${attr(poster)}"` : ''} src="${attr(url)}"></video></div>`;
  }
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  if (youtube) {
    return `<div class="web-video"><iframe src="https://www.youtube-nocookie.com/embed/${attr(youtube[1])}" title="${attr(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  const bilibili = url.match(/bilibili\.com\/video\/(BV[A-Za-z0-9]+|av\d+)/i);
  if (bilibili) {
    const id = bilibili[1];
    const query = id.toLowerCase().startsWith('bv') ? `bvid=${encodeURIComponent(id)}` : `aid=${encodeURIComponent(id.slice(2))}`;
    return `<div class="web-video"><iframe src="https://player.bilibili.com/player.html?${query}&page=1&autoplay=0" title="${attr(item.title)}" loading="lazy" allowfullscreen></iframe></div>`;
  }
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo) {
    return `<div class="web-video"><iframe src="https://player.vimeo.com/video/${attr(vimeo[1])}" title="${attr(item.title)}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  }
  return `<div class="web-video-fallback">
    <span class="play">${ICONS.video}</span>
    <span>这是一个外部视频链接</span>
    <a href="${attr(url)}" target="_blank" rel="noopener noreferrer">在新窗口打开 ${esc(getHostLabel(url))} ↗</a>
  </div>`;
}

function mediaMetaMarkup(item, options = {}) {
  const name = item.filename || getHostLabel(item.url) || '本地媒体';
  const pieces = [fileKindLabel(item.mime, item.filename), item.size ? formatBytes(item.size) : ''].filter(Boolean);
  const url = itemMediaUrl(item);
  return `<div class="web-media-meta">
    <span class="web-file-name">${esc(name)}</span>
    <span>${esc(pieces.join(' · '))}</span>
    ${url && options.download !== false ? `<a href="${attr(url)}" download="${attr(name)}" rel="noopener">下载 ${ICONS.download}</a>` : ''}
  </div>`;
}

function audioMarkup(item) {
  const url = itemMediaUrl(item);
  if (!url) {
    return `<div class="web-video-fallback"><span class="play">${ICONS.audio}</span><span>${item.assetId ? '本地音频还没有载入，刷新页面后再试。' : '这段音频暂时没有可用链接'}</span></div>`;
  }
  return `<div class="web-audio-card">
    <div class="web-audio-head"><span class="web-file-icon">${ICONS.audio}</span><div><strong>${esc(item.title)}</strong><span>${esc(item.filename || getHostLabel(item.url) || '音频')}</span></div></div>
    <audio controls${item.downloadable ? '' : ' controlsList="nodownload"'} preload="metadata" src="${attr(url)}"></audio>
    ${mediaMetaMarkup(item, { download: Boolean(item.downloadable) })}
  </div>`;
}

function fileMarkup(item) {
  const url = itemMediaUrl(item);
  const kind = fileKindLabel(item.mime, item.filename);
  const name = item.filename || item.title || getHostLabel(item.url) || '文件';
  if (!url) {
    return `<div class="web-file-card web-file-card--missing">
      <span class="web-file-icon">${ICONS.file}</span>
      <div><strong>${esc(name)}</strong><span>${item.assetId ? '本地文件还没有载入，刷新页面后再试。' : '这个文件暂时没有可用地址。'}</span></div>
    </div>`;
  }
  if (kind === '音频') {
    return `<div class="web-audio-card">
      <div class="web-audio-head"><span class="web-file-icon">${ICONS.audio}</span><div><strong>${esc(item.title)}</strong><span>${esc(name)}</span></div></div>
      <audio controls preload="metadata" src="${attr(url)}"></audio>
      ${mediaMetaMarkup(item)}
    </div>`;
  }
  if (kind === '视频') {
    return `<div>${videoEmbedMarkup({ ...item, url })}${mediaMetaMarkup(item)}</div>`;
  }
  if (kind === '图片') {
    return `<figure class="web-figure">
      <img src="${attr(url)}" alt="${attr(item.title || name)}" loading="lazy">
      <figcaption><strong>${esc(item.title)}</strong><span>${esc(name)}</span></figcaption>
    </figure>`;
  }
  return `<a class="web-file-card" href="${attr(url)}"${kind === 'PDF' ? ' target="_blank"' : ''} download="${attr(name)}" rel="noopener">
    <span class="web-file-icon">${ICONS.file}</span>
    <div>
      <span class="web-link-domain">${esc(kind)}${item.size ? ` · ${esc(formatBytes(item.size))}` : ''}</span>
      <strong>${esc(name)}</strong>
      ${item.desc ? `<p>${esc(item.desc)}</p>` : ''}
    </div>
    <span class="web-link-arrow" aria-hidden="true">↓</span>
  </a>`;
}

function mediaLockNoteMarkup(item) {
  return item.downloadable ? '' : `<div class="web-download-note">主人没有开放这份媒体的下载；可以在线播放或阅读。</div>`;
}

function itemDetailHref(item, payload) {
  if (payload.__standalone) return '';
  return `#/item/${encodeURIComponent(payload.slug || '')}/${encodeURIComponent(item.id)}${payload.__preview ? '?preview=1' : ''}`;
}

function itemDetailLinkMarkup(item, payload, label = '查看详情与评论') {
  const href = itemDetailHref(item, payload);
  return href ? `<a class="web-entry-open" href="${attr(href)}">${esc(label)} <span aria-hidden="true">→</span></a>` : '';
}

function mediaDownloadGateMarkup(item, payload, kind = 'video') {
  if (!payload.siteId || !item.assetId) return '';
  const label = kind === 'audio' ? '音频' : '视频';
  if (payload.__standalone) {
    return `<div class="web-download-gate"><div class="web-download-copy"><span class="web-download-label">${ICONS.lock} 受控下载</span><p>这个${label}不直接提供下载。请回到岸标站内主页，向主人逐次申请。</p></div></div>`;
  }
  const isNetwork = Boolean(payload.__network);
  const latest = isNetwork ? getNetworkDownloadRecord(payload.siteId, item.id) : latestDownloadRequest(payload.siteId, item.id);
  const status = latest ? latest.status : '';
  const pending = status === 'pending';
  const approved = status === 'approved';
  const downloaded = status === 'downloaded';
  const denied = status === 'denied';
  let statusText = `${label}下载需经主页主人同意；每次下载都要单独申请。`;
  let button = `<button type="button" class="web-download-btn" data-action="request-media-download" data-kind="${attr(kind)}" data-site-id="${attr(payload.siteId)}" data-item-id="${attr(item.id)}" data-title="${attr(item.title)}"${isNetwork ? ' data-network="1"' : ''}>申请下载</button>`;
  if (pending) {
    statusText = '下载申请已发送，等待主页主人处理。';
    button = '<span class="web-download-wait">等待处理</span>';
  } else if (approved) {
    statusText = '主人已同意这次下载。链接仅可下载一次。';
    button = isNetwork && latest.downloadUrl
      ? `<button type="button" class="web-download-btn" data-action="download-network-media" data-url="${attr(latest.downloadUrl)}" data-site-id="${attr(payload.siteId)}" data-item-id="${attr(item.id)}" data-filename="${attr(item.filename || '')}">下载${label}（一次）</button>`
      : `<button type="button" class="web-download-btn" data-action="download-local-media" data-request-id="${attr(latest.id)}">下载${label}（一次）</button>`;
  } else if (downloaded) {
    statusText = '这次下载已完成。再次下载需要重新申请。';
    button = `<button type="button" class="web-download-btn" data-action="request-media-download" data-kind="${attr(kind)}" data-site-id="${attr(payload.siteId)}" data-item-id="${attr(item.id)}" data-title="${attr(item.title)}"${isNetwork ? ' data-network="1"' : ''}>重新申请</button>`;
  } else if (denied) {
    statusText = '这次下载申请未获同意。可以重新申请，或直接联系主人。';
    button = `<button type="button" class="web-download-btn" data-action="request-media-download" data-kind="${attr(kind)}" data-site-id="${attr(payload.siteId)}" data-item-id="${attr(item.id)}" data-title="${attr(item.title)}"${isNetwork ? ' data-network="1"' : ''}>重新申请</button>`;
  }
  return `<div class="web-download-gate" data-download-gate data-site-id="${attr(payload.siteId)}" data-item-id="${attr(item.id)}" data-title="${attr(item.title)}"${isNetwork ? ' data-network="1"' : ''}>
    <div class="web-download-copy">
      <span class="web-download-label">${ICONS.lock} 受控下载</span>
      <p>${esc(statusText)}</p>
    </div>
    ${button}
  </div>`;
}

function entrySearchText(item, zoneName) {
  const pieces = [
    item.title,
    zoneName,
    itemTypeLabel(item.type),
    item.excerpt,
    item.desc,
    item.content,
    item.source,
    item.caption,
    item.filename,
    item.mime,
    item.url,
    ...(Array.isArray(item.entries) ? item.entries.flatMap((entry) => [entry.title, entry.note, entry.url]) : [])
  ];
  return normalizeSpace(pieces.filter(Boolean).join(' ')).toLowerCase();
}

function renderPublicItem(item, payload, zoneName = '', previewHidden = false) {
  const type = item.type;
  const previewAttr = previewHidden ? ' data-preview-hidden="true" data-preview-extra="true"' : '';
  const dataSearch = `data-entry-search="${attr(entrySearchText(item, zoneName))}"`;
  const head = (label) => `<div class="web-entry-head"><span class="web-entry-type">${esc(label)}</span><time>${esc(formatDate(item.createdAt))}</time></div>`;

  if (type === 'article') {
    const cover = safeMediaSrc(item.cover);
    const chapters = Array.isArray(item.chapters) ? item.chapters : [];
    const hasContent = Boolean(item.body || chapters.length);
    const readHref = `#/read/${encodeURIComponent(payload.slug || '')}/${encodeURIComponent(item.id)}${payload.__preview ? '?preview=1' : ''}`;
    const readAction = payload.__standalone
      ? `<button type="button" class="web-entry-open" data-open-content data-content-kind="article">阅读全文 <span aria-hidden="true">→</span></button>`
      : `<a class="web-entry-open" href="${attr(readHref)}">阅读全文${chapters.length ? ` · ${chapters.length} 章` : ''} <span aria-hidden="true">→</span></a>`;
    return `<article class="web-entry entry-article" ${dataSearch}${previewAttr}>
      ${head('文章')}
      <h3>${payload.__standalone ? esc(item.title) : `<a class="web-entry-title-link" href="${attr(readHref)}">${esc(item.title)}</a>`}</h3>
      ${item.excerpt ? `<p class="web-entry-lead">${esc(item.excerpt)}</p>` : ''}
      ${cover ? `<figure class="web-figure web-image-openable" style="margin-top:20px" data-open-content data-content-kind="image" tabindex="0" role="button" aria-label="查看大图：${attr(item.title)}"><img src="${attr(cover)}" alt="${attr(item.title)}" loading="lazy"></figure>` : ''}
      ${chapters.length ? `<div class="web-chapter-line">${chapters.length} 个章节 · 进入阅读页选择章节</div>` : ''}
      ${item.body ? `<div class="web-prose web-entry-detail">${renderParagraphs(item.body)}</div>` : ''}
      ${payload.__standalone && chapters.length ? `<div class="web-prose web-entry-detail">${chapters.map((chapter, index) => `<h4>${String(index + 1).padStart(2, '0')} · ${esc(chapter.title || '未命名章节')}</h4>${renderParagraphs(chapter.body)}`).join('')}</div>` : ''}
      ${hasContent ? readAction : ''}
    </article>`;
  }

  if (type === 'image') {
    const src = safeMediaSrc(item.src) || safeMediaSrc((item.images || []).find((image) => image.src)?.src) || builtinCoverFor(payload.theme);
    const extra = Array.isArray(item.images) ? item.images.filter((image) => image.src).length : 0;
    return `<article class="web-entry image-entry" ${dataSearch}${previewAttr}>
      <figure class="web-figure web-image-openable" data-open-content data-content-kind="image" tabindex="0" role="button" aria-label="查看大图：${attr(item.title || '图片内容')}">
        <img src="${attr(src)}" alt="${attr(item.title || item.caption || '图片内容')}" loading="lazy">
        <figcaption>
          <strong>${esc(item.title)}</strong>
          <span>${esc(item.caption || '')}${extra ? ` · 另 ${extra} 张` : ''}</span>
        </figcaption>
      </figure>
      ${itemDetailLinkMarkup(item, payload, '查看图集与详情')}
    </article>`;
  }

  if (type === 'collection') {
    const entries = Array.isArray(item.entries) ? item.entries : [];
    return `<article class="web-entry" ${dataSearch}${previewAttr}>
      ${head('合集')}
      <div class="web-collection">
        <h3>${esc(item.title)}</h3>
        ${item.desc ? `<p class="web-collection-desc">${esc(item.desc)}</p>` : ''}
        <ol>
          ${entries.map((entry, index) => {
            const href = safeHref(entry.url);
            return `<li>
              <span class="coll-no">${String(index + 1).padStart(2, '0')}</span>
              <div>
                <div class="coll-title">${href ? `<a href="${attr(href)}" target="_blank" rel="noopener noreferrer">${esc(entry.title || getHostLabel(href))}</a>` : esc(entry.title || '未命名条目')}</div>
                ${entry.note ? `<p class="coll-note">${esc(entry.note)}</p>` : ''}
              </div>
              ${href ? `<a class="coll-arrow" href="${attr(href)}" target="_blank" rel="noopener noreferrer" aria-label="打开 ${attr(entry.title || '链接')}">↗</a>` : '<span></span>'}
            </li>`;
          }).join('')}
        </ol>
      </div>
    </article>`;
  }

  if (type === 'video') {
    return `<article class="web-entry" ${dataSearch}${previewAttr}>
      ${head('视频')}
      <h3>${esc(item.title)}</h3>
      ${item.desc ? `<p class="web-entry-lead">${esc(item.desc)}</p>` : ''}
      <div style="margin-top:20px">${videoEmbedMarkup(item)}</div>
      ${item.assetId ? mediaMetaMarkup(item, { download: Boolean(item.downloadable) }) : ''}
      ${mediaLockNoteMarkup(item)}
      ${itemDetailLinkMarkup(item, payload)}
    </article>`;
  }

  if (type === 'audio') {
    return `<article class="web-entry" ${dataSearch}${previewAttr}>
      ${head('音频')}
      <h3>${esc(item.title)}</h3>
      ${item.desc ? `<p class="web-entry-lead">${esc(item.desc)}</p>` : ''}
      <div style="margin-top:20px">${audioMarkup(item)}</div>
      ${mediaLockNoteMarkup(item)}
      ${itemDetailLinkMarkup(item, payload)}
    </article>`;
  }

  if (type === 'file') {
    return `<article class="web-entry" ${dataSearch}${previewAttr}>
      ${head('文件')}
      <div class="web-file-entry">
        ${fileMarkup(item)}
      </div>
      ${itemDetailLinkMarkup(item, payload)}
    </article>`;
  }

  if (type === 'link') {
    const href = safeHref(item.url);
    const inner = `
      <div>
        <span class="web-link-domain">${esc(getHostLabel(item.url))}</span>
        <h3>${esc(item.title)}</h3>
        ${item.desc ? `<p>${esc(item.desc)}</p>` : ''}
      </div>
      <span class="web-link-arrow" aria-hidden="true">↗</span>`;
    return `<article class="web-entry" ${dataSearch}${previewAttr}>
      ${head('链接')}
      ${href
        ? `<a class="web-link-card" href="${attr(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`
        : `<div class="web-link-card">${inner}</div>`}
    </article>`;
  }

  if (type === 'note') {
    return `<article class="web-entry" ${dataSearch}${previewAttr}>
      ${head('短句')}
      <blockquote class="web-note">
        <p>${esc(item.content || '')}</p>
        <footer>${esc(item.source || item.title)}</footer>
      </blockquote>
    </article>`;
  }

  return '';
}

function attachZoneItems(nodes, items, parentPath = '') {
  return (nodes || []).map((node) => {
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
    return {
      ...node,
      path,
      items: items.filter((item) => item.zoneId === node.id),
      children: attachZoneItems(node.children, items, path)
    };
  });
}

function zoneTotalEntries(node) {
  return (node.items ? node.items.length : 0) +
    (node.children ? node.children.reduce((sum, child) => sum + zoneTotalEntries(child), 0) : 0);
}

function renderZoneDirectItems(node, payload) {
  const zonePath = node.path || node.name;
  const previewItems = node.items.slice(0, 2);
  const remaining = node.items.slice(2);
  return `${previewItems.map((item) => renderPublicItem(item, payload, zonePath, false)).join('')}
    ${remaining.map((item) => renderPublicItem(item, payload, zonePath, true)).join('')}
    ${remaining.length ? `<button type="button" class="web-zone-more" data-zone-expand data-more-label="查看剩下 ${remaining.length} 篇内容" data-less-label="收起预览" aria-expanded="false">查看剩下 ${remaining.length} 篇内容 <span aria-hidden="true">↓</span></button>` : ''}`;
}

function renderNestedZone(node, payload) {
  const total = zoneTotalEntries(node);
  if (!total) return '';
  const panelId = `web-subzone-content-${node.id}`;
  return `<section class="web-subzone" data-zone-block data-zone-id="${attr(node.id)}">
    <header class="web-subzone-head" data-zone-expand-area style="--zone-color:${attr(node.color || DEFAULT_ZONE_COLOR)}">
      <span class="web-folder-mark" aria-hidden="true">${ICONS.folder}</span>
      <div class="web-subzone-copy">
        <div class="web-subzone-titleline">
          <h3>${esc(node.name)}</h3>
          <span class="web-zone-count">${total} 块内容</span>
          <button type="button" class="web-zone-toggle" data-zone-toggle aria-expanded="true" aria-controls="${attr(panelId)}" aria-label="收起或展开 ${attr(node.name)}"><span aria-hidden="true">−</span></button>
        </div>
        ${node.desc ? `<p>${esc(node.desc)}</p>` : ''}
        ${node.items.length > 2 ? '<span class="web-zone-expand-hint">点击专区展开或收起预览</span>' : ''}
      </div>
    </header>
    <div class="web-subzone-content" id="${attr(panelId)}" data-zone-panel>
      ${renderZoneDirectItems(node, payload)}
      ${node.children.map((child) => renderNestedZone(child, payload)).join('')}
    </div>
  </section>`;
}

function renderTopZone(node, index, payload) {
  const total = zoneTotalEntries(node);
  if (!total) return '';
  const panelId = `web-zone-content-${index}`;
  return `<section class="web-zone-section" id="web-zone-${index}" data-zone-block data-zone-id="${attr(node.id)}">
    <header class="web-zone-head" data-zone-expand-area style="--zone-color:${attr(node.color || DEFAULT_ZONE_COLOR)}">
      <span class="web-zone-index">ZONE / ${String(index + 1).padStart(2, '0')}</span>
      <h2 class="web-zone-title">${esc(node.name)}</h2>
      ${node.desc ? `<p class="web-zone-desc">${esc(node.desc)}</p>` : ''}
      <span class="web-zone-count">${total} 块内容${node.children.length ? ` · ${node.children.length} 个子专区` : ''}</span>
      ${node.items.length > 2 ? '<span class="web-zone-expand-hint">点击专区展开或收起预览</span>' : ''}
      <button type="button" class="web-zone-toggle" data-zone-toggle aria-expanded="true" aria-controls="${attr(panelId)}" aria-label="收起或展开 ${attr(node.name)}"><span aria-hidden="true">−</span></button>
    </header>
    <div class="web-zone-content" id="${attr(panelId)}" data-zone-panel>
      ${renderZoneDirectItems(node, payload)}
      ${node.children.map((child) => renderNestedZone(child, payload)).join('')}
    </div>
  </section>`;
}

function siteCollections(payload) {
  const tree = buildZoneTree(payload.zones || []);
  const withItems = attachZoneItems(tree, payload.items || []);
  return flattenZoneTree(withItems).map((entry) => ({
    zone: entry.zone,
    depth: entry.depth,
    count: zoneTotalEntries(entry.zone),
    cover: firstCollectionCover(entry.zone.cover, entry.zone.items)
  }));
}

function firstCollectionCover(explicit, items) {
  const direct = safeMediaSrc(explicit);
  if (direct) return direct;
  for (const item of items || []) {
    const src = safeMediaSrc(item.cover) || safeMediaSrc(item.src) || safeMediaSrc((item.images || []).find((image) => image.src)?.src);
    if (src) return src;
  }
  return builtinCoverFor('paper');
}

function collectionHref(payload, zoneId) {
  return `#/collection/${encodeURIComponent(payload.slug || '')}/${encodeURIComponent(zoneId)}${payload.__preview ? '?preview=1' : ''}`;
}

function renderCollectionCards(payload) {
  const layout = normalizeLayout(payload.layout);
  const order = new Map(layout.collectionOrder.map((id, index) => [id, index]));
  const collections = siteCollections(payload)
    .filter((entry) => entry.count > 0)
    .sort((a, b) => {
      const aIndex = order.has(a.zone.id) ? order.get(a.zone.id) : 999;
      const bIndex = order.has(b.zone.id) ? order.get(b.zone.id) : 999;
      return aIndex - bIndex;
    });
  if (!collections.length) return `<div class="web-empty">这座 web 还没有公开合集。主人可以在工作台里添加内容。</div>`;
  return `<div class="web-collection-grid">${collections.map(({ zone, count, cover, depth }) => `<a class="web-collection-card${depth ? ' is-child' : ''}" href="${attr(collectionHref(payload, zone.id))}" data-entry-search="${attr([zone.name, zone.desc, ...(zone.items || []).map((item) => item.title)].join(' '))}">
    <div class="web-collection-cover"><img src="${attr(cover)}" alt="${attr(zone.name)}" loading="lazy"><span>${String(count).padStart(2, '0')}</span></div>
    <div class="web-collection-copy">
      <span class="web-collection-kicker">${depth ? 'SUB COLLECTION' : 'COLLECTION'}</span>
      <h2>${esc(zone.name)}</h2>
      ${zone.desc ? `<p>${esc(zone.desc)}</p>` : '<p class="web-collection-empty">这个合集还没有说明。</p>'}
      <span class="web-collection-count">查看 ${count} 项内容 →</span>
    </div>
  </a>`).join('')}</div>`;
}

function renderSiteBrowseBar(layout) {
  const safe = normalizeLayout(layout);
  return `<div class="web-browse">
    <div class="web-browse-inner web-shell">
      <label class="web-search-field">
        <span class="sr-only">在这个主页里搜索内容</span>
        ${ICONS.search}
        <input class="web-search-input" type="search" placeholder="在这个主页里搜索合集标题" autocomplete="off">
        <button type="button" class="web-search-clear" data-web-search-clear hidden>清空</button>
      </label>
      <div class="web-view-controls">
        <div class="web-seg" role="group" aria-label="分栏">
          <button type="button" data-web-layout="1" class="${safe.columns === 1 ? 'is-active' : ''}" aria-pressed="${safe.columns === 1}">单栏</button>
          <button type="button" data-web-layout="2" class="${safe.columns === 2 ? 'is-active' : ''}" aria-pressed="${safe.columns === 2}">双栏</button>
        </div>
        <div class="web-seg" role="group" aria-label="内容大小">
          <button type="button" data-web-size="compact" class="${safe.density === 'compact' ? 'is-active' : ''}" aria-pressed="${safe.density === 'compact'}">小</button>
          <button type="button" data-web-size="standard" class="${safe.density === 'standard' ? 'is-active' : ''}" aria-pressed="${safe.density === 'standard'}">中</button>
          <button type="button" data-web-size="large" class="${safe.density === 'large' ? 'is-active' : ''}" aria-pressed="${safe.density === 'large'}">大</button>
        </div>
      </div>
      <p class="web-search-status" aria-live="polite"></p>
    </div>
  </div>`;
}

function renderWebSite(payload, options = {}) {
  const safe = payload || buildPublicPayload(state.site);
  const zones = Array.isArray(safe.zones) ? safe.zones : [];
  const items = Array.isArray(safe.items) ? safe.items : [];
  const tree = attachZoneItems(buildZoneTree(zones), items);
  const visibleRoots = tree.filter((node) => zoneTotalEntries(node) > 0);
  const layout = normalizeLayout(safe.layout);
  const appearance = normalizeAppearance(safe.appearance, safe.theme);
  const background = appearancePresentation(appearance, safe.theme);

  const totalItems = items.length;
  const tagline = trimText(safe.tagline, 100);
  const intro = trimText(safe.intro, 300);
  const owner = trimText(safe.owner, 40) || '未署名';
  const title = trimText(safe.title, 60) || '未命名 web';
  const publishedLabel = safe.publishedAt
    ? `公示于 ${formatDate(safe.publishedAt)}`
    : options.standalone
      ? '个人 web'
      : '本地草稿';
  const styleAttr = background.style ? ` style="${attr(background.style)}"` : '';
  const collectionCount = siteCollections(safe).filter((entry) => entry.count > 0).length;
  const heroHtml = `<header class="web-hero web-shell">
      <div class="web-hero-copy">
        <div class="web-kicker">PERSONAL WEB / ${esc(String(safe.slug || 'draft').toUpperCase())}</div>
        <h1 class="web-title">${esc(title)}</h1>
        ${tagline ? `<p class="web-tagline">${esc(tagline)}</p>` : ''}
        ${intro ? `<p class="web-intro">${esc(intro)}</p>` : ''}
        <div class="web-hero-meta">
          <span class="web-owner">${esc(owner)}</span>
          ${(safe.tags || []).slice(0, 6).map((tag) => `<span class="web-tag">${esc(tag)}</span>`).join('')}
          <span>${collectionCount} 个合集</span>
          <span>${publishedLabel}</span>
        </div>
      </div>
      <figure class="web-cover-frame web-image-openable" data-open-content data-content-kind="image" tabindex="0" role="button" aria-label="查看大图：${attr(title)} 封面">
        ${renderCoverFrame(safe)}
        <figcaption class="web-cover-caption">
          <span>COVER / ${esc(owner)}</span>
          <span>${String(totalItems).padStart(2, '0')} ENTRIES</span>
        </figcaption>
      </figure>
    </header>`;
  const browseHtml = totalItems ? renderSiteBrowseBar(layout) : '';
  const bodyHtml = `${safe.__standalone ? (visibleRoots.length ? `<nav class="web-zone-nav" aria-label="按专区浏览">
      <div class="web-zone-nav-inner web-shell">
        <span class="web-zone-nav-label">ZONES / 专区</span>
        ${visibleRoots.map((node, index) => `<a class="web-zone-link" href="#web-zone-${index}" data-web-zone="${index}"><i>${String(index + 1).padStart(2, '0')}</i>${esc(node.name)}<span class="web-zone-nav-count">${zoneTotalEntries(node)}</span></a>`).join('')}
      </div>
    </nav>` : '') : ''}
    <div class="web-body web-shell">
      ${safe.__standalone
        ? (visibleRoots.length ? visibleRoots.map((node, index) => renderTopZone(node, index, safe)).join('') : `<div class="web-empty">这座 web 还没有公开内容。主人可以在工作台里添加第一块内容。</div>`)
        : renderCollectionCards(safe)}
      <div class="web-search-empty" hidden>没有找到匹配的合集。试试其他关键词，或清空搜索。</div>
    </div>`;
  const sectionHtml = { hero: heroHtml, browse: browseHtml, body: bodyHtml };
  const orderedBlocks = layout.blocks
    .slice()
    .sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const layoutGrid = `<div class="web-layout-grid">${orderedBlocks.map((block) => `<div class="web-layout-block web-layout-block--${attr(block.id)}" style="grid-column:${block.x + 1} / span ${block.w};grid-row:${block.y + 1} / span ${block.h}">${sectionHtml[block.id] || ''}</div>`).join('')}</div>`;

  return `<div class="web-site ${themeClass(safe.theme)} ${background.className}"${styleAttr} data-web-site data-view-columns="${layout.columns}" data-view-density="${attr(layout.density)}" data-hero-style="${attr(layout.heroStyle)}">
    <div class="web-topbar web-shell">
      <div class="web-identity"><span class="web-identity-dot" aria-hidden="true"></span>${esc(owner)} 的个人 web</div>
      <div class="web-topmeta">
        <span>${collectionCount} 个合集</span>
        <span>${totalItems} 块内容</span>
        <span>${esc(publishedLabel)}</span>
      </div>
    </div>

    ${layoutGrid}

    <footer class="web-site-footer">
      <div class="web-site-footer-inner web-shell">
        <div>
          <strong>${esc(title)} · ${esc(owner)}</strong>
          一个由主人自己设计和维护的个人 web。
        </div>
        <div class="web-made-by">
          <span>岸标 ANBIAO</span>
          只提供设计、存储与指路<br>没有推荐算法 · 只按合集被找到
        </div>
      </div>
    </footer>
  </div>`;
}

function resolveExportPayload(payload) {
  const builtins = window.ANBIAO_BUILTINS || {};
  const resolve = (src) => (src && builtins[src] ? builtins[src] : src);
  const copy = JSON.parse(JSON.stringify(payload));
  copy.cover = resolve(copy.cover);
  if (copy.appearance) copy.appearance.image = resolve(copy.appearance.image);
  copy.items = (copy.items || []).map((item) => ({
    ...item,
    cover: resolve(item.cover),
    src: resolve(item.src)
  }));
  return copy;
}

function buildStandaloneHTML(payload) {
  const safe = resolveExportPayload(payload);
  safe.__standalone = true;
  const css = window.ANBIAO_WEB_CSS || '';
  const runtime = typeof window.ANBIAO_SITE_RUNTIME === 'function'
    ? `(${window.ANBIAO_SITE_RUNTIME.toString()})();`
    : '';
  const title = trimText(safe.title, 60) || '我的 web';
  const description = trimText(safe.tagline || safe.intro, 160);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${attr(description)}">
  <meta name="generator" content="岸标 ANBIAO ${APP_VERSION}">
  <title>${esc(title)} · ${esc(safe.owner)}</title>
  <style>
    html { scroll-behavior: smooth; }
    html, body { margin: 0; padding: 0; background: ${themeBackground(safe.theme)}; }
    .web-zone-section { scroll-margin-top: 84px; }
    ${css}
  </style>
</head>
<body>
${renderWebSite(safe, { standalone: true })}
${runtime ? `<script>${runtime}</script>` : ''}
</body>
</html>`;
}

/* ------------------------------ guide / directory ------------------------------ */

function renderHeroMap() {
  return `<aside class="hero-map" aria-hidden="true">
    <div class="map-disc">
      <svg class="map-svg" viewBox="0 0 400 400" focusable="false">
        <circle cx="200" cy="200" r="193" fill="none" stroke="currentColor" opacity=".18"/>
        <circle cx="200" cy="200" r="156" fill="none" stroke="currentColor" opacity=".1" stroke-dasharray="2 5"/>
        <path d="M82 316C124 256 137 233 197 216S284 166 321 94" fill="none" stroke="#c05334" stroke-width="1.6" stroke-dasharray="3 6" opacity=".85"/>
        <circle cx="82" cy="316" r="4" fill="#c05334"/>
        <circle cx="197" cy="216" r="3.5" fill="#1c2b24"/>
        <circle cx="321" cy="94" r="4" fill="#c05334"/>
        <path d="M200 18v16M200 366v16M18 200h16M366 200h16M71 71l11 11M318 318l11 11M329 71l-11 11M82 318l-11 11" stroke="currentColor" stroke-width="1.2" opacity=".35"/>
        <text x="200" y="44" text-anchor="middle" fill="currentColor" font-family="Georgia, serif" font-size="10" letter-spacing="3" opacity=".55">N</text>
      </svg>
      <span class="map-node map-node--a">写作</span>
      <span class="map-node map-node--b">影像</span>
      <span class="map-node map-node--c">收藏</span>
      <span class="map-node map-node--d">链接</span>
      <span class="map-center"><span>岸标<small>ANBIAO</small></span></span>
      <span class="map-stamp"><span><strong>已获同意</strong>CONSENTED</span></span>
    </div>
    <div class="map-caption">
      <span>MAP OF CONSENT / 只标出被允许的位置</span>
      <span>NO. 001</span>
    </div>
  </aside>`;
}

function renderZoneChips(entries, activeZone) {
  const zones = directoryZones(entries);
  const validActive = activeZone !== 'all' && zones.some((zone) => zone.name === activeZone) ? activeZone : 'all';
  return `<button type="button" class="zone-chip${validActive === 'all' ? ' is-active' : ''}" data-action="filter-zone" data-zone="all" aria-pressed="${validActive === 'all'}">全部专区 <span>${entries.length}</span></button>
    ${zones.map((zone) => `<button type="button" class="zone-chip${validActive === zone.name ? ' is-active' : ''}" data-action="filter-zone" data-zone="${attr(zone.name)}" aria-pressed="${validActive === zone.name}">${esc(zone.name)} <span>${zone.count}</span></button>`).join('')}`;
}

function renderSiteCard(entry, index, tokens) {
  const snapshot = entry.snapshot;
  const cover = safeMediaSrc(snapshot.cover) || builtinCoverFor(snapshot.theme);
  const zones = Array.isArray(snapshot.zones) ? snapshot.zones : [];
  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  const href = `#/site/${encodeURIComponent(snapshot.slug)}`;
  return `<article class="site-card" style="--i:${Math.min(index, 8)}">
    <a class="site-card-cover" href="${attr(href)}" aria-label="进入 ${attr(snapshot.title)}">
      <img src="${attr(cover)}" alt="${attr(snapshot.title)} 的封面" loading="lazy">
      <span class="card-index">${String(index + 1).padStart(2, '0')} / SITE</span>
      <span class="card-badges">
        ${entry.online ? '<span class="badge badge--online">在线</span>' : ''}
        ${entry.isMine ? '<span class="badge badge--mine">我的 web</span>' : ''}
        ${entry.isDemo ? '<span class="badge badge--demo">平台示例</span>' : ''}
      </span>
    </a>
    <div class="site-card-body">
      <div class="card-topline">
        <span>${highlightText(snapshot.owner, tokens)}</span>
        <span class="consent-mark">${entry.isDemo ? '示例内容' : '✓ 已同意公示'}</span>
      </div>
      <h3><a href="${attr(href)}">${highlightText(snapshot.title, tokens)}</a></h3>
      <p class="site-card-owner">${zones.length} 个专区 · ${items.length} 块内容</p>
      ${snapshot.tagline ? `<p class="site-card-tagline">${highlightText(snapshot.tagline, tokens)}</p>` : ''}
      <div class="card-tags">
        ${(snapshot.tags || []).slice(0, 6).map((tag) => `<span class="card-tag">${highlightText(tag, tokens)}</span>`).join('')}
      </div>
      <div class="card-foot">
        <span>公示于 ${esc(formatDate(entry.publishedAt))}</span>
        <span>进入 <span class="arrow">→</span></span>
      </div>
    </div>
  </article>`;
}

function renderGuideEmpty(hasAny, query, zone) {
  if (!hasAny) {
    return `<div class="empty-state">
      <img src="assets/mark.svg" alt="" width="42" height="42">
      <h3>还没有站点被指路</h3>
      <p>指路区只会出现经主人同意公示的 web。你可以先搭好自己的那一座，再决定是否让它出现在这里。</p>
      <div class="empty-actions">
        <a class="btn btn--primary" href="#/studio">去搭我的 Web</a>
        ${DEMO_SITES.length && !state.settings.showDemo ? '<button type="button" class="btn" data-action="toggle-demo">查看平台示例</button>' : ''}
      </div>
    </div>`;
  }
  return `<div class="empty-state">
    <img src="assets/mark.svg" alt="" width="42" height="42">
    <h3>没有找到匹配的站点</h3>
    <p>${query ? `没有与「${esc(query)}」匹配的结果。` : '当前搜索范围里暂时没有站点。'} 搜索只是过滤，不会插入推广或“猜你喜欢”。</p>
    <div class="empty-actions">
      <button type="button" class="btn" data-action="clear-filters">清空筛选</button>
    </div>
  </div>`;
}

function guideResultsMarkup(entries, query, scope) {
  const tokens = searchTokens(query);
  if (!entries.length) {
    const all = getDirectoryEntries();
    return renderGuideEmpty(all.length > 0, query, scope);
  }
  return entries.map((entry, index) => renderSiteCard(entry, index, tokens)).join('');
}

function renderGuidePage() {
  const allEntries = getDirectoryEntries();
  const scope = ['site', 'owner', 'tag', 'all'].includes(state.ui.guideScope) ? state.ui.guideScope : 'all';
  state.ui.guideScope = scope;
  const results = searchDirectory(allEntries, state.ui.guideQuery, scope);
  const hasAny = allEntries.length > 0;
  const demosVisible = allEntries.some((entry) => entry.isDemo);
  const query = state.ui.guideQuery;
  const tagCount = new Set(allEntries.flatMap((entry) => entry.snapshot.tags || [])).size;

  const onlineSites = networkInfo.server ? networkSites.filter((site) => site.online && site.snapshot) : [];
  const onlineStrip = networkInfo.server ? `<section class="container online-strip-wrap" aria-label="同时在线的主页">
    <div class="online-strip">
      <div class="online-strip-label"><span class="online-pulse" aria-hidden="true"></span><strong>联机发现</strong><span>${onlineSites.length ? `${onlineSites.length} 个主页正在使用` : '导览已连接，暂时没有其他在线主页'}</span></div>
      <div class="online-strip-links">
        ${onlineSites.slice(0, 6).map((site) => `<a href="#/site/${attr(site.snapshot.slug)}">${esc(site.snapshot.title)}<span>${esc(site.snapshot.owner || '')}</span></a>`).join('')}
        ${onlineSites.length > 6 ? `<span class="online-more">+${onlineSites.length - 6}</span>` : ''}
        <button type="button" class="link-btn" data-action="refresh-network">刷新</button>
      </div>
    </div>
  </section>` : '';

  return `<div class="guide-page">
    <section class="guide-hero container">
      <div class="reveal">
        <div class="eyebrow">岸标 · 指路 / WAYFINDING</div>
        <h1><span class="headline-line">被同意的 web，</span><br><em>才被指路。</em></h1>
        <p class="guide-lede">这里没有推荐、没有热搜、没有“猜你喜欢”。每一座 web 都由主人自己设计、自己保存，并在明确同意之后，才被标在这张地图上。搜索可以选择站点、主人、标签或全局范围，结果按站点名称排序。</p>
        <div class="hero-signature">
          <span>${allEntries.length} 个公开站点</span>
          <span>${tagCount} 个标签</span>
          <span>0 条推荐</span>
        </div>
      </div>
      ${renderHeroMap()}
    </section>

    ${onlineStrip}

    <section class="container" aria-label="按范围搜索">
      <div class="search-deck reveal" style="--i:1">
        <h2 class="sr-only">按范围搜索站点</h2>
        <div class="search-row">
          <div class="search-field">
            ${ICONS.search}
            <label class="sr-only" for="guide-search">搜索站点、主人、标签或全部内容</label>
            <input id="guide-search" class="search-input" type="search" value="${attr(query)}" placeholder="输入关键词，再选择右侧搜索范围" autocomplete="off" data-role="guide-search" aria-controls="guide-results">
            <button type="button" class="icon-btn search-clear${query ? ' is-visible' : ''}" data-action="clear-search" aria-label="清空搜索">${ICONS.close}</button>
          </div>
        </div>
        <div class="search-scopes" id="search-scopes" role="group" aria-label="搜索范围">
          ${Object.entries(SEARCH_SCOPES).map(([key, label]) => `<button type="button" class="scope-btn${scope === key ? ' is-active' : ''}" data-action="set-search-scope" data-scope="${attr(key)}" aria-pressed="${scope === key}">${esc(label)}</button>`).join('')}
        </div>
        <div class="search-meta">
          <span><strong id="result-count" aria-live="polite">${results.length}</strong> 个站点 · 当前范围：<span id="search-scope-label">${esc(SEARCH_SCOPES[scope] || '全局')}</span></span>
          <span>按名称 A→Z 固定排序 · 不含热度或个性化</span>
        </div>
      </div>
    </section>

    <section class="principles container" aria-label="指路原则">
      <article class="principle reveal" style="--i:2">
        <div class="principle-num">01 / CONSENT</div>
        <h3>本人同意后，才被指路</h3>
        <p>新建的 web 默认只保存在本机。只有主人阅读并勾选同意，内容才会进入导览区。</p>
      </article>
      <article class="principle reveal" style="--i:3">
        <div class="principle-num">02 / REVOKE</div>
        <h3>随时可以撤回</h3>
        <p>撤回后立即从「指路」消失。草稿与内容不会被删除，只是重新回到只有自己能看见的状态。</p>
      </article>
      <article class="principle reveal" style="--i:4">
        <div class="principle-num">03 / SEARCH</div>
        <h3>只按专区找，不做推荐</h3>
        <p>搜索是确定的过滤，不是排序游戏。岸标不根据浏览、点击或画像推荐任何站点。</p>
      </article>
    </section>

    <section class="directory container" id="directory">
      <div class="section-head">
        <div>
          <div class="eyebrow">DIRECTORY / 导览</div>
          <h2>正在指路的 web</h2>
          <p class="section-head-note" id="directory-note">${demosVisible ? '带「平台示例」标记的是岸标制作的演示内容，并非真实用户站点。真实站点均由主人同意后公示。' : '所有真实站点均在主人同意后公示，并可以随时撤回。'}</p>
        </div>
        <div class="directory-tools">
          <span><span class="count" id="directory-count">${allEntries.length}</span> 个站点在指路</span>
          <button type="button" class="link-btn" data-action="toggle-demo">${state.settings.showDemo ? '隐藏平台示例' : '显示平台示例'}</button>
        </div>
      </div>
      <div class="card-grid" id="guide-results">${guideResultsMarkup(results, query, scope)}</div>
    </section>
  </div>`;
}

/* ------------------------------ studio ------------------------------ */

function studioReadiness(site) {
  const checks = [
    { label: '站点名称', ok: Boolean(trimText(site.title, 60)) },
    { label: '主人署名', ok: Boolean(trimText(site.owner, 40)) },
    { label: '站点路径', ok: isValidSlug(site.slug) && !DEMO_SLUGS.has(site.slug) },
    { label: '至少一个专区', ok: Array.isArray(site.zones) && site.zones.length > 0 },
    { label: '公开内容', ok: visibleItemCount(site) > 0 }
  ];
  const done = checks.filter((check) => check.ok).length;
  return { checks, done, total: checks.length, ready: done === checks.length };
}

function renderCoverEditor() {
  const site = state.site;
  const cover = safeMediaSrc(site.cover);
  const uploaded = isDataUrl(cover);
  const inputValue = uploaded ? '' : cover;
  return `<div class="field">
    <label>封面图片 <span>建议 1600 × 1000，也会成为指路卡片的画面</span></label>
    <div class="cover-editor">
      <div class="cover-thumb" id="cover-thumb">${cover
        ? `<img src="${attr(cover)}" alt="当前封面预览">`
        : `<div class="cover-thumb-empty">还没有封面</div>`}</div>
      <div class="cover-controls">
        <div class="cover-actions">
          <label class="file-button">${ICONS.upload} 上传图片<input type="file" accept="image/*" data-upload="cover" aria-label="上传封面图片"></label>
          <button type="button" class="btn btn--sm" data-action="remove-cover"${cover ? '' : ' disabled'}>移除封面</button>
        </div>
        <input id="cover-url" class="input" type="text" data-scope="site" data-field="cover" value="${attr(inputValue)}" placeholder="${uploaded ? '已上传本地图片（可粘贴地址替换）' : '或粘贴图片地址'}" aria-label="封面图片地址">
        <span class="upload-note">${uploaded ? '当前使用本地上传的图片。它会随导出文件一起打包。' : '可以使用网络图片地址，或上传一张本地图片。'}</span>
      </div>
    </div>
  </div>`;
}

function renderAppearanceEditor() {
  const site = state.site;
  const appearance = normalizeAppearance(site.appearance, site.theme);
  const modes = [
    ['theme', '主题底色'],
    ['solid', '纯色'],
    ['gradient', '渐变'],
    ['image', '图片']
  ];
  return `<div class="field">
    <label>页面底色 <span>主题、纯色、渐变，或上传一张背景图</span></label>
    <div class="bg-mode-tabs" role="group" aria-label="页面底色类型">
      ${modes.map(([mode, label]) => `<button type="button" class="bg-mode${appearance.mode === mode ? ' is-active' : ''}" data-action="set-bg-mode" data-mode="${mode}" aria-pressed="${appearance.mode === mode}">${esc(label)}</button>`).join('')}
    </div>
    <div class="bg-controls">
      ${appearance.mode === 'theme' ? `<p class="bg-hint">跟随上方「配色主题」的纸张底色。想完全自定义时，选择纯色、渐变或图片。</p>` : ''}
      ${appearance.mode === 'solid' ? `<div class="color-line">
        <input type="color" value="${attr(appearance.color)}" data-scope="appearance" data-field="color" aria-label="纯色背景颜色">
        <input type="text" class="input color-value" value="${attr(appearance.color)}" data-scope="appearance" data-field="color" aria-label="纯色背景十六进制颜色" maxlength="7">
        <span>纯色背景</span>
      </div>` : ''}
      ${appearance.mode === 'gradient' ? `<div class="gradient-controls">
        <div class="color-line">
          <input type="color" value="${attr(appearance.color)}" data-scope="appearance" data-field="color" aria-label="渐变起始颜色">
          <span>起始</span>
          <input type="color" value="${attr(appearance.color2)}" data-scope="appearance" data-field="color2" aria-label="渐变结束颜色">
          <span>结束</span>
        </div>
        <label class="range-line">角度 <input type="range" min="0" max="360" step="1" value="${attr(appearance.angle)}" data-scope="appearance" data-field="angle"><output>${appearance.angle}°</output></label>
      </div>` : ''}
      ${appearance.mode === 'image' ? `<div class="bg-image-controls">
        <div class="cover-editor bg-image-editor">
          <div class="cover-thumb">${appearance.image ? `<img src="${attr(appearance.image)}" alt="页面背景预览">` : '<div class="cover-thumb-empty">还没有背景图</div>'}</div>
          <div class="cover-controls">
            <div class="cover-actions">
              <label class="file-button">${ICONS.upload} 上传背景图<input type="file" accept="image/*" data-upload="background-image" aria-label="上传页面背景图"></label>
              <button type="button" class="btn btn--sm" data-action="clear-background-image"${appearance.image ? '' : ' disabled'}>移除</button>
            </div>
            <input class="input" type="text" value="${isDataUrl(appearance.image) ? '' : attr(appearance.image)}" placeholder="${isDataUrl(appearance.image) ? '已上传本地背景图（可粘贴地址替换）' : '或粘贴图片地址'}" data-scope="appearance" data-field="image" aria-label="页面背景图地址">
            <label class="range-line">暗色遮罩 <input type="range" min="0" max="85" step="5" value="${Math.round(appearance.overlay * 100)}" data-scope="appearance" data-field="overlay"><output>${Math.round(appearance.overlay * 100)}%</output></label>
            <span class="upload-note">背景图会自动加上暗色遮罩，保证页面文字仍然清楚。</span>
          </div>
        </div>
      </div>` : ''}
    </div>
  </div>`;
}

function renderLayoutEditor() {
  const layout = normalizeLayout(state.site.layout);
  return `<div class="field">
    <label>主页默认显示 <span>访客也可以在主页里临时切换</span></label>
    <div class="layout-controls">
      <div class="layout-group">
        <span>分栏</span>
        <div class="seg-buttons">
          <button type="button" class="seg-btn${layout.columns === 1 ? ' is-active' : ''}" data-action="set-site-layout" data-columns="1" aria-pressed="${layout.columns === 1}">单栏</button>
          <button type="button" class="seg-btn${layout.columns === 2 ? ' is-active' : ''}" data-action="set-site-layout" data-columns="2" aria-pressed="${layout.columns === 2}">双栏</button>
        </div>
      </div>
      <div class="layout-group">
        <span>内容大小</span>
        <div class="seg-buttons">
          <button type="button" class="seg-btn${layout.density === 'compact' ? ' is-active' : ''}" data-action="set-site-density" data-density="compact" aria-pressed="${layout.density === 'compact'}">小</button>
          <button type="button" class="seg-btn${layout.density === 'standard' ? ' is-active' : ''}" data-action="set-site-density" data-density="standard" aria-pressed="${layout.density === 'standard'}">中</button>
          <button type="button" class="seg-btn${layout.density === 'large' ? ' is-active' : ''}" data-action="set-site-density" data-density="large" aria-pressed="${layout.density === 'large'}">大</button>
        </div>
      </div>
    </div>
  </div>`;
}

function renderHomeLink(site) {
  const slug = site.slug || 'draft';
  const listed = publicationIsListed() && state.publication.snapshot && state.publication.snapshot.slug === slug;
  const linkPath = `#/site/${slug}${listed ? '' : '?preview=1'}`;
  return `<div class="home-link-box">
    <div class="home-link-copy">
      <span class="home-link-label">${listed ? '已公示的主页链接' : '站内草稿链接'}</span>
      <code>${esc(linkPath)}</code>
      <small>主页包含在岸标里。部署到网络后，这个链接可以直接分享给访客；未公示时链接会带上预览参数，只有本机能打开草稿。</small>
    </div>
    <div class="home-link-actions">
      <button type="button" class="btn btn--sm" data-action="copy-site-address">${ICONS.copy} 复制链接</button>
      <button type="button" class="btn btn--sm btn--soft" data-action="open-homepage">${ICONS.external} 打开主页</button>
    </div>
  </div>`;
}

function renderIdentityPanel() {
  const site = state.site;
  const slugWarning = !isValidSlug(site.slug)
    ? '只能用小写字母、数字和连字符。'
    : DEMO_SLUGS.has(site.slug)
      ? '这个路径与平台示例冲突，请换一个。'
      : `访客会通过 #/site/${esc(site.slug)} 找到这里。`;
  return `<section class="panel" id="panel-identity">
    <header class="panel-head">
      <span class="panel-index">01</span>
      <div>
        <h2>站点设定</h2>
        <p>名字、介绍、封面、底色和主页链接。这里决定了访客第一眼看到什么。</p>
      </div>
    </header>
    <div class="panel-body">
      <div class="field-grid">
        <div class="field">
          <label for="site-title">站点名称 <span>${cleanText(site.title).length}/60</span></label>
          <input id="site-title" type="text" maxlength="60" data-scope="site" data-field="title" value="${attr(site.title)}" placeholder="给自己的 web 起个名字">
        </div>
        <div class="field">
          <label for="site-owner">主人署名 <span>${cleanText(site.owner).length}/40</span></label>
          <input id="site-owner" type="text" maxlength="40" data-scope="site" data-field="owner" value="${attr(site.owner)}" placeholder="你的名字">
        </div>
      </div>
      <div class="field">
        <label for="site-tags">网页标签 <span>用逗号分隔，最多 8 个</span></label>
        <input id="site-tags" type="text" maxlength="160" data-scope="site" data-field="tags" value="${attr((site.tags || []).join('，'))}" placeholder="例如：写作，摄影，杭州">
        <span class="hint">标签会显示在指路卡片上，也是搜索范围之一。</span>
      </div>
      <div class="field">
        <label for="site-slug">站点路径 <span>小写字母、数字与连字符</span></label>
        <div class="input-prefix"><span>#/site/</span><input id="site-slug" type="text" maxlength="40" data-scope="site" data-field="slug" value="${attr(site.slug)}" placeholder="my-shore" spellcheck="false"></div>
        <span class="hint slug-hint${isValidSlug(site.slug) && !DEMO_SLUGS.has(site.slug) ? '' : ' is-warn'}" id="slug-hint">${slugWarning}</span>
      </div>
      ${renderHomeLink(site)}
      <div class="field">
        <label for="site-tagline">一句话介绍 <span>${cleanText(site.tagline).length}/100</span></label>
        <input id="site-tagline" type="text" maxlength="100" data-scope="site" data-field="tagline" value="${attr(site.tagline)}" placeholder="例如：把喜欢的东西，放在自己的岸上。">
      </div>
      <div class="field">
        <label for="site-intro">更长一点的介绍 <span>${cleanText(site.intro).length}/300</span></label>
        <textarea id="site-intro" maxlength="300" data-scope="site" data-field="intro" placeholder="告诉来者，这里是什么地方。">${esc(site.intro)}</textarea>
      </div>
      ${renderCoverEditor()}
      <div class="field">
        <label>配色主题 <span>决定文字、强调色与默认纸张</span></label>
        <div class="theme-options">
          ${Object.entries(THEMES).map(([key, theme]) => `<label class="theme-option">
            <input type="radio" name="site-theme" value="${attr(key)}" data-scope="site" data-field="theme"${site.theme === key ? ' checked' : ''}>
            <span class="theme-swatch" style="background:${attr(theme.bg)}">${theme.swatch.map((color) => `<i style="background:${attr(color)}"></i>`).join('')}</span>
            <span class="theme-name">${esc(theme.name)}</span>
          </label>`).join('')}
        </div>
      </div>
      ${renderAppearanceEditor()}
      ${renderLayoutEditor()}
    </div>
  </section>`;
}

function zonePathName(zones, zoneId) {
  const byId = new Map((zones || []).map((zone) => [zone.id, zone]));
  const names = [];
  let current = byId.get(zoneId);
  const seen = new Set();
  while (current && !seen.has(current.id) && names.length < 24) {
    seen.add(current.id);
    names.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return names.join(' / ') || '未分类';
}

function zoneCountDirect(zoneId) {
  return state.site.items.filter((item) => item.zoneId === zoneId).length;
}

function zoneCountTotal(zoneId) {
  const descendants = zoneDescendantIds(state.site.zones, zoneId);
  return state.site.items.filter((item) => item.zoneId === zoneId || descendants.has(item.zoneId)).length;
}

function zoneParentOptions(zone) {
  const zones = state.site.zones;
  const excluded = zoneDescendantIds(zones, zone.id);
  excluded.add(zone.id);
  const flat = flattenZoneTree(buildZoneTree(zones));
  return `<option value="">顶层专区</option>${flat
    .filter((entry) => !excluded.has(entry.zone.id))
    .map((entry) => `<option value="${attr(entry.zone.id)}"${zone.parentId === entry.zone.id ? ' selected' : ''}>${'— '.repeat(entry.depth)}${esc(entry.zone.name)}</option>`)
    .join('')}`;
}

function renderZonesPanel() {
  const zones = state.site.zones;
  const flat = flattenZoneTree(buildZoneTree(zones));
  return `<section class="panel" id="panel-zones">
    <header class="panel-head">
      <span class="panel-index">02</span>
      <div>
        <h2>专区与子专区</h2>
        <p>至少保留一个，数量不限。专区可以像文件夹一样一直往下细分，并单独设置上级、描述和颜色。</p>
      </div>
      <span class="panel-head-aside">${zones.length} 个专区</span>
    </header>
    <div class="panel-body">
      <div class="zone-help">${ICONS.folder} 在任意专区里点击「子专区」，就能把不同主题继续分层。删除专区前需先移走内容与子专区。</div>
      <div class="zone-list">
        ${flat.map((entry) => {
          const zone = entry.zone;
          const direct = zoneCountDirect(zone.id);
          const total = zoneCountTotal(zone.id);
          const children = Array.isArray(zone.children) ? zone.children : [];
          return `<div class="zone-row zone-row--nested" style="--depth:${entry.depth}">
            <span class="zone-dot" style="background:${attr(zone.color || DEFAULT_ZONE_COLOR)}" aria-hidden="true"></span>
            <div class="zone-body">
              <div class="zone-mainline">
                <input class="zone-name" type="text" maxlength="24" data-scope="zone" data-zone-id="${attr(zone.id)}" data-field="name" value="${attr(zone.name)}" aria-label="专区名称 ${esc(zone.name)}" placeholder="专区名称">
                <span class="zone-count">${direct} 块${total > direct ? ` · 共 ${total} 块` : ''}${children.length ? ` · ${children.length} 个子专区` : ''}</span>
                <div class="zone-actions">
                  <button type="button" class="icon-btn" data-action="add-subzone" data-id="${attr(zone.id)}" aria-label="在 ${attr(zone.name)} 下添加子专区" title="添加子专区">${ICONS.folder}</button>
                  <button type="button" class="icon-btn" data-action="move-zone" data-id="${attr(zone.id)}" data-dir="-1" aria-label="上移 ${attr(zone.name)}" title="上移">${ICONS.up}</button>
                  <button type="button" class="icon-btn" data-action="move-zone" data-id="${attr(zone.id)}" data-dir="1" aria-label="下移 ${attr(zone.name)}" title="下移">${ICONS.down}</button>
                  <button type="button" class="icon-btn icon-btn--danger" data-action="delete-zone" data-id="${attr(zone.id)}" aria-label="删除 ${attr(zone.name)}" title="${direct > 0 || children.length ? '请先移走该专区下的内容与子专区' : zones.length <= 1 ? '至少保留一个专区' : '删除专区'}"${direct > 0 || children.length || zones.length <= 1 ? ' disabled' : ''}>${ICONS.trash}</button>
                </div>
              </div>
              <div class="zone-sublines">
                <input type="text" maxlength="80" data-scope="zone" data-zone-id="${attr(zone.id)}" data-field="desc" value="${attr(zone.desc)}" aria-label="${attr(zone.name)} 的专区描述" placeholder="一句可选描述">
                <label class="zone-parent">上级<select data-scope="zone" data-zone-id="${attr(zone.id)}" data-field="parentId" data-zone-parent aria-label="${attr(zone.name)} 的上级专区">${zoneParentOptions(zone)}</select></label>
                <label class="zone-color">颜色<input type="color" value="${attr(normalizeHexColor(zone.color, DEFAULT_ZONE_COLOR))}" data-scope="zone" data-zone-id="${attr(zone.id)}" data-field="color" aria-label="${attr(zone.name)} 的颜色"></label>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <form class="zone-add-form" id="zone-add-form">
        <label class="sr-only" for="new-zone-name">新专区名称</label>
        <input id="new-zone-name" type="text" maxlength="24" placeholder="新专区名称，例如：声音、食谱、路上" autocomplete="off">
        <label class="sr-only" for="new-zone-parent">新专区的上级</label>
        <select id="new-zone-parent">${`<option value="">顶层专区</option>${flattenZoneTree(buildZoneTree(zones)).map((entry) => `<option value="${attr(entry.zone.id)}">${'— '.repeat(entry.depth)}${esc(entry.zone.name)}</option>`).join('')}`}</select>
        <button type="submit" class="btn btn--sm">${ICONS.plus} 添加专区</button>
      </form>
      <p class="zone-limit-note">没有数量上限。内容很多时，可用子专区把文档、图片、音频、视频和压缩包分开。</p>
    </div>
  </section>`;
}

function itemMatchesStudioFilter(item, query, zoneFilter) {
  if (zoneFilter !== 'all') {
    const descendants = zoneDescendantIds(state.site.zones, zoneFilter);
    if (item.zoneId !== zoneFilter && !descendants.has(item.zoneId)) return false;
  }
  const q = normalizeSpace(query).toLowerCase();
  if (!q) return true;
  const zone = zonePathName(state.site.zones, item.zoneId);
  const haystack = [item.title, itemSummary(item), itemTypeLabel(item.type), zone, item.filename, item.mime]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function renderItemRow(item, index, total, query = '', zoneFilter = 'all') {
  const zone = zonePathName(state.site.zones, item.zoneId);
  const type = CONTENT_TYPES[item.type] || CONTENT_TYPES.article;
  const matches = itemMatchesStudioFilter(item, query, zoneFilter);
  const search = [item.title, itemSummary(item), type.label, zone, item.filename, item.mime].filter(Boolean).join(' ').toLowerCase();
  return `<article class="item-row${item.hidden ? ' is-hidden' : ''}" data-item-id="${attr(item.id)}" data-zone-id="${attr(item.zoneId)}" data-item-search="${attr(search)}"${matches ? '' : ' hidden'}>
    <span class="item-type-icon" title="${attr(type.label)}">${ICONS[item.type] || ICONS.article}</span>
    <div class="item-main">
      <div class="item-title-line">
        <span class="item-title">${esc(item.title || '未命名内容')}</span>
        ${item.hidden ? '<span class="tag tag--muted">仅本机</span>' : ''}
        ${item.starter ? '<span class="tag tag--demo">示例</span>' : ''}
      </div>
      <div class="item-summary">${esc(itemSummary(item))}</div>
      <div class="item-meta">
        <span class="mini-zone">${esc(zone)}</span>
        <span>${esc(type.label)}</span>
        ${item.size ? `<span>${esc(formatBytes(item.size))}</span>` : ''}
        <span>${esc(formatDate(item.createdAt))}</span>
      </div>
    </div>
    <div class="item-actions">
      <button type="button" class="icon-btn" data-action="move-item" data-id="${attr(item.id)}" data-dir="-1" aria-label="上移 ${attr(item.title)}" title="上移"${index === 0 ? ' disabled' : ''}>${ICONS.up}</button>
      <button type="button" class="icon-btn" data-action="move-item" data-id="${attr(item.id)}" data-dir="1" aria-label="下移 ${attr(item.title)}" title="下移"${index === total - 1 ? ' disabled' : ''}>${ICONS.down}</button>
      <button type="button" class="icon-btn${item.hidden ? ' is-on' : ''}" data-action="toggle-hidden" data-id="${attr(item.id)}" aria-label="${item.hidden ? '设为公开' : '设为仅本机可见'}：${attr(item.title)}" title="${item.hidden ? '恢复公开' : '设为仅本机可见'}">${item.hidden ? ICONS.eyeOff : ICONS.eye}</button>
      <button type="button" class="icon-btn" data-action="edit-item" data-id="${attr(item.id)}" aria-label="编辑 ${attr(item.title)}" title="编辑">${ICONS.edit}</button>
      <button type="button" class="icon-btn icon-btn--danger" data-action="delete-item" data-id="${attr(item.id)}" aria-label="删除 ${attr(item.title)}" title="删除">${ICONS.trash}</button>
    </div>
  </article>`;
}

function renderStudioZoneOptions() {
  const flat = flattenZoneTree(buildZoneTree(state.site.zones));
  return `<option value="all">全部专区</option>${flat
    .map((entry) => `<option value="${attr(entry.zone.id)}"${state.ui.studioZoneFilter === entry.zone.id ? ' selected' : ''}>${'— '.repeat(entry.depth)}${esc(entry.zone.name)}</option>`)
    .join('')}`;
}

function renderContentPanel() {
  const items = state.site.items;
  const visible = visibleItemCount(state.site);
  const hidden = hiddenItemCount(state.site);
  const starterCount = items.filter((item) => item.starter).length;
  const query = state.ui.studioQuery || '';
  const validZone = state.ui.studioZoneFilter === 'all' || state.site.zones.some((zone) => zone.id === state.ui.studioZoneFilter)
    ? state.ui.studioZoneFilter
    : 'all';
  if (validZone !== state.ui.studioZoneFilter) state.ui.studioZoneFilter = validZone;
  const filtered = items.filter((item) => itemMatchesStudioFilter(item, query, validZone));
  const density = ['compact', 'standard', 'large'].includes(state.ui.studioDensity) ? state.ui.studioDensity : 'standard';
  return `<section class="panel" id="panel-content">
    <header class="panel-head">
      <span class="panel-index">03</span>
      <div>
        <h2>内容</h2>
        <p>文章、图片、合集、视频、音频、文件、链接和短句。支持本地上传，也可以按专区查找。</p>
      </div>
      <span class="panel-head-aside">${items.length} 块</span>
    </header>
    <div class="panel-body">
      ${starterCount && !state.ui.starterNoteDismissed ? `<div class="starter-note">
        ${ICONS.warn}
        <span>这 ${starterCount} 块是起始示例，可以直接编辑或删除。它们只是草稿，未同意公示前不会出现在指路里。</span>
        <button type="button" class="link-btn" data-action="dismiss-starter">知道了</button>
        <button type="button" class="link-btn" data-action="clear-starters">清空示例</button>
      </div>` : ''}
      <div class="content-toolbar">
        <span class="content-count"><strong>${visible}</strong> 块公开内容${hidden ? ` · ${hidden} 块仅本机可见` : ''} · 显示 <strong id="studio-content-visible">${filtered.length}</strong> 块</span>
        <button type="button" class="btn btn--sm" data-action="add-content">${ICONS.plus} 添加内容</button>
      </div>
      <div class="content-filter-row">
        <label class="content-search">${ICONS.search}<input id="studio-content-search" type="search" value="${attr(query)}" placeholder="在内容中查找标题、文件名或专区" data-role="studio-content-search" aria-label="在内容中查找"></label>
        <label class="sr-only" for="studio-zone-filter">按专区筛选内容</label>
        <select id="studio-zone-filter" data-role="studio-zone-filter">${renderStudioZoneOptions()}</select>
        <div class="density-toggle" role="group" aria-label="内容列表显示密度">
          <button type="button" class="seg-btn${density === 'compact' ? ' is-active' : ''}" data-action="set-studio-density" data-density="compact" aria-pressed="${density === 'compact'}">紧凑</button>
          <button type="button" class="seg-btn${density === 'standard' ? ' is-active' : ''}" data-action="set-studio-density" data-density="standard" aria-pressed="${density === 'standard'}">标准</button>
          <button type="button" class="seg-btn${density === 'large' ? ' is-active' : ''}" data-action="set-studio-density" data-density="large" aria-pressed="${density === 'large'}">宽松</button>
        </div>
      </div>
      ${items.length ? `<div class="item-list density-${density}" id="studio-item-list">${items.map((item, index) => renderItemRow(item, index, items.length, query, validZone)).join('')}</div><div class="item-empty" id="studio-content-no-match"${filtered.length ? ' hidden' : ''}>没有匹配的内容。换个关键词，或选择其他专区。</div>` : `<div class="item-empty">还没有内容。从一篇文章、一张图片、一段视频，或一个文件开始。</div>`}
    </div>
  </section>`;
}

function renderReadinessBar(readiness) {
  return `<div class="readiness">
    <span class="ready-count">${readiness.done}/${readiness.total} 项就绪</span>
    <span class="readiness-bar" aria-hidden="true"><span style="width:${(readiness.done / readiness.total) * 100}%"></span></span>
    <span>${readiness.ready ? '可以公示' : '公示前需要补齐'}</span>
  </div>`;
}

function historyActionLabel(action) {
  if (action === 'publish') return '首次同意并公示';
  if (action === 'update') return '确认更新公示内容';
  if (action === 'revoke') return '撤回公示';
  return '公示记录';
}

function renderHistory(history) {
  if (!Array.isArray(history) || !history.length) return '';
  return `<div class="history-list">
    <h4>公示记录 / LOCAL LOG</h4>
    <ul>${history.slice(0, 6).map((entry) => `<li><span>${esc(historyActionLabel(entry.action))}</span><span>${esc(formatDate(entry.at))}</span></li>`).join('')}</ul>
  </div>`;
}

function renderPublishPanel() {
  const publication = state.publication;
  const readiness = studioReadiness(state.site);
  const active = Boolean(publication.active);
  const listed = publicationIsListed();
  const stale = publicationIsStale();
  const needsReconfirm = active && !listed;
  const visible = visibleItemCount(state.site);
  const hidden = hiddenItemCount(state.site);
  const snapshot = publication.snapshot;

  if (active) {
    return `<section class="panel" id="panel-publish">
      <header class="panel-head">
        <span class="panel-index">04</span>
        <div>
          <h2>公开展示</h2>
          <p>是否让「指路」把来者带到这里，由你决定，也可以随时撤回。</p>
        </div>
        <span class="panel-head-aside">${stale ? '待同步' : listed ? '已公示' : '待确认'}</span>
      </header>
      <div class="panel-body">
        <div class="publish-panel-card">
          <div class="publish-status-line">
            <span class="status-dot ${stale || needsReconfirm ? 'status-dot--stale' : 'status-dot--live'}"></span>
            <div>
              <h3>${needsReconfirm ? '需要重新确认公示' : stale ? '草稿有修改，尚未同步' : '你的 web 已在指路公示'}</h3>
              <p>${needsReconfirm
                ? '公示协议已更新，当前站点暂时不会出现在指路中。重新阅读并确认后，才会恢复公示。'
                : stale
                  ? '指路仍然显示你上次确认公开的版本。确认更新后，新的内容才会被看见。'
                  : `来者可以按专区找到这里。你随时可以撤回，撤回后立即消失。`}</p>
            </div>
          </div>
          <div class="consent-summary">
            <div><span>公开内容</span><strong>${snapshot ? snapshot.items.length : 0}</strong></div>
            <div><span>公示专区</span><strong>${snapshot ? snapshot.zones.length : 0}</strong></div>
            <div><span>同意时间</span><strong style="font-size:13px">${esc(formatDate(publication.consentedAt))}</strong></div>
          </div>
          ${stale || needsReconfirm ? `<div class="publish-hint" style="color:#7b5a22">当前草稿有 ${visible} 块公开内容、${hidden} 块仅本机内容，尚未同步到指路。</div>` : ''}
          <div class="publish-actions">
            ${snapshot ? `<a class="btn btn--primary btn--sm" href="#/site/${encodeURIComponent(snapshot.slug)}">查看公示页 ${ICONS.arrow}</a>` : ''}
            <button type="button" class="btn btn--sm" data-action="open-publish">${ICONS.check} ${stale || needsReconfirm ? '确认更新公示' : '更新公示内容'}</button>
            <button type="button" class="btn btn--sm" data-action="copy-public-link"${snapshot ? '' : ' disabled'}>${ICONS.copy} 复制链接</button>
            <button type="button" class="btn btn--sm" data-action="export-site">${ICONS.download} 导出网页</button>
            <button type="button" class="btn btn--danger btn--sm" data-action="revoke-publish">撤回公示</button>
          </div>
          <div class="publish-hint">指路只使用你确认过的快照。编辑草稿、隐藏内容或更换封面，都不会自动改变公开页面；「导出网页」导出的是当前草稿。撤回不会删除本地内容。</div>
          ${renderHistory(publication.history)}
        </div>
      </div>
    </section>`;
  }

  return `<section class="panel" id="panel-publish">
    <header class="panel-head">
      <span class="panel-index">04</span>
      <div>
        <h2>公开展示</h2>
        <p>默认不公开。只有你明确同意，web 才会被「指路」收录。</p>
      </div>
      <span class="panel-head-aside">尚未公示</span>
    </header>
    <div class="panel-body">
      <div class="publish-panel-card">
        <div class="publish-status-line">
          <span class="status-dot"></span>
          <div>
            <h3>现在只有你能看到</h3>
            <p>内容和草稿保存在这台设备的浏览器里。没有你的同意，它不会出现在导览区，也不会被搜索到。</p>
          </div>
        </div>
        <div class="consent-summary">
          <div><span>当前公开内容</span><strong>${visible}</strong></div>
          <div><span>仅本机可见</span><strong>${hidden}</strong></div>
          <div><span>公示状态</span><strong style="font-size:13px">未同意</strong></div>
        </div>
        ${renderReadinessBar(readiness)}
        <div class="publish-actions">
          <button type="button" class="btn btn--primary" data-action="open-publish">${ICONS.lock} 阅读并同意公示</button>
          <button type="button" class="btn" data-action="export-site">${ICONS.download} 导出独立网页</button>
        </div>
        <div class="publish-hint">点击后会先看到完整的公开清单，再决定是否勾选同意。你不需要公示也能导出网页、保存内容。${publication.consentedAt ? ` 上次撤回于 ${esc(formatDate(publication.revokedAt || publication.consentedAt))}。` : ''}</div>
        ${renderHistory(publication.history)}
      </div>
    </div>
  </section>`;
}

function renderDownloadSettingsPanel() {
  const zones = flattenZoneTree(buildZoneTree(state.site.zones));
  const mediaItems = state.site.items.filter((item) => ['video', 'audio', 'image'].includes(item.type));
  const allowed = mediaItems.filter((item) => item.downloadable).length;
  const groups = zones.map((entry) => ({
    zone: entry.zone,
    items: mediaItems.filter((item) => item.zoneId === entry.zone.id)
  })).filter((group) => group.items.length);
  return `<section class="panel" id="panel-downloads">
    <header class="panel-head">
      <span class="panel-index">05</span>
      <div>
        <h2>下载设置</h2>
        <p>在这里一次性决定哪些视频、音频、图片允许下载。访客不需要再单独发送请求。</p>
      </div>
      <span class="panel-head-aside">${allowed} / ${mediaItems.length} 个允许</span>
    </header>
    <div class="panel-body">
      ${mediaItems.length ? `<div class="download-settings-actions"><button type="button" class="btn btn--sm" data-action="set-all-download" data-value="1">全部允许</button><button type="button" class="btn btn--sm" data-action="set-all-download" data-value="0">全部禁止</button></div>
      <div class="download-settings-list">${groups.map(({ zone, items }) => `<div class="download-zone-group">
        <div class="download-zone-head"><strong>${esc(zone.name)}</strong><div><button type="button" class="link-btn" data-action="set-zone-download" data-zone-id="${attr(zone.id)}" data-value="1">本专区允许</button><button type="button" class="link-btn" data-action="set-zone-download" data-zone-id="${attr(zone.id)}" data-value="0">本专区禁止</button></div></div>
        ${items.map((item) => `<label class="download-item-row">
          <input type="checkbox" data-download-toggle data-id="${attr(item.id)}"${item.downloadable ? ' checked' : ''}>
          <span class="item-type-icon">${ICONS[item.type] || ICONS.video}</span>
          <span class="download-item-title">${esc(item.title)}</span>
          <span class="tag">${item.type === 'audio' ? '音频' : item.type === 'image' ? '图片' : '视频'}</span>
        </label>`).join('')}
      </div>`).join('')}</div>` : '<div class="item-empty">还没有视频或音频。添加之后可以在这里设置是否允许下载。</div>'}
      <div class="settings-note">下载开关会写入下一次公示快照。访客只能看到直接下载按钮或“主人未开放下载”的提示；不再需要主人逐次审批。</div>
    </div>
  </section>`;
}

function renderDownloadRequestsPanel() {
  const local = (state.downloadRequests || []).filter((request) => request.siteId === state.site.id);
  const asISO = (value) => (typeof value === 'number' ? new Date(value * 1000).toISOString() : value);
  const online = (typeof networkOwnerRequests !== 'undefined' ? networkOwnerRequests : []).map((request) => ({
    ...request,
    createdAt: asISO(request.createdAt),
    decidedAt: asISO(request.decidedAt),
    downloadedAt: asISO(request.downloadedAt),
    source: 'online'
  }));
  const requests = [...local, ...online]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const pending = requests.filter((request) => request.status === 'pending').length;
  return `<section class="panel" id="panel-downloads">
    <header class="panel-head">
      <span class="panel-index">05</span>
      <div>
        <h2>视频 / 音频下载请求</h2>
        <p>视频与音频不直接提供下载。每次下载都需要访客单独申请，由你同意后才可下载一次。</p>
      </div>
      <span class="panel-head-aside">${pending ? `${pending} 个待处理` : `${requests.length} 条记录`}</span>
    </header>
    <div class="panel-body">
      ${requests.length ? `<div class="download-request-list">${requests.map((request) => {
        const labels = { pending: '等待处理', approved: '已同意', denied: '已拒绝', downloaded: '已下载' };
        return `<article class="download-request-card status-${attr(request.status)}">
          <div class="download-request-main">
            <div class="download-request-title"><strong>${esc(request.videoTitle || '媒体')}</strong><span class="tag">${esc(labels[request.status] || request.status)}</span>${request.source === 'online' ? '<span class="tag">联机</span>' : ''}</div>
            <p>${esc(request.requester || '匿名访客')}${request.note ? ` · “${esc(request.note)}”` : ''}</p>
            <small>${esc(formatDateTime(request.createdAt))}${request.decidedAt ? ` · 处理于 ${esc(formatDateTime(request.decidedAt))}` : ''}</small>
          </div>
          <div class="download-request-actions">
            ${request.status === 'pending' ? `<button type="button" class="btn btn--sm btn--primary" data-action="approve-media-request" data-id="${attr(request.id)}" data-source="${attr(request.source || 'local')}">同意一次下载</button><button type="button" class="btn btn--sm btn--danger" data-action="deny-media-request" data-id="${attr(request.id)}" data-source="${attr(request.source || 'local')}">拒绝</button>` : ''}
            ${request.status === 'approved' ? `<span class="download-request-state">等待访客下载</span>` : ''}
          </div>
        </article>`;
      }).join('')}</div>` : `<div class="item-empty">还没有视频或音频下载请求。访客在主页点击「申请下载」后，会出现在这里。</div>`}
      <div class="settings-note">本地模式下请求保存在当前浏览器；使用 server.py 联机运行时，请求会从同一服务上的访客直接送达，并由服务端保证下载一次后失效。界面控制不能阻止录屏或通过开发者工具提取媒体。</div>
    </div>
  </section>`;
}

function renderVisitsPanel() {
  const visits = (typeof networkVisits !== 'undefined' ? networkVisits : []);
  return `<section class="panel" id="panel-visits">
    <header class="panel-head">
      <span class="panel-index">06</span>
      <div>
        <h2>访客记录</h2>
        <p>登录访客会显示账号名；未登录访客显示为匿名。记录来自同一联机服务。</p>
      </div>
      <span class="panel-head-aside">${visits.length} 条</span>
    </header>
    <div class="panel-body">
      ${networkInfo.server ? (state.publication.active ? `<div class="visit-list">${visits.length ? visits.slice(0, 80).map((visit) => `<div class="visit-row"><span class="visit-avatar">${visit.userName ? esc(String(visit.userName).slice(0, 1)) : '匿'}</span><div><strong>${esc(visit.userName || '匿名访客')}</strong><small>${esc(visit.path || '/')} · ${esc(formatDateTime(typeof visit.createdAt === 'number' ? new Date(visit.createdAt * 1000).toISOString() : visit.createdAt))}</small></div><span class="visit-ip">${esc(String(visit.user_agent || '').slice(0, 26))}</span></div>`).join('') : '<div class="item-empty">还没有访客记录。把主页链接发给朋友，或在另一台设备打开。</div>'}</div>` : '<div class="item-empty">公示之后才能记录访客。</div>') : '<div class="item-empty">访客记录需要连接 Supabase。</div>'}
      <div class="settings-actions"><button type="button" class="btn btn--sm" data-action="refresh-visits">刷新访客记录</button></div>
      <div class="settings-note">只记录访问的页面、时间、登录名和匿名访客标识；不记录键盘输入。Supabase 浏览器端不提供访问者公网 IP。</div>
    </div>
  </section>`;
}

function renderPreviewCard() {
  const payload = buildPublicPayload(state.site);
  const hidden = hiddenItemCount(state.site);
  return `<aside class="preview-col" aria-label="实时预览">
    <div class="preview-card">
      <div class="preview-toolbar">
        <span class="preview-toolbar-label"><i></i>实时预览</span>
        <span class="preview-toolbar-meta">VISITOR'S VIEW</span>
      </div>
      <div class="preview-viewport">
        <div class="preview-canvas" id="preview-canvas">${renderWebSite(payload)}</div>
      </div>
      <div class="preview-caption">
        <span>访客视角 · 仅显示公开内容${hidden ? ` · ${hidden} 块仅本机内容已隐藏` : ''}</span>
        <span>${payload.items.length} 块</span>
      </div>
    </div>
  </aside>`;
}

function renderStudioPage() {
  const status = getPublishStatus();
  const readiness = studioReadiness(state.site);
  const slug = state.site.slug || 'draft';
  return `<div class="studio-page">
    <section class="studio-hero container">
      <div>
        <div class="eyebrow">STUDIO / 我的 WEB</div>
        <h1>设计你的岸，<br>再决定是否指路。</h1>
        <p class="studio-lede">用专区与子专区收纳文章、图片、视频、音频和文件，自定义主页底色与分栏。编辑会保存在本机；不勾选同意，它就只是你的草稿。</p>
      </div>
      <div class="studio-hero-actions">
        <span class="save-status" id="save-status">${storageOK ? `已保存到本机${lastSavedAt ? ` · ${formatTime(lastSavedAt)}` : ''}` : '本地保存失败，请导出备份'}</span>
        <button type="button" class="btn btn--sm" data-action="copy-site-address">${ICONS.copy} 主页链接</button>
        <button type="button" class="btn btn--sm" data-action="open-homepage">${ICONS.external} 打开主页</button>
        <button type="button" class="btn btn--sm" data-action="export-site">${ICONS.download} 导出网页</button>
      </div>
    </section>

    <div class="studio-layout container">
      <div class="editor-col">
        <div class="studio-status-card">
          <span class="status-dot ${status.kind === 'live' ? 'status-dot--live' : status.kind === 'stale' ? 'status-dot--stale' : ''}" id="studio-status-dot"></span>
          <div class="status-copy">
            <strong id="studio-status-headline">${esc(status.label)}</strong>
            <small id="studio-status-detail"${status.kind === 'stale' ? ' class="warn"' : ''}>${esc(status.detail)}</small>
          </div>
          <button type="button" class="btn btn--sm" data-action="open-publish">${state.publication.active ? '更新' : '公示设置'}</button>
        </div>
        ${renderIdentityPanel()}
        ${renderZonesPanel()}
        ${renderContentPanel()}
        ${renderPublishPanel()}
        ${renderDownloadSettingsPanel()}
        ${renderVisitsPanel()}
        <section class="layout-actions-panel" aria-labelledby="layout-actions-title">
          <div>
            <span class="panel-index">07</span>
            <h2 id="layout-actions-title">页面布局</h2>
            <p>内容都放好之后，决定它们在主页上的顺序、主视觉样式和合集排列。也可以让 AI 先给一版方案，再手动微调。</p>
          </div>
          <div class="layout-actions-buttons">
            <button type="button" class="btn btn--sm" data-action="open-layout-editor">自定义页面布局</button>
            <button type="button" class="btn btn--sm btn--primary" data-action="ai-layout">AI 辅助布局</button>
          </div>
        </section>
      </div>
      ${renderPreviewCard()}
    </div>
  </div>`;
}

/* ------------------------------ page layout workspace ------------------------------ */

function renderLayoutPage(route = {}) {
  if (!layoutDraft) layoutDraft = normalizeLayout(state.site.layout);
  const blocks = layoutDraft.blocks.slice().sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const labels = { hero: '主视觉', browse: '搜索与视图', body: '合集 / 内容' };
  const blockCards = blocks.map((block) => {
    const preview = block.id === 'hero'
      ? '<span class="layout-mini-kicker"></span><strong class="layout-mini-title"></strong><span class="layout-mini-line"></span><span class="layout-mini-line short"></span>'
      : block.id === 'browse'
        ? '<span class="layout-mini-search"></span><span class="layout-mini-chip"></span>'
        : '<span class="layout-mini-card"></span><span class="layout-mini-card"></span><span class="layout-mini-card"></span><span class="layout-mini-card"></span>';
    return `<div class="layout-canvas-block layout-canvas-block--${attr(block.id)}${selectedLayoutBlockId === block.id ? ' is-selected' : ''}" style="grid-column:${block.x + 1} / span ${block.w};grid-row:${block.y + 1} / span ${block.h}" data-layout-block-id="${attr(block.id)}" data-action="layout-select" draggable="true">
      <div class="layout-canvas-block-head"><strong>${esc(labels[block.id] || block.id)}</strong><span>${block.x + 1}, ${block.y + 1} · ${block.w} 列</span></div>
      <div class="layout-canvas-preview">${preview}</div>
      <div class="layout-canvas-controls">
        <div class="layout-canvas-nudge"><button type="button" data-action="layout-nudge" data-dir="left" aria-label="左移">←</button><button type="button" data-action="layout-nudge" data-dir="up" aria-label="上移">↑</button><button type="button" data-action="layout-nudge" data-dir="down" aria-label="下移">↓</button><button type="button" data-action="layout-nudge" data-dir="right" aria-label="右移">→</button></div>
        <div class="layout-canvas-size"><button type="button" data-action="layout-width" data-delta="-2" aria-label="变窄">−</button><button type="button" data-action="layout-width" data-delta="2" aria-label="变宽">＋</button><button type="button" data-action="layout-height" data-delta="-1" aria-label="变矮">↕−</button><button type="button" data-action="layout-height" data-delta="1" aria-label="变高">↕＋</button></div>
      </div>
    </div>`;
  }).join('');
  return `<div class="layout-page">
    <header class="layout-page-head container">
      <div>
        <div class="eyebrow">LAYOUT / 页面布局</div>
        <h1>把每一块，<br>放到你想放的位置。</h1>
        <p>拖动板块，或用板块上的方向按钮移动、加减号调整宽高。手机上会自动按顺序单列显示。</p>
      </div>
      <div class="layout-page-actions">
        <button type="button" class="btn btn--sm" data-action="layout-ai">AI 重新排布</button>
        <button type="button" class="btn btn--sm" data-action="layout-reset">恢复默认</button>
        <button type="button" class="btn btn--sm" data-action="layout-cancel">返回</button>
        <button type="button" class="btn btn--sm btn--primary" data-action="layout-save">保存布局</button>
      </div>
    </header>
    <div class="layout-workspace container">
      <aside class="layout-side">
        <h2>画布</h2>
        <p>12 列网格。拖动板块到空白处即可改变位置；位置和尺寸使用顶部行号、列号与跨列数表示。</p>
        <div class="layout-side-note">${route.query && route.query.get('ai') ? 'AI 已生成一版布局，你可以继续移动后再保存。' : '保存后只影响当前网页。对外展示需要重新公示。'}</div>
        <div class="layout-side-legend"><span><i class="legend-hero"></i>主视觉</span><span><i class="legend-browse"></i>搜索</span><span><i class="legend-body"></i>内容</span></div>
        <p class="layout-side-tip">手机端会忽略绝对位置，自动按主视觉 → 搜索 → 内容的顺序单列展示，保证可读性。</p>
      </aside>
      <div class="layout-canvas" data-layout-canvas>${blockCards}</div>
    </div>
  </div>`;
}

/* ------------------------------ account sites ------------------------------ */

function renderSitesPage() {
  syncActiveSiteRecord();
  const records = state.sites || [];
  const count = records.length;
  const cards = records.map((record) => {
    const site = record.site;
    const publication = record.publication || {};
    const collectionCount = new Set((site.zones || []).map((zone) => zone.id)).size;
    const active = site.id === state.site.id;
    return `<article class="managed-site-card${active ? ' is-active' : ''}">
      <div class="managed-site-head"><div><span class="eyebrow">${active ? 'CURRENT / 当前编辑' : 'WEB / 网页'}</span><h2>${esc(site.title || '未命名网页')}</h2><p>#/site/${esc(site.slug || '')}</p></div><span class="managed-site-status ${publication.active ? 'is-live' : ''}">${publication.active ? '已公示' : '草稿'}</span></div>
      <div class="managed-site-meta"><span>${(site.items || []).length} 块内容</span><span>${collectionCount} 个专区</span><span>更新于 ${esc(formatDate(site.updatedAt))}</span></div>
      <div class="managed-site-actions"><button type="button" class="btn btn--sm" data-action="view-site" data-site-id="${attr(site.id)}">查看网页</button><button type="button" class="btn btn--sm btn--primary" data-action="switch-site" data-site-id="${attr(site.id)}">${active ? '继续编辑' : '编辑这个网页'}</button>${publication.active ? `<button type="button" class="btn btn--sm" data-action="unpublish-site" data-site-id="${attr(site.id)}">撤销公示</button>` : ''}<button type="button" class="btn btn--sm btn--danger" data-action="delete-site" data-site-id="${attr(site.id)}" ${records.length <= 1 ? 'disabled' : ''}>删除</button></div>
    </article>`;
  }).join('');
  const localRemoteIds = new Set(records.map((record) => record.publication && record.publication.remoteSiteId).filter(Boolean));
  const remoteOnly = authUser
    ? (networkSites || []).filter((site) => site.ownerId === authUser.id && !localRemoteIds.has(site.siteId))
    : [];
  const remoteCards = remoteOnly.map((site) => `<article class="managed-site-card is-cloud-only">
    <div class="managed-site-head"><div><span class="eyebrow">CLOUD / 仅云端记录</span><h2>${esc(site.snapshot?.title || '未命名网页')}</h2><p>#/site/${esc(site.slug || '')}</p></div><span class="managed-site-status is-live">已公示</span></div>
    <div class="managed-site-meta"><span>云端旧记录</span><span>${site.snapshot ? `${(site.snapshot.items || []).length} 块内容` : ''}</span></div>
    <div class="managed-site-actions"><button type="button" class="btn btn--sm btn--danger" data-action="delete-cloud-site" data-site-id="${attr(site.siteId)}">删除云端记录</button></div>
  </article>`).join('');
  return `<div class="sites-page">
    <header class="page-head container">
      <div class="eyebrow">ACCOUNT / 我的网页</div>
      <h1>一个账号，<br>几座自己的岸。</h1>
      <p>每个账号最多创建 ${MAX_SITES} 个网页。这里可以看到每个网页的状态、内容数量，并进入编辑界面。</p>
      <div class="sites-page-actions"><a class="btn btn--sm" href="#/settings">返回设置</a><button type="button" class="btn btn--sm btn--primary" data-action="create-site" ${count >= MAX_SITES ? 'disabled' : ''}>${count >= MAX_SITES ? `已达到 ${MAX_SITES} 个上限` : `新建网页（${count}/${MAX_SITES}）`}</button></div>
    </header>
    <section class="sites-grid container">${cards || '<div class="item-empty">还没有网页。</div>'}</section>
    ${remoteCards ? `<section class="sites-grid container sites-cloud-only"><h2 class="sites-cloud-title">云端旧记录</h2>${remoteCards}</section>` : ''}
  </div>`;
}

/* ------------------------------ settings ------------------------------ */

function renderSettingsPage() {
  const bytes = storageSizeBytes();
  const percent = Math.min(100, (bytes / STORAGE_TARGET_BYTES) * 100);
  return `<div class="settings-page">
    <section class="page-head container">
      <div class="eyebrow">SETTINGS / 设置</div>
      <h1>你的数据，<br>在你自己手里。</h1>
      <p>岸标支持本地模式和登录模式。站点结构保存在浏览器本地存储；登录后可以在账号下管理多个网页，公开内容通过 Supabase 同步。可以随时导出 JSON 备份，或导出为独立网页带走。</p>
    </section>

    <section class="settings-grid container">
      ${authUser ? `<article class="settings-panel">
        <h2>账号与我的网页</h2>
        <p>当前账号 @${esc(authUser.username)}。在这里创建和切换网页；每个账号最多 ${MAX_SITES} 个。</p>
        <div class="settings-actions"><button type="button" class="btn btn--sm btn--primary" data-action="open-site-manager">管理我的网页</button></div>
        <div class="settings-note">每个网页有独立的内容、专区、布局和公示状态。</div>
      </article>` : ''}
      <article class="settings-panel">
        <h2>数据与备份</h2>
        <p>JSON 备份包含站点、内容、公示快照、同意记录以及上传的本地文件。换一台设备时，导入即可继续。</p>
        <div class="storage-meter" aria-hidden="true"><span style="width:${Math.max(2, percent)}%"></span></div>
        <div class="storage-meta"><span>站点设置占用 ${esc(formatBytes(bytes))}</span><span>本地文件另存于文件库</span></div>
        <div class="settings-actions">
          <button type="button" class="btn btn--sm" data-action="export-data">${ICONS.download} 导出完整 JSON 备份</button>
          <label class="file-button">${ICONS.upload} 导入备份<input type="file" accept="application/json,.json" data-upload="import-data" aria-label="导入 JSON 备份"></label>
          <button type="button" class="btn btn--sm" data-action="export-site">${ICONS.external} 导出独立网页</button>
        </div>
        <div class="settings-note">图片会压缩后存储；视频、音频、文档等原文件存入浏览器文件库。备份含大文件时 JSON 会很大，导出可能需要一些时间。</div>
      </article>

      <article class="settings-panel">
        <h2>导览偏好</h2>
        <p>平台示例由岸标制作，用于演示不同内容类型；它们不是真实用户站点。</p>
        <div class="toggle-row">
          <div>
            <strong>在指路中显示平台示例</strong>
            <p>隐藏后，导览区只显示真实经同意公示的站点。这个开关只影响你自己的浏览，不改变任何人的公示状态。</p>
          </div>
          <label class="switch">
            <input type="checkbox" id="settings-show-demo"${state.settings.showDemo ? ' checked' : ''} data-field="show-demo" aria-label="在指路中显示平台示例">
            <span aria-hidden="true"></span>
          </label>
        </div>
        <div class="settings-note">示例站点的卡片与页面都带有「平台示例」标记；真实站点只有在主人勾选同意后才会出现。</div>
      </article>

      <div class="settings-download-embed">${renderDownloadSettingsPanel()}</div>

      <article class="settings-panel">
        <h2>岸标的原则</h2>
        <ul class="principle-list">
          <li><span class="num">01</span><div><strong>设计，但不替你做主</strong><p>提供版式、颜色与导出；内容、专区与去留由你决定。</p></div></li>
          <li><span class="num">02</span><div><strong>存储，但不偷偷上传</strong><p>默认保存在本机浏览器；没有后台账号，也没有浏览追踪。</p></div></li>
          <li><span class="num">03</span><div><strong>指路，但不做推荐</strong><p>只有明确同意的 web 才会出现；搜索按专区和关键词过滤，结果按名称排序。</p></div></li>
          <li><span class="num">04</span><div><strong>随时可撤回</strong><p>撤回后立即从导览区移除。内容不会被删除，也不会被继续展示。</p></div></li>
        </ul>
      </article>

      <article class="settings-panel">
        <h2>关于这个版本</h2>
        <p>默认可以双击打开、独立运行；运行 server.py 后，同一服务上的用户还能互相发现主页并共享评论。</p>
        <div class="about-line"><span>版本</span><strong>岸标 ${APP_VERSION}</strong></div>
        <div class="about-line"><span>数据保存</span><code>localStorage + IndexedDB</code></div>
        <div class="about-line"><span>联机发现</span><strong>${networkInfo.server ? `已连接 · ${networkInfo.online} 个主页在线` : '本地模式'}</strong></div>
        <div class="about-line"><span>推荐机制</span><strong>无</strong></div>
        <div class="about-line"><span>公示协议</span><code>${CONSENT_VERSION}</code></div>
        <div class="settings-actions">
          <button type="button" class="btn btn--sm btn--danger" data-action="reset-all">清空全部数据并重置</button>
        </div>
        <div class="settings-note">清空会删除当前浏览器里的站点内容、本地文件与公示记录。建议先导出备份。</div>
      </article>
    </section>
  </div>`;
}

/* ------------------------------ auth ------------------------------ */

function renderAuthPage() {
  if (!networkInfo.server) {
    return `<div class="auth-page container"><div class="auth-card"><span class="eyebrow">ACCOUNT / 账号</span><h1>Supabase 尚未连接</h1><p>请检查网络是否能够加载 Supabase CDN，并确认项目已经执行初始化 SQL。账号、评论和访客记录都依赖 Supabase。</p><a class="btn btn--primary" href="#/guide">先浏览指路</a></div></div>`;
  }
  if (authUser) {
    return `<div class="auth-page container"><div class="auth-card"><span class="eyebrow">ACCOUNT / 账号</span><h1>${esc(authUser.name || authUser.username)}</h1><p>已登录。评论会绑定到 @${esc(authUser.username)}，主人也能在访客记录里看到你的访问。</p><div class="auth-meta"><span>用户名</span><strong>@${esc(authUser.username)}</strong></div><div class="auth-meta"><span>显示名</span><strong>${esc(authUser.name || authUser.username)}</strong></div><div class="auth-actions"><button type="button" class="btn btn--primary" data-action="open-site-manager">管理我的网页</button><button type="button" class="btn" data-action="logout">退出登录</button></div></div></div>`;
  }
  return `<div class="auth-page container"><div class="auth-card">
    <span class="eyebrow">ACCOUNT / 账号</span>
    <h1>登录岸标</h1>
    <p>登录后，评论会绑定到你的账号；主人也会在访客记录里看到你的访问。</p>
    <div class="auth-tabs"><button type="button" class="auth-tab is-active" data-action="auth-tab" data-tab="login">登录</button><button type="button" class="auth-tab" data-action="auth-tab" data-tab="register">注册</button></div>
    <form id="auth-login-form" class="auth-form" data-auth-form="login">
      <label>邮箱<input name="email" type="email" maxlength="120" autocomplete="email" required></label>
      <label>密码<input name="password" type="password" minlength="6" autocomplete="current-password" required></label>
      <div class="form-error" role="alert"></div>
      <button type="submit" class="btn btn--primary">登录</button>
    </form>
    <form id="auth-register-form" class="auth-form" data-auth-form="register" hidden>
      <label>邮箱<input name="email" type="email" maxlength="120" autocomplete="email" required></label>
      <label>用户名<input name="username" type="text" maxlength="40" autocomplete="username" required></label>
      <label>显示名<input name="name" type="text" maxlength="60" placeholder="评论时显示的名字"></label>
      <label>密码<input name="password" type="password" minlength="6" autocomplete="new-password" required></label>
      <div class="form-error" role="alert"></div>
      <button type="submit" class="btn btn--primary">注册</button>
      <p class="auth-confirm-note">注册后会发送确认邮件，确认邮箱后才能登录和评论。</p>
    </form>
  </div></div>`;
}

/* ------------------------------ article reader ------------------------------ */

function resolveReaderSite(route) {
  const preview = route.query.get('preview') === '1';
  if (preview && route.slug === state.site.slug) {
    return { payload: { ...buildPublicPayload(state.site), __preview: true }, preview: true, mode: 'local' };
  }
  if (publicationIsListed() && state.publication.snapshot.slug === route.slug) {
    return {
      payload: { ...state.publication.snapshot, siteId: state.publication.remoteSiteId || state.publication.snapshot.siteId },
      preview: false,
      mode: 'public'
    };
  }
  const networkSite = typeof findNetworkSite === 'function' ? findNetworkSite(route.slug) : null;
  if (networkSite && networkSite.snapshot) {
    return { payload: { ...networkSite.snapshot, __network: true }, preview: false, mode: 'network' };
  }
  const demo = DEMO_SITES.find((entry) => entry.snapshot.slug === route.slug);
  if (demo) return { payload: demo.snapshot, preview: false, mode: 'demo' };
  return null;
}

function commentListMarkup(comments, parentId = '', depth = 0) {
  const children = comments.filter((comment) => (comment.parentId || '') === parentId);
  if (!children.length) return '';
  return children.map((comment) => `<article class="comment${depth ? ' comment--reply' : ''}" data-comment-id="${attr(comment.id)}">
    <header><strong>${esc(comment.name || '匿名访客')}</strong><time>${esc(formatDateTime(comment.createdAt))}</time></header>
    <p>${esc(comment.text)}</p>
    <button type="button" class="comment-reply" data-action="reply-comment" data-id="${attr(comment.id)}" data-name="${attr(comment.name || '匿名访客')}">回复</button>
    ${commentListMarkup(comments, comment.id, depth + 1)}
  </article>`).join('');
}

function commentBlockMarkup(item, payload) {
  if (payload.__standalone || !item.commentsEnabled || !payload.siteId) return '';
  const online = networkOnline && !payload.__preview && (payload.__network || publicationIsListed());
  const localComments = online ? [] : (state.comments || []).filter((comment) => comment.siteId === payload.siteId && comment.itemId === item.id);
  const form = online && !authUser
    ? `<div class="comment-login"><span>登录后可以发表评论，评论会绑定到你的账号。</span><a class="btn btn--sm btn--primary" href="#/login">登录 / 注册</a></div>`
    : `<form class="comment-form" id="comment-form" data-comment-form data-site-id="${attr(payload.siteId)}" data-item-id="${attr(item.id)}" data-online="${online ? '1' : '0'}">
      <input type="hidden" name="parentId" value="">
      <div class="comment-reply-target" hidden>回复 <strong data-reply-name></strong><button type="button" data-action="cancel-comment-reply">取消</button></div>
      <div class="comment-fields">
        ${online && authUser ? `<div class="comment-as">以 <strong>${esc(authUser.name || authUser.username)}</strong> 的身份评论</div>` : ''}
        ${online ? '' : '<input type="text" name="name" maxlength="60" placeholder="你的称呼（可留空）">'}
        <textarea name="text" maxlength="1000" required placeholder="写一句评论。只支持文字与符号。"></textarea>
      </div>
      <div class="comment-submit"><span>回复会显示在同一条评论下面。</span><button type="submit" class="btn btn--sm btn--primary">发送评论</button></div>
    </form>`;
  return `<section class="comment-block" data-comments data-site-id="${attr(payload.siteId)}" data-item-id="${attr(item.id)}" data-online="${online ? '1' : '0'}">
    <header class="comment-head"><div><span class="comment-kicker">COMMENTS / 评论</span><h2>给这里留一句话</h2></div><span class="comment-note">文字与符号 · 可回复 · 无点赞</span></header>
    <div class="comment-list" data-comment-list>${online ? '<p class="comment-loading">正在载入评论…</p>' : (commentListMarkup(localComments) || '<p class="comment-empty">还没有评论，留下第一句。</p>')}</div>
    ${form}
  </section>`;
}

function articleRichHtml(item, chapter = null) {
  const html = chapter ? chapter.html : item.bodyHtml;
  if (html) return sanitizeRichHtml(html);
  const plain = chapter ? chapter.body : item.body;
  return plain ? renderParagraphs(plain) : '';
}

function renderWritingPage(route) {
  const item = (state.site.items || []).find((entry) => entry.id === route.itemId && entry.type === 'article');
  if (!item) return `<div class="container"><div class="item-empty">没有找到这篇文章。</div></div>`;
  const bodyHtml = articleRichHtml(item);
  const chapters = Array.isArray(item.chapters) ? item.chapters : [];
  return `<div class="writing-page container">
    <header class="writing-head">
      <div><span class="eyebrow">WRITE / 写作</span><h1>${esc(item.title || '未命名文章')}</h1><p>像写文档一样排版正文。选中文字后使用工具栏；也可以导入文本或 Word 文档，让 AI 按章节整理。</p></div>
      <div class="writing-actions"><button type="button" class="btn btn--sm" data-action="writing-back">返回工作台</button><button type="button" class="btn btn--sm btn--primary" data-action="writing-ai">直接读取文档</button><button type="button" class="btn btn--sm" data-action="writing-smart">智能排版</button><button type="button" class="btn btn--sm" data-action="writing-save">保存文章</button></div>
    </header>
    <form id="writing-form" data-item-id="${attr(item.id)}">
      <div class="writing-meta">
        <label>标题<input name="title" type="text" maxlength="120" value="${attr(item.title || '')}"></label>
        <label>摘要<input name="excerpt" type="text" maxlength="320" value="${attr(item.excerpt || '')}" placeholder="可留空"></label>
        <label>文章合集<select name="zone">${flattenZoneTree(buildZoneTree(state.site.zones || [])).map((entry) => `<option value="${attr(entry.zone.id)}"${entry.zone.id === item.zoneId ? ' selected' : ''}>${'— '.repeat(entry.depth)}${esc(entry.zone.name)}</option>`).join('')}</select></label>
      </div>
      <div class="writing-toolbar" role="toolbar" aria-label="文章排版工具">
        <button type="button" data-write-cmd="bold" title="加粗"><strong>B</strong></button>
        <button type="button" data-write-cmd="italic" title="斜体"><em>I</em></button>
        <button type="button" data-write-cmd="underline" title="下划线"><u>U</u></button>
        <button type="button" data-write-cmd="strikeThrough" title="删除线"><s>S</s></button>
        <span class="writing-tool-divider"></span>
        <label>字号<select data-write-size><option value="2">小</option><option value="3" selected>正文</option><option value="4">14pt</option><option value="5">18pt</option><option value="6">24pt</option></select></label>
        <button type="button" data-write-block="indent" title="首行缩进">首行缩进</button>
        <label>行距<select data-write-line><option value="1.5" selected>1.5</option><option value="1.8">1.8</option><option value="2">2.0</option><option value="2.4">2.4</option></select></label>
        <button type="button" data-write-image="1" title="插入图片">插入图片</button>
        <span class="writing-tool-divider"></span>
        <button type="button" data-write-ai="1">直接读取文档</button>
      </div>
      <div class="writing-editor" data-write-editor="body" contenteditable="true" spellcheck="true" data-placeholder="从这里开始写。">${bodyHtml || ''}</div>
      <div class="writing-chapter-list" data-writing-chapters>
        ${chapters.map((chapter, index) => `<section class="writing-chapter" data-chapter-id="${attr(chapter.id)}"><div class="writing-chapter-head"><span>章节 ${String(index + 1).padStart(2, '0')}</span><input data-chapter-title value="${attr(chapter.title || '')}" placeholder="章节标题"><button type="button" class="icon-button" data-action="writing-remove-chapter" aria-label="删除章节">${ICONS.trash}</button></div><div class="writing-chapter-body" contenteditable="true" data-write-editor="chapter">${articleRichHtml(item, chapter)}</div></section>`).join('')}
      </div>
      <div class="writing-footer"><button type="button" class="btn btn--sm" data-action="writing-add-chapter">+ 添加章节</button><span>每章最多 4 万汉字；图片会随文章一起发布。</span></div>
      <input type="file" accept=".txt,.md,.markdown,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document" data-upload="writing-ai-file" hidden>
      <input type="file" accept="image/*" data-upload="writing-image" hidden>
    </form>
  </div>`;
}

function renderReadRoute(route) {
  const source = resolveReaderSite(route);
  if (!source) {
    return { title: '没有找到这篇文章 · 岸标', html: renderNotFound() };
  }
  const payload = source.payload;
  const item = (payload.items || []).find((entry) => entry.id === route.itemId);
  if (!item || item.type !== 'article') {
    return { title: '没有找到这篇文章 · 岸标', html: renderNotFound() };
  }
  const chapters = Array.isArray(item.chapters) ? item.chapters : [];
  const requested = route.query.get('chapter') || '';
  const selectedIndex = Math.max(0, chapters.findIndex((chapter) => chapter.id === requested));
  const selected = chapters.length ? chapters[selectedIndex] || chapters[0] : null;
  const richContent = articleRichHtml(item, selected);
  const bg = appearancePresentation(payload.appearance, payload.theme);
  const suffix = `${route.slug}/${item.id}`;
  const querySuffix = source.preview ? '?preview=1' : '';
  const siteHref = `#/site/${route.slug}${querySuffix}`;
  const readHref = (chapterId) => `#/read/${suffix}?${source.preview ? 'preview=1&' : ''}chapter=${encodeURIComponent(chapterId)}`;
  const prev = chapters[selectedIndex - 1];
  const next = chapters[selectedIndex + 1];
  const cover = safeMediaSrc(item.cover);
  const chapterNav = chapters.length ? `<nav class="read-chapters" aria-label="章节选择">
    <span class="read-chapters-label">章节选择</span>
    ${chapters.map((chapter, index) => `<a class="${index === selectedIndex ? 'is-current' : ''}" href="${attr(readHref(chapter.id))}"><span>${String(index + 1).padStart(2, '0')}</span>${esc(chapter.title || `第 ${index + 1} 章`)}</a>`).join('')}
  </nav>` : '';
  return {
    title: `${item.title} · ${payload.title}`,
    html: `<div class="web-site read-page ${themeClass(payload.theme)} ${bg.classes}" style="${attr(bg.style)}">
      <div class="read-topbar web-shell">
        <a class="read-back" href="${attr(siteHref)}">← 返回 ${esc(payload.title)}</a>
        <span>${esc(payload.owner)} 的个人 web</span>
      </div>
      <main class="read-shell">
        <aside class="read-aside">
          <span class="read-kicker">READING / 阅读</span>
          <h2>${esc(payload.title)}</h2>
          <p>${esc(payload.tagline || '')}</p>
          ${chapterNav}
          <div class="read-aside-foot"><a href="${attr(siteHref)}">回到主页</a><span>·</span><span>${chapters.length ? `${chapters.length} 个章节` : '单篇内容'}</span></div>
        </aside>
        <article class="read-article">
          <header class="read-head">
            <div class="read-meta"><span>${selected ? `第 ${String(selectedIndex + 1).padStart(2, '0')} 章` : '文章'}</span><time>${esc(formatDate(item.createdAt))}</time></div>
            <h1>${esc(item.title)}</h1>
            ${item.excerpt ? `<p class="read-lead">${esc(item.excerpt)}</p>` : ''}
            ${cover ? `<figure class="read-cover"><img src="${attr(cover)}" alt="${attr(item.title)}"></figure>` : ''}
          </header>
          ${selected ? `<h2 class="read-chapter-title">${esc(selected.title || `第 ${selectedIndex + 1} 章`)}</h2>` : ''}
          <div class="read-prose">${richContent || renderParagraphs(item.body || '这一章还没有正文。')}</div>
          ${chapters.length ? `<nav class="read-pager" aria-label="章节翻页">
            ${prev ? `<a href="${attr(readHref(prev.id))}">← ${esc(prev.title || '上一章')}</a>` : '<span></span>'}
            ${next ? `<a href="${attr(readHref(next.id))}">${esc(next.title || '下一章')} →</a>` : '<span></span>'}
          </nav>` : ''}
          ${commentBlockMarkup(item, payload)}
          <footer class="read-foot"><a href="${attr(siteHref)}">回到 ${esc(payload.title)}</a><span>由岸标提供设计、存储与指路</span></footer>
        </article>
      </main>
    </div>`
  };
}

function partUrl(part) {
  if (!part) return '';
  if (part.assetId) {
    const local = assetUrl(part.assetId);
    if (local) return local;
  }
  if (/^\/api\/media\//.test(String(part.url || ''))) return part.url;
  return safeHref(part.url);
}

function imageGalleryMarkup(item) {
  const all = [];
  if (item.src) all.push({ src: item.src, caption: item.caption || '' });
  (item.images || []).forEach((image) => { if (image.src) all.push(image); });
  if (!all.length) return '<div class="web-empty">这张图片还没有载入。</div>';
  return `<div class="image-gallery">${all.map((image, index) => `<figure class="web-figure image-gallery-item web-image-openable" data-open-content data-content-kind="image" tabindex="0" role="button" aria-label="查看大图：${attr(item.title || '')} ${index + 1}"><img src="${attr(safeMediaSrc(image.src))}" alt="${attr(image.caption || item.title || '')}" loading="lazy"><figcaption><strong>${esc(item.title)} · ${String(index + 1).padStart(2, '0')}</strong><span>${esc(image.caption || '')}</span>${item.downloadable ? `<a href="${attr(safeMediaSrc(image.src))}" download="${attr(item.title || 'image')}-${index + 1}">下载图片</a>` : ''}</figcaption></figure>`).join('')}</div>`;
}

function mediaPartsMarkup(item) {
  const parts = item.type === 'file' ? (item.files || []) : (item.episodes || []);
  const usable = parts.filter((part) => partUrl(part));
  if (!usable.length) return '';
  const title = item.type === 'file' ? '文件分区' : '选集 / 分区';
  return `<section class="episode-public"><h2>${title}</h2><div class="episode-public-list">${usable.map((part, index) => {
    const src = partUrl(part);
    const media = item.type === 'file'
      ? `<a class="episode-file-link" href="${attr(src)}" target="_blank" rel="noopener noreferrer"${item.downloadable ? ` download="${attr(part.filename || '')}"` : ''}>${item.downloadable ? '下载' : '打开'} ↗</a>`
      : item.type === 'audio'
        ? `<audio controls preload="metadata" src="${attr(src)}"></audio>`
        : `<video controls preload="metadata" src="${attr(src)}"></video>`;
    return `<div class="episode-public-row"><span>${String(index + 1).padStart(2, '0')}</span><div><strong>${esc(part.title || `第 ${index + 1} 项`)}</strong>${part.note ? `<p>${esc(part.note)}</p>` : ''}</div>${media}</div>`;
  }).join('')}</div></section>`;
}

function allItemImages(item) {
  const all = [];
  if (item.src) all.push({ id: 'main', src: item.src, caption: item.caption || '', main: true });
  (item.images || []).forEach((image) => { if (image.src) all.push({ ...image, main: false }); });
  return all;
}

function itemPartList(item) {
  if (item.type === 'file') return (item.files || []).filter(partUrl);
  return (item.episodes || []).filter(partUrl);
}

function nestedVideoSidebarMarkup(item, allParts, selectedKey, baseHref, preview) {
  const groups = allParts.filter((part) => part.group);
  const files = allParts.filter((part) => !part.group && partUrl(part));
  const topGroups = groups.filter((group) => !group.parentId || !groups.some((itemGroup) => itemGroup.id === group.parentId));
  const directFiles = files.filter((part) => !part.parentId || !groups.some((group) => group.id === part.parentId));
  if (!groups.length && files.length < 2) return '';
  const fileLink = (part, index) => {
    const key = part.id || String(index);
    return `<a class="${key === selectedKey ? 'is-current' : ''}" href="${attr(baseHref(key, preview))}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(part.title || part.filename || `视频 ${index + 1}`)}</strong></a>`;
  };
  const groupBlock = (group, depth = 0) => {
    const children = files.filter((part) => part.parentId === group.id);
    const childGroups = groups.filter((itemGroup) => itemGroup.parentId === group.id);
    return `<div class="media-sidebar-group" style="--depth:${depth}"><span class="media-sidebar-group-name">${esc(group.title || '未命名合集')}</span>${children.map((part) => fileLink(part, files.indexOf(part))).join('')}${childGroups.map((child) => groupBlock(child, depth + 1)).join('')}</div>`;
  };
  return `<aside class="media-sidebar" aria-label="视频合集">
    <span class="media-sidebar-kicker">VIDEO COLLECTION / 视频合集</span>
    <h2>${esc(item.title)}</h2>
    <p>${files.length} 个视频 · ${groups.length} 个合集</p>
    <nav class="media-sidebar-nav">${directFiles.map((part) => fileLink(part, files.indexOf(part))).join('')}${topGroups.map((group) => groupBlock(group)).join('')}</nav>
  </aside>`;
}

function collectionSidebarMarkup(item, parts, selectedKey, kind, baseHref, preview) {
  if (!parts || parts.length < 2) return '';
  const label = kind === 'image' ? '图片' : kind === 'video' ? '视频' : kind === 'audio' ? '音频' : '文件';
  return `<aside class="media-sidebar" aria-label="${label}合集">
    <span class="media-sidebar-kicker">${label.toUpperCase()} COLLECTION / ${label}合集</span>
    <h2>${esc(item.title)}</h2>
    <p>${parts.length} 个${label}文件，点击切换查看。</p>
    <nav class="media-sidebar-nav">${parts.map((part, index) => {
      const key = part.id || String(index);
      return `<a class="${key === selectedKey ? 'is-current' : ''}" href="${attr(baseHref(key, preview))}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(part.title || part.caption || part.filename || `第 ${index + 1} 项`)}</strong></a>`;
    }).join('')}</nav>
  </aside>`;
}

function imageCollectionMarkup(item, route, source, siteHref) {
  const images = allItemImages(item);
  if (!images.length) return { html: '<div class="web-empty">这张图片还没有载入。</div>', sidebar: '' };
  const requested = route.query.get('image') || '';
  const index = Math.max(0, images.findIndex((image, i) => (image.id || String(i)) === requested));
  const selected = images[index] || images[0];
  const base = (key, preview) => `#/item/${encodeURIComponent(route.slug)}/${encodeURIComponent(item.id)}${preview ? '?preview=1&' : '?'}image=${encodeURIComponent(key)}`;
  const sidebar = collectionSidebarMarkup(item, images, selected.id || String(index), 'image', base, source.preview);
  const download = item.downloadable ? `<a href="${attr(safeMediaSrc(selected.src))}" download="${attr(item.title || 'image')}-${index + 1}">下载图片</a>` : '';
  return {
    html: `<div class="item-detail-media"><figure class="web-figure web-image-openable media-stage-image" data-open-content data-content-kind="image" tabindex="0" role="button" aria-label="查看大图：${attr(item.title || '')}"><img src="${attr(safeMediaSrc(selected.src))}" alt="${attr(selected.caption || item.title || '')}"><figcaption><strong>${esc(item.title)} · ${String(index + 1).padStart(2, '0')}</strong><span>${esc(selected.caption || '')}</span>${download}</figcaption></figure></div>`,
    sidebar
  };
}

function playerForPart(item, part) {
  if (!part) return '';
  const merged = {
    ...item,
    title: part.title || item.title,
    url: part.url || '',
    assetId: part.assetId || '',
    filename: part.filename || '',
    mime: part.mime || '',
    size: part.size || 0
  };
  if (item.type === 'video') return videoEmbedMarkup(merged);
  if (item.type === 'audio') return audioMarkup(merged);
  return `<div class="web-file-entry">${fileMarkup(merged)}</div>`;
}

function mediaCollectionMarkup(item, route, source, siteHref) {
  const allParts = item.type === 'file' ? (item.files || []) : (item.episodes || []);
  const parts = itemPartList(item);
  if (!parts.length) return { html: '', sidebar: '' };
  const requested = route.query.get('episode') || route.query.get('file') || '';
  const index = Math.max(0, parts.findIndex((part, i) => (part.id || String(i)) === requested));
  const selected = parts[index] || parts[0];
  const base = (key, preview) => `#/item/${encodeURIComponent(route.slug)}/${encodeURIComponent(item.id)}${preview ? '?preview=1&' : '?'}${item.type === 'file' ? 'file' : 'episode'}=${encodeURIComponent(key)}`;
  const sidebar = item.type === 'video'
    ? nestedVideoSidebarMarkup(item, allParts, selected.id || String(index), base, source.preview)
    : collectionSidebarMarkup(item, parts, selected.id || String(index), item.type, base, source.preview);
  return {
    html: `<div class="item-detail-media"><div class="media-stage-head"><span>${String(index + 1).padStart(2, '0')} / ${String(parts.length).padStart(2, '0')}</span><strong>${esc(selected.title || selected.filename || `第 ${index + 1} 项`)}</strong></div>${playerForPart(item, selected)}${selected.note ? `<p class="media-stage-note">${esc(selected.note)}</p>` : ''}</div>`,
    sidebar
  };
}

function renderItemRoute(route) {
  const source = resolveReaderSite(route);
  if (!source) return { title: '没有找到这份内容 · 岸标', html: renderNotFound() };
  const payload = source.payload;
  const item = (payload.items || []).find((entry) => entry.id === route.itemId);
  if (!item || !['video', 'audio', 'file', 'image'].includes(item.type)) {
    return { title: '没有找到这份内容 · 岸标', html: renderNotFound() };
  }
  const bg = appearancePresentation(payload.appearance, payload.theme);
  const querySuffix = source.preview ? '?preview=1' : '';
  const siteHref = `#/site/${route.slug}${querySuffix}`;
  const collection = item.type === 'image'
    ? { html: imageGalleryMarkup(item), sidebar: '' }
    : mediaCollectionMarkup(item, route, source, siteHref);
  const mainMedia = collection.html || (item.type === 'video' ? videoEmbedMarkup(item) : item.type === 'audio' ? audioMarkup(item) : `<div class="web-file-entry">${fileMarkup(item)}</div>`);
  const article = `<article class="read-article item-detail-article">
          <div class="read-meta"><span>${item.type === 'audio' ? '音频' : item.type === 'file' ? '文件' : item.type === 'image' ? '图片' : '视频'}</span><time>${esc(formatDate(item.createdAt))}</time></div>
          <h1>${esc(item.title)}</h1>
          ${item.desc ? `<div class="read-lead">${renderParagraphs(item.desc)}</div>` : ''}
          ${mainMedia}
          ${item.downloadable && item.type === 'video' && !collection.sidebar ? mediaMetaMarkup(item, { download: true }) : ''}
          ${mediaLockNoteMarkup(item)}
          ${commentBlockMarkup(item, payload)}
          <footer class="read-foot"><a href="${attr(siteHref)}">回到 ${esc(payload.title)}</a><span>由岸标提供设计、存储与指路</span></footer>
        </article>`;
  return {
    title: `${item.title} · ${payload.title}`,
    html: `<div class="web-site read-page ${themeClass(payload.theme)} ${bg.classes}" style="${attr(bg.style)}">
      <div class="read-topbar web-shell">
        <a class="read-back" href="${attr(siteHref)}">← 返回 ${esc(payload.title)}</a>
        <span>${esc(payload.owner)} 的个人 web</span>
      </div>
      <main class="item-detail-shell">
        ${collection.sidebar ? `<div class="item-detail-layout">${collection.sidebar}${article}</div>` : article}
      </main>
    </div>`
  };
}

function renderCollectionRoute(route) {
  const source = resolveReaderSite(route);
  if (!source) return { title: '没有找到这个合集 · 岸标', html: renderNotFound() };
  const payload = source.payload;
  const zone = (payload.zones || []).find((entry) => entry.id === route.zoneId);
  if (!zone) return { title: '没有找到这个合集 · 岸标', html: renderNotFound() };
  const allowed = new Set([zone.id]);
  zoneDescendantIds(payload.zones || [], zone.id).forEach((id) => allowed.add(id));
  const items = (payload.items || []).filter((item) => allowed.has(item.zoneId));
  const bg = appearancePresentation(payload.appearance, payload.theme);
  const preview = source.preview ? '?preview=1' : '';
  const siteHref = `#/site/${route.slug}${preview}`;
  const collections = siteCollections(payload).filter((entry) => entry.count > 0);
  return {
    title: `${zone.name} · ${payload.title}`,
    html: `<div class="site-surface"><div class="web-site collection-page ${themeClass(payload.theme)} ${bg.classes}" style="${attr(bg.style)}">
      <div class="read-topbar web-shell">
        <a class="read-back" href="${attr(siteHref)}">← 返回 ${esc(payload.title)}</a>
        <span>${esc(payload.owner)} 的个人 web</span>
      </div>
      <main class="collection-shell">
        <header class="collection-head">
          <span class="read-kicker">COLLECTION / 合集</span>
          <h1>${esc(zone.name)}</h1>
          ${zone.desc ? `<p>${esc(zone.desc)}</p>` : ''}
          <span class="collection-head-count">${items.length} 项内容</span>
        </header>
        <nav class="collection-switcher" aria-label="选择合集">
          ${collections.map((entry) => `<a class="${entry.zone.id === zone.id ? 'is-current' : ''}" href="${attr(collectionHref(payload, entry.zone.id))}"><span>${esc(entry.zone.name)}</span><small>${entry.count}</small></a>`).join('')}
        </nav>
        <div class="collection-items">
          ${items.length ? items.map((item) => renderPublicItem(item, payload, zone.name, false)).join('') : '<div class="web-empty">这个合集暂时没有内容。</div>'}
        </div>
        <footer class="read-foot"><a href="${attr(siteHref)}">回到 ${esc(payload.title)}</a><span>由岸标提供设计、存储与指路</span></footer>
      </main>
    </div></div>`
  };
}

/* ------------------------------ site route ------------------------------ */

function renderSiteRibbon(mode, payload) {
  if (mode === 'local') {
    return `<div class="site-ribbon site-ribbon--local">
      <div class="site-ribbon-left">
        <a href="#/studio">← 岸标 · 工作台</a>
        <span class="dot" aria-hidden="true"></span>
        <span class="ribbon-message"><strong>本地草稿视图</strong> · ${publicationIsListed() ? '以下是当前草稿，不是指路中的公开快照' : '尚未进入指路，只有你能看到'}</span>
      </div>
      <div class="site-ribbon-actions"><a class="ribbon-btn" href="#/studio">返回编辑</a></div>
    </div>`;
  }
  if (mode === 'network') {
    return `<div class="site-ribbon">
      <div class="site-ribbon-left">
        <a href="#/guide">← 岸标 · 联机指路</a>
        <span class="dot" aria-hidden="true"></span>
        <span class="ribbon-message"><strong>联机发现</strong> · 来自同一岸标服务上的公开主页</span>
      </div>
      <div class="site-ribbon-actions">
        <button type="button" class="ribbon-btn" data-action="copy-site-link" data-slug="${attr(payload.slug)}">复制链接</button>
      </div>
    </div>`;
  }
  if (mode === 'demo') {
    return `<div class="site-ribbon site-ribbon--demo">
      <div class="site-ribbon-left">
        <a href="#/guide">← 岸标 · 指路</a>
        <span class="dot" aria-hidden="true"></span>
        <span class="ribbon-message"><strong>平台示例</strong> · 非真实用户站点，由岸标制作用于演示</span>
      </div>
      <div class="site-ribbon-actions">
        <button type="button" class="ribbon-btn" data-action="copy-site-link" data-slug="${attr(payload.slug)}">复制链接</button>
      </div>
    </div>`;
  }
  return `<div class="site-ribbon">
    <div class="site-ribbon-left">
      <a href="#/guide">← 岸标 · 指路</a>
      <span class="dot" aria-hidden="true"></span>
      <span class="ribbon-message"><strong>经主人同意公示</strong> · 可以随时撤回，岸标不做推荐</span>
    </div>
    <div class="site-ribbon-actions">
      <button type="button" class="ribbon-btn" data-action="copy-site-link" data-slug="${attr(payload.slug)}">复制链接</button>
      <a class="ribbon-btn" href="#/studio">管理我的 web</a>
    </div>
  </div>`;
}

function renderNotFound() {
  return `<div class="not-found">
    <div class="not-found-inner">
      <img src="assets/mark.svg" alt="" width="48" height="48">
      <div class="eyebrow eyebrow--plain" style="justify-content:center">404 / NOT ON THE MAP</div>
      <h1>这条路没有<br>通向任何一座 web。</h1>
      <p>也许站点还没有被公示，或者链接已经改变。请回到导览区，或先搭好自己的 web。</p>
      <div class="empty-actions">
        <a class="btn btn--primary" href="#/guide">回到指路</a>
        <a class="btn" href="#/studio">我的 Web</a>
      </div>
    </div>
  </div>`;
}

function renderSiteRoute(route, query) {
  const slug = route.slug;
  const previewRequested = query.get('preview') === '1';

  if (previewRequested && slug === state.site.slug) {
    const payload = buildPublicPayload(state.site);
    payload.__preview = true;
    return {
      mode: 'local',
      title: `${payload.title} · 本地预览`,
      html: `${renderSiteRibbon('local', payload)}<div class="site-surface">${renderWebSite(payload)}</div>`
    };
  }

  if (publicationIsListed() && state.publication.snapshot.slug === slug) {
    const payload = {
      ...state.publication.snapshot,
      siteId: state.publication.remoteSiteId || state.publication.snapshot.siteId
    };
    return {
      mode: 'public',
      title: `${payload.title} · ${payload.owner}`,
      html: `${renderSiteRibbon('public', payload)}<div class="site-surface">${renderWebSite(payload)}</div>`
    };
  }

  const networkSite = typeof findNetworkSite === 'function' ? findNetworkSite(slug) : null;
  if (networkSite && networkSite.snapshot) {
    const payload = { ...networkSite.snapshot, __network: true };
    return {
      mode: 'network',
      title: `${payload.title} · ${payload.owner} · 联机`,
      html: `${renderSiteRibbon('network', payload)}<div class="site-surface">${renderWebSite(payload)}</div>`
    };
  }

  const demo = DEMO_SITES.find((item) => item.snapshot.slug === slug);
  if (demo) {
    return {
      mode: 'demo',
      title: `${demo.snapshot.title} · 平台示例`,
      html: `${renderSiteRibbon('demo', demo.snapshot)}<div class="site-surface">${renderWebSite(demo.snapshot)}</div>`
    };
  }

  return {
    mode: 'notfound',
    title: '没有找到这座 web · 岸标',
    html: renderNotFound()
  };
}
