/* Runtime controls shared by the in-app homepage and standalone HTML exports.
   Kept as a serialisable function so it can be embedded verbatim. */
window.ANBIAO_SITE_RUNTIME = function anbiaoSiteRuntime() {
  if (window.__anbiaoSiteRuntimeReady) return;
  window.__anbiaoSiteRuntimeReady = true;

  function closeDetail() {
    const overlay = document.querySelector('.web-detail-overlay');
    if (overlay) overlay.remove();
    document.body.classList.remove('web-detail-open');
  }

  function openDetail(entry, kind) {
    if (!entry) return;
    closeDetail();
    const overlay = document.createElement('div');
    overlay.className = 'web-detail-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const panel = document.createElement('div');
    panel.className = 'web-detail-panel';
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'web-detail-close';
    close.setAttribute('aria-label', '关闭');
    close.innerHTML = '&times;';
    close.addEventListener('click', closeDetail);
    const body = document.createElement('div');
    body.className = 'web-detail-body';

    if (kind === 'image') {
      const image = entry.querySelector('img');
      const caption = entry.querySelector('figcaption');
      if (!image) return;
      const figure = document.createElement('figure');
      figure.className = 'web-detail-figure';
      const big = document.createElement('img');
      big.src = image.currentSrc || image.src;
      big.alt = image.alt || '';
      figure.appendChild(big);
      if (caption) figure.appendChild(caption.cloneNode(true));
      body.appendChild(figure);
    } else {
      const clone = entry.cloneNode(true);
      clone.removeAttribute('hidden');
      clone.removeAttribute('data-preview-hidden');
      clone.removeAttribute('data-entry-search');
      clone.querySelectorAll('[data-open-content]').forEach((node) => {
        node.removeAttribute('data-open-content');
        node.removeAttribute('tabindex');
        node.removeAttribute('role');
      });
      clone.querySelectorAll('.web-entry-open').forEach((node) => node.remove());
      body.appendChild(clone);
    }

    panel.appendChild(close);
    panel.appendChild(body);
    overlay.appendChild(panel);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeDetail();
    });
    const host = entry.closest('.web-site') || document.body;
    host.appendChild(overlay);
    document.body.classList.add('web-detail-open');
    close.focus({ preventScroll: true });
  }

  function applySearch(site) {
    const input = site.querySelector('.web-search-input');
    if (!input) return;
    const query = String(input.value || '').trim().toLowerCase();
    const entries = Array.from(site.querySelectorAll('[data-entry-search]'));
    const blocks = Array.from(site.querySelectorAll('[data-zone-block]'));
    const clear = site.querySelector('[data-web-search-clear]');
    const status = site.querySelector('.web-search-status');
    const empty = site.querySelector('.web-search-empty');

    if (!query) {
      entries.forEach((entry) => {
        entry.hidden = false;
        entry.classList.remove('is-search-visible');
      });
      blocks.forEach((block) => { block.hidden = false; });
      site.querySelectorAll('[data-zone-panel][data-search-opened="1"]').forEach((panel) => {
        panel.hidden = true;
        delete panel.dataset.searchOpened;
        const block = panel.closest('[data-zone-block]');
        const toggle = block && block.querySelector('[data-zone-toggle]');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          const mark = toggle.querySelector('span');
          if (mark) mark.textContent = '+';
        }
      });
      if (clear) clear.hidden = true;
      if (status) status.textContent = '';
      if (empty) empty.hidden = true;
      return;
    }

    site.querySelectorAll('[data-zone-panel][hidden]').forEach((panel) => {
      panel.dataset.searchOpened = '1';
      panel.hidden = false;
      const block = panel.closest('[data-zone-block]');
      const toggle = block && block.querySelector('[data-zone-toggle]');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
        const mark = toggle.querySelector('span');
        if (mark) mark.textContent = '−';
      }
    });

    let visible = 0;
    entries.forEach((entry) => {
      const matches = String(entry.getAttribute('data-entry-search') || '').includes(query);
      entry.hidden = !matches;
      entry.classList.toggle('is-search-visible', matches);
      if (matches) visible += 1;
    });
    blocks.forEach((block) => {
      block.hidden = block.querySelectorAll('[data-entry-search]:not([hidden])').length === 0;
    });
    if (clear) clear.hidden = false;
    if (status) status.textContent = visible ? `找到 ${visible} 条内容` : '没有找到匹配的内容';
    if (empty) empty.hidden = visible !== 0;
  }

  function setChoice(site, selector, activeButton) {
    site.querySelectorAll(selector).forEach((button) => {
      const on = button === activeButton;
      button.classList.toggle('is-active', on);
      button.setAttribute('aria-pressed', String(on));
    });
  }

  function toggleZone(button) {
    const id = button.getAttribute('aria-controls');
    const block = button.closest('[data-zone-block]');
    const panel = (id && document.getElementById(id)) || (block && block.querySelector('[data-zone-panel]'));
    if (!panel) return;
    const collapsing = !panel.hidden;
    panel.hidden = collapsing;
    button.setAttribute('aria-expanded', String(!collapsing));
    const mark = button.querySelector('span');
    if (mark) mark.textContent = collapsing ? '+' : '−';
    if (block) block.classList.toggle('is-collapsed', collapsing);
  }

  function toggleZonePreview(trigger) {
    const block = trigger.closest('[data-zone-block]');
    if (!block) return;
    const panel = block.querySelector('[data-zone-panel]');
    if (panel && panel.hidden) {
      panel.hidden = false;
      const toggle = block.querySelector('[data-zone-toggle]');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
        const mark = toggle.querySelector('span');
        if (mark) mark.textContent = '−';
      }
    }
    const expanded = block.getAttribute('data-preview-expanded') === 'true';
    const extras = Array.from(block.querySelectorAll('[data-preview-extra]'))
      .filter((entry) => entry.closest('[data-zone-block]') === block);
    extras.forEach((entry) => {
      if (expanded) entry.setAttribute('data-preview-hidden', 'true');
      else entry.removeAttribute('data-preview-hidden');
    });
    if (expanded) block.removeAttribute('data-preview-expanded');
    else block.setAttribute('data-preview-expanded', 'true');

    const button = block.querySelector('.web-zone-more');
    if (button) {
      const label = expanded ? button.getAttribute('data-more-label') : button.getAttribute('data-less-label');
      button.innerHTML = `${label || (expanded ? '查看剩余内容' : '收起预览')} <span aria-hidden="true">${expanded ? '↓' : '↑'}</span>`;
      button.setAttribute('aria-expanded', String(!expanded));
    }
    const hint = block.querySelector('.web-zone-expand-hint');
    if (hint) hint.hidden = !expanded;
  }

  document.addEventListener('input', (event) => {
    const input = event.target.closest && event.target.closest('.web-search-input');
    if (!input) return;
    const site = input.closest('.web-site');
    if (site) applySearch(site);
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const clear = target.closest('[data-web-search-clear]');
    if (clear) {
      const site = clear.closest('.web-site');
      const input = site && site.querySelector('.web-search-input');
      if (site && input) {
        input.value = '';
        applySearch(site);
        input.focus();
      }
      return;
    }

    const layout = target.closest('[data-web-layout]');
    if (layout) {
      const site = layout.closest('.web-site');
      if (!site) return;
      const value = layout.getAttribute('data-web-layout') === '2' ? '2' : '1';
      site.setAttribute('data-view-columns', value);
      setChoice(site, '[data-web-layout]', layout);
      return;
    }

    const size = target.closest('[data-web-size]');
    if (size) {
      const site = size.closest('.web-site');
      if (!site) return;
      const value = ['compact', 'standard', 'large'].includes(size.getAttribute('data-web-size'))
        ? size.getAttribute('data-web-size')
        : 'standard';
      site.setAttribute('data-view-density', value);
      setChoice(site, '[data-web-size]', size);
      return;
    }

    const zoneToggle = target.closest('[data-zone-toggle]');
    if (zoneToggle) {
      event.preventDefault();
      toggleZone(zoneToggle);
      return;
    }

    const expandArea = target.closest('[data-zone-expand-area]');
    if (expandArea && !target.closest('a, button, input, textarea, select')) {
      const block = expandArea.closest('[data-zone-block]');
      if (block && block.querySelector('[data-preview-extra]')) {
        event.preventDefault();
        toggleZonePreview(expandArea);
        return;
      }
    }

    const zoneExpand = target.closest('[data-zone-expand]');
    if (zoneExpand) {
      event.preventDefault();
      toggleZonePreview(zoneExpand);
      return;
    }

    if (target.closest('a[download]')) return;
    const opener = target.closest('[data-open-content]');
    if (opener) {
      event.preventDefault();
      const entry = opener.closest('.web-entry') || opener.closest('figure') || opener;
      const kind = opener.getAttribute('data-content-kind') || 'article';
      openDetail(entry, kind);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDetail();
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && event.target instanceof Element) {
      const opener = event.target.closest('[data-open-content]');
      if (opener && opener.getAttribute('role') === 'button') {
        event.preventDefault();
        openDetail(opener.closest('.web-entry') || opener.closest('figure') || opener, opener.getAttribute('data-content-kind') || 'image');
      }
    }
  });
};
